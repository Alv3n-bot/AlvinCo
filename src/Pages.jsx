
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
      <p className="sub">The numbers behind AKOIN. No unnecessary talk. 🗿</p>

      <h2>Supply and price assumption</h2>
      <table><tbody>
        <tr><td>Total supply</td><td>{n(cfg.totalSupply)} AKOIN</td></tr>
        <tr><td>Initial target market cap </td><td>${n(cfg.targetMarketCapUsd)}</td></tr>
        <tr><td>Illustrative initial price</td><td>${price.toFixed(8)}</td></tr>
      </tbody></table>
      <p>${n(cfg.targetMarketCapUsd)} ÷ {n(cfg.totalSupply)} AKOIN = ${price.toFixed(8)} per AKOIN. The actual market price depends on trading and could be higher or lower.</p>

      <h2>Terms that are often confused</h2>
      <ul>
        <li><b>Total supply:</b> all the tokens that exist or are intended to exist.</li>
        <li><b>Circulating supply:</b> tokens currently available on the market.</li>
        <li><b>Market cap:</b> price × circulating supply. <b>FDV</b> (fully diluted value) uses the total supply instead.</li>
        <li><b>Liquidity:</b> the tokens and funds available in the trading pool. Market cap isn't cash sitting in a pool, and low liquidity can mean wild price swings.</li>
        <li><b>Airdrop allocation:</b> the portion of the supply set aside for community rewards.</li>
        <li><b>Treasury and liquidity allocations:</b> tokens reserved for project needs and the trading pool.</li>
      </ul>

      <h2>Allocation</h2>
      <table><thead><tr><th>Bucket</th><th>%</th><th>AKOIN</th></tr></thead><tbody>
        {rows.map(([k, v]) => (<tr key={k}><td>{LABELS[k] || k}</td><td>{v}%</td><td>{n((v / 100) * cfg.totalSupply)}</td></tr>))}
        <tr><td><b>Total</b></td><td><b>{total}%</b></td><td><b>{n((total / 100) * cfg.totalSupply)}</b></td></tr>
      </tbody></table>
      <p className="sub">Future Ecosystem & Rewards gets the biggest allocation. The exact plans for these tokens, including any lock-up periods, will be shared before launch.</p>

      <h2>Pre-launch reward limits</h2>
      <table><tbody>
        <tr><td>Daily reward</td><td>{n(cfg.dailyReward)} AKOIN</td></tr>
        <tr><td>Daily cycles before launch</td><td>{cycles}</td></tr>
        <tr><td>Max daily rewards per user</td><td>∞ AKOIN</td></tr>
        <tr><td>Referral reward</td><td>{n(cfg.referralReward)} AKOIN</td></tr>
        <tr><td>Max referral rewards per user</td><td>{n(cfg.referralReward * cfg.maxReferralsPerUser)} AKOIN</td></tr>
        <tr><td><b>Reward pool hard cap</b></td><td><b>{n(cfg.poolCap)} AKOIN</b></td></tr>
        <tr><td>Share of total supply</td><td>{pct.toFixed(2)}%</td></tr>
        <tr><td>Value of the whole pool at the $ assumption</td><td>${poolValue.toFixed(2)}</td></tr>
      </tbody></table>
      <p>That's the limit. Once the reward pool is full, rewards stop. The airdrop is only one part of AKOIN — the real point is to build a community people actually want to be part of.</p>
    </div>
  );
}

