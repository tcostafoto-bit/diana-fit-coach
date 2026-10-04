// Botão "Avisar o Tiago": manda uma notificação push (ntfy) ao Tiago para tratar já de um pedido.
// Variáveis na Vercel: APP_PASSCODE, GITHUB_TOKEN (ou github_token), NTFY_TOPIC (nome secreto do canal ntfy).
const REPO = process.env.GITHUB_REPO || "tcostafoto-bit/diana-fit-coach";
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.status(405).json({ error: "Só POST." }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const pass = process.env.APP_PASSCODE;
  if (!pass || String(body.code || "").trim() !== String(pass).trim()) { res.status(401).json({ error: "Código errado." }); return; }
  const n = parseInt(body.n, 10);
  const tok = process.env.GITHUB_TOKEN || process.env.github_token;
  const topic = process.env.NTFY_TOPIC || process.env.ntfy_topic;
  if (!n || !tok) { res.status(400).json({ error: "Pedido inválido." }); return; }
  if (!topic) { res.status(503).json({ error: "O aviso ainda não está configurado (falta NTFY_TOPIC na Vercel)." }); return; }
  const h = { "Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "diana-fit-coach" };
  try {
    const ir = await fetch("https://api.github.com/repos/" + REPO + "/issues/" + n, { headers: h });
    if (!ir.ok) { res.status(404).json({ error: "Pedido não encontrado." }); return; }
    const issue = await ir.json();
    const labels = (issue.labels || []).map(l => l.name);
    if (!labels.includes("pedido-diana") || issue.state !== "open") { res.status(400).json({ error: "Este pedido já não está aberto." }); return; }
    if (labels.includes("urgente")) { res.status(200).json({ ok: true, ja: true }); return; }
    const titulo = String(issue.title || "").replace(/^Pedido da Diana:\s*/, "");
    const p = await fetch("https://ntfy.sh/" + encodeURIComponent(topic), {
      method: "POST",
      headers: { "Title": "Diana quer o pedido #" + n + " feito ja", "Click": issue.html_url, "Tags": "rocket", "Priority": "high" },
      body: titulo.slice(0, 300)
    });
    if (!p.ok) { res.status(502).json({ error: "Não consegui avisar o Tiago (" + p.status + ")." }); return; }
    await fetch("https://api.github.com/repos/" + REPO + "/issues/" + n + "/labels", { method: "POST", headers: h, body: JSON.stringify({ labels: ["urgente"] }) });
    res.status(200).json({ ok: true });
  } catch (e) { res.status(502).json({ error: "Sem ligação." }); }
};
