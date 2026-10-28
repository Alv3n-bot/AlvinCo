import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { ensureUser } from "./api";
import { ConfigCtx, useConfigLoader } from "./config";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import Page, { isPage } from "./Pages";

// Save the referral code from an invite link like /?ref=AK7X92Q
const ref = new URLSearchParams(location.search).get("ref");
if (ref) localStorage.setItem("akoin_ref", ref.toUpperCase().slice(0, 12));

function useRoute() {
  const [h, setH] = useState(location.hash);
  useEffect(() => {
    const f = () => { setH(location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return h.replace(/^#\/?/, "");
}

export default function App() {
  const cfg = useConfigLoader();
  const route = useRoute();
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [err, setErr] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setErr("");
        if (u) {
          try { await ensureUser(u); } catch (e) { setErr(e.message); }
        }
        setUser(u);
      }),
    []
  );

  let view;
  if (isPage(route)) view = <Page name={route} />;
  else if (user === undefined) view = <div className="center">Loading…</div>;
  else if (user && err) view = <div className="center"><p>{err}</p><button className="btn" onClick={() => signOut(auth)}>Log out</button></div>;
  else view = user ? <Dashboard user={user} /> : <Landing />;

  return <ConfigCtx.Provider value={cfg}>{view}</ConfigCtx.Provider>;
}