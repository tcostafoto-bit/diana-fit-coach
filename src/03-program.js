
/* ---------- padrões de movimento → exercício por local ----------
   VARIANTS[padrão] = {gym:[exercício, ref], condo:[...], home:[...]}
   Um padrão que não esteja aqui é usado tal e qual em todos os locais (sem carga). */
var VARIANTS = {
  /* pernas e glúteos */
  squat:        {gym:["Squat (Barra) - Rack","45 kg"],               condo:["Squat (Barra) - Rack","45 kg"],               home:["Agachamento Tempo 3-1-1",""]},
  front_squat:  {gym:["Squat Frontal (Barra) - Rack","30 kg"],       condo:["Squat Frontal (Barra) - Rack","30 kg"],       home:["Agachamento Sumo c/ Elástico",""]},
  goblet:       {gym:["Goblet Squat (Halter)","20 kg"],              condo:["Goblet Squat (Halter)","20 kg"],              home:["Agachamento (Peso Corporal)",""]},
  leg_press:    {gym:["Goblet Squat (Halter)","18 kg"],                condo:["Goblet Squat (Halter)","18 kg"],              home:["Agachamento Sumo c/ Elástico",""]},
  hack:         {gym:["Squat Frontal (Barra) - Rack","30 kg"],               condo:["Squat (Barra) - Rack","45 kg"],               home:["Agachamento Tempo 3-1-1",""]},
  deadlift:     {gym:["Deadlift (Barra)","60 kg"],                   condo:["Deadlift (Barra)","60 kg"],                   home:["Bom Dia c/ Elástico",""]},
  rdl:          {gym:["RDL (Barra)","45 kg"],                        condo:["RDL (Barra)","45 kg"],                        home:["RDL Unilateral (Peso Corporal)",""]},
  sumo_dl:      {gym:["Deadlift Sumo (Barra)","55 kg"],              condo:["Deadlift Sumo (Barra)","55 kg"],              home:["Agachamento Sumo c/ Elástico",""]},
  hip_thrust:   {gym:["Hip Thrust (Barra)","60 kg"],                 condo:["Hip Thrust (Barra)","60 kg"],                 home:["Ponte Glúteos Unilateral",""]},
  hip_thrust_db:{gym:["Hip Thrust (Halter)","20 kg"],                condo:["Hip Thrust (Halter)","20 kg"],                home:["Ponte Glúteos (c/ Elástico nos joelhos)",""]},
  bulgarian:    {gym:["Afundo Búlgaro (Banco + Halter)","8 kg/mão"], condo:["Afundo Búlgaro (Banco + Halter)","8 kg/mão"], home:["Afundo Búlgaro (Cadeira)",""]},
  lunge:        {gym:["Afundo Caminhando (Halteres)","8 kg/mão"],    condo:["Afundo Caminhando (Halteres)","8 kg/mão"],    home:["Afundo Inverso",""]},
  stepup:       {gym:["Stepup (Banco + Halteres)","8 kg/mão"],       condo:["Stepup (Banco + Halteres)","8 kg/mão"],       home:["Split Squat (Peso Corporal)",""]},
  glute_med:    {gym:["Monster Walk (c/ Elástico nos joelhos)",""],                 condo:["Abdução de Anca na Polia Baixa","10 kg"],     home:["Clamshell c/ Mini Band",""]},
  glute_med2:   {gym:["Abdução de Anca (Polia)","10 kg"],            condo:["Monster Walk (c/ Elástico nos joelhos)",""],  home:["Abdução de Anca Deitada",""]},
  kickback:     {gym:["Kickback de Glúteo (Polia)","10 kg"],         condo:["Kickback de Glúteo na Polia Baixa","10 kg"],  home:["Kickback de Glúteo c/ Mini Band",""]},
  hamstring:    {gym:["Leg Curl Deitada (Máquina)","25 kg"],         condo:["Flexão de Pernas em Pé (Rolos)","12 kg"],     home:["Hamstring Walkout",""]},
  hamstring2:   {gym:["Kettlebell Swing","20 kg"],         condo:["Flexão de Pernas em Pé (Rolos)","12 kg"],     home:["Ponte Glúteos Unilateral",""]},
  quad_iso:     {gym:["Goblet Squat (Halter)","20 kg"],       condo:["Extensão de Pernas (Rolos)","25 kg"],         home:["Agachamento Tempo 3-1-1",""]},
  adductor:     {gym:["Deadlift Sumo (Barra)","45 kg"],                  condo:["Adução de Anca na Polia Baixa","10 kg"],      home:["Agachamento Sumo c/ Elástico",""]},
  pull_through: {gym:["Pull-Through (Polia)","20 kg"],               condo:["Kettlebell Swing","12 kg"],                   home:["Bom Dia c/ Elástico",""]},
  kb_swing:     {gym:["Kettlebell Swing","20 kg"],                   condo:["Kettlebell Swing","20 kg"],                   home:["Salto em Comprimento",""]},
  /* superior */
  bench:        {gym:["Supino c/ Halteres","14 kg/mão"],             condo:["Supino Plano (Halteres) – Banco","14 kg/mão"], home:["Flexões (Padrão)",""]},
  incline:      {gym:["Supino Inclinado (Halteres)","10 kg/mão"],    condo:["Supino Inclinado (Halteres) – Banco","10 kg/mão"], home:["Flexões em Declive",""]},
  chest_press:  {gym:["Supino Inclinado (Halteres)","10 kg/mão"],              condo:["Supino na Máquina (Chest Press)","30 kg"],    home:["Flexões (Padrão)",""]},
  fly:          {gym:["Crucifixo (Halteres) – Banco Plano","6 kg/mão"],                  condo:["Butterfly (Pec Deck)","20 kg"],               home:["Flexões em Incline",""]},
  ohp:          {gym:["Desenvolvimento Ombro (Halteres) – Banco Sentado","8 kg/mão"], condo:["Desenvolvimento Ombro (Halteres) – Banco Sentado","8 kg/mão"], home:["Pike Push-Up",""]},
  ohp2:         {gym:["Desenvolvimento Ombro (Halteres em pé)","8 kg/mão"],           condo:["Desenvolvimento Ombro (Halteres em pé)","8 kg/mão"], home:["Press de Ombros c/ Elástico",""]},
  lat_raise:    {gym:["Elevação Lateral (Halteres)","5 kg/mão"],            condo:["Elevação Lateral na Polia Baixa","5 kg"],     home:["Elevação Lateral c/ Elástico",""]},
  row_db:       {gym:["Remada com Halteres (Unilateral)","14 kg"],   condo:["Remada com Halteres (Unilateral)","14 kg"],   home:["Remada c/ Elástico",""]},
  row_cable:    {gym:["Remada Sentada (Polia)","30 kg"],             condo:["Remada Baixa Sentada","30 kg"],               home:["Remada Invertida (Mesa)",""]},
  row_chest:    {gym:["Remada Curvada (Barra)","25 kg"], condo:["Remada Curvada (Barra)","25 kg"],             home:["Remada c/ Elástico",""]},
  pulldown:     {gym:["Lat Pulldown (Polia)","36 kg"],               condo:["Puxada Alta (Barra Larga)","36 kg"],          home:["Puxada c/ Elástico (Porta)",""]},
  pulldown_close:{gym:["Pull-Up Assistido (Máquina ou Elástico)",""], condo:["Puxada Pega Fechada (Supinada)","30 kg"],    home:["Puxada c/ Elástico (Porta)",""]},
  pullup:       {gym:["Pull-Up (Barra)",""],                         condo:["Pull-Up (Barra)",""],                         home:["Remada Invertida (Mesa)",""]},
  face_pull:    {gym:["Face Pull (Polia)","15 kg"],                  condo:["Face Pull (Corda na Polia Alta)","15 kg"],    home:["Pull Apart (c/ Elástico)",""]},
  rear_delt:    {gym:["Fly Reverso (Halteres) – Banco Inclinado","5 kg/mão"], condo:["Fly Reverso (Halteres) – Banco Inclinado","5 kg/mão"], home:["Pull Apart (c/ Elástico)",""]},
  biceps:       {gym:["Rosca Direta (Barra/Halteres)","8 kg/mão"],   condo:["Rosca Direta (Halteres) – Banco Sentado","8 kg/mão"], home:["Rosca Bíceps c/ Elástico",""]},
  biceps2:      {gym:["Rosca Martelo (Halteres)","8 kg/mão"],              condo:["Rosca Bíceps na Polia Baixa","15 kg"],        home:["Rosca Bíceps c/ Elástico",""]},
  hammer:       {gym:["Rosca Martelo (Halteres)","8 kg/mão"],        condo:["Rosca Martelo (Halteres)","8 kg/mão"],        home:["Rosca Bíceps c/ Elástico",""]},
  triceps:      {gym:["Tríceps na Polia (Corda)","15 kg"],           condo:["Tríceps na Polia Alta (Corda)","15 kg"],      home:["Flexões Diamante",""]},
  triceps2:     {gym:["Extensão de Tríceps (Halteres acima cabeça)","6 kg/mão"], condo:["Extensão de Tríceps (Halteres acima cabeça)","6 kg/mão"], home:["Extensão de Tríceps c/ Elástico",""]},
  dips:         {gym:["Tricep Dips (Banco)",""],                     condo:["Dips (Banco)",""],                            home:["Dips (Cadeira)",""]},
  pushup_hard:  {gym:["Flexões em Declive (Pés elevados)",""],       condo:["Flexões em Declive (Pés elevados)",""],       home:["Flexões em Declive",""]},
  farmer:       {gym:["Farmer's Carry (Halteres)","16 kg/mão"],      condo:["Farmer's Carry (Halteres)","16 kg/mão"],      home:["Hollow Hold",""]},
  renegade:     {gym:["Renegade Row (Halteres)","8 kg/mão"],         condo:["Renegade Row (Halteres)","8 kg/mão"],         home:["Prancha c/ Toque Ombro",""]},
  /* core */
  pallof:       {gym:["Pallof Press (Polia)","10 kg"],               condo:["Pallof Press (Elástico)",""],                 home:["Pallof Press (Elástico na Porta)",""]},
  cable_crunch: {gym:["Crunch na Polia (Corda)","25 kg"],            condo:["Crunch na Polia Alta","25 kg"],               home:["V-Up",""]},
  woodchop:     {gym:["Woodchop (Polia)","12 kg"],                   condo:["Woodchop Alto-Baixo (Polia)","12 kg"],        home:["Woodchop c/ Elástico (Bilateral)",""]},
  hanging_knee: {gym:["Elevação de Joelhos na Barra",""],            condo:["Elevação de Joelhos na Barra",""],            home:["Bicicleta (Abdominal)",""]},
  /* cardio */
  cardio_warm:  {gym:["Passadeira – Aquecimento",""],                condo:["Bicicleta Estática – Aquecimento",""],        home:["Marcha no Lugar",""]},
  cardio_warm2: {gym:["Remo – Aquecimento",""],                      condo:["Bicicleta Estática – Aquecimento",""],        home:["Polichinelos",""]},
  cardio_int:   {gym:["Passadeira – Intervalos",""],                 condo:["Bicicleta Estática – HIIT (30s / 30s)",""],   home:["Corrida no Lugar",""]},
  cardio_int2:  {gym:["Remo – Intervalos",""],                       condo:["Bicicleta Estática – HIIT (30s / 30s)",""],   home:["Corda de Saltar",""]},
  cardio_int3:  {gym:["Escada – Intervalos",""],                     condo:["Bicicleta Estática – HIIT (30s / 30s)",""],   home:["Skaters",""]},
  cardio_steady:{gym:["Passadeira – Inclinada",""],                  condo:["Bicicleta Estática – Recuperação Ativa",""],  home:["Corrida no Lugar",""]},
  cardio_steady2:{gym:["Escada – Contínuo",""],                      condo:["Bicicleta Estática – Recuperação Ativa",""],  home:["Polichinelos",""]},
  cardio_ell:   {gym:["Elíptica – Contínuo",""],                     condo:["Bicicleta Estática – Recuperação Ativa",""],  home:["Marcha no Lugar",""]},
  cardio_cool:  {gym:["Passadeira – Aquecimento",""],                condo:["Bicicleta Estática – Recuperação Ativa",""],  home:["Marcha no Lugar",""]},
  /* WOD */
  box_jump:     {gym:["Box Jump",""],                                condo:["Afundo com Salto",""],                        home:["Afundo com Salto",""]},
  wall_ball:    {gym:["Wall Ball",""],                               condo:["Thruster (Halteres)","6 kg/mão"],             home:["Squat to Press c/ Elástico",""]},
  thruster:     {gym:["Thruster (Halteres)","8 kg/mão"],             condo:["Thruster (Halteres)","8 kg/mão"],             home:["Squat to Press c/ Elástico",""]},
  row_cal:      {gym:["Remo – Intervalos",""],                       condo:["Bicicleta Estática – HIIT (30s / 30s)",""],   home:["Burpees",""]},
  /* alongamentos que mudam de sítio */
  st_chest:     {gym:["Alongamento Peitoral",""],                    condo:["Alongamento Peitoral",""],                    home:["Alongamento Peitoral (Porta)",""]},
  st_lats:      {gym:["Alongamento Dorsais (Lats)",""],              condo:["Alongamento Dorsais (Lats)",""],              home:["Alongamento Dorsais (Mesa)",""]},
  st_hams:      {gym:["Alongamento Posteriores (Hamstrings)",""],    condo:["Alongamento Posteriores (Hamstrings)",""],    home:["Alongamento Posteriores (Sentada)",""]}
};

