import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Fallback only. The real values live in Firestore: config/app
export const DEFAULTS = {
  launchAt: new Date("2026-11-11T00:00:00Z"),
  dailyEpoch: new Date("2026-10-27T00:00:00Z"),
  dailyReward: 25000,
  referralReward: 50000,
  maxReferralsPerUser: 10,
  poolCap: 200000000,
  poolShards: 10,
  dailyEnabled: true,
  status: "prelaunch",
  totalSupply: 1000000000,
  targetMarketCapUsd: 100000,
  xUrl: "",
  discordUrl: "",
  websiteUrl: "",
  contactEmail: "",
  allocations: { community: 20, liquidity: 35, marketing: 5, development: 5, treasury: 10, team: 5, ecosystem: 20 },
};

export const ConfigCtx = createContext({ ...DEFAULTS, loaded: false });
export const useCfg = () => useContext(ConfigCtx);
export const realUrl = (u) => !!u && !u.includes("PLACEHOLDER");

const toDate = (v, f) => (v && v.toDate ? v.toDate() : f);

export function useConfigLoader() {
  const [cfg, setCfg] = useState({ ...DEFAULTS, loaded: false });
  useEffect(
    () =>
      onSnapshot(
        doc(db, "config", "app"),
        (s) => {
          const d = s.data() || {};
          setCfg({
            ...DEFAULTS,
            ...d,
            launchAt: toDate(d.launchAt, DEFAULTS.launchAt),
            dailyEpoch: toDate(d.dailyEpoch, DEFAULTS.dailyEpoch),
            loaded: s.exists(),
          });
        },
        () => setCfg((c) => ({ ...c, loaded: false }))
      ),
    []
  );
  return cfg;
}