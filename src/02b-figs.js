
/* ---------- figuras novas ---------- */
var RUN = "B c 80,20,7|B l 80,28 78,64|B l 80,34 66,44 72,58|B l 80,34 96,44 90,30|B l 78,64 68,80 62,110|B l 78,64 96,80 90,96|M d M 108 92 Q 116 76 104 66";
var PUSHUP = "B c 26,72,7|B l 36,78 92,84 142,110|B l 38,80 42,110|M l 70,104 70,92";
var BENCH_DB = "P l 24,82 112,82|P l 40,82 40,112|P l 96,82 96,112|B c 30,74,7|B l 38,78 86,78|B l 44,78 48,60 50,44|A r 42,38,16,6|B l 86,78 110,74 116,110|M l 72,62 72,38";
var LUNGE = "B c 72,26,7|B l 70,34 66,72|B l 70,40 74,72|A c 74,76,4|B l 66,72 92,84 96,110|B l 66,72 48,104 24,110|M l 120,74 120,98";
var THRUSTER = "B c 80,24,7|B l 80,32 78,64|B l 80,36 66,22 64,8|B l 80,36 94,22 96,8|A r 56,4,14,6|A r 90,4,14,6|B l 78,64 68,86 64,110|B l 78,64 92,88 96,110|M l 120,50 120,20";
var CURL = "B c 80,20,7|B l 80,28 80,64|B l 74,34 70,52 84,46|B l 86,34 90,52 96,46|A c 84,44,4|A c 98,44,4|B l 80,64 72,88 68,110|B l 80,64 88,88 92,110|M d M 108 66 Q 118 56 106 44";
var LATRAISE = "B c 80,20,7|B l 80,28 80,64|B l 80,34 70,50 66,70|B l 80,34 104,38 124,36|A c 128,36,4|B l 80,64 72,88 68,110|B l 80,64 88,88 92,110|M d M 116 66 Q 132 60 130 44";
var SQUAT_BW = "B c 74,30,7|B l 72,38 60,74|B l 72,42 96,50 112,50|B l 60,74 92,78 86,110 98,111|M l 40,60 40,92";
var ABDUCT_M = "P l 60,66 100,66|P l 80,66 80,112|B c 80,26,7|B l 80,34 80,66|B l 76,40 64,56|B l 84,40 96,56|B l 80,66 58,84 56,110|B l 80,66 102,84 104,110|A r 42,78,6,14|A r 112,78,6,14|M l 40,100 26,100|M l 120,100 134,100";
var ADDUCT_M = "P l 60,66 100,66|P l 80,66 80,112|B c 80,26,7|B l 80,34 80,66|B l 76,40 64,56|B l 84,40 96,56|B l 80,66 54,84 50,110|B l 80,66 106,84 110,110|A r 60,78,6,14|A r 94,78,6,14|M l 36,100 50,100|M l 124,100 110,100";
var STRETCH_CALF = "P l 20,6 20,112|B c 54,24,7|B l 54,32 62,66|B l 52,36 36,50 22,54|B l 62,66 58,88 54,110|B l 62,66 92,90 118,110|A c 118,110,3";

