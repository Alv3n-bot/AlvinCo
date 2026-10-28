import { Fragment, useEffect, useState } from "react";
import { serverNow } from "./api";

// Fallback launch moment: Nov 11, 2026 at 00:00:00 UTC (03:00 in Kenya).
export const LAUNCH_AT = new Date("2026-11-11T00:00:00Z");

const pad = (n) => String(n).padStart(2, "0");

export default function Countdown({ target, label = "LAUNCHING IN", liveText = "AKOIN IS LIVE 🚀", showDate = true }) {
  const [now, setNow] = useState(serverNow());
  useEffect(() => {
    const i = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(i);
  }, []);

  const t = target instanceof Date && !isNaN(target) ? target : LAUNCH_AT;
  const ms = t.getTime() - now;

  if (ms <= 0) return <div className="cdbox"><div className="cdlive">{liveText}</div></div>;

  const s = Math.floor(ms / 1000);
  const units = [
    ["DAYS", String(Math.floor(s / 86400))],
    ["HRS", pad(Math.floor((s % 86400) / 3600))],
    ["MIN", pad(Math.floor((s % 3600) / 60))],
    ["SEC", pad(s % 60)],
  ];

  return (
    <div className={"cdbox" + (ms < 86400000 ? " urgent" : "")}>
      <div className="cdlbl">{label}</div>
      <div className="cdunits">
        {units.map(([l, v], i) => (
          <Fragment key={l}>
            {i > 0 && <span className="cdsep">:</span>}
            <div className="cdu"><b className="cdn" key={v}>{v}</b><small>{l}</small></div>
          </Fragment>
        ))}
      </div>
      {showDate && <div className="cddate">{t.toLocaleString([], { dateStyle: "long", timeStyle: "short" })}</div>}
    </div>
  );
}