// Lista o estado dos pedidos de mudança da Diana (issues com a etiqueta pedido-diana).
const REPO = process.env.GITHUB_REPO || "tcostafoto-bit/diana-fit-coach";
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const pass = process.env.APP_PASSCODE;
  const code = String((req.query && req.query.code) || "").trim();
  if (!pass || code !== String(pass).trim()) { res.status(401).json({ error: "Código errado." }); return; }
  const h = { "Accept": "application/vnd.github+json", "User-Agent": "diana-fit-coach" };
  if ((process.env.GITHUB_TOKEN || process.env.github_token)) h.Authorization = "Bearer " + (process.env.GITHUB_TOKEN || process.env.github_token);
  try {
    const r = await fetch("https://api.github.com/repos/" + REPO + "/issues?labels=pedido-diana&state=all&per_page=20&sort=created&direction=desc", { headers: h });
    if (!r.ok) { res.status(502).json({ error: "Não consegui ver os pedidos." }); return; }
    const list = await r.json();
    const out = [];
    for (const i of list) {
      let resposta = "";
      if (i.comments > 0) {
        try {
          const c = await fetch(i.comments_url + "?per_page=100", { headers: h });
          if (c.ok) { const cs = await c.json(); const last = cs[cs.length - 1]; resposta = last ? String(last.body || "").slice(0, 1500) : ""; }
        } catch (e) {}
      }
      out.push({ n: i.number, titulo: String(i.title || "").replace(/^Pedido da Diana:\s*/, ""), estado: i.state === "closed" ? "feito" : (resposta ? "em curso" : "em fila"), criado: String(i.created_at || "").slice(0, 10), resposta, avisado: (i.labels || []).some(l => l.name === "urgente") });
    }
    res.status(200).json({ pedidos: out });
  } catch (e) { res.status(502).json({ error: "Sem ligação." }); }
};