/* ---------- tipos de treino ----------
   Cada tipo tem 3 versões (A/B/C) que rodam sozinhas.
   item = [padrão ou exercício, "3×10" | "3×30s" | "3×10/lado" | "10 reps", esforço 1-10]
   bloco = {name, rest, items, short:false (sai no curto) | {items} (troca no curto), wod:{kind, min|cap|work/rest/rounds}}
   Os minutos de cada bloco são calculados. */
var AQ = "Aquecimento", A = "Força · Supersérie A", B = "Força · Supersérie B", AL = "Alongamentos", FIN = "Finisher · WOD", CD = "Cardio · Final";
var RA = "A1 → 30s → A2 → 75s", RB = "B1 → 30s → B2 → 60s", RC = "C1 → 20s → C2 → 45s", C = "Força · Supersérie C";

function wodBlock(name, kind, opts, items, shortOpts){
  var b = {name:name, rest:"", wod:Object.assign({kind:kind}, opts), items:items};
  if (shortOpts) b.short = {wod:Object.assign({kind:kind}, opts, shortOpts)};
  return b;
}


/* ================= PROGRAMAS =================
   Cada programa = 5 etapas feitas por ordem (Etapa 1 → 5 → recomeça, ciclo +1).
   Mesma lógica de treino: cardio no aquecimento, superséries, descansos curtos,
   finisher WOD, alongamentos. Curto = sem bloco C e finisher mais curto. */
