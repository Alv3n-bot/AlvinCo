import { useCfg } from "./config";
import Footer from "./Footer";

const DAY = 86400000;
const n = (x) => Number(x).toLocaleString();
const LABELS = {
  community: "Community / Airdrop", liquidity: "Liquidity", marketing: "Marketing / Community",
  development: "Development", treasury: "Treasury", team: "Team", ecosystem: "Future Ecosystem & Rewards",
};

function useNumbers() {
  const cfg = useCfg();
  const price = cfg.targetMarketCapUsd / cfg.totalSupply;
  const cycles = Math.max(0, Math.ceil((cfg.launchAt - cfg.dailyEpoch) / DAY));
  return { cfg, price, cycles, pct: (cfg.poolCap / cfg.totalSupply) * 100, poolValue: cfg.poolCap * price };
}

function Tokenomics() {
  const { cfg, price, cycles, pct, poolValue } = useNumbers();
  const rows = Object.entries(cfg.allocations);
  const total = rows.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="prose">
      <h1>Tokenomics</h1>
      <p className="sub">Numbers below are read live from the project settings. Nothing here is a promise of value or profit.</p>

      <h2>Supply and price assumption</h2>
      <table><tbody>
        <tr><td>Total supply</td><td>{n(cfg.totalSupply)} AKOIN</td></tr>
        <tr><td>Initial target market cap (assumption)</td><td>${n(cfg.targetMarketCapUsd)}</td></tr>
        <tr><td>Illustrative initial price</td><td>${price.toFixed(8)}</td></tr>
      </tbody></table>
      <p>${n(cfg.targetMarketCapUsd)} ÷ {n(cfg.totalSupply)} AKOIN = ${price.toFixed(8)} per AKOIN. This is only a project assumption. Real prices are set by trading and can be far higher, lower, or zero.</p>

      <h2>Terms that are often confused</h2>
      <ul>
        <li><b>Total supply:</b> every token that will ever exist.</li>
        <li><b>Circulating supply:</b> tokens actually available to trade at a given time.</li>
        <li><b>Market cap:</b> price × circulating supply. <b>FDV</b> (fully diluted value) uses total supply instead.</li>
        <li><b>Liquidity:</b> the money and tokens in the trading pool. It is not the same as market cap, and a tiny pool means prices can swing wildly.</li>
        <li><b>Airdrop allocation:</b> the small share of supply reserved for pre-launch community rewards.</li>
        <li><b>Treasury and liquidity allocations:</b> reserves held for operations and for the trading pool.</li>
      </ul>

      <h2>Allocation</h2>
      <table><thead><tr><th>Bucket</th><th>%</th><th>AKOIN</th></tr></thead><tbody>
        {rows.map(([k, v]) => (<tr key={k}><td>{LABELS[k] || k}</td><td>{v}%</td><td>{n((v / 100) * cfg.totalSupply)}</td></tr>))}
        <tr><td><b>Total</b></td><td><b>{total}%</b></td><td><b>{n((total / 100) * cfg.totalSupply)}</b></td></tr>
      </tbody></table>
      <p className="sub">The largest bucket is Future Ecosystem & Rewards. Its purpose and any lock terms will be published before launch.</p>

      <h2>Pre-launch reward limits</h2>
      <table><tbody>
        <tr><td>Daily reward</td><td>{n(cfg.dailyReward)} AKOIN</td></tr>
        <tr><td>Daily cycles before launch</td><td>{cycles}</td></tr>
        <tr><td>Max daily rewards per user</td><td>{n(cfg.dailyReward * cycles)} AKOIN</td></tr>
        <tr><td>Referral reward</td><td>{n(cfg.referralReward)} AKOIN</td></tr>
        <tr><td>Max referral rewards per user</td><td>{n(cfg.referralReward * cfg.maxReferralsPerUser)} AKOIN</td></tr>
        <tr><td><b>Reward pool hard cap</b></td><td><b>{n(cfg.poolCap)} AKOIN</b></td></tr>
        <tr><td>Share of total supply</td><td>{pct.toFixed(2)}%</td></tr>
        <tr><td>Value of the whole pool at the $ assumption</td><td>${poolValue.toFixed(2)}</td></tr>
      </tbody></table>
      <p>Once the pool cap is reached, no more rewards are issued. The airdrop is deliberately tiny: the reason to join should be the community, not free tokens.</p>
    </div>
  );
}

