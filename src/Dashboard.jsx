import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { claimDaily, completeReferral, getLeaderboard, serverNow, DAY } from "./api";
import { useCfg, realUrl } from "./config";
import Countdown from "./Countdown";
import Footer from "./Footer";

const n = (x) => Number(x).toLocaleString();
const fmt = (ms) => {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export default function Dashboard({ user }) {
  const cfg = useCfg();
  const [me, setMe] = useState(null);
  const [prof, setProf] = useState(null);
  const [top, setTop] = useState([]);
  const [now, setNow] = useState(serverNow());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => onSnapshot(doc(db, "users", user.uid), (s) => setMe(s.data() || null)), [user.uid]);
  useEffect(() => onSnapshot(doc(db, "profiles", user.uid), (s) => setProf(s.data() || null)), [user.uid]);
  useEffect(() => {
    const i = setInterval(() => setNow(serverNow()), 30000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => { getLeaderboard().then(setTop).catch(() => {}); }, [prof?.points]);

  // After a referred user's first claim, reward the person who invited them.
  useEffect(() => {
    if (cfg.loaded && me?.referredBy && me.claimCount >= 1) completeReferral(user.uid, cfg).catch(() => {});
  }, [me?.claimCount, cfg.loaded]);

  if (!me || !prof) return <div className="center">Loading…</div>;

  const cycle = Math.floor((now - cfg.dailyEpoch.getTime()) / DAY);
  const end = Math.min(cfg.dailyEpoch.getTime() + (cycle + 1) * DAY, cfg.launchAt.getTime());
  const open = cfg.loaded && cfg.dailyEnabled && now < cfg.launchAt.getTime() && cycle >= 0;
  const claimed = me.lastClaimCycle === cycle;
  const missed = !claimed && me.claimCount > 0 && me.lastClaimCycle < cycle - 1;
  const link = `${location.origin}/?ref=${me.referralCode}`;

  const doClaim = async () => {
    setBusy(true); setMsg("");
    try {
      await claimDaily(user.uid, cfg);
      getLeaderboard(true).then(setTop).catch(() => {});
    } catch (e) {
      setMsg(e.message === "POOL_FULL" ? "The reward pool is full." : "Claim failed. Please refresh and try again.");
    }
    setBusy(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {}
  };

  return (
    <div className="app"><div className="appin">
      <div className="bar">
        <span className="brand">AKOIN</span>
        <button className="link" onClick={() => signOut(auth)}>Log out</button>
      </div>

      <div className="balwrap">
        <div className="lbl">YOUR BALANCE</div>
        <div className="bal">{n(prof.points)}</div>
        <div className="unit">AKOIN POINTS</div>
      </div>

      <div className="tbox">
        <div className="lbl">DAILY CLAIM</div>
        {!cfg.loaded ? <p className="sub">Rewards are being set up.</p>
          : !open ? <p className="sub">Daily claims are closed.</p>
          : claimed ? (<><div className="big2">Daily claim claimed ✓</div><p className="sub">Next claim in {fmt(end - now)}</p></>)
          : (<>
              <div className="big2">{n(cfg.dailyReward)} AKOIN</div>
              <p className="sub">Expires in {fmt(end - now)}</p>
              <button className="btn primary claim" onClick={doClaim} disabled={busy}>{busy ? "Claiming…" : "Claim"}</button>
            </>)}
        {open && missed && <p className="sub small-p">A previous daily claim expired. Claims don’t stack.</p>}
        {msg && <p className="msg">{msg}</p>}
      </div>

      <Countdown target={cfg.launchAt} />
      <p className="sub small-p" style={{ textAlign: "center" }}>Launch: {cfg.launchAt.toLocaleString()}</p>

      <div className="blk">
        <h3>INVITE FRIENDS</h3>
        {prof.refs === 0
          ? <p className="sub">Invite friends and earn {n(cfg.referralReward)} AKOIN when they make their first claim.</p>
          : <p className="sub">Successful referrals: <b>{prof.refs}</b> · Referral rewards: <b>{n(prof.referralRewards)}</b> AKOIN</p>}
        <div className="row2"><span>Your code</span><b>{me.referralCode}</b></div>
        <div className="row2"><span>Successful referrals</span><b>{prof.refs}</b></div>
        <div className="row2"><span>Referral rewards</span><b>{n(prof.referralRewards)}</b></div>
        <div className="row2"><span>Daily rewards earned</span><b>{n(prof.dailyRewards)}</b></div>
        <div className="copyrow" style={{ marginTop: 10 }}>
          <input className="field" readOnly value={link} />
          <button className="btn" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
        </div>
      </div>

      <div className="blk">
        <h3>LEADERBOARD</h3>
        <ol className="lb">
          {top.length === 0 && <li><span className="nm sub">No one yet. Be first.</span></li>}
          {top.map((u, i) => (
            <li key={u.id} className={u.id === user.uid ? "me" : ""}>
              <span className="rk">{i + 1}</span>
              <span className="nm">{u.name}{u.id === user.uid ? " (you)" : ""}</span>
              <span className="pt">{n(u.points)}</span>
            </li>
          ))}
        </ol>
      </div>

      {(realUrl(cfg.xUrl) || realUrl(cfg.discordUrl)) && (
        <div className="blk">
          <h3>COMMUNITY</h3>
          <div className="buttons2">
            {realUrl(cfg.xUrl) && <a className="btn" href={cfg.xUrl} target="_blank" rel="noreferrer">X</a>}
            {realUrl(cfg.discordUrl) && <a className="btn" href={cfg.discordUrl} target="_blank" rel="noreferrer">Discord</a>}
          </div>
        </div>
      )}

      <div className="blk">
        <h3>ACCOUNT</h3>
        <div className="acct">
          {me.photoURL && <img src={me.photoURL} alt="" referrerPolicy="no-referrer" />}
          <div><b>{me.displayName}</b><div className="sub small-p">{me.email} · {me.accountStatus}</div></div>
        </div>
      </div>

      <Footer />
    </div></div>
  );
}