Object.assign(FIG, {
  "Flexões (Padrão)": PUSHUP,
  "Prancha (Frontal)": "B c 26,72,7|B l 36,78 92,84 142,110|B l 38,80 36,104|B l 24,110 50,110|A l 36,80 92,86",
  "Prancha c/ Toque Ombro": "B c 26,72,7|B l 36,78 92,84 142,110|B l 38,80 42,110|B l 40,79 24,92 36,80|A c 38,78,4|M d M 20 100 Q 10 88 24 84",
  "Mountain Climbers": "B c 26,72,7|B l 36,78 92,84 142,110|B l 38,80 42,110|B l 92,84 66,96 58,110|M l 106,102 74,96",
  "Burpees": "B c 80,18,7|B l 80,26 80,58|B l 80,30 68,14 66,4|B l 80,30 92,14 94,4|B l 80,58 72,80 70,100|B l 80,58 88,80 90,100|P l 66,110 92,110|M l 116,104 116,64|P l 8,108 40,112|P c 6,104,3",
  "Sit-Up": "B c 46,60,7|B l 52,68 82,100|B l 54,70 70,84|B l 82,100 106,78 128,108|B l 128,108 138,110|M d M 30 100 Q 32 78 46 70",
  "Hollow Hold": "B c 22,90,7|B l 32,98 80,104 130,92|B l 30,98 12,84|A l 40,104 100,104|M l 130,100 130,88",
  "V-Up": "B c 44,62,7|B l 50,70 80,104 116,66|B l 52,72 98,74|M l 30,96 44,80|M l 130,96 116,80",
  "Russian Twist": "B c 56,44,7|B l 60,52 84,96|B l 62,60 40,70 30,80|A c 28,82,4|B l 84,96 110,76 126,100|M d M 30 90 Q 44 102 62 96",
  "Bicicleta (Abdominal)": "B c 28,88,7|B l 36,92 84,100|B l 84,100 76,76 66,66|B l 84,100 134,90|B l 38,90 58,80 74,78|M l 118,86 132,74",
  "Superman": "B c 22,88,7|B l 30,94 80,102 130,96|B l 28,92 8,84|B l 80,102 106,96 132,90|M l 16,78 16,68|M l 138,84 138,74",
  "Dips (Banco)": "P l 96,72 140,72|P l 102,72 102,112|P l 134,72 134,112|B c 54,44,7|B l 58,52 66,84|B l 60,54 84,60 98,72|B l 66,84 42,100 18,110|M l 34,74 34,62",
  "Pike Push-Up": "B c 48,88,7|B l 56,84 88,52 136,110|B l 56,86 44,110|M l 30,96 34,84",
  "Pull-Up (Barra)": "P l 40,10 120,10|P l 46,10 46,112|P l 114,10 114,112|B c 80,20,7|B l 66,10 62,28 74,32|B l 94,10 98,28 86,32|B l 80,30 80,66|B l 80,66 76,88 84,100|M l 132,60 132,36",
  "Elevação de Joelhos na Barra": "P l 40,10 120,10|P l 46,10 46,112|P l 114,10 114,112|B c 80,24,7|B l 64,10 74,34|B l 96,10 86,34|B l 74,34 86,34|B l 80,34 80,66|B l 80,66 98,56 100,74|M d M 100 96 Q 114 80 102 60",
  "Remada Invertida (Mesa)": "P l 20,50 140,50|P l 26,50 26,112|P l 134,50 134,112|B c 40,80,7|B l 48,84 96,96 128,110|B l 48,84 46,66 44,52|A f 44,52,3|M l 72,102 72,90",
  "Renegade Row (Halteres)": "B c 26,72,7|B l 36,78 92,84 142,110|B l 38,80 42,110|B l 40,80 52,84 64,88|A c 44,108,4|A c 66,90,4|M l 66,104 66,96",
  "Farmer's Carry (Halteres)": "B c 80,20,7|B l 80,28 80,64|B l 70,34 66,72|B l 90,34 94,72|A r 60,70,12,6|A r 88,70,12,6|B l 72,64 88,64|B l 72,64 62,88 56,110|B l 88,64 96,88 100,110|M l 120,100 142,100",
  "Kettlebell Swing": "B c 70,34,7|B l 66,42 44,72|B l 66,44 88,48 110,52|A c 116,54,7|B l 44,72 54,92 52,110|B l 44,72 62,90 66,110|M d M 100 84 Q 122 70 118 44",
  "Thruster (Halteres)": THRUSTER,
  "Box Jump": "P r 96,70,50,42|B c 118,26,7|B l 118,34 118,52|B l 118,38 106,50|B l 118,38 130,50|B l 118,52 110,64 112,70|B l 118,52 126,64 124,70|M d M 40 100 Q 60 40 100 56",
  "Agachamento (Peso Corporal)": SQUAT_BW,
  "Agachamento Sumo c/ Elástico": "B c 80,30,7|B l 80,38 80,70|B l 80,42 100,56 116,56|B l 80,70 52,84 40,110|B l 80,70 108,84 120,110|A l 52,86 108,86|M l 20,72 20,100",
  "Afundo Caminhando (Halteres)": LUNGE,
  "Stepup (Banco + Halteres)": "P l 100,72 146,72|P l 106,72 106,112|P l 140,72 140,112|B c 76,24,7|B l 76,32 74,68|B l 76,38 80,70|A c 80,74,4|B l 74,68 96,62 114,72|B l 74,68 68,90 64,110|M l 126,60 126,36",
  "RDL Unilateral (Peso Corporal)": "B c 100,44,7|B l 94,50 60,66|B l 60,66 36,58 14,56|B l 60,66 62,90 60,110|B l 92,52 96,76 98,90|M d M 116 70 Q 130 80 128 100",
  "Bom Dia c/ Elástico": "B c 100,42,7|B l 94,48 60,66|B l 60,66 64,90 62,110|B l 92,52 84,62 96,64|A l 62,110 92,50|M d M 116 50 Q 128 30 106 22",
  "Ponte Glúteos Unilateral": "B c 30,104,7|B l 40,108 80,90|B l 42,108 58,110 72,110|B l 80,90 106,76 116,108 126,110|B l 80,90 132,60|M l 84,108 84,96",
  "Clamshell c/ Mini Band": "B c 22,88,7|B l 32,92 84,96|B l 84,96 110,88 130,104|B l 84,96 104,70 130,104|A l 108,72 110,86|B l 34,92 26,76|M d M 116 84 Q 122 70 112 62",
  "Kickback de Glúteo c/ Mini Band": "B c 106,64,7|B l 56,70 98,70|B l 96,70 96,90 96,110|B l 56,70 57,108 32,110|B l 56,70 36,60 22,42|A l 40,66 54,90|M d M 20 70 Q 12 56 24 44",
  "Abdução de Anca Deitada": "B c 22,90,7|B l 32,94 84,98|B l 84,98 136,104|B l 84,98 132,66|B l 34,94 26,78|M d M 136 96 Q 146 84 136 72",
  "Hamstring Walkout": "B c 30,104,7|B l 40,108 80,90|B l 42,108 58,110 72,110|B l 80,90 112,84 132,108 140,110|M l 118,100 142,100",
  "Salto em Comprimento": "B c 58,26,7|B l 58,34 70,62|B l 60,40 44,50 38,60|B l 60,40 78,46 90,40|B l 70,62 60,84 72,98|B l 70,62 84,80 96,92|M d M 100 96 Q 120 60 146 96",
  "Skaters": "B c 62,28,7|B l 62,36 74,66|B l 64,42 46,50 34,56|B l 64,42 86,48 100,42|B l 74,66 84,88 86,110|B l 74,66 56,86 40,96|M d M 100 100 Q 122 86 146 100",
  "Polichinelos": "B c 80,20,7|B l 80,28 80,66|B l 80,34 60,20 48,8|B l 80,34 100,20 112,8|B l 80,66 62,90 52,110|B l 80,66 98,90 108,110|M d M 40 40 Q 30 60 44 80|M d M 120 40 Q 130 60 116 80",
  "Corrida no Lugar": RUN,
  "Corda de Saltar": "B c 80,22,7|B l 80,30 80,64|B l 80,36 68,50 62,60|B l 80,36 92,50 98,60|B l 80,64 72,86 70,104|B l 80,64 88,86 90,104|P d M 62 60 Q 80 128 98 60|P d M 62 60 Q 80 2 98 60|M l 120,100 120,80",
  "Passadeira – Aquecimento": "P l 28,104 132,104|P l 28,104 24,112|P l 132,104 136,112|P l 128,104 122,44|P l 108,44 134,44|B c 74,28,7|B l 74,36 72,68|B l 74,42 62,50 68,62|B l 74,42 90,50 98,44|B l 72,68 62,84 58,104|B l 72,68 90,84 86,96|M l 44,84 20,84",
  "Remo – Aquecimento": "P l 20,98 140,98|P c 54,92,4|P l 112,78 120,96|P c 130,78,10|B c 46,44,7|B l 48,52 52,88|B l 50,58 40,76 60,80|A f 60,80,3|P l 60,80 122,76|B l 52,88 90,80 116,86|M l 90,60 66,60",
  "Escada – Contínuo": "P l 100,110 100,90 116,90 116,70 132,70 132,50 148,50|B c 88,22,7|B l 88,30 90,66|B l 88,36 100,44 96,58|B l 88,36 76,48 82,60|B l 90,66 108,80 110,90|B l 90,66 84,90 84,110|M l 60,70 60,44",
  "Leg Press (Máquina)": "P l 22,50 40,96|P l 40,96 70,92|B c 32,40,7|B l 38,48 56,88|B l 40,54 50,72|B l 56,88 86,64 110,58|P l 104,44 120,78|P l 118,78 140,110|A c 110,58,3|M l 84,86 106,72",
  "Hack Squat (Máquina)": "P l 110,20 140,100|P l 60,104 112,112|B c 108,26,7|B l 114,34 128,70|A r 112,36,10,6|B l 116,44 104,60|B l 128,70 100,86 86,108|M l 60,80 60,60",
  "Leg Curl Deitada (Máquina)": "P l 30,84 130,84|P l 36,84 36,112|P l 124,84 124,112|B c 30,74,7|B l 40,80 90,82|B l 90,82 110,84 126,62|A c 130,60,5|M d M 134 90 Q 144 76 134 66",
  "Leg Curl Sentada (Máquina)": "P l 40,44 46,84|P l 46,84 84,84|P l 60,84 60,112|B c 52,36,7|B l 54,44 60,82|P l 64,74 92,74|B l 60,82 94,82 118,100|A c 118,104,5|M d M 124 68 Q 134 84 122 100",
  "Abdutora (Máquina)": ABDUCT_M,
  "Adutora (Máquina)": ADDUCT_M,
  "Supino c/ Halteres": BENCH_DB,
  "Fly Reverso (Halteres) – Banco Inclinado": "P l 40,100 100,50|P l 60,100 60,112|P l 90,60 90,112|B c 108,44,7|B l 100,50 60,82|B l 96,54 90,76 86,92|A c 86,96,4|M d M 74 90 Q 60 80 62 66",
  "Crossover (Polia)": "P r 10,6,12,106|P r 138,6,12,106|P c 16,20,3|P c 144,20,3|P l 16,20 62,48|P l 144,20 98,48|B c 80,22,7|B l 80,30 80,64|B l 80,36 62,48|B l 80,36 98,48|A f 62,48,3|A f 98,48,3|B l 80,64 70,88 66,110|B l 80,64 90,88 94,110|M d M 56 60 Q 80 70 104 60",
  "Elevação Lateral (Polia)": LATRAISE,
  "Rosca Direta (Barra/Halteres)": CURL,
  "Extensão de Tríceps (Halteres acima cabeça)": "B c 80,26,7|B l 80,34 80,66|B l 74,40 66,22 76,10|B l 86,40 94,22 84,10|A c 80,8,5|B l 80,66 72,88 68,110|B l 80,66 88,88 92,110|M d M 104 22 Q 110 8 96 2",
  "Remada Curvada (Barra)": "B c 108,46,7|B l 100,52 62,66|B l 99,54 90,62 92,72|A c 92,76,7|A f 92,76,2.5|B l 62,66 88,86 86,110 96,111|M l 120,96 120,80",
  "Pull-Through (Polia)": "P r 132,6,18,106|P c 132,104,3|P l 132,104 60,90|B c 32,46,7|B l 40,52 78,66|B l 42,54 52,72 60,88|A f 60,90,3|B l 78,66 60,86 62,110|B l 78,66 74,90 80,110|M d M 20 74 Q 10 60 26 54",
  "Crunch na Polia (Corda)": "P r 122,6,18,106|P c 122,14,3|P l 122,14 78,30|B c 62,38,7|B l 68,44 74,70|B l 66,46 78,32|A f 78,30,3|B l 74,70 52,108|B l 52,110 20,110|M d M 52 34 Q 40 48 50 62",
  "Abdução de Anca (Polia)": "P r 14,6,18,106|P c 32,104,3|P l 32,104 120,96|B c 72,22,7|B l 72,30 72,64|B l 72,36 52,44 40,50|B l 72,64 66,88 62,110|B l 72,64 98,84 120,94|A c 120,96,3|M d M 108 70 Q 128 76 128 90",
  "Alongamento Quadricípite (De Pé)": "B c 74,20,7|B l 74,28 74,66|B l 74,34 60,40 52,50|B l 74,34 86,50 98,86|B l 74,66 70,88 68,110|B l 74,66 88,82 98,90|A c 98,90,4",
  "Alongamento Gémeos (Parede)": STRETCH_CALF,
  "Pigeon": "B c 64,34,7|B l 66,42 76,84|B l 64,46 50,66 42,84|B l 76,84 50,100 24,102|B l 76,84 110,92 140,104|A c 60,100,3",
  "Postura da Criança": "B c 30,98,7|B l 40,100 92,80|B l 92,80 100,110 132,110|B l 40,100 12,104|M l 60,70 60,84",
  "Alongamento Tríceps e Ombro": "B c 80,22,7|B l 80,30 80,66|B l 80,36 70,18 84,10|B l 80,36 96,30 74,16|A c 74,16,3|B l 80,66 72,88 68,110|B l 80,66 88,88 92,110"
});