var W_LEG = [["cardio_warm","3 min",3],["Ponte Glúteos (c/ Elástico nos joelhos)","1×15",2],["Monster Walk (c/ Elástico nos joelhos)","1×12 passos",2]];
var W_LEG2 = [["cardio_warm2","3 min",3],["Clamshell c/ Mini Band","1×15/lado",2],["Alongamento do Mundo (World's Greatest)","1×5/lado",1]];
var W_UP = [["cardio_warm2","3 min",3],["Pull Apart (c/ Elástico)","1×15",2],["Rotação Externa Ombro (c/ Elástico)","1×12/lado",2]];
var W_FULL = [["cardio_warm","3 min",3],["Alongamento do Mundo (World's Greatest)","1×5/lado",1],["Agachamento (Peso Corporal)","1×12",2]];
var W_CORE = [["cardio_warm","3 min",3],["Cat-Camel (Chão)","1×8",1],["Dead Bug (Chão)","1×8/lado",2]];
var S_LEG = [["Alongamento Glúteo (Figura 4)","1×40s/lado",1],["Alongamento Flexores da Anca","1×40s/lado",1],["st_hams","1×30s/lado",1]];
var S_LEG2 = [["Pigeon","1×40s/lado",1],["Alongamento Quadricípite (De Pé)","1×30s/lado",1],["Alongamento Gémeos (Parede)","1×30s/lado",1]];
var S_UP = [["st_chest","1×40s/lado",1],["st_lats","1×40s",1],["Alongamento Tríceps e Ombro","1×30s/lado",1]];
var S_FULL = [["Alongamento Flexores da Anca","1×40s/lado",1],["st_chest","1×30s/lado",1],["Postura da Criança","1×40s",1]];
var CD_END = "Cardio · Final";

