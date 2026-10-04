# Diana Fit Coach — instruções para o Claude

App de treino (PWA) da Diana, publicada em https://diana-fit-coach.vercel.app. Cada push para `main` publica sozinho na Vercel (~1 min).

## Quem pede mudanças
A Diana (dona da app) ou o Tiago. Fala sempre em **português de Portugal, informal**. A Diana não é programadora: explica as mudanças pelo que ela vê na app, nunca pelo código.

## Como está feito
- **Nunca editar `index.html` à mão.** É gerado. O código-fonte está em `src/`:
  - `00-head.html` — HTML, CSS (paleta: marfim + carvão-ameixa + dourado `#C9A868`), separadores.
  - `01-base-data.js`, `02-extra-data.js` — biblioteca de exercícios (`LIB`), nomes em inglês (`EX_EN`), "sentir/evitar" (`FEEL`), locais (`LOCS`).
  - `02b-figs.js` — figuras de linha dos exercícios (DSL em `FIG`) e `ALIAS`.
  - `03-program.js` — padrões de movimento por local (`VARIANTS`) e **programas** (`TYPES`, `TYPE_ORDER`). Cada programa tem 5 etapas (`versions`), cada etapa tem blocos (aquecimento, superséries A/B/C, finisher WOD, alongamentos).
  - `03b-nutri.js` — nutrição: princípios, suplementos, receitas (`img` = id de foto do Unsplash).
  - `04-engine.js` — toda a lógica e ecrãs (início, treino, biblioteca, nutrição, coach, perfil).
- `api/chat.js` — função da Vercel para o separador **Coach** (usa `ANTHROPIC_API_KEY` e `APP_PASSCODE` das variáveis de ambiente; nunca pôr chaves no código, o repositório é público).
- Depois de mudar `src/`: correr `./tools/build.sh` e `node tools/check.js` (tem de dar `no FIG: []` e `no FEEL: []`).
- Ao publicar: subir `VERSION` em `sw.js` (ex.: `dfc-v12` → `dfc-v13`) para os telemóveis apanharem a versão nova.
- Lógica do programa e decisões: `docs/PROGRAMA-diana-fit-coach.md`.

## Regras do treino da Diana (não mudar sem ela pedir)
40–49 anos, 57 kg, vem do crossfit, sem lesões. Objetivo: perder gordura, tonificar, core. Gosta de: pesos livres (máquinas só o essencial), superséries, descansos curtos, WOD como finisher, cardio no início e no fim, aquecimento e alongamentos sempre, variar muito, treinos puxados. Nomes dos exercícios em inglês com português por baixo. Sons desligados por defeito.

## Como trabalhar
1. Faz a mudança em `src/`, build, check.
2. Testa no telemóvel simulado (Playwright, 390×844) o ecrã que mudaste.
3. Commit e push para `main`. Diz à Diana em 2–3 frases o que mudou e onde ver.
4. Se algo correr mal: `git revert` do último commit e push repõe a versão anterior.
5. Os dados dela (pesos, histórico) ficam só no telemóvel (localStorage, chave `dfc1`). Nunca mudar a estrutura de `st` sem migrar os dados antigos.