Object.assign(ALIAS, {
  "Flexões em Declive": "Flexões (Padrão)", "Flexões em Incline": "Flexões (Padrão)", "Flexões Diamante": "Flexões (Padrão)", "Flexões em Declive (Pés elevados)": "Flexões (Padrão)", "Flexões (Peso Corporal)": "Flexões (Padrão)",
  "Marcha no Lugar": "Corrida no Lugar", "Joelhos ao Peito": "Corrida no Lugar",
  "Passadeira – Intervalos": "Passadeira – Aquecimento", "Passadeira – Inclinada": "Passadeira – Aquecimento",
  "Remo – Intervalos": "Remo – Aquecimento", "Escada – Intervalos": "Escada – Contínuo", "Elíptica – Contínuo": "Bicicleta Estática – Aquecimento",
  "Agachamento Tempo 3-1-1": "Agachamento (Peso Corporal)",
  "Split Squat (Peso Corporal)": "Afundo Caminhando (Halteres)", "Afundo Inverso": "Afundo Caminhando (Halteres)", "Afundo com Salto": "Afundo Caminhando (Halteres)",
  "Wall Ball": "Thruster (Halteres)", "Squat to Press c/ Elástico": "Thruster (Halteres)",
  "Supino Plano (Halteres) – Banco": "Supino c/ Halteres", "Supino Inclinado (Halteres)": "Supino c/ Halteres", "Supino Inclinado (Halteres) – Banco": "Supino c/ Halteres",
  "Chest Press (Máquina)": "Supino na Máquina (Chest Press)", "Shoulder Press (Máquina)": "Desenvolvimento Ombro (Halteres) – Banco Sentado", "Press de Ombros c/ Elástico": "Desenvolvimento Ombro (Halteres) – Banco Sentado",
  "Lat Pulldown (Polia)": "Puxada Alta (Barra Larga)", "Pull-Up Assistido (Máquina ou Elástico)": "Pull-Up (Barra)", "Puxada c/ Elástico (Porta)": "Puxada Alta (Barra Larga)",
  "Remada Sentada (Polia)": "Remada Baixa Sentada", "Remada c/ Elástico": "Remada Baixa Sentada", "Remada c/ Apoio ao Peito (Máquina)": "Remada Baixa Sentada",
  "Kickback de Glúteo (Polia)": "Kickback de Glúteo na Polia Baixa", "Abdução de Anca na Polia Baixa": "Abdução de Anca (Polia)", "Adução de Anca na Polia Baixa": "Abdução de Anca (Polia)",
  "Tríceps na Polia (Corda)": "Tríceps na Polia Alta (Corda)", "Rosca Bíceps na Polia": "Rosca Direta (Barra/Halteres)", "Rosca Bíceps na Polia Baixa": "Rosca Direta (Barra/Halteres)", "Rosca Direta (Halteres) – Banco Sentado": "Rosca Direta (Barra/Halteres)", "Rosca Martelo (Halteres)": "Rosca Direta (Barra/Halteres)", "Rosca Bíceps c/ Elástico": "Rosca Direta (Barra/Halteres)",
  "Elevação Lateral na Polia Baixa": "Elevação Lateral (Polia)", "Elevação Lateral c/ Elástico": "Elevação Lateral (Polia)", "Elevação Lateral (Halteres)": "Elevação Lateral (Polia)",
  "Extensão de Tríceps c/ Elástico": "Extensão de Tríceps (Halteres acima cabeça)",
  "Tricep Dips (Banco)": "Dips (Banco)", "Dips (Cadeira)": "Dips (Banco)",
  "Crunch na Polia Alta": "Crunch na Polia (Corda)", "Woodchop (Polia)": "Woodchop Alto-Baixo (Polia)",
  "Deadlift Sumo (Barra)": "Deadlift (Barra)", "Pallof Press (Polia)": "Pallof Press (Elástico)", "Pallof Press (Elástico na Porta)": "Pallof Press (Elástico)",
  "Face Pull (Polia)": "Face Pull (Corda na Polia Alta)", "Bicicleta Estática – HIIT (30s / 30s)": "Bicicleta Estática – Aquecimento",
  "Alongamento Peitoral (Porta)": "Alongamento Peitoral", "Alongamento Dorsais (Mesa)": "Alongamento Dorsais (Lats)", "Alongamento Posteriores (Sentada)": "Alongamento Posteriores (Hamstrings)",
  "Afundo Búlgaro (Cadeira)": "Afundo Búlgaro (Banco + Halter)", "Desenvolvimento Ombro (Halteres em pé)": "Desenvolvimento Ombro (Halteres) – Banco Sentado"
});
FIG["Extensão de Pernas (Máquina)"] = FIG["Extensão de Pernas (Rolos)"];
FIG["Crucifixo (Halteres) – Banco Plano"] = "P l 24,82 112,82|P l 40,82 40,112|P l 96,82 96,112|B c 30,74,7|B l 38,78 86,78|B l 44,78 30,56 22,44|A c 20,42,4|B l 44,78 58,56 66,44|A c 68,42,4|B l 86,78 110,74 116,110|M d M 26 36 Q 44 22 62 36";

