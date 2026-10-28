import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { useCfg } from "./config";
import Countdown from "./Countdown";
import Footer from "./Footer";

export default function Landing() {
  const cfg = useCfg();
  const [msg, setMsg] = useState("");

  const login = async () => {
    setMsg("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setMsg("Sign-in failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="top">
        <span className="brand">AKOIN</span>
        <button className="btn primary small" onClick={login}>Log in</button>
      </div>
      <main className="hero">
        <img className="logo" src="/akoin-logo.png" alt="AKOIN logo" />
        <h1>THE <span>A</span> COIN.</h1>
        <p className="sub">Built on Solana. Join early, invite friends, stack Akoin before launch.</p>
        <button className="btn primary" onClick={login}>Continue with Google</button>
        {msg && <p className="msg">{msg}</p>}
        <Countdown target={cfg.launchAt} />
        <div className="stats"><span><b>Akoin</b> For Everyone</span><span><b>Solana</b></span><span>Contract <b>soon</b></span></div>
      </main>
      <Footer />
    </div>
  );
}