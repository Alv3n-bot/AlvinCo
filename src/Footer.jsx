import { useCfg, realUrl } from "./config";

export default function Footer() {
  const cfg = useCfg();
  return (
    <footer className="foot">
      <div className="flinks">
        <a href="#/tokenomics">Tokenomics</a>
        <a href="#/whitepaper">Whitepaper</a>
        <a href="#/terms">User Agreement</a>
        {realUrl(cfg.xUrl) && <a href={cfg.xUrl} target="_blank" rel="noreferrer">X</a>}
        {realUrl(cfg.discordUrl) && <a href={cfg.discordUrl} target="_blank" rel="noreferrer">Discord</a>}
      </div>
      <div>© 2026 AKOIN </div>
    </footer>
  );
}