Object.assign(FEEL, {
  "Crucifixo (Halteres) – Banco Plano":["O peito a alongar na abertura e a espremer ao fechar.","Descer demasiado ou dobrar muito os cotovelos."],
  "Mountain Climbers": ["O core a segurar a anca enquanto as pernas correm.", "A anca a subir para o teto."],
  "Abdução de Anca na Polia Baixa": ["O lado da anca a trabalhar.", "Inclinar o tronco para o lado."],
  "Afundo Caminhando (Halteres)": ["Glúteo e coxa da perna da frente a empurrar.", "Joelho da frente a cair para dentro."],
  "Burpees": ["O corpo todo, ritmo constante.", "Arredondar a lombar ao ir ao chão."],
  "Stepup (Banco + Halteres)": ["O glúteo da perna de cima a puxar-te.", "Saltar com a perna de baixo."],
  "Deadlift Sumo (Barra)": ["Interior das coxas e glúteos, tronco vertical.", "Joelhos a fechar ao subir."],
  "Adução de Anca na Polia Baixa": ["O interior da coxa a apertar.", "Rodar a anca."],
  "Supino c/ Halteres": ["Peito e tríceps a empurrar, omoplatas presas ao banco.", "Deixar os halteres descer sem controlo."],
  "Flexões (Padrão)": ["Peito, tríceps e core a segurar o corpo reto.", "A anca a cair ou a subir."],
  "Supino Plano (Halteres) – Banco": ["Peito e tríceps a empurrar, omoplatas presas ao banco.", "Deixar os halteres descer sem controlo."],
  "Prancha c/ Toque Ombro": ["O core a impedir a anca de rodar.", "Balançar a anca de um lado para o outro."],
  "Supino Inclinado (Halteres)": ["A parte de cima do peito a trabalhar.", "Cotovelos demasiado abertos."],
  "Rosca Direta (Barra/Halteres)": ["O bíceps a apertar em cima.", "Balançar as costas."],
  "Supino Inclinado (Halteres) – Banco": ["A parte de cima do peito a trabalhar.", "Cotovelos demasiado abertos."],
  "Rosca Direta (Halteres) – Banco Sentado": ["O bíceps a apertar em cima.", "Balançar."],
  "Flexões em Declive": ["A parte de cima do peito e os ombros.", "A anca a cair."],
  "Flexões em Incline": ["Peito e tríceps, corpo reto.", "Anca a cair."],
  "Elevação Lateral na Polia Baixa": ["O lado do ombro a trabalhar de cima a baixo.", "Encolher o trapézio."],
  "Flexões Diamante": ["O tríceps a fazer o trabalho.", "Cotovelos a abrir."],
  "Tricep Dips (Banco)": ["Tríceps a empurrar.", "Ombros a subir para as orelhas."],
  "Flexões em Declive (Pés elevados)": ["A parte de cima do peito e os ombros.", "A anca a cair."],
  "Extensão de Tríceps (Halteres acima cabeça)": ["A parte de trás do braço a esticar.", "Abrir os cotovelos."],
  "Fly Reverso (Halteres) – Banco Inclinado": ["A parte de trás dos ombros e o meio das costas.", "Balançar ou usar peso a mais."],
  "Rosca Martelo (Halteres)": ["Bíceps e antebraço.", "Rodar o pulso."],
  "Remada Curvada (Barra)": ["O meio das costas a puxar o cotovelo para trás.", "Arredondar as costas ou levantar o tronco."],
  "Rosca Bíceps na Polia Baixa": ["O bíceps a trabalhar de cima a baixo.", "Balançar."],
  "Bicicleta Estática – HIIT (30s / 30s)": ["Sem fôlego no fim dos 30s fortes.", "Ir a meio gás nos 30s fortes."],
  "Prancha (Frontal)": ["Abdómen e glúteo apertados, corpo reto.", "A anca a cair ou a lombar a arquear."],
  "Crunch na Polia Alta": ["O abdómen a enrolar o tronco.", "Puxar com os braços."]
});
