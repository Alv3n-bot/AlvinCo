import {
  doc, getDoc, setDoc, updateDoc, writeBatch, runTransaction, collection, query, orderBy, limit, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const DAY = 86400000;

// Server clock offset, learned at login. Countdowns use this, not the device clock.
let offset = 0;
export const serverNow = () => Date.now() + offset;
export const currentCycle = (cfg) => Math.floor((serverNow() - cfg.dailyEpoch.getTime()) / DAY);

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => "AK" + Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * 32)]).join("");

// ---------- sign up / login ----------
export async function ensureUser(user) {
  const uref = doc(db, "users", user.uid);
  if ((await getDoc(uref)).exists()) await updateDoc(uref, { lastLoginAt: serverTimestamp() });
  else await createAccount(user);
  const t = (await getDoc(uref)).data()?.lastLoginAt;
  if (t) offset = t.toMillis() - Date.now();
}

async function createAccount(user) {
  let ref = (localStorage.getItem("akoin_ref") || "").toUpperCase();
  let referrerUid = null;
  if (ref) {
    const c = await getDoc(doc(db, "referralCodes", ref));
    if (c.exists() && c.data().uid !== user.uid) referrerUid = c.data().uid;
    else ref = "";
  }
  const name = (user.displayName || "Anon").split(" ")[0].slice(0, 30);
  let lastErr;
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const b = writeBatch(db);
    b.set(doc(db, "users", user.uid), {
      uid: user.uid, displayName: user.displayName || "", email: user.email, photoURL: user.photoURL || null,
      referralCode: code, referredBy: referrerUid ? ref : null,
      accountStatus: "active", flaggedForReview: false, launchEligible: true,
      walletAddress: null, walletVerified: false,
      claimCount: 0, lastClaimCycle: -1, lastDailyClaimAt: null,
      createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(),
    });
    b.set(doc(db, "profiles", user.uid), { name, photoURL: user.photoURL || null, points: 0, refs: 0, referralRewards: 0, dailyRewards: 0 });
    b.set(doc(db, "referralCodes", code), { uid: user.uid });
    if (referrerUid) {
      b.set(doc(db, "referrals", user.uid), {
        referrerUid, referredUid: user.uid, referralCode: ref, status: "signed_up",
        rewardAmount: 0, createdAt: serverTimestamp(), completedAt: null,
      });
    }
    try {
      await b.commit();
      localStorage.removeItem("akoin_ref");
      return;
    } catch (e) {
      lastErr = e;
      if (e.code !== "permission-denied") throw e; // usually a code collision, try a new code
    }
  }
  console.error(lastErr);
  throw new Error("Could not create your account. Please refresh and try again.");
}

// ---------- reward pool ----------
// poolCap is split across poolShards counters. A counter may hold at most poolCap / poolShards.
async function pickShard(cfg, amount) {
  for (let i = 0; i < 4; i++) {
    const shard = "pool_" + Math.floor(Math.random() * cfg.poolShards);
    const sref = doc(db, "stats", shard);
    const s = await getDoc(sref);
    if (!s.exists()) {
      try { await setDoc(sref, { distributed: 0 }); } catch (e) { console.error("stats create failed:", e); }
      return shard;
    }
    if ((s.data().distributed + amount) * cfg.poolShards <= cfg.poolCap) return shard;
  }
  throw new Error("POOL_FULL");
}

// ---------- daily claim (one transaction, plain values) ----------
export async function claimDaily(uid, cfg) {
  const cycle = currentCycle(cfg);
  const amount = cfg.dailyReward;
  const shard = await pickShard(cfg, amount);
  await runTransaction(db, async (tx) => {
    const uref = doc(db, "users", uid);
    const pref = doc(db, "profiles", uid);
    const sref = doc(db, "stats", shard);
    const [u, p, s] = await Promise.all([tx.get(uref), tx.get(pref), tx.get(sref)]);
    if (!s.exists()) throw new Error("Reward counter missing");
    if (u.data().lastClaimCycle >= cycle) throw new Error("ALREADY_CLAIMED");
    const used = s.data().distributed;
    if ((used + amount) * cfg.poolShards > cfg.poolCap) throw new Error("POOL_FULL");
    tx.set(doc(db, "dailyClaims", `${uid}_${cycle}`), { uid, cycle, amount, shard, claimedAt: serverTimestamp() });
    tx.update(uref, { claimCount: u.data().claimCount + 1, lastClaimCycle: cycle, lastDailyClaimAt: serverTimestamp() });
    tx.update(pref, { points: p.data().points + amount, dailyRewards: p.data().dailyRewards + amount });
    tx.update(sref, { distributed: used + amount });
  });
}

// ---------- referral reward (after the friend's first claim) ----------
export async function completeReferral(uid, cfg) {
  const rref = doc(db, "referrals", uid);
  const r = await getDoc(rref);
  if (!r.exists() || r.data().status !== "signed_up") return;
  const amount = cfg.referralReward;
  const referrerUid = r.data().referrerUid;
  const shard = await pickShard(cfg, amount);
  await runTransaction(db, async (tx) => {
    const pref = doc(db, "profiles", referrerUid);
    const sref = doc(db, "stats", shard);
    const [rs, p, s] = await Promise.all([tx.get(rref), tx.get(pref), tx.get(sref)]);
    if (!s.exists()) throw new Error("Reward counter missing");
    if (rs.data().status !== "signed_up") return;
    const used = s.data().distributed;
    if ((used + amount) * cfg.poolShards > cfg.poolCap) throw new Error("POOL_FULL");
    tx.update(rref, { status: "rewarded", rewardAmount: amount, completedAt: serverTimestamp(), shard });
    tx.update(pref, { points: p.data().points + amount, refs: p.data().refs + 1, referralRewards: p.data().referralRewards + amount });
    tx.update(sref, { distributed: used + amount });
  });
}

// ---------- leaderboard (cached 2 minutes to save reads) ----------
let lb = { t: 0, rows: [] };
export async function getLeaderboard(force) {
  if (!force && Date.now() - lb.t < 120000) return lb.rows;
  const s = await getDocs(query(collection(db, "profiles"), orderBy("points", "desc"), limit(10)));
  lb = { t: Date.now(), rows: s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.points > 0) };
  return lb.rows;
}