function aq(items){ return {name:AQ, rest:"seguido", items:items}; }
function al(items){ return {name:AL, rest:"respira fundo", items:items}; }
function ss(name, rest, items, opt){ var b = {name:name, rest:rest, items:items}; if (opt === "long") b.short = false; return b; }
function fin(kind, opts, items, sh){ return wodBlock(FIN, kind, opts, items, sh); }
function cdEnd(pat, min){ return {name:CD_END, rest:"seguido", short:false, items:[[pat, min + " min", 7]]}; }
function stage(title, blocks){ return {title:title, blocks:blocks}; }

var REST_A = "A1 → 30s → A2 → 75s", REST_B = "B1 → 30s → B2 → 60s", REST_C = "C1 → 20s → C2 → 45s";
var FL_A = "A1 → 15s → A2 → 45s", FL_B = "B1 → 15s → B2 → 45s", FL_C = "C1 → 15s → C2 → 30s";
var ST_A = "A1 → 45s → A2 → 120s", ST_B = "B1 → 45s → B2 → 90s";

var TYPES = {
  /* ---------- GLÚTEO REDONDO ---------- */
  glutes: {name:"Glúteo redondo", focus:"Glúteos fortes e redondos, pernas firmes", goal:"4 etapas de glúteo e pernas com cargas altas + 1 de parte superior para equilibrar.", kind:"strength", versions:[
    stage("Hip thrust pesado", [aq(W_LEG),
      ss(A, REST_A, [["hip_thrust","4×8",9],["glute_med","4×15",8]]),
      ss(B, REST_B, [["rdl","4×10",8],["kickback","3×15/lado",8]]),
      ss(C, REST_C, [["bulgarian","3×12/lado",8],["Ponte Glúteos Unilateral","3×12/lado",8]], "long"),
      fin("amrap", {min:10}, [["kb_swing","15 reps",8],["Jump Squats","10 reps",8],["Monster Walk (c/ Elástico nos joelhos)","12 passos",8]], {min:6}),
      al(S_LEG)]),
    stage("Unilateral e glúteo médio", [aq(W_LEG2),
      ss(A, REST_A, [["bulgarian","4×10/lado",9],["glute_med2","3×15/lado",8]]),
      ss(B, REST_B, [["sumo_dl","4×8",8],["hip_thrust_db","3×15",8]]),
      ss(C, REST_C, [["stepup","3×10/lado",8],["Clamshell c/ Mini Band","2×20/lado",8]], "long"),
      fin("emom", {min:10}, [["Afundo com Salto","12 reps",8],["kb_swing","15 reps",8]], {min:7}),
      al(S_LEG2)]),
    stage("Superior + core", [aq(W_UP),
      ss(A, REST_A, [["pulldown","4×10",8],["bench","4×10",8]]),
      ss(B, REST_B, [["row_db","3×12/lado",8],["ohp","3×10",8]]),
      ss(C, REST_C, [["face_pull","3×15",7],["pallof","3×12/lado",8]], "long"),
      fin("fortime", {cap:10, rounds:4}, [["Flexões (Padrão)","10 reps",8],["renegade","10 reps",8],["Mountain Climbers","20 reps",8]], {cap:6, rounds:3}),
      al(S_UP)]),
    stage("Hinge e posteriores", [aq(W_LEG),
      ss(A, REST_A, [["deadlift","4×6",9],["hip_thrust","4×12",8]]),
      ss(B, REST_B, [["hamstring","4×12",8],["pull_through","3×15",8]]),
      ss(C, REST_C, [["lunge","3×12/lado",8],["glute_med","3×15",8]], "long"),
      fin("circuit", {work:40, rest:20, rounds:3}, [["Ponte Glúteos Unilateral","40s",8],["Agachamento Sumo c/ Elástico","40s",8],["Kickback de Glúteo c/ Mini Band","40s",8],["Jump Squats","40s",8]], {rounds:2}),
      al(S_LEG)]),
    stage("Volume de glúteo", [aq(W_LEG2),
      ss(A, REST_A, [["hip_thrust","4×12",9],["squat","4×10",8]]),
      ss(B, REST_B, [["bulgarian","3×12/lado",8],["kickback","3×15/lado",8]]),
      ss(C, REST_C, [["glute_med","3×20",8],["Hamstring Walkout","3×10",8]], "long"),
      fin("amrap", {min:10}, [["Ponte Glúteos (c/ Elástico nos joelhos)","20 reps",8],["Afundo com Salto","12 reps",8],["kb_swing","15 reps",8]], {min:6}),
      al(S_LEG2)])
  ]},

  /* ---------- SÓ GLÚTEO ---------- */
  gluteonly: {name:"Só glúteo", focus:"100% glúteo, mais nada: cada etapa ataca uma parte", goal:"Cada etapa tem um foco: glúteo máximo, médio, a ligação com os posteriores, unilateral e pump final.", kind:"strength", versions:[
    stage("Glúteo máximo · Hip thrust", [aq(W_LEG),
      ss(A, REST_A, [["hip_thrust","5×8",9],["Ponte Glúteos (c/ Elástico nos joelhos)","4×20",8]]),
      ss(B, REST_B, [["hip_thrust_db","4×12",8],["kickback","3×15/lado",8]]),
      ss(C, REST_C, [["Ponte Glúteos Unilateral","3×12/lado",8],["glute_med","3×20",8]], "long"),
      fin("amrap", {min:8}, [["Ponte Glúteos (c/ Elástico nos joelhos)","20 reps",8],["kb_swing","15 reps",8],["Monster Walk (c/ Elástico nos joelhos)","12 passos",8]], {min:5}),
      al(S_LEG)]),
    stage("Glúteo médio · Lateral da anca", [aq(W_LEG2),
      ss(A, REST_A, [["glute_med","4×15",9],["Monster Walk (c/ Elástico nos joelhos)","4×15 passos",8]]),
      ss(B, REST_B, [["glute_med2","4×15/lado",8],["Clamshell c/ Mini Band","3×20/lado",8]]),
      ss(C, REST_C, [["Abdução de Anca Deitada","3×20/lado",8],["Agachamento Sumo c/ Elástico","3×15",8]], "long"),
      fin("emom", {min:8}, [["Monster Walk (c/ Elástico nos joelhos)","15 passos",8],["Clamshell c/ Mini Band","15/lado",8]], {min:6}),
      al(S_LEG2)]),
    stage("Glúteo e posteriores · Hinge", [aq(W_LEG),
      ss(A, REST_A, [["rdl","4×10",9],["pull_through","4×15",8]]),
      ss(B, REST_B, [["sumo_dl","4×8",8],["kb_swing","4×15",8]]),
      ss(C, REST_C, [["RDL Unilateral (Peso Corporal)","3×10/lado",8],["Hamstring Walkout","3×10",8]], "long"),
      fin("amrap", {min:8}, [["kb_swing","15 reps",8],["Ponte Glúteos Unilateral","10/lado",8]], {min:5}),
      al(S_LEG)]),
    stage("Glúteo unilateral · Uma perna", [aq(W_LEG2),
      ss(A, REST_A, [["bulgarian","4×10/lado",9],["Ponte Glúteos Unilateral","4×12/lado",8]]),
      ss(B, REST_B, [["stepup","4×10/lado",8],["kickback","3×15/lado",8]]),
      ss(C, REST_C, [["lunge","3×12/lado",8],["glute_med2","3×15/lado",8]], "long"),
      fin("emom", {min:8}, [["Afundo com Salto","12 reps",8],["Ponte Glúteos Unilateral","10/lado",8]], {min:6}),
      al(S_LEG2)]),
    stage("Pump final · Queimar o glúteo", [aq(W_LEG),
      ss(A, FL_A, [["hip_thrust","4×15",9],["glute_med","4×20",8]]),
      ss(B, FL_B, [["kickback","4×15/lado",8],["Kickback de Glúteo c/ Mini Band","3×20/lado",8]]),
      ss(C, FL_C, [["Ponte Glúteos (c/ Elástico nos joelhos)","3×25",8],["Clamshell c/ Mini Band","3×20/lado",8]], "long"),
      fin("circuit", {work:40, rest:20, rounds:3}, [["Ponte Glúteos (c/ Elástico nos joelhos)","40s",8],["Monster Walk (c/ Elástico nos joelhos)","40s",8],["Kickback de Glúteo c/ Mini Band","40s",8],["Agachamento Sumo c/ Elástico","40s",8]], {rounds:2}),
      al(S_LEG)])
  ]},

  /* ---------- PERDA DE PESO ---------- */
  fatloss: {name:"Perda de peso", focus:"Queimar mais, perder gordura sem perder músculo", goal:"Corpo inteiro com descansos curtos, superséries rápidas, finishers longos e 1 etapa de cardio intervalado.", kind:"strength", versions:[
    stage("Corpo inteiro · superséries", [aq(W_FULL),
      ss(A, FL_A, [["squat","4×10",8],["row_db","4×10/lado",8]]),
      ss(B, FL_B, [["rdl","4×10",8],["bench","4×10",8]]),
      ss(C, FL_C, [["lunge","3×12/lado",8],["pallof","3×12/lado",8]], "long"),
      fin("amrap", {min:12}, [["Burpees","8 reps",9],["kb_swing","15 reps",8],["Mountain Climbers","20 reps",8]], {min:7}),
      al(S_FULL)]),
    stage("Circuito metabólico", [aq(W_FULL),
      wodBlock("Circuito", "circuit", {work:40, rest:20, rounds:5}, [["goblet","40s",8],["Flexões (Padrão)","40s",8],["kb_swing","40s",9],["row_db","40s",8],["Mountain Climbers","40s",8],["Prancha (Frontal)","40s",7]], {rounds:3}),
      fin("emom", {min:8}, [["Burpees","10 reps",9],["Jump Squats","15 reps",8]], {min:6}),
      al(S_FULL)]),
    stage("Pernas + cardio", [aq(W_LEG),
      ss(A, FL_A, [["goblet","4×15",8],["hip_thrust","4×12",8]]),
      ss(B, FL_B, [["lunge","4×12/lado",8],["hamstring","3×12",8]]),
      ss(C, FL_C, [["stepup","3×12/lado",8],["glute_med","3×20",8]], "long"),
      fin("fortime", {cap:12, rounds:5}, [["box_jump","10 reps",9],["kb_swing","15 reps",8],["Skaters","20 reps",8]], {cap:7, rounds:3}),
      cdEnd("cardio_int", 5), al(S_LEG)]),
    stage("Superior + core metabólico", [aq(W_UP),
      ss(A, FL_A, [["pulldown","4×12",8],["incline","4×12",8]]),
      ss(B, FL_B, [["row_cable","4×12",8],["ohp2","3×12",8]]),
      ss(C, FL_C, [["renegade","3×10",8],["cable_crunch","3×15",8]], "long"),
      fin("amrap", {min:12}, [["thruster","10 reps",9],["Mountain Climbers","20 reps",8],["V-Up","10 reps",8]], {min:7}),
      al(S_UP)]),
    stage("Intervalos + WOD", [aq([["cardio_warm","5 min",3],["Agachamento (Peso Corporal)","1×15",2],["Polichinelos","1×30",3]]),
      {name:"Cardio · Intervalos", rest:"seguido", items:[["cardio_int","10 min",9]], short:{items:[["cardio_int","8 min",9]]}},
      wodBlock("WOD · For Time", "fortime", {cap:15, rounds:5}, [["wall_ball","15 reps",9],["Burpees","10 reps",9],["kb_swing","15 reps",8],["Sit-Up","15 reps",8]], {cap:10, rounds:3}),
      cdEnd("cardio_int2", 8), al(S_FULL)])
  ]},

  /* ---------- GANHAR FORÇA ---------- */
  strength: {name:"Ganhar força", focus:"Pesos a subir nos básicos: squat, deadlift, hip thrust, supino", goal:"Poucas repetições e cargas altas nos básicos, descansos maiores, finisher curto.", kind:"strength", versions:[
    stage("Squat pesado", [aq(W_LEG),
      ss(A, ST_A, [["squat","5×5",9],["pullup","4×6",8]]),
      ss(B, ST_B, [["rdl","4×6",8],["ohp","4×6",8]]),
      ss(C, REST_C, [["bulgarian","3×8/lado",8],["farmer","3×40s",8]], "long"),
      fin("emom", {min:8}, [["kb_swing","12 reps",8],["Prancha (Frontal)","40s",8]], {min:6}),
      al(S_LEG)]),
    stage("Supino e remada", [aq(W_UP),
      ss(A, ST_A, [["bench","5×5",9],["row_chest","5×6",8]]),
      ss(B, ST_B, [["incline","4×6",8],["pulldown","4×8",8]]),
      ss(C, REST_C, [["dips","3×8",8],["hammer","3×10",8]], "long"),
      fin("amrap", {min:6}, [["Flexões (Padrão)","8 reps",8],["renegade","8 reps",8]], {min:5}),
      al(S_UP)]),
    stage("Deadlift pesado", [aq(W_LEG2),
      ss(A, ST_A, [["deadlift","5×4",9],["hanging_knee","4×10",8]]),
      ss(B, ST_B, [["front_squat","4×6",8],["hamstring","4×8",8]]),
      ss(C, REST_C, [["hip_thrust_db","3×10",8],["pallof","3×10/lado",8]], "long"),
      fin("emom", {min:8}, [["box_jump","6 reps",8],["farmer","40s",8]], {min:6}),
      al(S_LEG2)]),
    stage("Hip thrust e ombros", [aq(W_LEG),
      ss(A, ST_A, [["hip_thrust","5×6",9],["ohp","5×5",9]]),
      ss(B, ST_B, [["sumo_dl","4×6",8],["pullup","4×6",8]]),
      ss(C, REST_C, [["lunge","3×8/lado",8],["lat_raise","3×12",8]], "long"),
      fin("amrap", {min:6}, [["thruster","8 reps",8],["Sit-Up","12 reps",8]], {min:5}),
      al(S_FULL)]),
    stage("Corpo inteiro pesado", [aq(W_FULL),
      ss(A, ST_A, [["front_squat","5×5",9],["bench","5×5",9]]),
      ss(B, ST_B, [["rdl","4×6",8],["row_db","4×8/lado",8]]),
      ss(C, REST_C, [["farmer","3×40s",8],["cable_crunch","3×12",8]], "long"),
      fin("fortime", {cap:8, rounds:3}, [["kb_swing","10 reps",8],["Flexões (Padrão)","8 reps",8],["Jump Squats","8 reps",8]], {cap:6, rounds:2}),
      al(S_LEG)])
  ]},

  /* ---------- TONIFICAR ---------- */
  tone: {name:"Tonificar e definir", focus:"Corpo equilibrado, firme e definido", goal:"8 a 15 repetições, superséries em todos os blocos, corpo todo em 5 etapas.", kind:"strength", versions:[
    stage("Pernas e glúteos", [aq(W_LEG),
      ss(A, REST_A, [["squat","4×10",8],["hamstring","4×12",8]]),
      ss(B, REST_B, [["hip_thrust","4×12",8],["glute_med","3×15",8]]),
      ss(C, REST_C, [["lunge","3×12/lado",8],["quad_iso","3×15",8]], "long"),
      fin("amrap", {min:10}, [["kb_swing","15 reps",8],["Jump Squats","10 reps",8],["Mountain Climbers","20 reps",8]], {min:6}),
      al(S_LEG)]),
    stage("Costas e braços", [aq(W_UP),
      ss(A, REST_A, [["pulldown","4×10",8],["row_db","4×10/lado",8]]),
      ss(B, REST_B, [["face_pull","3×15",7],["biceps","3×12",8]]),
      ss(C, REST_C, [["rear_delt","3×15",7],["triceps","3×12",8]], "long"),
      fin("emom", {min:10}, [["Burpees","8 reps",8],["renegade","10 reps",8]], {min:7}),
      al(S_UP)]),
    stage("Corpo inteiro", [aq(W_FULL),
      ss(A, REST_A, [["rdl","4×10",8],["incline","4×10",8]]),
      ss(B, REST_B, [["bulgarian","3×10/lado",8],["row_cable","3×12",8]]),
      ss(C, REST_C, [["kickback","3×15/lado",8],["pallof","3×12/lado",8]], "long"),
      fin("fortime", {cap:10, rounds:4}, [["thruster","10 reps",8],["Flexões (Padrão)","10 reps",8],["Sit-Up","15 reps",8]], {cap:6, rounds:3}),
      al(S_FULL)]),
    stage("Peito, ombros e core", [aq(W_UP),
      ss(A, REST_A, [["bench","4×10",8],["ohp","4×10",8]]),
      ss(B, REST_B, [["fly","3×15",8],["lat_raise","3×15",8]]),
      ss(C, REST_C, [["dips","3×12",8],["cable_crunch","3×15",8]], "long"),
      fin("circuit", {work:40, rest:20, rounds:3}, [["Prancha (Frontal)","40s",8],["Mountain Climbers","40s",8],["Flexões (Padrão)","40s",8],["Bicicleta (Abdominal)","40s",8]], {rounds:2}),
      al(S_UP)]),
    stage("Glúteo e posteriores", [aq(W_LEG2),
      ss(A, REST_A, [["hip_thrust","4×12",8],["rdl","4×10",8]]),
      ss(B, REST_B, [["stepup","3×12/lado",8],["glute_med2","3×15/lado",8]]),
      ss(C, REST_C, [["pull_through","3×15",8],["adductor","3×15",8]], "long"),
      fin("amrap", {min:10}, [["Ponte Glúteos (c/ Elástico nos joelhos)","20 reps",8],["Skaters","20 reps",8],["kb_swing","15 reps",8]], {min:6}),
      al(S_LEG2)])
  ]},

  /* ---------- CORE E POSTURA ---------- */
  core: {name:"Core e postura", focus:"Abdominal forte, costas saudáveis, postura direita", goal:"Core em todos os ângulos, costas e glúteo médio, com mais mobilidade.", kind:"core", versions:[
    stage("Anti-extensão", [aq(W_CORE),
      ss("Core · Bloco 1", "30s", [["Prancha (Frontal)","4×45s",8],["row_db","3×12/lado",8]]),
      ss("Core · Bloco 2", "30s", [["Dead Bug (Chão)","3×10/lado",8],["face_pull","3×15",7]]),
      ss("Core · Bloco 3", "30s", [["Hollow Hold","3×30s",8],["Superman","3×12",7]], "long"),
      fin("amrap", {min:8}, [["Mountain Climbers","20 reps",8],["Sit-Up","12 reps",8],["Prancha c/ Toque Ombro","16 reps",8]], {min:5}),
      al([["Postura da Criança","1×40s",1],["Cat-Camel (Chão)","1×8",1],["Rotação Torácica (Chão)","1×8/lado",1]])]),
    stage("Anti-rotação", [aq(W_CORE),
      ss("Core · Bloco 1", "30s", [["pallof","4×12/lado",8],["Prancha Lateral (Cada lado)","3×35s/lado",8]]),
      ss("Core · Bloco 2", "30s", [["woodchop","3×12/lado",8],["Bird Dog (Chão)","3×10/lado",7]]),
      ss("Core · Bloco 3", "30s", [["renegade","3×10",8],["farmer","3×40s",8]], "long"),
      fin("emom", {min:8}, [["Russian Twist","20 reps",8],["Hollow Hold","30s",8]], {min:6}),
      al([["Rotação Torácica (Chão)","1×8/lado",1],["Anca 90/90 (Chão/Transições)","1×6/lado",1],["Postura da Criança","1×40s",1]])]),
    stage("Costas e postura", [aq(W_UP),
      ss(A, REST_A, [["row_cable","4×12",8],["face_pull","4×15",7]]),
      ss(B, REST_B, [["pulldown","3×12",8],["rear_delt","3×15",7]]),
      ss("Core · Bloco 3", "30s", [["Superman","3×12",7],["Dead Bug (Chão)","3×10/lado",8]], "long"),
      fin("circuit", {work:40, rest:20, rounds:2}, [["Prancha (Frontal)","40s",8],["Bird Dog (Chão)","40s",7],["Prancha Lateral (Cada lado)","40s",8],["Superman","40s",7]], {rounds:1}),
      al(S_UP)]),
    stage("Flexão e oblíquos", [aq(W_CORE),
      ss("Core · Bloco 1", "30s", [["cable_crunch","4×15",8],["Prancha Lateral (Cada lado)","3×40s/lado",8]]),
      ss("Core · Bloco 2", "30s", [["hanging_knee","3×12",8],["Russian Twist","3×20",8]]),
      ss("Core · Bloco 3", "30s", [["V-Up","3×12",8],["Bicicleta (Abdominal)","3×20",8]], "long"),
      fin("amrap", {min:8}, [["Sit-Up","15 reps",8],["Mountain Climbers","20 reps",8],["Prancha (Frontal)","30s",8]], {min:5}),
      al([["Postura da Criança","1×40s",1],["Alongamento Flexores da Anca","1×30s/lado",1],["Cat-Camel (Chão)","1×8",1]])]),
    stage("Glúteo médio e estabilidade", [aq(W_LEG2),
      ss(A, REST_A, [["glute_med","4×15",8],["RDL Unilateral (Peso Corporal)","3×10/lado",8]]),
      ss(B, REST_B, [["bulgarian","3×10/lado",8],["pallof","3×12/lado",8]]),
      ss("Core · Bloco 3", "30s", [["Clamshell c/ Mini Band","3×20/lado",8],["Hollow Hold","3×30s",8]], "long"),
      fin("emom", {min:8}, [["Monster Walk (c/ Elástico nos joelhos)","12 passos",8],["Prancha c/ Toque Ombro","16 reps",8]], {min:6}),
      al(S_LEG2)])
  ]},

  /* ---------- RÁPIDO ---------- */
  quick: {name:"Rápido · 20 min", focus:"Para dias maus: curto e intenso", kind:"wod", noDuration:true, versions:[
    {blocks:[
      {name:AQ, rest:"seguido", items:[["Polichinelos","1×30",2],["Agachamento (Peso Corporal)","1×10",2],["Flexões em Incline","1×8",2]]},
      wodBlock("EMOM 14′", "emom", {min:14}, [["Burpees","8 reps",9],["Jump Squats","15 reps",8],["Flexões (Padrão)","10 reps",8],["Mountain Climbers","30 reps",8],["Sit-Up","15 reps",7],["Afundo com Salto","12 reps",8],["Prancha (Frontal)","40s",7]]),
      {name:AL, rest:"respira fundo", items:[["st_hams","1×30s/lado",1],["st_chest","1×30s/lado",1]]}
    ]},
    {blocks:[
      {name:AQ, rest:"seguido", items:[["Joelhos ao Peito","1×30",2],["Ponte Glúteos (c/ Elástico nos joelhos)","1×12",2],["Cat-Camel (Chão)","1×6",1]]},
      wodBlock("AMRAP 14′", "amrap", {min:14}, [["kb_swing","15 reps",8],["Flexões (Padrão)","10 reps",8],["Skaters","20 reps",8],["V-Up","10 reps",8]]),
      {name:AL, rest:"respira fundo", items:[["Alongamento Flexores da Anca","1×30s/lado",1],["Postura da Criança","1×40s",1]]}
    ]},
    {blocks:[
      {name:AQ, rest:"seguido", items:[["Marcha no Lugar","1×45s",2],["Agachamento (Peso Corporal)","1×10",2],["Pull Apart (c/ Elástico)","1×12",2]]},
      wodBlock("Circuito 14′", "circuit", {work:40, rest:20, rounds:2}, [["goblet","40s",8],["Burpees","40s",9],["renegade","40s",8],["Afundo com Salto","40s",8],["Hollow Hold","40s",7],["Joelhos ao Peito","40s",8],["Prancha c/ Toque Ombro","40s",7]]),
      {name:AL, rest:"respira fundo", items:[["Alongamento Quadricípite (De Pé)","1×30s/lado",1],["st_chest","1×30s/lado",1]]}
    ]}
  ]}
};
var TYPE_ORDER = ["gluteonly","glutes","fatloss","strength","tone","core"];
var QUICK_KEY = "quick";
