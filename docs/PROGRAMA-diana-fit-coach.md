# Diana Fit Coach — lógica do programa (v1)

App: https://diana-fit-coach.vercel.app · Repo: `tcostafoto-bit/diana-fit-coach` · Base técnica: Coach ProGolfer.

## Fluxo
1. **Local** (Passo 1): Fitness Up (ginásio) · Ginásio de casa (condomínio) · Sem ginásio (peso corporal, tapete, elásticos). Lembra o último.
2. **Tipo de treino** (Passo 2): 11 cartões, com "última vez" e uma **sugestão** (o grupo treinado há mais tempo, entre os 6 tipos de força).
3. **Cartão do treino**: local + versão (A/B/C), minutos calculados, botões **Curto / Longo**, barra de blocos, lista de exercícios resolvida para o local, "Começar treino".
4. **Modo treino**: igual à Coach ProGolfer (uma coisa de cada vez, superséries em bloco, descanso automático, peso editável, desfazer, saltar, terminar cedo) + **trocar de local a meio** + **temporizador de WOD**.

## Decisões vindas do questionário
- Perder gordura (principal); tonificar e core (secundários); corpo equilibrado.
- 5+ dias/semana, duração escolhida no dia, esforço misto, descansos curtos, superséries às vezes, WOD só como finisher, cardio no início e no fim, aquecimento e alongamentos sempre.
- **Variar muito** → cada tipo tem **3 versões (A/B/C)** que rodam sozinhas de cada vez que um treino desse tipo é guardado ("Guardar e repetir esta versão" mantém).
- Nomes em **inglês em grande, português por baixo**. Sons **desligados** por defeito (botão para ligar). Ecrã sempre ligado.
- Dados **só no telemóvel** (localStorage) + Exportar/Importar cópia (JSON). Preparado para passar a Supabase (interface `save`/`load` única).

## Estrutura de um treino de força (Pernas, Glúteos, Superior, Empurrar, Puxar, Corpo inteiro)
| Bloco | Longo (~40′) | Curto (~25′) |
|---|---|---|
| Aquecimento | 3′ cardio + 2 ativações | igual |
| Força · Supersérie A | 2 exercícios, 3×8–12, `A1 → 30s → A2 → 60s` | igual |
| Força · Supersérie B | 2 exercícios, 3×10–15, `B1 → 30s → B2 → 45s` | **sai** |
| Finisher · WOD | AMRAP 8′ / EMOM 8′ / For Time 3 rondas cap 8′ / Circuito | 5–6′ |
| Alongamentos | 3 alongamentos, 30–40s | igual |

Outros tipos: **Core** (3 blocos curtos de 2 exercícios, descanso 30s, + finisher 6′; curto tira o bloco 3), **HIIT/WOD** (aquecimento + AMRAP 15′ / EMOM 16′ / For Time 4 rondas cap 15′ + alongar), **Circuito** (6 estações × 40s/20s × 4 voltas; curto 3), **Cardio** (aquecimento 5′ + bloco principal + 2.ª máquina + arrefecer + alongar), **Rápido 20′** (sem curto/longo: EMOM 14′ / AMRAP 14′ / Circuito 14′).

## Padrões de movimento → exercício por local (VARIANTS)
Os treinos são escritos em padrões; a app resolve para o local. Exemplos:

| Padrão | Fitness Up | Ginásio de casa | Sem ginásio |
|---|---|---|---|
| squat | Back Squat 40 kg | Back Squat 40 kg | Tempo Squat |
| leg_press | Leg Press 80 kg | Goblet 18 kg | Band Sumo Squat |
| rdl | RDL 40 kg | RDL 40 kg | Single-Leg RDL |
| hip_thrust | Barbell Hip Thrust 50 kg | idem | Single-Leg Glute Bridge |
| glute_med | Hip Abduction Machine 35 kg | Cable Hip Abduction 10 kg | Banded Clamshell |
| hamstring | Lying Leg Curl 25 kg | Standing Leg Curl 12 kg | Hamstring Walkout |
| bench | DB Bench 12 kg/mão | DB Bench 12 kg/mão | Push-Up |
| ohp | Seated DB Shoulder Press 8 kg/mão | idem | Pike Push-Up |
| row_cable | Seated Cable Row 30 kg | Remada baixa 30 kg | Inverted Row (mesa) |
| pulldown | Lat Pulldown 32 kg | Puxada alta 32 kg | Band Lat Pulldown (porta) |
| pullup | Pull-Up | Pull-Up (rack) | Inverted Row |
| pallof | Pallof Press (polia) 10 kg | Band Pallof (rack) | Band Pallof (porta) |
| cardio_warm | Passadeira | Bicicleta | Marcha no lugar |
| cardio_int | Passadeira intervalos | Bike HIIT 30/30 | Corrida no lugar |
| kb_swing | KB Swing 16 kg | KB Swing 16 kg | Broad Jump |
| box_jump | Box Jump | Jump Lunge | Jump Lunge |
| wall_ball | Wall Ball | DB Thruster 6 kg/mão | Band Thruster |

Lista completa: `var VARIANTS` no `index.html` (≈70 padrões). Um item que não é padrão usa-se tal e qual em todos os locais (peso corporal, elásticos, alongamentos).

## Cargas iniciais (estimadas, editáveis série a série)
Back Squat 40 · Front Squat 30 · Deadlift 55 · Sumo 50 · RDL 40 · Hip Thrust 50 · Leg Press 80 · Hack 40 · Goblet 16 · DB Bench 12/mão · Incline 10/mão · Shoulder Press 8/mão · DB Row 14 · Lat Pulldown 32 · Cable Row 30 · Face Pull 15 · KB Swing 16 · Cabos 10–25 · Máquinas de pernas 25–35.
Progressão: séries todas feitas com esforço ≤ indicado → +2,5 kg (barra/máquina) ou +1 kg (halteres). O peso guardado é por exercício (partilhado entre locais quando o exercício é o mesmo).

## WOD engine
- **AMRAP**: contagem decrescente, contador de rondas (−/+), termina sozinho no fim do tempo.
- **EMOM**: um exercício por minuto (roda pela lista), mostra segundos que faltam no minuto, muda sozinho.
- **For Time**: contagem crescente com cap, contador de rondas, "feito" manual.
- **Circuito**: estação × 40s trabalho / 20s descanso × voltas, mostra a estação atual e a fase.
- No fim, os exercícios do bloco ficam marcados e o histórico guarda rondas e tempo.

## Ficheiros
`index.html` (tudo), `manifest.webmanifest`, `sw.js` (mudar `VERSION` a cada atualização), `icons/`. Fontes: Big Shoulders Display + Instrument Sans + IBM Plex Mono (Google Fonts). NoSleep.js (CDN) como reserva do Wake Lock.

## Próximos passos possíveis
- Fotos das máquinas do Fitness Up → afinar nomes/execução.
- Supabase (opção B) para o Tiago ver o histórico sem ficheiro.
- Ajustar cargas depois da 1.ª semana (a Diana exporta a cópia e manda).