function Whitepaper() {
  const { cfg, price, cycles, pct } = useNumbers();
  return (
    <div className="prose">
      <h1>AKOIN Whitepaper</h1>
      <h2>1. Introduction</h2>
      <p>AKOIN is a community-driven meme token on the Solana blockchain. This document explains what is planned and what the risks are. It is not an offer or investment advice.</p>
      <h2>2. Vision</h2>
      <p>A light-hearted internet coin built around participation, memes and community rather than corporate promises.</p>
      <h2>3. What is AKOIN?</h2>
      <p>AKOIN is a meme/community token with a fixed supply of {n(cfg.totalSupply)}. It has no guaranteed utility, no promised returns and no claim on any company or asset.</p>
      <h2>4. Community and referral system</h2>
      <p>Each person signs in with Google and receives a personal invite link. When an invited friend signs up and completes their first daily claim, the inviter receives {n(cfg.referralReward)} AKOIN points, up to {n(cfg.maxReferralsPerUser)} referrals per person.</p>
      <h2>5. Daily reward system</h2>
      <p>Each daily cycle, an eligible account can claim {n(cfg.dailyReward)} AKOIN points. Each claim expires at the end of its cycle and does not stack.</p>
      <h2>6. Tokenomics</h2>
      <p>See the Tokenomics page. Illustrative price under a ${n(cfg.targetMarketCapUsd)} market-cap assumption is ${price.toFixed(8)}. That is an assumption, not a promise.</p>
      <h2>7. Launch plan</h2>
      <p>Launch is planned for {cfg.launchAt.toUTCString()}. Dates can change.</p>
      <h2>8. Liquidity</h2>
      <p>A liquidity pool is planned at launch. Liquidity and market cap are different things: a small pool means thin trading and large price swings. Pool details will be published before launch.</p>
      <h2>9. Airdrop mechanics</h2>
      <p>Points are recorded in the project database during the {cycles}-day pre-launch period. A hard cap of {n(cfg.poolCap)} points ({pct.toFixed(2)}% of supply) applies. How points are converted into tokens (for example, a snapshot followed by wallet linking) will be announced and is not guaranteed.</p>
      <h2>10. Anti-abuse system</h2>
      <p>One Google account is one AKOIN account. Rewards are limited by database rules: one claim per cycle, one reward per referral, a hard pool cap, and no self-referrals. Accounts that abuse the system may be suspended or excluded.</p>
      <h2>11. Roadmap</h2>
      <ul>
        <li>Now: website, accounts, referrals and daily rewards.</li>
        <li>Launch: token creation and liquidity pool.</li>
        <li>After launch: community growth, wallet linking and reward conversion, if feasible.</li>
      </ul>
      <p className="sub">The roadmap is a plan, not a commitment.</p>
      <h2>12. Risks</h2>
      <ul>
        <li>The token price can fall to zero.</li>
        <li>Thin liquidity can make trading difficult or impossible.</li>
        <li>Smart-contract, wallet and scam risks exist on any blockchain.</li>
        <li>Laws and platform rules may change and affect the project.</li>
      </ul>
      <h2>13. Disclaimer</h2>
      <p>AKOIN is a meme/community token. Rewards are promotional community rewards, and receiving them does not guarantee financial returns. Market cap and liquidity are different things. The project may change its plans where necessary. Do not spend money you cannot afford to lose.</p>
    </div>
  );
}

function Terms() {
  const cfg = useCfg();
  const items = [
    ["Eligibility", "You must be old enough to use Google accounts and to enter agreements where you live, and you must follow local laws."],
    ["Account rules", "You sign in with Google. Your account is identified by your Google account. You are responsible for its security."],
    ["One-account policy", "One person may hold one AKOIN account. Creating extra accounts to gain rewards is prohibited."],
    ["Referral abuse", "Self-referrals, fake accounts, paid or automated sign-ups and any scheme to manufacture referrals are prohibited. A referral earns at most one reward."],
    ["Bots and automation", "Scripts, bots and automated tools may not be used to sign up, claim or refer."],
    ["Fraud and manipulation", "Attempts to alter points, claims or rules, or to exploit bugs, can result in removal and forfeiture of rewards."],
    ["Reward eligibility", "Rewards are promotional points, subject to the pool cap and the rules in force. They have no guaranteed cash or token value."],
    ["Reward expiration", "Each daily claim expires at the end of its cycle and cannot be recovered or accumulated."],
    ["Account suspension", "We may suspend or exclude accounts we believe are abusing the system, with or without notice."],
    ["Changes to the project", "Plans, amounts, dates and rules may change, including the launch date and the conversion of points."],
    ["Token risks", "Crypto assets are volatile and can lose all value. Nothing here is financial, legal or tax advice."],
    ["No guaranteed returns", "We do not promise profit, price, liquidity or listing."],
    ["User responsibility", "You decide whether to participate and are responsible for your own wallet security, taxes and legal compliance."],
    ["Privacy and data", "We store your Google name, email, profile picture, referral and claim records to run the service. Your name and points appear on the public leaderboard. Your email is private."],
    ["Contact", cfg.contactEmail || "Use the community links in the footer."],
  ];
  return (
    <div className="prose">
      <h1>User Agreement</h1>
      <p className="sub">This is a plain-language agreement for a community project. It is not legal advice, and you should get your own advice if you need it.</p>
      {items.map(([t, d], i) => (<div key={t}><h2>{i + 1}. {t}</h2><p>{d}</p></div>))}
    </div>
  );
}

const PAGES = { tokenomics: Tokenomics, whitepaper: Whitepaper, terms: Terms };
export const isPage = (name) => name in PAGES;

export default function Page({ name }) {
  const C = PAGES[name];
  return (
    <div className="pagewrap">
      <a className="back" href="#/">← Back</a>
      <C />
      <Footer />
    </div>
  );
}