function Whitepaper() {
  const { cfg, price, cycles, pct } = useNumbers();
  return (
    <div className="prose">
      <h1>AKOIN Whitepaper</h1>
      <h2>1. Introduction</h2>
      <p>AKOIN is a community-driven meme token planned for the Solana blockchain. Here's the plan, how the community rewards work, and what you should know before joining.</p>
      <h2>2. Vision</h2>
      <p>Built for community participation, a project people can join and help grow.</p>
      <h2>3. What is AKOIN?</h2>
      <p>AKOIN is a solana based meme coin and community token with a fixed planned supply of {n(cfg.totalSupply)}.doesn't guarantee utility, returns or ownership in any company or asset.</p>
      <h2>4. Community and referral system</h2>
      <p>Sign in with Google to get your own invite link. When a friend joins through your link and completes their first daily claim, you earn {n(cfg.referralReward)} AKOIN. Referrals are unlimited.</p>
      <h2>5. Daily reward system</h2>
      <p>Eligible accounts can claim {n(cfg.dailyReward)} AKOIN points during each daily cycle. Claims are cycle-based, expire when the cycle ends, and don't stack if you miss a day.</p>
      <h2>6. Tokenomics</h2>
      <p>Check the Tokenomics page for the full breakdown. Using a ${n(cfg.targetMarketCapUsd)} market-cap target gives an illustrative price of ${price.toFixed(8)} per AKOIN. That's a calculation, not a prediction of what the market will pay.</p>
      <h2>7. Launch plan</h2>
      <p>The planned launch date is {cfg.launchAt.toUTCString()}. Plans can change, and any updates will be shared with the community.</p>
      <h2>8. Liquidity</h2>
      <p>A liquidity pool is planned for launch. Pool details will be shared before launch.</p>
      <h2>9. Airdrop mechanics</h2>
      <p>Points are tracked in the project database during the {cycles}-day pre-launch period. The reward pool is capped at {n(cfg.poolCap)} points, equal to {pct.toFixed(2)}% of the total supply. The process for converting points into tokens, such as taking a snapshot and linking wallets, will be announced separately. Points do not automatically guarantee tokens.</p>
      <h2>10. Anti-abuse system</h2>
      <p>One person, one Google account, one AKOIN account. The system is designed to limit claims to one per cycle, referrals to one reward each, and total rewards to the pool cap. Self-referrals are not allowed. Accounts found abusing the system may be suspended or excluded from rewards.</p>
      <h2>11. Roadmap</h2>
      <ul>
        <li>Now: website, Google sign-in, referrals and daily rewards.</li>
        <li>Launch: token creation and liquidity pool setup.</li>
        <li>After launch: community growth, wallet linking and reward conversion, if feasible.</li>
      </ul>
      <p className="sub">This is the current plan. Timelines and features may change.</p>
      <h2>12. Risks</h2>
      <ul>
        <li>The token could lose all its value.</li>
        <li>Low liquidity can make buying or selling difficult.</li>
        <li>Wallets, smart contracts and blockchain transactions carry technical and scam risks.</li>
        <li>Changes in laws or platform rules may affect the project.</li>
      </ul>
      <h2>13. Disclaimer</h2>
      <p>AKOIN is a meme and community token. Points and rewards are promotional and do not guarantee tokens, cash or profit. Market cap is not the same as available liquidity. Project plans may change as needed. Only spend what you can afford to lose.</p>
    </div>
  );
}

function Terms() {
  const cfg = useCfg();
  const items = [
    ["Eligibility", "You must meet the minimum age requirements for Google accounts and agreements in your location, and follow the laws that apply to you."],
    ["Account rules", "Sign in with Google to use AKOIN. Your account is linked to your Google account, and you're responsible for keeping it secure."],
    ["One-account policy", "One person may have one AKOIN account. Creating extra accounts to collect more rewards is not allowed."],
    ["Referral abuse", "No self-referrals, fake accounts, automated sign-ups, paid sign-ups or attempts to game the referral system. Each eligible referral can earn one reward only."],
    ["Bots and automation", "Don't use scripts, bots or automated tools to create accounts, claim rewards or generate referrals."],
    ["Fraud and manipulation", "Trying to change points, bypass claim limits, manipulate the system or exploit bugs may lead to account removal and loss of rewards."],
    ["Reward eligibility", "Rewards are promotional points subject to the pool cap and current project rules. They have no guaranteed cash or token value."],
    ["Reward expiration", "Each daily claim expires at the end of its cycle. Missed claims cannot be recovered or carried forward."],
    ["Account suspension", "Accounts suspected of abusing the system may be suspended or excluded from rewards, with or without prior notice."],
    ["Changes to the project", "Project plans, reward amounts, dates and rules may change, including the launch date and how points may be converted."],
    ["Token risks", "Crypto assets are volatile and can lose all their value. Nothing on this website is financial, legal or tax advice."],
    ["No guaranteed returns", "There are no promises of profit, a specific token price, available liquidity or exchange listings."],
    ["User responsibility", "Participation is your choice. You're responsible for your wallet security, taxes and compliance with applicable laws."],
    ["Privacy and data", "We store your Google name, email, profile picture, referral details and claim records to operate the service. Your name and points appear on the public leaderboard, while your email remains private."],
    ["Contact", cfg.contactEmail || "Reach out through the community links in the footer."],
  ];
  return (
    <div className="prose">
      <h1>User Agreement</h1>
      <p className="sub">The basic rules for using AKOIN. Please read them before joining. This is a plain-language summary, not legal advice.</p>
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
