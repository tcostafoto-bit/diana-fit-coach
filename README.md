# Diana Fit Coach

App de treino (PWA) da Diana. Um só `index.html` sem framework, publicada no Vercel.

- `index.html` — a app inteira (dados + lógica + estilo)
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA (adicionar ao ecrã principal, funciona offline)

Para atualizar: muda os ficheiros, sobe a versão em `sw.js` (`VERSION`) e faz push para `main`. O Vercel publica sozinho.
