
/* ---------- lookups ---------- */
var EX = {};
LIB.forEach(function(g){ g.items.forEach(function(it){ if(!EX[it[0]]) EX[it[0]] = {g:g.g, muscle:it[1], howto:it[2]||"", setup:it[3]||""}; }); });
function base(n){ return String(n).split("(")[0].trim().toLowerCase(); }
function look(map, n){
  if (map[n] != null) return map[n];
  if (ALIAS[n] && map[ALIAS[n]] != null) return map[ALIAS[n]];
  var b = base(n);
  for (var k in map){ if (base(k) === b) return map[k]; }
  return null;
}
function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function shortName(n){ return n.split(" (")[0].split(" – ")[0].split(" - ")[0]; }
/* nomes: inglês em grande, português por baixo */
function enName(n){ return EX_EN[n] || look(EX_EN, n) || n; }
function ptName(n){ var e = enName(n); return e === n ? "" : n; }
function enShort(n){ return enName(n).split(" (")[0]; }

/* ---------- figures ---------- */
function fig(name, extraClass){
  var spec = look(FIG, name);
  if (!spec) return "";
  var out = '<svg class="fig ' + (extraClass||"") + '" viewBox="0 0 160 120" aria-hidden="true"><polyline class="P" points="8,112 152,112"/>';
  spec.split("|").forEach(function(part){
    part = part.trim(); if (!part) return;
    var cls = part.charAt(0), type = part.charAt(2), rest = part.slice(4);
    if (type === "c"){ var c = rest.split(","); out += '<circle class="' + cls + '" cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; }
    else if (type === "f"){ var f = rest.split(","); out += '<circle class="' + cls + 'f" cx="' + f[0] + '" cy="' + f[1] + '" r="' + f[2] + '"/>'; }
    else if (type === "l"){ out += '<polyline class="' + cls + '" points="' + rest + '"/>'; }
    else if (type === "r"){ var r = rest.split(","); out += '<rect class="' + cls + '" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="2"/>'; }
    else if (type === "d"){ out += '<path class="' + cls + '" d="' + rest + '"/>'; }
  });
  return out + '</svg>';
}

/* ---------- state ---------- */
var KEY = "dfc1";
var st = {loc:"gym", type:"glutes", dur:"long", ver:{}, weights:{}, last:{}, sess:null, log:[], sound:false, keepAwake:true, ssMode:"alt", custom:{}, subs:{}, prot:{}, cycle:{}, chat:[], chatCode:"", requests:[]};
var ui = {tab:"home", filter:null, libLoc:null, search:"", rest:null, viewDone:null, confirmEnd:false, nsec:"rec", nmeal:null, nq:""};
try {
  var saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved){
    if (LOCS[saved.loc]) st.loc = saved.loc;
    st.custom = saved.custom || {}; st.subs = saved.subs || {}; st.prot = saved.prot || {};
    st.cycle = saved.cycle || {}; st.chat = saved.chat || []; st.chatCode = saved.chatCode || ""; st.requests = saved.requests || [];
    if (typeOf(saved.type)) st.type = saved.type; else st.type = "glutes";
    if (saved.dur === "short" || saved.dur === "long") st.dur = saved.dur;
    st.ver = saved.ver || {}; st.weights = saved.weights || {}; st.last = saved.last || {}; st.sess = saved.sess || null; st.log = saved.log || [];
    st.sound = saved.sound === true; st.keepAwake = saved.keepAwake !== false; st.ssMode = saved.ssMode || "alt";
  }
} catch(e){}
if (st.sess && !typeOf(st.sess.type)) st.sess = null;
function save(){
  st.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){}
}

/* ---------- cópia de segurança ---------- */
function exportData(){
  var blob = new Blob([JSON.stringify({app:"Diana Fit Coach", v:1, exportedAt:new Date().toISOString(), data:st}, null, 1)], {type:"application/json"});
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "diana-fit-coach-" + new Date().toISOString().slice(0,10) + ".json";
  document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast("Cópia descarregada");
}
function importData(file){
  var r = new FileReader();
  r.onload = function(){
    try {
      var j = JSON.parse(r.result), d = j && j.data ? j.data : j;
      if (!d || !d.weights){ toast("Ficheiro não reconhecido"); return; }
      st.weights = d.weights || {}; st.last = d.last || {}; st.log = d.log || []; st.ver = d.ver || {}; st.custom = d.custom || {}; st.subs = d.subs || {};
      if (LOCS[d.loc]) st.loc = d.loc; if (typeOf(d.type)) st.type = d.type;
      st.sess = null; save(); renderProfile(); toast("Cópia importada: " + st.log.length + " treinos");
    } catch(e){ toast("Não consegui ler o ficheiro"); }
  };
  r.readAsText(file);
}
var toastTimer = null;
function toast(msg){
  var t = document.getElementById("toast");
  if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.hidden = true; }, 2200);
}

/* ---------- parsing ---------- */
function parseScheme(s){
  var m = /^(\d+)\s*×\s*(.+)$/.exec(s), sets = 1, reps = s;
  if (m){ sets = parseInt(m[1],10); reps = m[2]; }
  var secs = 0, mi = /(\d+)\s*min/.exec(reps), se = /(\d+)\s*s\b/.exec(reps);
  if (mi) secs = parseInt(mi[1],10) * 60; else if (se) secs = parseInt(se[1],10);
  return {sets:sets, reps:reps, secs:secs};
}
function parseRest(r){
  var nums = (String(r||"").match(/(\d+)\s*s\b/g) || []).map(function(x){ return parseInt(x,10); });
  if (nums.length >= 2) return {between:nums[0], after:nums[1], has:true};
  if (nums.length === 1) return {between:nums[0], after:nums[0], has:true};
  return {between:0, after:0, has:false};
}
function blockCode(n){
  var sm = /Supersérie ([A-Z])/.exec(n); if (sm) return sm[1];
  if (/Supersérie/.test(n)) return "A";
  if (/^Treino/.test(n)) return "T";
  if (/^Aquec/.test(n)) return "AQ";
  if (/^Along/.test(n)) return "AL";
  if (/^Core · Bloco 1/.test(n)) return "C";
  if (/^Core · Bloco 2/.test(n)) return "D";
  if (/^Core · Bloco 3/.test(n)) return "E";
  if (/^Cardio/.test(n)) return "K";
  return "W";
}
function isWod(b){ return !!(b && b.wod); }
function blockColor(b){ var n = b.name; return /^Força|^Core|^Treino/.test(n) ? "#EEF1E8" : (isWod(b) || /^Cardio · (?!Arref)/.test(n) ? "#9FD2B0" : "#6E8F7A"); }
function blockLabel(b){ var n = b.name; if (/^Força|^Treino/.test(n)) return "Força"; if (/^Core/.test(n)) return "Core"; if (isWod(b)) return wodLabel(b); if (/^Aquec/.test(n)) return "Aquecer"; if (/^Along/.test(n)) return "Alongar"; if (/^Cardio/.test(n)) return "Cardio"; return "Bloco"; }
function wodLabel(b){ var w = b.wod; return w.kind === "amrap" ? "AMRAP" : (w.kind === "emom" ? "EMOM" : (w.kind === "fortime" ? "For Time" : "Circuito")); }
function wodTotal(b){ var w = b.wod; if (w.kind === "amrap" || w.kind === "emom") return w.min * 60; if (w.kind === "fortime") return w.cap * 60; return w.rounds * b.items.length * (w.work + w.rest); }
function wodTitle(b){ var w = b.wod; if (w.kind === "amrap") return "AMRAP " + w.min + "′"; if (w.kind === "emom") return "EMOM " + w.min + "′"; if (w.kind === "fortime") return w.rounds + " rondas · For Time (cap " + w.cap + "′)"; return w.rounds + " voltas · " + w.work + "s / " + w.rest + "s"; }

/* ---------- resolver tipo → treino do dia ---------- */
function resolveItem(raw, loc){
  var v = VARIANTS[raw[0]];
  if (v){ var e = v[loc] || v.gym; return [e[0], raw[1], raw[2], e[1] || ""]; }
  return [raw[0], raw[1], raw[2], ""];
}
function blockMinutes(b){
  var secs = 0;
  if (isWod(b)) secs = wodTotal(b);
  else {
    var r = parseRest(b.rest), ss = /Supersérie/.test(b.name) && b.items.length === 2;
    b.items.forEach(function(it){
      var sc = parseScheme(it[1]), per = sc.secs ? sc.secs : (parseInt(sc.reps, 10) || 10) * 3.5 + 12;
      if (/\/lado/.test(sc.reps)) per *= 2;
      secs += sc.sets * per;
      if (!ss) secs += (sc.sets - (ss ? 0 : 1)) * r.after;
    });
    if (ss){ var rounds = Math.max.apply(null, b.items.map(function(it){ return parseScheme(it[1]).sets; })); secs += rounds * (r.between + r.after) - r.after; }
    secs += (/^Aquec|^Along/.test(b.name) ? 15 : 30) * b.items.length;
  }
  return Math.max(1, Math.round(secs / 60));
}
var CUSTOM_WARM = [["cardio_warm","3 min",2],["Ponte Glúteos (c/ Elástico nos joelhos)","1×12",2],["Alongamento do Mundo (World's Greatest)","1×5/lado",1]];
var CUSTOM_STRETCH = [["st_hams","1×30s/lado",1],["st_chest","1×30s/lado",1],["Alongamento Flexores da Anca","1×30s/lado",1]];
function isCustomKey(k){ return typeof k === "string" && k.indexOf("custom:") === 0; }
function typeOf(key){
  if (TYPES[key]) return TYPES[key];
  if (!isCustomKey(key)) return null;
  var c = st.custom && st.custom[key.slice(7)]; if (!c) return null;
  var blocks = [];
  if (c.warm !== false) blocks.push({name:AQ, rest:"seguido", items:CUSTOM_WARM});
  var items = (c.items || []).map(function(it){ return [it[0], it[1] || "3×10", it[2] || 7, it[3] || ""]; });
  var rest = (c.rest || 60) + "s";
  if (c.ss && items.length >= 2){
    var L = "ABCDEFGHIJ", li = 0;
    for (var i = 0; i < items.length; i += 2){
      if (i + 1 < items.length){ var Lt = L.charAt(li++); blocks.push({name:"Força · Supersérie " + Lt, rest:Lt + "1 → 30s → " + Lt + "2 → " + rest, items:[items[i], items[i + 1]]}); }
      else blocks.push({name:"Treino · " + (i + 1), rest:rest, items:[items[i]]});
    }
  } else if (items.length) blocks.push({name:"Treino", rest:rest, items:items});
  if (c.stretch !== false) blocks.push({name:AL, rest:"respira fundo", items:CUSTOM_STRETCH});
  return {name:c.name || "O meu treino", focus:"Treino criado pela Diana", kind:"custom", custom:true, noDuration:true, versions:[{blocks:blocks}]};
}
var FAMILIES = [
  ["squat","front_squat","goblet","leg_press","hack","quad_iso"],
  ["deadlift","rdl","sumo_dl","pull_through","kb_swing"],
  ["hip_thrust","hip_thrust_db","kickback","glute_med","glute_med2","adductor"],
  ["bulgarian","lunge","stepup"],
  ["hamstring","hamstring2"],
  ["bench","incline","chest_press","fly","pushup_hard"],
  ["ohp","ohp2","lat_raise"],
  ["row_db","row_cable","row_chest","renegade"],
  ["pulldown","pulldown_close","pullup"],
  ["face_pull","rear_delt"],
  ["biceps","biceps2","hammer"],
  ["triceps","triceps2","dips"],
  ["pallof","cable_crunch","woodchop","hanging_knee","farmer"],
  ["cardio_warm","cardio_warm2","cardio_cool","cardio_ell"],
  ["cardio_int","cardio_int2","cardio_int3","cardio_steady","cardio_steady2"],
  ["box_jump","wall_ball","thruster","row_cal"],
  ["st_chest","st_lats","st_hams"]
];
function subKey(typeKey, ver, loc){ return typeKey + "|" + ver + "|" + loc; }
function itemKey(b, ii){ return b.name + "#" + ii; }
function resolveDay(typeKey, ver, loc, dur, subs){
  var t = typeOf(typeKey), v = t.versions[ver % t.versions.length], short = dur === "short" && !t.noDuration;
  var blocks = [];
  v.blocks.forEach(function(b){
    if (short && b.short === false) return;
    var nb = {name:b.name, rest:b.rest, items:b.items};
    if (b.wod) nb.wod = Object.assign({}, b.wod);
    if (short && b.short && typeof b.short === "object"){
      if (b.short.items) nb.items = b.short.items;
      if (b.short.wod) nb.wod = Object.assign({}, b.short.wod);
    }
    if (short && /Supersérie|Core · Bloco/.test(nb.name)) nb.items = nb.items.map(function(it){ var m = /^(\d+)×(.+)$/.exec(it[1]); if (m && +m[1] >= 4) return [it[0], (+m[1] - 1) + "×" + m[2], it[2]].concat(it.slice(3)); return it; });
    if (short && nb.name === AQ && nb.items.length > 2) nb.items = nb.items.slice(0, 2);
    nb.pats = nb.items.map(function(it){ return it[0]; });
    nb.items = nb.items.map(function(it, ii){ var r = resolveItem(it, loc); if (it.length > 3 && it[3]) r[3] = it[3]; var sb = subs && subs[itemKey(nb, ii)]; if (sb) r = [sb[0], r[1], r[2], sb[3] || ""]; return r; });
    nb.min = blockMinutes(nb);
    blocks.push(nb);
  });
  var min = 0; blocks.forEach(function(b){ min += b.min; });
  var vi = ver % t.versions.length, vl = t.custom ? "meu" : (t.versions.length === 5 ? "Etapa " + (vi + 1) : "ABC".charAt(vi));
  return {key:typeKey, ver:vi, verLabel:vl, stageTitle:t.versions[vi].title || "", nStages:t.versions.length, isProgram:t.versions.length === 5, title:t.name, focus:t.focus, kind:t.kind, min:min, blocks:blocks, loc:loc, dur:dur, noDuration:!!t.noDuration};
}
function curVer(typeKey){ return st.ver[typeKey] || 0; }
function curSubs(){ return st.subs[subKey(st.type, curVer(st.type), st.loc)] || null; }
function curDay(){ return resolveDay(st.type, curVer(st.type), st.loc, st.dur, curSubs()); }
function sessDay(){ var s = st.sess; return s ? resolveDay(s.type, s.ver, s.loc, s.dur, s.subs || null) : null; }
function itemAt(day, bi, ii){ return day.blocks[bi].items[ii]; }
function codeOf(day, bi, ii){ return blockCode(day.blocks[bi].name) + (ii + 1); }
function effortMax(day){ var m = 0; day.blocks.forEach(function(b){ b.items.forEach(function(it){ m = Math.max(m, it[2] || 0); }); }); return m; }
function countItems(day){ var n = 0; day.blocks.forEach(function(b){ n += b.items.length; }); return n; }

/* ---------- weights ---------- */
function refKg(ref){ var m = /([\d.,]+)\s*kg/.exec(ref || ""); return m ? parseFloat(m[1].replace(",", ".")) : null; }
function perHand(ref){ return /\/mão/.test(ref || ""); }
function wKey(n){ return n; }
function curKg(it){ var k = wKey(it[0]); if (st.weights[k] != null && st.weights[k] !== "") return parseFloat(st.weights[k]); return refKg(it[3]); }
function fmtKg(n){ return (Math.round(n * 10) / 10).toString().replace(".", ","); }
function unitOf(it){ return perHand(it[3]) ? "kg/mão" : "kg"; }
function noLoadLabel(n){
  var g = (EX[n] || look(EX, n) || {}).g || "";
  if (/Elástic/.test(g) || /Elástico|Mini Band/.test(n)) return "elástico";
  if (/Bicicleta|Cardio/.test(g)) return "máquina";
  return "peso corporal";
}

/* ---------- time ---------- */
function pad(n){ return (n < 10 ? "0" : "") + n; }
function mmss(sec){ sec = Math.max(0, Math.floor(sec)); return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60); }
function elapsed(){ var s = st.sess; if (!s) return 0; return (s.accum + (s.running ? Date.now() - s.startedAt : 0)) / 1000; }
var audioCtx = null;
function unlockAudio(){ if (st.sound !== true) return; try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === "suspended") audioCtx.resume(); } catch(e){} }
function tone(freq, start, dur, vol, type){
  var o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type || "sine"; o.frequency.value = freq;
  o.connect(g); g.connect(audioCtx.destination);
  var t0 = audioCtx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function vib(p){ try { if (navigator.vibrate) navigator.vibrate(p); } catch(e){} }
var SOUNDS = {
  tick: function(){ tone(660, 0, 0.09, 0.22, "triangle"); vib(30); },
  count: function(){ tone(880, 0, 0.12, 0.28, "square"); vib(60); },
  go: function(){ tone(1175, 0, 0.18, 0.32, "square"); tone(1568, 0.2, 0.32, 0.32, "square"); vib([200,80,300]); },
  start: function(){ tone(784, 0, 0.1, 0.25, "triangle"); tone(1047, 0.11, 0.14, 0.25, "triangle"); },
  green: function(){ tone(784, 0, 0.16, 0.26, "triangle"); tone(988, 0.17, 0.16, 0.26, "triangle"); tone(1319, 0.34, 0.4, 0.28, "triangle"); vib([100,60,100,60,300]); }
};
function play(name){
  if (st.sound !== true) return;
  try { unlockAudio(); if (audioCtx && SOUNDS[name]) SOUNDS[name](); } catch(e){}
}
function beep(){ play("go"); }

/* ---------- ecrã sempre ligado ---------- */
var wake = {lock:null, ns:null, on:false, tried:false, supported:true};
function wakeOn(){
  wake.tried = true;
  if (st.keepAwake === false){ wakeOff(); return; }
  if ("wakeLock" in navigator){
    navigator.wakeLock.request("screen").then(function(l){
      wake.lock = l; wake.on = true; paintWake();
      l.addEventListener("release", function(){ wake.on = !!(wake.ns && wake.ns.isEnabled); wake.lock = null; paintWake(); });
    }).catch(function(){ wakeFallback(); });
  } else wakeFallback();
}
function wakeFallback(){
  try {
    if (!wake.ns && window.NoSleep) wake.ns = new window.NoSleep();
    if (wake.ns){
      var p = wake.ns.enable();
      var ok = function(){ wake.on = true; paintWake(); };
      if (p && p.then) p.then(ok).catch(function(){ wake.on = false; wake.supported = !wake.userTried; paintWake(); }); else ok();
      return;
    }
  } catch(e){}
  wake.on = false; wake.supported = !wake.userTried; paintWake();
}
function wakeOff(){
  try { if (wake.lock) wake.lock.release(); } catch(e){}
  try { if (wake.ns && wake.ns.isEnabled) wake.ns.disable(); } catch(e){}
  wake.lock = null; wake.on = false; paintWake();
}
function paintWake(){
  var b = document.getElementById("wakeBtn"); if (!b) return;
  var off = st.keepAwake === false;
  b.className = "tool" + (wake.on && !off ? " on" : "");
  b.setAttribute("aria-pressed", String(wake.on && !off));
  var t = b.querySelector("span");
  if (t) t.textContent = off ? "Ecrã: normal" : (wake.on ? "Ecrã: sempre ligado" : (wake.supported ? "Ecrã: tocar p/ ligar" : "Ecrã: não suportado"));
}
document.addEventListener("visibilitychange", function(){
  if (document.visibilityState === "visible" && !document.getElementById("wk").hidden && st.keepAwake !== false && !wake.lock) wakeOn();
});

/* ---------- HOME ---------- */
var LOC_ICON = {
  gym:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 8h2v4H3zM15 8h2v4h-2zM5 10h10M6 6.5h2v7H6zM12 6.5h2v7h-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  condo:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10l7-6 7 6v7H3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 17v-5h4v5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  home:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M6 8h8M6 12h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
};
var LOGO = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 8h2v4H3zM15 8h2v4h-2zM5 10h10M6 6.5h2v7H6zM12 6.5h2v7h-2z" stroke="#C9A868" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function weekStats(){
  var now = Date.now(), wk = 0, min = 0;
  (st.log || []).forEach(function(l){ var d = new Date(l.date + "T12:00:00").getTime(); if (now - d < 7 * 86400000){ wk++; min += Math.round((l.sec || 0) / 60); } });
  return {week:wk, min:min, total:(st.log || []).length};
}
var _unused_ =
0;
var ARROW = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 11h13M12 5l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var HERO_BG = '<svg class="bg" viewBox="0 0 360 300" fill="none" aria-hidden="true"><g stroke="#EEF1E8" stroke-width="1.2"><circle cx="230" cy="130" r="110"/><circle cx="230" cy="130" r="84"/><circle cx="230" cy="130" r="58"/><circle cx="230" cy="130" r="32"/><path d="M40 260c60-40 140-30 200 10M10 300c80-50 180-40 250 0"/></g></svg>';

function todayLabel(){
  var d = new Date(), wd = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"], mo = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return wd[d.getDay()] + " · " + d.getDate() + " " + mo[d.getMonth()];
}
function fmtDate(iso){ return iso.split("-").reverse().slice(0, 2).join("/"); }
function daysAgo(iso){ var d = new Date(iso + "T12:00:00"), n = Math.round((Date.now() - d.getTime()) / 86400000); return n <= 0 ? "hoje" : (n === 1 ? "ontem" : "há " + n + " dias"); }
function lastOfType(k){ var l = null; (st.log || []).forEach(function(x){ if (x.type === k) l = x; }); return l; }
function suggestedType(){ return null; }
function _oldSuggested(){
  var best = null, bestAge = -1;
  ["legs","glutes","upper","push","pull","full"].forEach(function(k){
    var l = lastOfType(k), age = l ? (Date.now() - new Date(l.date + "T12:00:00").getTime()) : 1e15;
    if (age > bestAge){ bestAge = age; best = k; }
  });
  return best;
}
function keyExercises(day){
  var names = [];
  day.blocks.forEach(function(b){
    if (/^Aquec|^Along|Arref/.test(b.name)) return;
    b.items.forEach(function(it){ var n = enShort(it[0]); if (names.indexOf(n) < 0) names.push(n); });
  });
  return names.slice(0, 3).join(" · ") + (names.length > 3 ? " …" : "");
}
function previewRows(day){
  var h = '<div class="exrows">';
  day.blocks.forEach(function(b, bi){
    h += '<div class="exhead">' + esc(b.name) + (isWod(b) ? ' · ' + esc(wodTitle(b)) : '') + ' · ' + b.min + '′</div>';
    b.items.forEach(function(it, ii){
      var kg = curKg(it);
      var sw = (curSubs() || {})[itemKey(b, ii)];
      h += '<button class="exrow" data-swap="' + bi + '.' + ii + '"><span class="c">' + codeOf(day, bi, ii) + '</span><span class="n">' + esc(enName(it[0])) + (sw ? ' <em style="font-style:normal;color:var(--mint);font-size:10px">trocado</em>' : '') + (ptName(it[0]) ? '<small>' + esc(ptName(it[0])) + '</small>' : '') + '</span><span class="v">' + esc(it[1]) + (kg != null ? ' · ' + fmtKg(kg) + ' ' + unitOf(it) : '') + ' ⇄</span></button>';
    });
  });
  return h + '</div>';
}

function renderHome(){
  if (!typeOf(st.type)) st.type = "legs";
  var day = curDay(), t = typeOf(st.type);
  var h = '<div class="wrap">';
  var ws = weekStats();
  h += '<div class="top" style="align-items:center"><div class="brand"><div class="lg">' + LOGO + '</div><div><div class="eyebrow" style="font-size:10px;color:var(--muted)">Diana Fit Coach</div><div class="hi">Olá, Diana</div></div></div><span class="mono" style="font-size:11px;color:var(--muted)">' + esc(todayLabel()) + '</span></div>';

  h += '<div class="step-h"><h2>Onde vais treinar?</h2><span class="eyebrow">Passo 1</span></div>';
  h += '<div class="seg" role="group" aria-label="Local de treino">';
  LOC_ORDER.forEach(function(k){
    h += '<button data-loc="' + k + '" aria-pressed="' + (st.loc === k) + '">' + LOC_ICON[k] + '<b>' + esc(LOCS[k].name) + '</b><span>' + esc(LOCS[k].sub) + '</span></button>';
  });
  h += '</div><p class="note">' + esc(LOCS[st.loc].note) + '. O treino adapta-se ao que há neste sítio.</p>';

  h += '<div class="step-h"><h2>Escolhe o programa</h2><span class="eyebrow">Passo 2</span></div>';
  h += '<div class="plist" role="group" aria-label="Programa">';
  TYPE_ORDER.forEach(function(k){
    var tt = TYPES[k], cv = curVer(k), cyc = (st.cycle[k] || 0) + 1, l = lastOfType(k);
    var dots = ''; for (var di = 0; di < tt.versions.length; di++) dots += '<i class="' + (di < cv ? 'ok' : (di === cv ? 'cur' : '')) + '"></i>';
    h += '<button class="pcardp" data-type="' + k + '" aria-pressed="' + (st.type === k) + '"><span class="pl"><span class="nm">' + esc(tt.name) + '</span><span class="fo">' + esc(tt.focus) + '</span></span><span class="pr"><span class="dots">' + dots + '</span><span class="ps">Etapa ' + (cv + 1) + ' de ' + tt.versions.length + (cyc > 1 ? ' · ciclo ' + cyc : '') + '</span>' + (l ? '<span class="pl2">' + esc(daysAgo(l.date)) + '</span>' : '') + '</span></button>';
  });
  h += '</div>';
  var qd = resolveDay(QUICK_KEY, curVer(QUICK_KEY), st.loc, st.dur);
  h += '<button class="pquick" data-type="' + QUICK_KEY + '" aria-pressed="' + (st.type === QUICK_KEY) + '"><span><b>Rápido · 20 min</b><span>Para dias maus: curto e intenso, fora do programa</span></span><span class="mono">' + qd.min + '′</span></button>';
  var cids = Object.keys(st.custom || {});
  if (cids.length) h += '<div class="step-h"><h2>Os teus treinos</h2><span class="eyebrow">criados por ti</span></div>';
  h += '<div class="tgrid">';
  cids.forEach(function(id){
    var k = "custom:" + id, c = st.custom[id], l = lastOfType(k), d = resolveDay(k, 0, st.loc, st.dur);
    h += '<button class="tcard" data-type="' + k + '" aria-pressed="' + (st.type === k) + '"><span><span class="nm">' + esc(c.name || "O meu treino") + '</span><div class="fo">' + esc(keyExercises(d) || "sem exercícios") + '</div></span><span class="mt"><span>' + (l ? esc(daysAgo(l.date)) : 'por estrear') + '</span><span>' + d.min + '′</span></span></button>';
  });
  h += '</div>';
  h += '<button class="tech" id="newCustom" style="margin:10px auto 0;display:flex;border-color:var(--line);color:var(--green)">+ Criar um treino meu</button>';

  var inProg = st.sess && !st.sess.finished;
  h += '<div class="hero">' + HERO_BG;
  h += '<div><div class="eyebrow" style="color:var(--mint)">' + esc(LOCS[st.loc].name) + (day.isProgram ? ' · ' + esc(day.verLabel) + ' de ' + day.nStages : '') + '</div>';
  h += '<div class="disp t" style="margin-top:6px">' + esc(day.isProgram ? day.stageTitle : day.title) + '</div>';
  if (day.isProgram) h += '<div class="meta" style="margin-top:4px;color:var(--mint)">' + esc(day.title) + '</div>';
  h += '<div class="meta">' + day.min + ' min · ' + countItems(day) + ' exercícios · esforço até ' + effortMax(day) + '/10</div>' + (t.custom ? '<button class="tech" id="editCustom" style="margin-top:10px;border-color:rgba(255,255,255,.3);color:var(--chalk)">Editar este treino</button>' : '') + '</div>';
  var nver = t.versions.length;
  if (nver > 1){
    h += '<div class="vers"><span class="eyebrow" style="color:#B8B4BE;font-size:10px">' + (day.isProgram ? 'Etapas' : 'Versão') + '</span><div class="dur stg" role="group" aria-label="Etapa">';
    for (var vi = 0; vi < nver; vi++){ var cvv = curVer(st.type); h += '<button data-ver="' + vi + '" aria-pressed="' + (cvv === vi) + '"' + (vi < cvv ? ' class="done"' : '') + '>' + (day.isProgram ? (vi < cvv ? '✓' : (vi + 1)) : "ABC".charAt(vi)) + '</button>'; }
    h += '</div><div class="vnote">' + (day.isProgram ? esc(t.goal || "") + ' Fazes as etapas por ordem; quando acabas a 5, recomeças com mais carga.' : nver + ' versões diferentes.') + '</div></div>';
  }
  if (!day.noDuration){
    var dl = resolveDay(st.type, curVer(st.type), st.loc, "long"), ds = resolveDay(st.type, curVer(st.type), st.loc, "short");
    h += '<div class="dur" role="group" aria-label="Duração"><button data-dur="short" aria-pressed="' + (st.dur === "short") + '">Curto<span>' + ds.min + ' min</span></button><button data-dur="long" aria-pressed="' + (st.dur === "long") + '">Longo<span>' + dl.min + ' min</span></button></div>';
  }
  h += '<div class="holes"><div class="bars">';
  day.blocks.forEach(function(b){
    h += '<div class="s" style="flex-grow:' + b.min + '"><i style="background:' + blockColor(b) + '"></i><div><b>' + b.min + '′</b><br><span>' + esc(blockLabel(b)) + '</span></div></div>';
  });
  h += '</div></div>';
  if (inProg){
    var sd = sessDay();
    h += '<button class="go" id="goBtn"><span>Continuar · ' + esc(sd.title) + ' · ' + mmss(elapsed()) + '</span>' + ARROW + '</button>';
    h += '<button class="tech" id="dropBtn" style="align-self:center;border-color:rgba(255,255,255,.3);color:#C6D3CA">Descartar o treino a meio</button>';
  } else {
    h += '<button class="go" id="goBtn"><span>Começar treino</span>' + ARROW + '</button>';
  }
  h += '<details><summary class="eyebrow" style="color:#B8B4BE;cursor:pointer;list-style:none;padding:6px 0">Ver os ' + countItems(day) + ' exercícios ▾</summary><p class="note" style="color:#B8B4BE;margin:6px 0 0">Toca num exercício para o trocar por outro do mesmo tipo.</p>' + previewRows(day) + '</details>';
  h += '</div>';

  h += '<div class="gobar"><div class="in"><button class="lbl" id="gobarTitle"><div class="t">' + esc(day.title) + '</div><div class="s">' + esc(LOCS[st.loc].name) + ' · ' + day.min + '′' + (inProg ? ' · em curso' : '') + '</div></button><button class="go" id="goBtn2"><span>' + (inProg ? 'Continuar' : 'Começar') + '</span>' + ARROW + '</button></div></div>';
  h += '</div>';
  var el = document.getElementById("home");
  el.innerHTML = h;
  el.querySelectorAll("[data-loc]").forEach(function(b){ b.addEventListener("click", function(){ st.loc = b.getAttribute("data-loc"); save(); renderHome(); toast("Treinos adaptados a " + LOCS[st.loc].name); }); });
  el.querySelectorAll("[data-type]").forEach(function(b){ b.addEventListener("click", function(){ st.type = b.getAttribute("data-type"); save(); renderHome(); var hero = el.querySelector(".hero"); if (hero) hero.scrollIntoView({behavior:"smooth", block:"start"}); }); });
  el.querySelectorAll("[data-dur]").forEach(function(b){ b.addEventListener("click", function(){ st.dur = b.getAttribute("data-dur"); save(); renderHome(); }); });
  document.getElementById("goBtn").addEventListener("click", function(){ unlockAudio(); startOrResume(); });
  document.getElementById("goBtn2").addEventListener("click", function(){ unlockAudio(); startOrResume(); });
  document.getElementById("gobarTitle").addEventListener("click", function(){ var hero = el.querySelector(".hero"); if (hero) hero.scrollIntoView({behavior:"smooth", block:"start"}); });
  el.querySelectorAll("[data-swap]").forEach(function(b){ b.addEventListener("click", function(){ var p = b.getAttribute("data-swap").split("."); openSwap(+p[0], +p[1], false); }); });
  var db = document.getElementById("dropBtn"); if (db) db.addEventListener("click", function(){ st.sess = null; ui.rest = null; save(); renderHome(); toast("Treino descartado"); });
  el.querySelectorAll("[data-ver]").forEach(function(b){ b.addEventListener("click", function(){ st.ver[st.type] = parseInt(b.getAttribute("data-ver"), 10); save(); renderHome(); }); });
  document.getElementById("newCustom").addEventListener("click", function(){ openEditor(null); });
  var ec = document.getElementById("editCustom"); if (ec) ec.addEventListener("click", function(){ openEditor(st.type.slice(7)); });
}
document.getElementById("importFile").addEventListener("change", function(e){ var f = e.target.files && e.target.files[0]; if (f) importData(f); e.target.value = ""; });

/* ---------- COACH (chat) ---------- */
var CHAT_ICON = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 4.5h13v9h-7l-4 3v-3h-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
var chatBusy = false;
function chatCtx(){
  var names = [];
  LIB.forEach(function(g){ var gl = GROUP_LOC[g.g] || LOC_ORDER; if (gl.indexOf(st.loc) < 0) return; g.items.forEach(function(it){ names.push(it[0] + " = " + (EX_EN[it[0]] || "") + " [" + it[1] + "]"); }); });
  var progs = TYPE_ORDER.concat([QUICK_KEY]).map(function(k){ var t = TYPES[k]; return {id:k, nome:t.name, etapas:t.versions.length, etapa_atual:curVer(k) + 1, ciclo:(st.cycle[k] || 0) + 1, titulos:t.versions.map(function(v){ return v.title || ""; })}; });
  var day = curDay(), cur = {programa:typeOf(st.type) ? typeOf(st.type).name : "", etapa:day.verLabel, titulo:day.stageTitle || day.title, exercicios:[]};
  day.blocks.forEach(function(b){ b.items.forEach(function(it){ cur.exercicios.push(it[0] + " " + it[1] + (curKg(it) != null ? " @" + curKg(it) + "kg" : "")); }); });
  var wts = {}; Object.keys(st.weights).slice(-30).forEach(function(k){ wts[k] = st.weights[k]; });
  var today = new Date().toISOString().slice(0, 10);
  return {hoje:today, local:LOCS[st.loc].name, programas:progs, treino_selecionado:cur,
    ultimos_treinos:(st.log || []).slice(-6).map(function(l){ return l.date + " " + l.title + " " + l.done + "/" + l.total + " séries " + Math.round(l.sec / 60) + "min" + (l.partial ? " (terminou cedo)" : ""); }),
    treinos_criados:Object.keys(st.custom).map(function(id){ return st.custom[id].name; }),
    pesos_guardados:wts, proteina_hoje_g:st.prot[today] || 0, exercicios:names};
}
function renderChat(){
  var el = document.getElementById("chat");
  var h = '<div class="wrap chatwrap"><div class="top"><span class="eyebrow">Coach</span><span class="mono" style="font-size:11px;color:var(--muted)">fala comigo</span></div>';
  h += '<div class="disp" style="font-size:40px;margin-top:10px">Pergunta-me</div>';
  if (!st.chatCode){
    h += '<p class="note" style="margin:10px 2px 0">Escreve o código que o Tiago te deu. Só é preciso uma vez.</p>';
    h += '<div class="chatcode"><label class="vh" for="codeIn">Código</label><input id="codeIn" class="search" type="text" inputmode="text" autocomplete="off" placeholder="Código"><button class="main-btn" id="codeBtn" style="background:var(--green-deep);color:var(--chalk);min-height:48px">Entrar</button></div>';
    h += '</div>'; el.innerHTML = h;
    document.getElementById("codeBtn").addEventListener("click", function(){ var v = document.getElementById("codeIn").value.trim(); if (!v) return; st.chatCode = v; save(); renderChat(); });
    return;
  }
  if (ui.pedidos && ui.pedidos.length){
    h += '<details class="peds"' + (ui.pedidosOpen ? ' open' : '') + '><summary><span>Pedidos de mudança na app</span><span class="mono">' + ui.pedidos.filter(function(p){ return p.estado !== "feito"; }).length + ' em curso · ' + ui.pedidos.filter(function(p){ return p.estado === "feito"; }).length + ' feitos</span></summary>';
    ui.pedidos.forEach(function(p){ h += '<div class="ped"><div class="ph"><b>' + esc(p.titulo) + '</b><span class="pst ' + (p.estado === "feito" ? 'ok' : '') + '">' + esc(p.estado) + '</span></div>' + (p.resposta ? '<p>' + esc(p.resposta).replace(/\n/g, '<br>') + '</p>' : '') + '</div>'; });
    h += '<p class="note" style="font-size:11.5px;margin:6px 0 0">Quando um pedido fica "feito", fecha e volta a abrir a app para veres a mudança.</p></details>';
  }
  h += '<div class="msgs" id="msgs">';
  if (!st.chat.length){
    h += '<div class="msg ai"><p>Olá Diana. Pergunta-me o que quiseres sobre treino, técnica ou alimentação, ou pede-me mudanças: criar um treino, ajustar um peso, mudar de programa. Se for uma mudança na app em si, fica anotado para o Tiago.</p></div>';
    h += '<div class="sugs">' + ["Cria-me um treino só de glúteo para hoje, 45 min","O hip thrust está leve, sobe-me o peso","Que como antes de treinar às 7h?","Hoje estou cansada, o que faço?"].map(function(t){ return '<button class="chip sug" data-sug="' + esc(t) + '">' + esc(t) + '</button>'; }).join("") + '</div>';
  }
  st.chat.forEach(function(m, i){
    h += '<div class="msg ' + (m.role === "user" ? "me" : "ai") + '">' + esc(m.content).split("\n").map(function(x){ return '<p>' + x + '</p>'; }).join("") + '</div>';
    (m.actions || []).forEach(function(a, ai){ h += actionCard(a, i, ai); });
  });
  if (chatBusy) h += '<div class="msg ai typing"><p>a escrever…</p></div>';
  h += '</div>';
  h += '<div class="chatbar"><div class="in"><label class="vh" for="chatIn">Mensagem</label><textarea id="chatIn" rows="1" placeholder="Escreve aqui…"></textarea><button id="chatSend" aria-label="Enviar"' + (chatBusy ? ' disabled' : '') + '><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10l14-6-5 14-2.5-5.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button></div></div>';
  h += '<div style="display:flex;justify-content:center;gap:8px;margin-top:10px"><button class="tech" id="chatClear" style="border-color:var(--line);color:var(--muted)">Limpar conversa</button></div>';
  h += '</div>';
  el.innerHTML = h;
  var box = document.getElementById("msgs"); if (box) setTimeout(function(){ window.scrollTo(0, document.body.scrollHeight); }, 30);
  var ta = document.getElementById("chatIn");
  ta.addEventListener("input", function(){ ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px"; });
  document.getElementById("chatSend").addEventListener("click", function(){ sendChat(ta.value); });
  el.querySelectorAll("[data-sug]").forEach(function(b){ b.addEventListener("click", function(){ sendChat(b.getAttribute("data-sug")); }); });
  el.querySelectorAll("[data-act]").forEach(function(b){ b.addEventListener("click", function(){ var p = b.getAttribute("data-act").split("."); applyAction(+p[0], +p[1]); }); });
  document.getElementById("chatClear").addEventListener("click", function(){ st.chat = []; save(); renderChat(); });
  var pd = el.querySelector(".peds"); if (pd) pd.addEventListener("toggle", function(){ ui.pedidosOpen = pd.open; });
  if (!ui.pedidosAt || Date.now() - ui.pedidosAt > 60000) loadPedidos();
}
function actionCard(a, mi, ai){
  var done = a.applied, t = "", d = "";
  if (a.tipo === "create_workout"){ t = "Criar treino · " + (a.nome || "O meu treino"); d = (a.exercicios || []).map(function(x){ return enShort(x.ex) + " " + x.esquema + (x.kg ? " · " + x.kg + " kg" : ""); }).join(" / "); }
  else if (a.tipo === "set_weight"){ t = "Mudar peso"; d = enShort(a.ex || "") + " → " + a.kg + " kg"; }
  else if (a.tipo === "set_program"){ var tt = TYPES[a.programa]; t = "Mudar programa"; d = (tt ? tt.name : a.programa) + " · etapa " + a.etapa; }
  else if (a.tipo === "request_tiago"){ t = a.issue ? "Pedido de mudança na app · #" + a.issue : "Pedido para o Tiago"; d = a.texto || ""; }
  else return "";
  return '<div class="actc"><div><b>' + esc(t) + '</b><span>' + esc(d) + '</span></div>' + (a.tipo === "request_tiago" ? '<em>' + (a.issue ? 'na fila' : (a.fila ? 'fila: ' + esc(a.fila) : 'anotado')) + '</em>' : (done ? '<em>aplicado</em>' : '<button class="tech" data-act="' + mi + '.' + ai + '">Aplicar</button>')) + '</div>';
}
function findEx(n){
  if (!n) return null; if (EX[n]) return n;
  var low = String(n).toLowerCase(), hit = null;
  Object.keys(EX).forEach(function(k){ if (!hit && (k.toLowerCase() === low || (EX_EN[k] || "").toLowerCase() === low)) hit = k; });
  return hit || (look(EX, n) ? Object.keys(EX).filter(function(k){ return base(k) === base(n); })[0] : null);
}
function applyAction(mi, ai){
  var m = st.chat[mi], a = m && m.actions && m.actions[ai]; if (!a || a.applied) return;
  if (a.tipo === "create_workout"){
    var items = (a.exercicios || []).map(function(x){ var n = findEx(x.ex); return n ? [n, x.esquema || "3×10", Math.max(4, Math.min(9, x.esforco || 7)), x.kg ? x.kg + " kg" : ""] : null; }).filter(Boolean);
    if (!items.length){ toast("Não reconheci os exercícios"); return; }
    var id = "c" + Date.now().toString(36);
    st.custom[id] = {name:a.nome || "Treino do coach", items:items, ss:a.superseries !== false, rest:[45,60,90].indexOf(a.descanso) >= 0 ? a.descanso : 60, warm:true, stretch:true};
    st.type = "custom:" + id; toast("Treino criado: está no início");
  } else if (a.tipo === "set_weight"){
    var n2 = findEx(a.ex); if (!n2 || !(a.kg >= 0)){ toast("Não reconheci o exercício"); return; }
    st.weights[n2] = Math.round(a.kg * 10) / 10; toast(enShort(n2) + " → " + st.weights[n2] + " kg");
  } else if (a.tipo === "set_program"){
    if (!TYPES[a.programa]){ toast("Programa desconhecido"); return; }
    st.type = a.programa; st.ver[a.programa] = Math.max(0, Math.min(TYPES[a.programa].versions.length - 1, (a.etapa || 1) - 1)); toast("Programa mudado");
  }
  a.applied = true; save(); renderChat();
}
function loadPedidos(){
  ui.pedidosAt = Date.now();
  if (!st.chatCode) return;
  fetch("/api/pedidos?code=" + encodeURIComponent(st.chatCode)).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
    if (!j || !j.pedidos) return;
    var before = JSON.stringify(ui.pedidos || []); ui.pedidos = j.pedidos;
    if (before !== JSON.stringify(ui.pedidos) && ui.tab === "chat" && !document.getElementById("chatIn").value) renderChat();
  }).catch(function(){});
}
function sendChat(text){
  text = String(text || "").trim(); if (!text || chatBusy) return;
  st.chat.push({role:"user", content:text}); if (st.chat.length > 60) st.chat = st.chat.slice(-60);
  chatBusy = true; save(); renderChat();
  var msgs = st.chat.filter(function(m){ return !m.err; }).slice(-12).map(function(m){ return {role:m.role, content:m.content}; });
  fetch("/api/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({code:st.chatCode, messages:msgs, ctx:chatCtx()})})
    .then(function(r){ return r.json().then(function(j){ return {ok:r.ok, status:r.status, j:j}; }); })
    .then(function(o){
      chatBusy = false;
      if (!o.ok){ if (o.status === 401){ st.chatCode = ""; } st.chat.push({role:"assistant", content:(o.j && o.j.error) || "Erro. Tenta outra vez.", err:true}); save(); renderChat(); return; }
      var acts = (o.j.actions || []).filter(function(a){ return a && a.tipo; });
      acts.forEach(function(a){ if (a.tipo === "request_tiago" && a.texto){ st.requests.push({date:new Date().toISOString().slice(0, 10), text:a.texto}); } });
      st.chat.push({role:"assistant", content:o.j.reply || "", actions:acts});
      if (acts.some(function(a){ return a.issue; })) ui.pedidosAt = 0;
      save(); renderChat();
    })
    .catch(function(){ chatBusy = false; st.chat.push({role:"assistant", content:"Sem internet. Tenta outra vez quando tiveres rede.", err:true}); save(); renderChat(); });
}

/* ---------- PERFIL ---------- */
function renderProfile(){
  var ws = weekStats(), nTypes = TYPE_ORDER.length, nWork = 0; TYPE_ORDER.forEach(function(k){ nWork += TYPES[k].versions.length; });
  var h = '<div class="wrap"><div class="top"><span class="eyebrow">Perfil</span><span class="mono" style="font-size:11px;color:var(--muted)">' + esc(todayLabel()) + '</span></div>';
  h += '<div class="disp" style="font-size:40px;margin-top:10px">Diana</div>';
  h += '<div class="stats"><div class="stat"><b>' + ws.week + '</b><span>esta semana</span></div><div class="stat"><b>' + ws.total + '</b><span>treinos</span></div><div class="stat"><b class="acc">' + ws.min + '′</b><span>min esta semana</span></div></div>';
  var lg = (st.log || []).slice(-1)[0];
  if (lg) h += '<p class="lastlog">Último treino: <b>' + esc(lg.title) + '</b> · ' + esc(LOCS[lg.loc] ? LOCS[lg.loc].name : "") + ' · ' + lg.done + '/' + lg.total + ' séries · ' + Math.round(lg.sec / 60) + ' min' + (lg.partial ? ' · terminado mais cedo' : '') + ' · ' + esc(fmtDate(lg.date)) + '</p>';
  var logs = (st.log || []).slice(-20).reverse();
  h += '<div class="sec-h"><h2>Histórico</h2><span class="mono" style="font-size:11px;color:var(--muted)">' + (st.log || []).length + ' treinos</span></div><div class="wlist">';
  if (!logs.length) h += '<p class="empty" style="padding:20px 0">Ainda não há treinos guardados. Quando terminares o primeiro, aparece aqui com os pesos série a série.</p>';
  logs.forEach(function(l, i){
    h += '<button class="wrow" data-log="' + ((st.log.length - 1) - i) + '"><span class="n">' + esc(fmtDate(l.date)) + '</span><span><span class="tt">' + esc(l.title) + ' · ' + esc(l.ver || "") + '</span><div class="tags">' + esc(LOCS[l.loc] ? LOCS[l.loc].name : "") + ' · ' + l.done + '/' + l.total + ' séries' + (l.partial ? ' · terminado mais cedo' : '') + '</div></span><span class="mn">' + Math.round(l.sec / 60) + '′</span></button>';
  });
  h += '</div>';
  if ((st.requests || []).length){
    h += '<div class="sec-h"><h2>Pedidos ao Tiago</h2><span class="mono" style="font-size:11px;color:var(--muted)">' + st.requests.length + '</span></div><div class="ncards">';
    st.requests.slice(-10).reverse().forEach(function(q){ h += '<div class="ncard"><b style="font-size:12px;font-family:var(--mono);color:var(--muted)">' + esc(fmtDate(q.date)) + '</b><p>' + esc(q.text) + '</p></div>'; });
    h += '</div>';
  }
  h += '<div class="sec-h"><h2>Como funciona</h2></div>';
  h += '<div class="rules"><div class="r"><span class="eyebrow">Treinos</span><span>' + nTypes + ' programas × 5 etapas = <b>' + nWork + ' treinos diferentes</b>, cada um adaptado ao local. Mais o Rápido 20′ e os que criares.</span></div>';
  h += '<div class="r"><span class="eyebrow">Etapas</span><span>Escolhes um programa e fazes as 5 etapas por ordem. A app avança sozinha quando terminas cada uma. No fim da 5 recomeça (ciclo 2, 3…) e os pesos vão subindo. Podes trocar de programa quando quiseres; cada um guarda onde ficaste.</span></div>';
  h += '<div class="r"><span class="eyebrow">Superséries</span><span>A1 → 30s → A2 → 75s → repete. A app troca sozinha entre os dois.</span></div>';
  h += '<div class="r"><span class="eyebrow">Progressão</span><span>Séries todas feitas com esforço igual ou abaixo do indicado → <b>+2,5 kg</b> na barra e máquinas, <b>+1 kg</b> nos halteres. O peso é editável série a série e fica guardado.</span></div>';
  h += '<div class="r"><span class="eyebrow">Esforço</span><span>1 quase nada · 5 sobra muito · 8 sobram 2 reps · 9 sobra 1 · 10 falha</span></div></div>';
  h += '<div class="data"><button id="expBtn">Exportar cópia</button><button id="impBtn">Importar cópia</button><span class="st">Os dados ficam só neste telemóvel. Exporta de vez em quando e manda o ficheiro ao Tiago.</span></div>';
  h += '</div>';
  var el = document.getElementById("profile"); el.innerHTML = h;
  el.querySelectorAll("[data-log]").forEach(function(b){ b.addEventListener("click", function(){ openLog(parseInt(b.getAttribute("data-log"), 10)); }); });
  document.getElementById("expBtn").addEventListener("click", exportData);
  document.getElementById("impBtn").addEventListener("click", function(){ document.getElementById("importFile").click(); });
}

/* ---------- LIBRARY ---------- */
var GSHORT = {"Home Gym 900":"Home Gym","Power Rack 900":"Rack","Banco Ajustável":"Banco","Halteres + Barra":"Barra / halteres","Halteres Fixos":"Halteres","Bicicleta Estática":"Bike","Elásticos de Resistência":"Elástico","Peso Corporal":"Corpo","Alongamentos":"Along.","Máquinas · Fitness Up":"Máquina","Cardio · Fitness Up":"Cardio","Funcional":"Funcional","Sem ginásio":"Casa"};
var MUSCLES = ["peito","costas","ombros","bicep","tricep","perna","gluteo","core","cardio","mobilidade"];
function renderLib(){
  var q = ui.search.trim().toLowerCase(), loc = ui.libLoc || st.loc;
  var h = '<div class="wrap"><div class="top"><span class="eyebrow">Biblioteca</span><span class="mono" style="font-size:11px;color:var(--muted)">' + Object.keys(EX).length + ' exercícios</span></div>';
  h += '<div class="disp" style="font-size:40px;margin-top:10px">Como se faz</div>';
  h += '<label for="libSearch" class="eyebrow" style="position:absolute;left:-9999px">Procurar</label><input id="libSearch" class="search" type="search" placeholder="Procurar em inglês ou português" value="' + esc(ui.search) + '">';
  h += '<div class="chips" role="group" aria-label="Local">';
  LOC_ORDER.forEach(function(k){ h += '<button class="chip" data-lloc="' + k + '" aria-pressed="' + (loc === k) + '">' + esc(LOCS[k].name) + '</button>'; });
  h += '</div><div class="chips" role="group" aria-label="Grupo muscular">';
  MUSCLES.forEach(function(mu){ h += '<button class="chip" data-mu="' + mu + '" aria-pressed="' + (ui.filter === mu) + '">' + mu + '</button>'; });
  h += '</div><div id="libList">';
  var any = false;
  LIB.forEach(function(g){
    var gl = GROUP_LOC[g.g] || LOC_ORDER;
    if (!q && gl.indexOf(loc) < 0) return;
    var rows = g.items.filter(function(it){
      var en = (EX_EN[it[0]] || "").toLowerCase();
      return (!ui.filter || it[1].indexOf(ui.filter) !== -1) && (!q || it[0].toLowerCase().indexOf(q) !== -1 || en.indexOf(q) !== -1);
    });
    if (!rows.length) return; any = true;
    h += '<div class="lgroup"><div class="eyebrow" style="color:var(--muted);margin-bottom:6px">' + esc(g.g) + ' · ' + rows.length + '</div>';
    rows.forEach(function(it){
      var f = fig(it[0], "light");
      h += '<button class="lrow" data-ex="' + esc(it[0]) + '">' + (f ? '<span class="thumb">' + f + '</span>' : '<span class="thumb none">' + esc(GSHORT[g.g] || g.g) + '</span>') + '<span><div class="nm">' + esc(enName(it[0])) + '</div><div class="en">' + esc(ptName(it[0])) + ' <span class="mu">· ' + esc(it[1]) + '</span></div></span></button>';
    });
    h += '</div>';
  });
  if (!any) h += '<p class="empty">Nenhum exercício com esse nome.</p>';
  h += '</div></div>';
  var el = document.getElementById("lib");
  el.innerHTML = h;
  var inp = document.getElementById("libSearch");
  inp.addEventListener("input", function(){
    ui.search = inp.value; var pos = inp.selectionStart; renderLib();
    var n = document.getElementById("libSearch"); n.focus(); try { n.setSelectionRange(pos, pos); } catch(e){}
  });
  el.querySelectorAll("[data-lloc]").forEach(function(b){ b.addEventListener("click", function(){ ui.libLoc = b.getAttribute("data-lloc"); renderLib(); }); });
  el.querySelectorAll("[data-mu]").forEach(function(b){ b.addEventListener("click", function(){ var v = b.getAttribute("data-mu"); ui.filter = ui.filter === v ? null : v; renderLib(); }); });
  el.querySelectorAll("[data-ex]").forEach(function(b){ b.addEventListener("click", function(){ openSheet(b.getAttribute("data-ex"), null); }); });
}

/* ---------- NUTRIÇÃO ---------- */
var MEAL_ICON = {
  pa:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  al:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11h16l-1.5 8h-13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 11c0-3 2-5 4-5s4 2 4 5" stroke="currentColor" stroke-width="1.6"/></svg>',
  ja:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 14c3-6 8-8 14-8-1 6-4 9-9 10-2 .4-4 0-5-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 18c3-3 6-5 9-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  sn:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4c-4 0-7 3-7 7 0 5 7 9 7 9s7-4 7-9c0-4-3-7-7-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 4v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  pos:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8l-1 15a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.5 11h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  doce:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5h14v3a7 7 0 0 1-14 0z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 19h8M12 15v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
};
function addProt(v){
  var today = new Date().toISOString().slice(0, 10);
  if (v === "reset") st.prot[today] = 0; else st.prot[today] = (st.prot[today] || 0) + parseInt(v, 10);
  var keys = Object.keys(st.prot).sort(); if (keys.length > 60) keys.slice(0, keys.length - 60).forEach(function(k){ delete st.prot[k]; });
  save(); renderNutri(); toast(v === "reset" ? "Contador reposto" : "+" + v + " g de proteína");
}
function recImg(r, w){ return r.img ? "https://images.unsplash.com/photo-" + r.img + "?auto=format&fit=crop&w=" + w + "&q=70" : ""; }
function renderNutri(){
  var h = '<div class="wrap"><div class="top"><span class="eyebrow">Nutrição</span><span class="mono" style="font-size:11px;color:var(--muted)">' + NUTRI.recipes.length + ' receitas</span></div>';
  h += '<div class="disp" style="font-size:40px;margin-top:10px">Comer para treinar</div>';
  var today = new Date().toISOString().slice(0, 10), pg = st.prot[today] || 0, PT = 105, pct = Math.min(100, Math.round(pg / PT * 100)), left = Math.max(0, PT - pg);
  var pn = left === 0 ? "Objetivo de hoje cumprido." : (left <= 35 ? "Falta uma refeição com " + left + " g. Um batido pós-treino ou um iogurte grego chegam." : "Faltam " + left + " g. Põe proteína em cada refeição que ainda vem.");
  h += '<div class="pcard"><div class="ring" style="background:conic-gradient(var(--mint) ' + pct + '%, var(--nline) 0)"><i></i><b>' + pct + '%</b></div><div style="min-width:0;flex-grow:1"><div class="pk">Hoje · proteína</div><div class="pv">' + pg + ' de ' + PT + ' g</div><div class="pn">' + esc(pn) + '</div><div class="padd"><button data-padd="25">+25 g</button><button data-padd="30">+30 g</button><button data-padd="35">+35 g</button>' + (pg ? '<button class="rs" data-padd="reset">repor</button>' : '') + '</div></div></div>';
  h += '<p class="note" style="margin:10px 2px 0">' + esc(NUTRI.intro) + '</p>';
  h += '<div class="chips" role="group" aria-label="Secção">';
  NUTRI.sections.forEach(function(sc){ h += '<button class="chip" data-nsec="' + sc.key + '" aria-pressed="' + (ui.nsec === sc.key) + '">' + esc(sc.name) + '</button>'; });
  h += '<button class="chip" data-nsec="sup" aria-pressed="' + (ui.nsec === "sup") + '">Suplementos</button>';
  h += '<button class="chip" data-nsec="rec" aria-pressed="' + (ui.nsec === "rec") + '">Receitas</button></div>';
  if (ui.nsec === "sup"){
    h += '<p class="note" style="margin:10px 2px 0">O que vale a pena, quanto e quando. O resto da lista é para não gastares dinheiro à toa.</p><div class="ncards">';
    NUTRI.supplements.forEach(function(sp){
      h += '<div class="ncard sup"><div class="sup-h"><b>' + esc(sp.t) + '</b><span class="stag ' + sp.lvl + '">' + esc(sp.tag) + '</span></div>';
      if (sp.dose !== "—") h += '<div class="sup-row"><span class="eyebrow">Quanto</span><span>' + esc(sp.dose) + '</span></div><div class="sup-row"><span class="eyebrow">Quando</span><span>' + esc(sp.when) + '</span></div>';
      h += '<p>' + esc(sp.b) + '</p></div>';
    });
    h += '</div><div class="rtip" style="margin-top:12px"><b>Atenção:</b> ' + esc(NUTRI.supNote) + '</div>';
  } else if (ui.nsec === "rec"){
    h += '<input id="nSearch" class="search" type="search" placeholder="Procurar receita ou ingrediente" value="' + esc(ui.nq) + '">';
    h += '<div class="chips" role="group" aria-label="Refeição">';
    NUTRI.meals.forEach(function(m){ h += '<button class="chip" data-nmeal="' + m[0] + '" aria-pressed="' + (ui.nmeal === m[0]) + '">' + esc(m[1]) + '</button>'; });
    h += '</div><div style="margin-top:4px">';
    var q = ui.nq.trim().toLowerCase(), any = false;
    NUTRI.recipes.forEach(function(r, i){
      if (ui.nmeal && r.m !== ui.nmeal) return;
      if (q && r.n.toLowerCase().indexOf(q) < 0 && !r.ing.some(function(x){ return x.toLowerCase().indexOf(q) >= 0; })) return;
      any = true; var ml = NUTRI.meals.filter(function(m){ return m[0] === r.m; })[0];
      h += '<button class="rcard" data-rec="' + i + '"><span class="ic">' + MEAL_ICON[r.m] + (r.img ? '<img src="' + recImg(r, 200) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</span><span><div class="nm">' + esc(r.n) + '</div><div class="mu">' + esc(ml ? ml[1] : "") + ' · ' + r.min + ' min</div></span><span class="kc"><b>' + r.prot + ' g prot.</b>~' + r.kcal + ' kcal</span></button>';
    });
    if (!any) h += '<p class="empty">Nenhuma receita com isso.</p>';
    h += '<p class="note" style="margin:14px 2px 0;font-size:11px">Fotos: Unsplash.</p>';
    h += '</div>';
  } else {
    var sec = NUTRI.sections.filter(function(x){ return x.key === ui.nsec; })[0] || NUTRI.sections[0];
    h += '<div class="ncards">';
    sec.cards.forEach(function(cd){ h += '<div class="ncard"><b>' + esc(cd.t) + '</b><p>' + esc(cd.b) + '</p></div>'; });
    h += '</div>';
  }
  h += '</div>';
  var el = document.getElementById("nutri"); el.innerHTML = h;
  el.querySelectorAll("[data-nsec]").forEach(function(b){ b.addEventListener("click", function(){ ui.nsec = b.getAttribute("data-nsec"); renderNutri(); window.scrollTo(0, 0); }); });
  el.querySelectorAll("[data-nmeal]").forEach(function(b){ b.addEventListener("click", function(){ var v = b.getAttribute("data-nmeal"); ui.nmeal = ui.nmeal === v ? null : v; renderNutri(); }); });
  el.querySelectorAll("[data-rec]").forEach(function(b){ b.addEventListener("click", function(){ openRecipe(parseInt(b.getAttribute("data-rec"), 10)); }); });
  el.querySelectorAll("[data-padd]").forEach(function(b){ b.addEventListener("click", function(){ addProt(b.getAttribute("data-padd")); }); });
  var inp = document.getElementById("nSearch");
  if (inp) inp.addEventListener("input", function(){ ui.nq = inp.value; var pos = inp.selectionStart; renderNutri(); var n = document.getElementById("nSearch"); n.focus(); try { n.setSelectionRange(pos, pos); } catch(e){} });
}
function openRecipe(i){
  var r = NUTRI.recipes[i]; if (!r) return;
  var ml = NUTRI.meals.filter(function(m){ return m[0] === r.m; })[0];
  var h = '<div class="pan light" role="dialog" aria-modal="true" aria-label="' + esc(r.n) + '">';
  h += '<div class="grab"><span class="eyebrow" style="color:var(--muted)">' + esc(ml ? ml[1] : "") + ' · ' + r.min + ' min</span>' + CLOSE_BTN + '</div>';
  if (r.img) h += '<div class="rphoto"><img src="' + recImg(r, 900) + '" alt="' + esc(r.n) + '" onerror="this.parentNode.remove()"></div>';
  h += '<div class="disp" style="font-size:36px;margin-top:10px">' + esc(r.n) + '</div>';
  h += '<div class="tiles"><div class="tile"><span>PROTEÍNA</span><b>' + r.prot + ' g</b></div><div class="tile"><span>CALORIAS</span><b>~' + r.kcal + '</b></div><div class="tile"><span>TEMPO</span><b>' + r.min + '′</b></div></div>';
  h += '<div class="rowsx"><div class="rx"><span class="eyebrow">Precisas</span><span><ul class="rlist" style="margin-top:0">' + r.ing.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></span></div>';
  h += '<div class="rx"><span class="eyebrow">Como</span><span><ol class="rsteps" style="margin-top:0">' + r.st.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + '</ol></span></div></div>';
  if (r.tip) h += '<div class="rtip"><b>Dica:</b> ' + esc(r.tip) + '</div>';
  h += '<button class="main-btn" id="ateBtn" style="margin-top:14px;width:100%;background:var(--green-deep);color:var(--chalk)">Comi isto · +' + r.prot + ' g de proteína</button>';
  h += '</div>';
  showSheet(h);
  document.getElementById("ateBtn").addEventListener("click", function(){ closeSheet(); addProt(String(r.prot)); });
}

/* ---------- TROCAR EXERCÍCIO ---------- */
function swapCandidates(day, bi, ii){
  var b = day.blocks[bi], cur = b.items[ii][0], pat = b.pats ? b.pats[ii] : null, loc = day.loc, out = [], seen = {};
  seen[cur] = true;
  var fam = null; FAMILIES.forEach(function(f){ if (pat && f.indexOf(pat) >= 0) fam = f; });
  if (fam) fam.forEach(function(p){ if (p === pat) return; var v = VARIANTS[p] && VARIANTS[p][loc]; if (v && !seen[v[0]] && EX[v[0]]){ seen[v[0]] = true; out.push({n:v[0], ref:v[1] || "", why:"mesmo padrão"}); } });
  var ex = EX[cur] || look(EX, cur) || {}, mus = (ex.muscle || "").split("/")[0];
  if (mus){
    LIB.forEach(function(g){
      var gl = GROUP_LOC[g.g] || LOC_ORDER; if (gl.indexOf(loc) < 0) return;
      g.items.forEach(function(it){
        if (seen[it[0]] || it[1].split("/")[0] !== mus) return;
        seen[it[0]] = true;
        var loaded = /Home Gym|Rack|Banco|Barra|Fixos|Máquinas/.test(g.g) || /Halteres|Kettlebell|Halter\)/.test(it[0]);
        out.push({n:it[0], ref:loaded ? (refKg(b.items[ii][3]) != null ? b.items[ii][3] : "10 kg") : "", why:mus});
      });
    });
  }
  var seenEn = {}; out = out.filter(function(c){ var e = enName(c.n); if (seenEn[e] || e === enName(cur)) return false; seenEn[e] = true; return true; });
  return out.slice(0, 14);
}
function openSwap(bi, ii, inSess){
  var day = inSess ? sessDay() : curDay(), b = day.blocks[bi], it = b.items[ii];
  var cands = swapCandidates(day, bi, ii), k = itemKey(b, ii);
  var subs = inSess ? (st.sess.subs || {}) : (curSubs() || {}), isSub = !!subs[k];
  var h = '<div class="pan light" role="dialog" aria-modal="true" aria-label="Trocar exercício">';
  h += '<div class="grab"><span class="eyebrow" style="color:var(--muted)">' + esc(codeOf(day, bi, ii) + " · " + b.name) + '</span>' + CLOSE_BTN + '</div>';
  h += '<div class="disp" style="font-size:30px;margin-top:6px">Trocar ' + esc(enShort(it[0])) + '</div>';
  h += '<p class="note" style="margin:8px 0 0">Alternativas com a mesma função neste treino, para ' + esc(LOCS[day.loc].name) + '. Séries, reps e esforço mantêm-se (' + esc(it[1]) + ' · ' + (it[2] || "—") + '/10).</p>';
  if (isSub) h += '<button class="tech" id="swapReset" style="margin-top:12px;border-color:var(--green);color:var(--green)">Repor o exercício original</button>';
  h += '<div class="wlist" style="margin-top:10px">';
  if (!cands.length) h += '<p class="empty">Não há alternativas para este.</p>';
  cands.forEach(function(c, i){
    var f = fig(c.n, "light");
    h += '<button class="lrow" data-swapto="' + i + '">' + (f ? '<span class="thumb">' + f + '</span>' : '<span class="thumb none">' + esc(GSHORT[(EX[c.n] || {}).g] || "") + '</span>') + '<span><div class="nm">' + esc(enName(c.n)) + '</div><div class="en">' + esc(ptName(c.n)) + ' <span class="mu">· ' + esc(c.why) + (c.ref ? ' · ' + esc(c.ref) : '') + '</span></div></span></button>';
  });
  h += '</div></div>';
  showSheet(h);
  var el = document.getElementById("sheet");
  function apply(item){
    if (inSess){ st.sess.subs = st.sess.subs || {}; if (item) st.sess.subs[k] = item; else delete st.sess.subs[k]; ui.rest = null; save(); closeSheet(); renderWorkout(); }
    else { var sk = subKey(st.type, curVer(st.type), st.loc); st.subs[sk] = st.subs[sk] || {}; if (item) st.subs[sk][k] = item; else delete st.subs[sk][k]; if (!Object.keys(st.subs[sk]).length) delete st.subs[sk]; save(); closeSheet(); renderHome(); var hero = document.querySelector(".hero"); if (hero) hero.scrollIntoView({block:"start"}); }
    toast(item ? "Trocado por " + enShort(item[0]) : "Exercício original reposto");
  }
  el.querySelectorAll("[data-swapto]").forEach(function(btn){ btn.addEventListener("click", function(){ var c = cands[+btn.getAttribute("data-swapto")]; apply([c.n, it[1], it[2], c.ref]); }); });
  var rs = document.getElementById("swapReset"); if (rs) rs.addEventListener("click", function(){ apply(null); });
}

/* ---------- SHEET ---------- */
var CLOSE_BTN = '<button class="ib" id="sheetClose" aria-label="Fechar" style="background:var(--paper2)"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="#111A15" stroke-width="2" stroke-linecap="round"/></svg></button>';
function openSheet(name, ctx){
  var ex = EX[name] || look(EX, name) || {}, feel = look(FEEL, name);
  var f = fig(name, "light");
  var h = '<div class="pan light" role="dialog" aria-modal="true" aria-label="' + esc(enName(name)) + '">';
  h += '<div class="grab"><span class="eyebrow" style="color:var(--muted)">' + esc(ctx ? ctx.code + " · " + ctx.block : (ex.g || "")) + '</span>' + CLOSE_BTN + '</div>';
  h += '<div class="disp" style="font-size:38px;margin-top:6px">' + esc(enName(name)) + '</div>';
  h += '<div style="font-size:14px;color:var(--muted);margin-top:6px">' + esc(ptName(name)) + '</div>';
  if (f) h += '<div class="illo">' + f + '</div>';
  if (ctx){
    var kg = curKg(ctx.it);
    h += '<div class="tiles"><div class="tile"><span>SÉRIES</span><b>' + esc(ctx.it[1]) + '</b></div><div class="tile"><span>PESO</span><b>' + (kg != null ? fmtKg(kg) + " kg" : "—") + '</b></div><div class="tile"><span>ESFORÇO</span><b>' + (ctx.it[2] || "—") + '/10</b></div></div>';
  }
  h += '<div class="rowsx">';
  if (ex.setup) h += '<div class="rx"><span class="eyebrow">Onde</span><span>' + esc(ex.setup) + '</span></div>';
  if (ex.howto) h += '<div class="rx"><span class="eyebrow">Como</span><span>' + esc(ex.howto) + '</span></div>';
  if (feel){
    h += '<div class="rx feel"><span class="eyebrow">Sentir</span><span>' + esc(feel[0]) + '</span></div>';
    h += '<div class="rx avoid"><span class="eyebrow">Evitar</span><span>' + esc(feel[1]) + '</span></div>';
  }
  h += '</div></div>';
  showSheet(h);
}
function showSheet(h){
  var el = document.getElementById("sheet");
  el.innerHTML = h; el.hidden = false;
  var closer = document.getElementById("sheetClose");
  closer.addEventListener("click", closeSheet); closer.focus();
  el.onclick = function(e){ if (e.target === el) closeSheet(); };
}
function openLog(i){
  var l = (st.log || [])[i]; if (!l) return;
  var h = '<div class="pan light" role="dialog" aria-modal="true" aria-label="Treino de ' + esc(l.date) + '">';
  h += '<div class="grab"><span class="eyebrow" style="color:var(--muted)">' + esc(l.date.split("-").reverse().join("/")) + ' · ' + esc(LOCS[l.loc] ? LOCS[l.loc].name : "") + '</span>' + CLOSE_BTN + '</div>';
  h += '<div class="disp" style="font-size:36px;margin-top:6px">' + esc(l.title) + ' · ' + esc(l.ver || "") + '</div>';
  h += '<p style="margin:6px 0 0;color:var(--muted);font-size:14px">' + l.done + '/' + l.total + ' séries · ' + Math.round(l.sec / 60) + ' min' + (l.partial ? ' · terminado mais cedo' : '') + (l.dur === "short" ? ' · versão curta' : '') + '</p><div class="rowsx">';
  (l.wod || []).forEach(function(w){
    h += '<div class="rx"><span class="eyebrow">' + esc(w.kind) + '</span><span><b style="font-weight:600">' + esc(w.name) + '</b><div class="lg-sets"><span class="lg-s">' + (w.rounds != null ? w.rounds + ' rondas' : '') + '</span><span class="lg-s">' + mmss(w.sec) + '</span></div></span></div>';
  });
  (l.ex || []).forEach(function(e){
    var cells = e.s.map(function(v){ return v === null ? '<span class="lg-s no">—</span>' : '<span class="lg-s">' + (v === true ? '✓' : fmtKg(v) + ' kg') + '</span>'; }).join("");
    h += '<div class="rx"><span class="eyebrow">' + esc(e.c) + '</span><span><b style="font-weight:600">' + esc(enName(e.n)) + '</b> <span style="color:var(--muted);font-size:12.5px">· ' + esc(e.r) + '</span><div class="lg-sets">' + cells + '</div></span></div>';
  });
  h += '</div></div>';
  showSheet(h);
}
/* ---------- EDITOR de treinos ---------- */
var ZONES = [["perna","Pernas"],["gluteo","Glúteos"],["costas","Costas"],["peito","Peito"],["ombros","Ombros"],["bicep","Bíceps"],["tricep","Tríceps"],["core","Core"],["cardio","Cardio"],["mobilidade","Alongar"]];
var SCHEMES = ["3×8","3×10","3×12","3×15","4×8","4×10","4×12","2×12","2×15","3×20","3×30s","3×45s","3×60s","3×10/lado","3×12/lado","3×30s/lado","1×10","1×15","1×3 min","1×5 min"];
function openEditor(id){
  var c = id && st.custom[id] ? JSON.parse(JSON.stringify(st.custom[id])) : {name:"", items:[], ss:true, rest:60, warm:true, stretch:true};
  ui.ed = {id:id || ("c" + Date.now().toString(36)), isNew:!id, c:c, q:"", zone:null, loc:st.loc, free:{}, confirmDel:false};
  renderEditor();
}
function edSearchRows(){
  var ed = ui.ed, q = ed.q.trim().toLowerCase(), rows = [];
  LIB.forEach(function(g){
    var gl = GROUP_LOC[g.g] || LOC_ORDER;
    if (!q && gl.indexOf(ed.loc) < 0) return;
    g.items.forEach(function(it){
      var en = (EX_EN[it[0]] || "").toLowerCase();
      if (ed.zone && it[1].indexOf(ed.zone) < 0) return;
      if (!q || it[0].toLowerCase().indexOf(q) !== -1 || en.indexOf(q) !== -1 || it[1].indexOf(q) !== -1) rows.push(it);
    });
  });
  return rows.slice(0, q ? 40 : 200);
}
function renderEditor(){
  var ed = ui.ed, c = ed.c;
  var h = '<div class="pan light" role="dialog" aria-modal="true" aria-label="Criar treino">';
  h += '<div class="grab"><span class="eyebrow" style="color:var(--muted)">' + (ed.isNew ? "Novo treino" : "Editar treino") + '</span>' + CLOSE_BTN + '</div>';
  h += '<label class="eyebrow" style="display:block;margin-top:12px;color:var(--muted)">Nome do treino</label><input id="edName" class="search" style="margin-top:6px" type="text" placeholder="ex.: Pernas da Diana" value="' + esc(c.name) + '">';
  h += '<div class="eyebrow" style="margin-top:16px;color:var(--muted)">Exercícios · ' + c.items.length + '</div><div class="ed-list">';
  if (!c.items.length) h += '<p class="note" style="margin:8px 0">Ainda não há exercícios. Procura em baixo e toca para adicionar.</p>';
  c.items.forEach(function(it, i){
    var isTime = /s\b|min/.test(it[1] || "");
    h += '<div class="ed-row"><div class="ed-top"><span class="ed-n"><b>' + esc(enName(it[0])) + '</b><small>' + esc(ptName(it[0])) + '</small></span><span class="ed-btns"><button class="ib sm" data-up="' + i + '" aria-label="Subir">↑</button><button class="ib sm" data-down="' + i + '" aria-label="Descer">↓</button><button class="ib sm del" data-del="' + i + '" aria-label="Remover">✕</button></span></div>';
    h += '<div class="ed-ctl"><label><span>Séries × reps / tempo</span>';
    if (ed.free[i]) h += '<input type="text" data-schfree="' + i + '" placeholder="ex.: 3×12 ou 2×40s" value="' + esc(it[1]) + '">';
    else {
      h += '<select data-sch="' + i + '">';
      var list = SCHEMES.slice(); if (list.indexOf(it[1]) < 0) list.unshift(it[1]);
      list.forEach(function(sc){ h += '<option value="' + esc(sc) + '"' + (sc === it[1] ? ' selected' : '') + '>' + esc(sc) + '</option>'; });
      h += '<option value="__free">Escrever…</option></select>';
    }
    h += '</label><label><span>Esforço</span><select data-eff="' + i + '">';
    [4,5,6,7,8,9].forEach(function(e){ h += '<option value="' + e + '"' + (e === (it[2] || 7) ? ' selected' : '') + '>' + e + '/10</option>'; });
    h += '</select></label><label><span>Peso ref.</span><input type="text" inputmode="decimal" data-kg="' + i + '" placeholder="—" value="' + esc(it[3] ? String(it[3]).replace(/\s*kg.*$/, "") : "") + '"></label></div></div>';
  });
  h += '</div>';
  h += '<div class="ed-opts">';
  h += '<button class="chip" data-opt="ss" aria-pressed="' + !!c.ss + '">Superséries 2 a 2</button>';
  [45,60,90].forEach(function(r){ h += '<button class="chip" data-rest="' + r + '" aria-pressed="' + ((c.rest || 60) === r) + '">Descanso ' + r + 's</button>'; });
  h += '<button class="chip" data-opt="warm" aria-pressed="' + (c.warm !== false) + '">Aquecimento automático</button><button class="chip" data-opt="stretch" aria-pressed="' + (c.stretch !== false) + '">Alongamentos automáticos</button></div>';
  h += '<div class="eyebrow" style="margin-top:18px;color:var(--muted)">Sugestões por zona · ' + esc(LOCS[ed.loc].name) + '</div><div class="chips">';
  ZONES.forEach(function(z){ h += '<button class="chip" data-zone="' + z[0] + '" aria-pressed="' + (ed.zone === z[0]) + '">' + z[1] + '</button>'; });
  h += '</div>';
  h += '<div class="eyebrow" style="margin-top:14px;color:var(--muted)">Ou procurar</div>';
  h += '<input id="edSearch" class="search" style="margin-top:6px" type="search" placeholder="Procurar em português ou inglês" value="' + esc(ed.q) + '">';
  h += '<div class="chips">';
  LOC_ORDER.forEach(function(k){ h += '<button class="chip" data-edloc="' + k + '" aria-pressed="' + (ed.loc === k) + '">' + esc(LOCS[k].name) + '</button>'; });
  h += '</div><div class="ed-res">';
  var rows = edSearchRows(), lastG = null;
  rows.forEach(function(it){
    var g = (EX[it[0]] || {}).g || "";
    if (g !== lastG){ lastG = g; h += '<div class="eyebrow" style="color:var(--muted);margin:10px 0 4px;font-size:10px">' + esc(g) + '</div>'; }
    var f = fig(it[0], "light"), added = c.items.some(function(x){ return x[0] === it[0]; });
    h += '<button class="lrow" data-add="' + esc(it[0]) + '">' + (f ? '<span class="thumb">' + f + '</span>' : '<span class="thumb none">' + esc(GSHORT[g] || g) + '</span>') + '<span><div class="nm">' + esc(enName(it[0])) + (added ? ' <span class="mu" style="color:var(--green)">✓ adicionado</span>' : '') + '</div><div class="en">' + esc(ptName(it[0])) + ' <span class="mu">· ' + esc(it[1]) + '</span></div></span></button>';
  });
  if (!rows.length) h += '<p class="empty">Nenhum exercício com esse nome.</p>';
  h += '</div>';
  h += '<div class="ed-save"><button class="main-btn" id="edSave" style="background:var(--green);color:var(--chalk)">Guardar treino</button>';
  if (!ed.isNew) h += ed.confirmDel ? '<button class="tech" id="edDelYes" style="color:#8A5520;border-color:#8A5520">Apagar mesmo</button>' : '<button class="tech" id="edDel">Apagar treino</button>';
  h += '</div></div>';
  var el = document.getElementById("sheet"), keepPos = null, active = document.activeElement && document.activeElement.id;
  var scrollTop = el.firstElementChild ? el.firstElementChild.scrollTop : 0;
  if (active === "edSearch"){ try { keepPos = document.activeElement.selectionStart; } catch(e){} }
  el.innerHTML = h; el.hidden = false;
  var pan = el.firstElementChild; pan.scrollTop = scrollTop;
  document.getElementById("sheetClose").addEventListener("click", function(){ ui.ed = null; closeSheet(); });
  el.onclick = function(e){ if (e.target === el){ ui.ed = null; closeSheet(); } };
  var nm = document.getElementById("edName"); nm.addEventListener("input", function(){ c.name = nm.value; });
  var sq = document.getElementById("edSearch");
  sq.addEventListener("input", function(){ ed.q = sq.value; if (ed.q) ed.zone = null; var pos = sq.selectionStart; renderEditor(); var n = document.getElementById("edSearch"); n.focus(); try { n.setSelectionRange(pos, pos); } catch(e){} });
  if (keepPos != null){ sq.focus(); try { sq.setSelectionRange(keepPos, keepPos); } catch(e){} }
  el.querySelectorAll("[data-edloc]").forEach(function(b){ b.addEventListener("click", function(){ ed.loc = b.getAttribute("data-edloc"); renderEditor(); }); });
  el.querySelectorAll("[data-add]").forEach(function(b){ b.addEventListener("click", function(){ var n = b.getAttribute("data-add"); if (c.items.some(function(x){ return x[0] === n; })){ toast("Já está no treino"); return; } var sc = parseScheme("3×10"); var ex = EX[n] || {}; var def = /mobilidade/.test(ex.muscle) ? "1×30s/lado" : (/cardio/.test(ex.muscle) ? "1×5 min" : (/core/.test(ex.muscle) ? "3×12" : "3×10")); var loaded = /Home Gym|Rack|Banco|Barra|Fixos|Máquinas/.test(ex.g || "") || /Halteres|Kettlebell|Halter\)/.test(n); c.items.push([n, def, 7, loaded ? "10 kg" : ""]); toast("Adicionado: " + enShort(n)); renderEditor(); }); });
  el.querySelectorAll("[data-del]").forEach(function(b){ b.addEventListener("click", function(){ c.items.splice(+b.getAttribute("data-del"), 1); renderEditor(); }); });
  el.querySelectorAll("[data-up]").forEach(function(b){ b.addEventListener("click", function(){ var i = +b.getAttribute("data-up"); if (i > 0){ var t = c.items[i]; c.items[i] = c.items[i - 1]; c.items[i - 1] = t; renderEditor(); } }); });
  el.querySelectorAll("[data-down]").forEach(function(b){ b.addEventListener("click", function(){ var i = +b.getAttribute("data-down"); if (i < c.items.length - 1){ var t = c.items[i]; c.items[i] = c.items[i + 1]; c.items[i + 1] = t; renderEditor(); } }); });
  el.querySelectorAll("[data-sch]").forEach(function(sel){ sel.addEventListener("change", function(){ var i = +sel.getAttribute("data-sch"); if (sel.value === "__free"){ ed.free[i] = true; renderEditor(); var f = document.querySelector('[data-schfree="' + i + '"]'); if (f) f.focus(); return; } c.items[i][1] = sel.value; }); });
  el.querySelectorAll("[data-schfree]").forEach(function(inp){ inp.addEventListener("change", function(){ var v = inp.value.trim().replace(/x/i, "×").replace(/\s*×\s*/, "×"); if (v) c.items[+inp.getAttribute("data-schfree")][1] = v; }); });
  el.querySelectorAll("[data-zone]").forEach(function(b){ b.addEventListener("click", function(){ var z = b.getAttribute("data-zone"); ed.zone = ed.zone === z ? null : z; ed.q = ""; renderEditor(); }); });
  el.querySelectorAll("[data-eff]").forEach(function(sel){ sel.addEventListener("change", function(){ c.items[+sel.getAttribute("data-eff")][2] = parseInt(sel.value, 10); }); });
  el.querySelectorAll("[data-kg]").forEach(function(inp){ inp.addEventListener("change", function(){ var v = parseFloat(String(inp.value).replace(",", ".")); c.items[+inp.getAttribute("data-kg")][3] = isNaN(v) ? "" : (v + " kg"); }); });
  el.querySelectorAll("[data-opt]").forEach(function(b){ b.addEventListener("click", function(){ var o = b.getAttribute("data-opt"); c[o] = !(o === "ss" ? c.ss : c[o] !== false); renderEditor(); }); });
  el.querySelectorAll("[data-rest]").forEach(function(b){ b.addEventListener("click", function(){ c.rest = +b.getAttribute("data-rest"); renderEditor(); }); });
  document.getElementById("edSave").addEventListener("click", function(){
    if (!c.items.length){ toast("Adiciona pelo menos um exercício"); return; }
    if (!c.name.trim()) c.name = "O meu treino";
    st.custom[ed.id] = c; st.type = "custom:" + ed.id; save(); ui.ed = null; closeSheet(); renderHome(); toast("Treino guardado");
    var hero = document.querySelector(".hero"); if (hero) hero.scrollIntoView({behavior:"smooth", block:"start"});
  });
  var dl = document.getElementById("edDel"); if (dl) dl.addEventListener("click", function(){ ed.confirmDel = true; renderEditor(); });
  var dy = document.getElementById("edDelYes"); if (dy) dy.addEventListener("click", function(){ delete st.custom[ed.id]; if (st.type === "custom:" + ed.id) st.type = "legs"; save(); ui.ed = null; closeSheet(); renderHome(); toast("Treino apagado"); });
}
function closeSheet(){ var el = document.getElementById("sheet"); el.hidden = true; el.innerHTML = ""; }

/* ---------- WORKOUT ---------- */
function startOrResume(){
  if (!(st.sess && !st.sess.finished)){
    st.sess = {type:st.type, ver:curVer(st.type), loc:st.loc, dur:st.dur, subs:JSON.parse(JSON.stringify(curSubs() || {})), done:{}, wod:{}, accum:0, startedAt:Date.now(), running:true, finished:false, endSec:0};
    ui.rest = null;
  } else if (!st.sess.running){
    st.sess.running = true; st.sess.startedAt = Date.now();
  }
  save(); play("start"); showWorkout(true);
}
function showWorkout(on){
  document.getElementById("wk").hidden = !on;
  document.getElementById("tabbar").hidden = on;
  document.body.style.overflow = on ? "hidden" : "";
  if (on) renderWorkout(); else renderHome();
  if (on) wakeOn(); else wakeOff();
}
function sideHint(it){
  var sc = parseScheme(it[1]);
  if (!/\/lado/.test(sc.reps)) return "";
  var n = sc.reps.replace("/lado", "").trim();
  return sc.secs ? "Por lado: " + n + " de um lado, troca e " + n + " do outro. A contagem avisa a meio para trocares." : "Por lado: " + n + " para um lado + " + n + " para o outro = 1 série. Trocas de lado sem descanso e só descansas no fim.";
}
function isSS(b){ return /Supersérie/.test(b.name) && b.items.length === 2; }
function ssRestLabel(b){ var r = parseRest(b.rest); return r.after + 's entre séries'; }
function setsOf(it){ return parseScheme(it[1]).sets; }
function doneOf(bi, ii, n){ var c = 0; for (var k = 0; k < n; k++){ if (st.sess.done[bi + "." + ii + "." + k]) c++; } return c; }
function nextSetIdx(bi, ii, n){ for (var k = 0; k < n; k++){ if (!st.sess.done[bi + "." + ii + "." + k]) return k; } return -1; }
function allItems(day){
  var out = [];
  day.blocks.forEach(function(b, bi){ b.items.forEach(function(it, ii){ out.push({bi:bi, ii:ii, it:it, n:setsOf(it)}); }); });
  return out;
}
function isComplete(x){ return doneOf(x.bi, x.ii, x.n) >= x.n; }
function firstPending(day, from){
  var list = allItems(day), start = 0;
  if (from){ for (var i = 0; i < list.length; i++){ if (list[i].bi === from.bi && list[i].ii === from.ii){ start = i + 1; break; } } }
  for (var j = 0; j < list.length; j++){ var x = list[(start + j) % list.length]; if (!isComplete(x)) return x; }
  return null;
}
function focusItem(day){
  var f = st.sess.focus;
  if (f && day.blocks[f.bi] && day.blocks[f.bi].items[f.ii]){
    var x = {bi:f.bi, ii:f.ii, it:itemAt(day, f.bi, f.ii)}; x.n = setsOf(x.it);
    if (!isComplete(x) || ui.viewDone === f.bi + "." + f.ii) return x;
  }
  var p = firstPending(day, null);
  st.sess.focus = p ? {bi:p.bi, ii:p.ii} : null;
  return p;
}
function checkFinished(day){
  if (!firstPending(day, null)){
    setTimeout(function(){ play("green"); }, 150);
    st.sess.finished = true; st.sess.endSec = elapsed();
    st.sess.accum = st.sess.endSec * 1000; st.sess.running = false;
    return true;
  }
  return false;
}
function recordLast(it, kg){ st.last[it[0]] = {kg:kg, reps:parseScheme(it[1]).reps, date:new Date().toISOString().slice(0,10)}; }

function markDone(kForced){
  var day = sessDay(), x = focusItem(day); if (!x) return;
  var k = (kForced != null) ? kForced : nextSetIdx(x.bi, x.ii, x.n);
  if (k < 0 || st.sess.done[x.bi + "." + x.ii + "." + k]) return;
  var kg = curKg(x.it), key = x.bi + "." + x.ii + "." + k;
  st.sess.done[key] = {kg:kg, t:Date.now(), n:x.it[0]};
  (st.sess.hist = st.sess.hist || []).push([key]);
  recordLast(x.it, kg);
  ui.rest = null;
  play("tick");
  var blk = day.blocks[x.bi], r = parseRest(blk.rest), rest = r.has ? r.after : 0;
  if (!checkFinished(day)){
    if (isSS(blk) && st.ssMode !== "seq"){
      var o = x.ii === 0 ? 1 : 0, oN = setsOf(blk.items[o]);
      var dMe = doneOf(x.bi, x.ii, x.n), dO = doneOf(x.bi, o, oN), meLeft = dMe < x.n, oLeft = dO < oN;
      var target = null;
      if (x.ii === 0){
        if (oLeft && dO < dMe){ target = {bi:x.bi, ii:1}; rest = r.between; }
        else if (meLeft) target = {bi:x.bi, ii:0};
      } else {
        if (oLeft && dO <= dMe) target = {bi:x.bi, ii:0};
        else if (meLeft) target = {bi:x.bi, ii:1};
      }
      if (!target){ var nx2 = firstPending(day, {bi:x.bi, ii:1}); target = nx2 ? {bi:nx2.bi, ii:nx2.ii} : null; }
      st.sess.focus = target;
    } else if (isComplete(x)){
      var nx = firstPending(day, x); st.sess.focus = nx ? {bi:nx.bi, ii:nx.ii} : null;
    }
    if (rest > 0) ui.rest = {kind:"rest", total:rest, end:Date.now() + rest * 1000};
  }
  save(); renderWorkout();
}
function markItemDone(bi, ii){
  var day = sessDay(), it = itemAt(day, bi, ii), n = setsOf(it), kg = curKg(it), keys = [];
  for (var k = 0; k < n; k++){ var key = bi + "." + ii + "." + k; if (!st.sess.done[key]){ st.sess.done[key] = {kg:kg, t:Date.now(), n:it[0]}; keys.push(key); } }
  if (keys.length) (st.sess.hist = st.sess.hist || []).push(keys);
  recordLast(it, kg);
  ui.rest = null;
  if (!checkFinished(day)){ var nx = firstPending(day, {bi:bi, ii:ii}); st.sess.focus = nx ? {bi:nx.bi, ii:nx.ii} : null; }
  save(); renderWorkout();
  try { document.getElementById("wk").scrollTo(0, 0); } catch(e){}
}
function setFocus(bi, ii){ ui.viewDone = null; st.sess.focus = {bi:bi, ii:ii}; ui.rest = null; save(); renderWorkout(); try { document.getElementById("wk").scrollTo(0, 0); } catch(e){} }
function reopen(key){
  ui.viewDone = null;
  var p = key.split("."); st.sess.focus = {bi:+p[0], ii:+p[1]};
  if (st.sess.finished){ st.sess.finished = false; st.sess.partial = false; st.sess.running = true; st.sess.startedAt = Date.now(); }
}
function canUndo(){ return st.sess && Object.keys(st.sess.done).length > 0; }
function undoLast(){
  var s = st.sess; if (!s) return;
  var keys = s.hist && s.hist.length ? s.hist.pop() : null;
  if (!keys){
    var ks = Object.keys(s.done); if (!ks.length) return;
    ks.sort(function(a, b){ return s.done[b].t - s.done[a].t; }); keys = [ks[0]];
  }
  keys.forEach(function(k){ delete s.done[k]; });
  var bi = +keys[0].split(".")[0]; if (s.wod && s.wod[bi]) s.wod[bi].finished = false;
  ui.rest = null; reopen(keys[0]);
  save(); renderWorkout();
  try { document.getElementById("wk").scrollTo(0, 0); } catch(e){}
}
function unmarkSet(key){
  var s = st.sess; if (!s || !s.done[key]) return;
  delete s.done[key];
  if (s.hist) s.hist = s.hist.map(function(h){ return h.filter(function(k){ return k !== key; }); }).filter(function(h){ return h.length; });
  ui.rest = null; reopen(key); save(); renderWorkout();
}
function startHold(secs){ unlockAudio(); play("start"); ui.rest = {kind:"hold", total:secs, end:Date.now() + secs * 1000}; renderWorkout(); }
function startRest(secs){ unlockAudio(); ui.rest = {kind:"rest", total:secs, end:Date.now() + secs * 1000}; renderWorkout(); }

function ringSvg(left, total, color){
  var C = 326.7, off = C * (1 - (total ? left / total : 0));
  return '<svg width="96" height="96" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="#26342B" stroke-width="8"/><circle id="ringArc" cx="60" cy="60" r="52" fill="none" stroke="' + color + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 60 60)"/><text id="ringTxt" x="60" y="68" text-anchor="middle" fill="#EEF1E8" style="font-family:var(--mono);font-size:24px;font-weight:600">' + (left >= 60 ? mmss(left).replace(/^0/, "") : Math.ceil(left) + "s") + '</text></svg>';
}

/* ---------- WOD ---------- */
function wodState(bi){ var s = st.sess; s.wod = s.wod || {}; if (!s.wod[bi]) s.wod[bi] = {accum:0, startedAt:null, running:false, rounds:0, finished:false, lastPhase:null}; return s.wod[bi]; }
function wodElapsed(w){ return (w.accum + (w.running ? Date.now() - w.startedAt : 0)) / 1000; }
function wodInfo(b, w){
  var el = wodElapsed(w), total = wodTotal(b), k = b.wod.kind, o = {el:el, total:total, left:Math.max(0, total - el), over:el >= total};
  if (k === "emom"){
    o.minute = Math.min(b.wod.min, Math.floor(el / 60) + 1); o.station = Math.floor(el / 60) % b.items.length; o.left = Math.max(0, 60 - (el % 60)); if (o.over) o.left = 0;
    o.phase = "min" + Math.floor(el / 60);
  } else if (k === "circuit"){
    var cyc = b.wod.work + b.wod.rest, per = b.items.length * cyc, round = Math.floor(el / per), pos = el % per, stn = Math.floor(pos / cyc), inS = pos % cyc;
    o.round = Math.min(b.wod.rounds, round + 1); o.station = stn; o.work = inS < b.wod.work; o.left = o.work ? b.wod.work - inS : cyc - inS; if (o.over){ o.left = 0; }
    o.phase = round + "." + stn + "." + (o.work ? "w" : "r");
  }
  return o;
}
function wodStart(bi){ var w = wodState(bi); if (w.finished) return; unlockAudio(); if (!w.running){ w.running = true; w.startedAt = Date.now(); play("start"); } save(); renderWorkout(); }
function wodPause(bi){ var w = wodState(bi); if (w.running){ w.accum += Date.now() - w.startedAt; w.running = false; w.startedAt = null; } save(); renderWorkout(); }
function wodRounds(bi, d){ var w = wodState(bi); w.rounds = Math.max(0, w.rounds + d); play("tick"); save(); renderWorkout(); }
function wodFinish(bi){
  var day = sessDay(), b = day.blocks[bi], w = wodState(bi);
  if (w.running){ w.accum += Date.now() - w.startedAt; w.running = false; w.startedAt = null; }
  w.finished = true; w.sec = Math.round(w.accum / 1000);
  var keys = [];
  b.items.forEach(function(it, ii){ var key = bi + "." + ii + ".0"; if (!st.sess.done[key]){ st.sess.done[key] = {kg:null, t:Date.now()}; keys.push(key); } });
  if (keys.length) (st.sess.hist = st.sess.hist || []).push(keys);
  ui.rest = null;
  if (!checkFinished(day)){ var nx = firstPending(day, {bi:bi, ii:b.items.length - 1}); st.sess.focus = nx ? {bi:nx.bi, ii:nx.ii} : null; play("go"); }
  save(); renderWorkout();
  try { document.getElementById("wk").scrollTo(0, 0); } catch(e){}
}
function wodCard(day, bi, extraActs){
  var b = day.blocks[bi], w = wodState(bi), k = b.wod.kind, info = wodInfo(b, w), started = w.running || w.accum > 0;
  var h = '<div class="card">';
  h += '<div class="wod-kind"><span class="eyebrow" style="color:var(--amber)">' + esc(wodLabel(b)) + '</span><span class="mono" style="font-size:11px;color:var(--nmuted)">' + esc(wodTitle(b)) + '</span></div>';
  var note = k === "amrap" ? "O máximo de rondas possível no tempo. Cada vez que acabares a lista, toca em +1 ronda." :
             k === "emom" ? "A cada minuto fazes o exercício desse minuto e descansas o que sobrar. A app muda sozinha." :
             k === "fortime" ? "Faz as " + b.wod.rounds + " rondas o mais depressa que conseguires. Toca em +1 quando acabares cada ronda." :
             "Cada estação: " + b.wod.work + "s a trabalhar, " + b.wod.rest + "s de descanso para passar à seguinte. " + b.wod.rounds + " voltas.";
  h += '<p class="wod-note">' + esc(note) + '</p>';
  var big, lbl, phase = "", warn = false, barPct = 0, barRest = false;
  if (k === "amrap"){ big = mmss(info.left); lbl = "tempo que falta"; warn = info.left <= 30; barPct = info.el / info.total; }
  else if (k === "emom"){ big = Math.ceil(info.left) + "s"; lbl = "minuto " + info.minute + " de " + b.wod.min; phase = enShort(b.items[info.station][0]); warn = info.left <= 5; barPct = 1 - info.left / 60; }
  else if (k === "fortime"){ big = mmss(info.el); lbl = "cap " + b.wod.cap + "′ · ronda " + Math.min(b.wod.rounds, w.rounds + 1) + " de " + b.wod.rounds; warn = info.left <= 60; barPct = info.el / info.total; }
  else { big = Math.ceil(info.left) + "s"; lbl = "volta " + info.round + " de " + b.wod.rounds; phase = info.work ? enShort(b.items[info.station][0]) : "Descansa"; barRest = !info.work; warn = info.left <= 3; barPct = info.work ? 1 - info.left / b.wod.work : 1 - info.left / b.wod.rest; }
  if (w.finished){ big = mmss(w.sec || 0); lbl = "feito"; phase = ""; warn = false; barPct = 1; }
  h += '<div class="wod-timer"><div class="big' + (warn ? ' warn' : '') + '" id="wodBig">' + big + '</div><div class="lbl" id="wodLbl">' + esc(lbl) + '</div>' + (phase ? '<div class="wod-phase' + (barRest ? ' rest' : '') + '" id="wodPhase">' + esc(phase) + '</div>' : '') + '</div>';
  h += '<div class="wod-bar' + (barRest ? ' rest' : '') + '" id="wodBar"><i style="width:' + (Math.min(1, barPct) * 100).toFixed(1) + '%"></i></div>';
  h += '<div class="wod-list">';
  b.items.forEach(function(it, ii){
    var on = !w.finished && started && (k === "emom" || k === "circuit") && info.station === ii, kg = curKg(it);
    h += '<button class="tool" data-swapin="' + bi + '.' + ii + '" style="align-self:flex-end;min-height:28px;margin:-2px 0 -6px;font-size:10px">⇄ trocar</button><button class="wod-row' + (on ? ' on' : '') + '" data-tech="' + bi + '.' + ii + '" data-wodrow="' + ii + '"><span class="th">' + fig(it[0]) + '</span><span class="nm">' + esc(enName(it[0])) + '<small>' + esc(ptName(it[0]) || (EX[it[0]] || {}).setup || "") + '</small></span><span class="rp">' + esc(it[1]) + (kg != null ? '<br>' + fmtKg(kg) + ' ' + unitOf(it) : '') + '</span></button>';
  });
  h += '</div>';
  if (k === "amrap" || k === "fortime"){
    h += '<div class="rounds"><button class="step" id="rndDec" aria-label="Menos uma ronda">−</button><div><div class="rn" id="rndNum">' + w.rounds + '</div><div class="rl">rondas</div></div><button class="step" id="rndInc" aria-label="Mais uma ronda">+</button></div>';
  }
  h += '<div class="acts">';
  if (!w.finished){
    if (!started) h += '<button class="tech" id="wodGo" style="background:var(--mint);border-color:var(--mint);color:var(--night)">Começar ' + esc(wodLabel(b)) + '</button>';
    else if (w.running) h += '<button class="tech" id="wodPause">Pausar</button>';
    else h += '<button class="tech" id="wodGo" style="background:var(--mint);border-color:var(--mint);color:var(--night)">Continuar</button>';
    if (started) h += '<button class="tech" id="wodDone">' + esc(wodLabel(b)) + ' feito</button>';
  }
  h += extraActs + '</div></div>';
  return h;
}

function renderWorkout(){
  var s = st.sess; if (!s) { showWorkout(false); return; }
  var day = sessDay();
  var el = document.getElementById("wk");
  var total = day.min * 60, el_s = s.finished ? s.endSec : elapsed();
  var x = s.finished ? null : focusItem(day);
  var totalSets = 0, doneSets = Object.keys(s.done).length;
  allItems(day).forEach(function(y){ totalSets += y.n; });

  var h = '<div class="wrap">';
  h += '<div class="wk-h"><button class="ib" id="wkBack" aria-label="Voltar aos treinos"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12.5 4L6.5 10l6 6" stroke="#EEF1E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  h += '<div style="flex-grow:1;min-width:0"><div class="eyebrow" style="font-size:10px;color:var(--nmuted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(LOCS[s.loc].name) + ' · ' + esc(day.verLabel) + ' · ' + doneSets + '/' + totalSets + ' séries</div><div style="font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(day.title) + '</div></div>';
  h += '<button class="clock' + (s.running || s.finished ? "" : " paused") + '" id="clockBtn" aria-label="' + (s.running ? "Pausar sessão" : "Continuar sessão") + '"><b class="tnum" id="clockTxt">' + mmss(el_s) + '</b><span>' + (s.running || s.finished ? "de " + mmss(total) : "em pausa · toca") + '</span></button></div>';
  h += '<div class="tools"><button class="tool' + (st.sound === true ? ' on' : '') + '" id="soundBtn" aria-pressed="' + (st.sound === true) + '"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 6h2.5l3.5-3v10l-3.5-3H2.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' + (st.sound !== true ? '<path d="M11 6l3.5 4M14.5 6L11 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' : '<path d="M11 5.5c1 .8 1.5 1.6 1.5 2.5s-.5 1.7-1.5 2.5M12.8 3.8c1.5 1.1 2.2 2.5 2.2 4.2s-.7 3.1-2.2 4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>') + '</svg><span>' + (st.sound === true ? 'Som: ligado' : 'Som: desligado') + '</span></button><button class="tool" id="wakeBtn" aria-pressed="false"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="1.5" width="8" height="13" rx="1.8" stroke="currentColor" stroke-width="1.5"/><path d="M7 12.2h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>Ecrã</span></button>';
  h += '<button class="tool" id="locBtn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10 8 14 8 14z" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.5"/></svg><span>' + esc(LOCS[s.loc].name) + ' · trocar</span></button></div>';
  if (ui.locPick){
    h += '<div class="seg" style="margin-top:8px;background:var(--night2)" role="group" aria-label="Trocar local">';
    LOC_ORDER.forEach(function(k){ h += '<button data-setloc="' + k + '" aria-pressed="' + (s.loc === k) + '" style="color:var(--chalk)"><b>' + esc(LOCS[k].name) + '</b><span style="color:var(--nmuted)">' + esc(LOCS[k].sub) + '</span></button>'; });
    h += '</div>';
  }

  var curBi = x ? x.bi : day.blocks.length;
  h += '<div class="track">';
  day.blocks.forEach(function(b, bi){
    var bDone = b.items.every(function(it, ii){ return doneOf(bi, ii, setsOf(it)) >= setsOf(it); });
    var col = bDone ? "#9FD2B0" : (bi === curBi ? "#EEF1E8" : "#26342B");
    h += '<i style="flex-grow:' + b.min + ';background:' + col + '"></i>';
  });
  h += '<span class="dot" id="trackDot" style="left:calc(' + Math.min(100, el_s / total * 100).toFixed(1) + '% * (1 - 18 / 100))"></span>';
  h += '<svg width="12" height="22" viewBox="0 0 12 22" fill="none" aria-hidden="true"><circle cx="6" cy="11" r="4" stroke="#9DAAA1" stroke-width="1.4"/><circle cx="6" cy="11" r="1.5" fill="#E2B266"/></svg></div>';

  if (!x){
    if (s.partial){
      var missing = allItems(day).filter(function(y){ return doneOf(y.bi, y.ii, y.n) < y.n; }).map(function(y){ return codeOf(day, y.bi, y.ii) + " " + enShort(y.it[0]); });
      h += '<div class="finish"><div class="eyebrow" style="color:var(--amber)">Treino terminado mais cedo</div><div class="disp" style="font-size:44px">' + doneSets + '/' + totalSets + ' séries</div><p style="margin:0;font-size:14px;line-height:1.45;color:var(--nsoft)">' + mmss(s.endSec) + ' de treino. Ficou por fazer: ' + esc(missing.join(", ")) + '.</p>';
      h += '<button class="main-btn" id="finishBtn">Guardar e terminar</button><button class="tech" id="finishRepeat" style="justify-content:center">Guardar e repetir esta versão da próxima vez</button><button class="tech" id="resumeBtn" style="align-self:center">Afinal quero continuar</button></div>';
    } else {
      h += '<div class="finish"><div class="eyebrow" style="color:var(--mint)">Treino concluído</div><div class="disp" style="font-size:44px">' + mmss(s.endSec) + '</div><p style="margin:0;font-size:14px;line-height:1.45;color:var(--nsoft)">' + doneSets + ' séries feitas. Os pesos que usaste ficam guardados como ponto de partida para a próxima vez. A próxima vez que escolheres este tipo vem a versão seguinte.</p><button class="main-btn" id="finishBtn">Guardar e terminar</button><button class="tech" id="undoBtn2" style="align-self:center">Voltar ao último exercício</button></div>';
    }
    h += exerciseList(day, null) + '</div>';
    el.innerHTML = h;
    document.getElementById("finishBtn").addEventListener("click", function(){
      logSession();
      var nv = typeOf(st.sess.type).versions.length, nx = (st.sess.ver + 1) % nv;
      if (nx === 0 && nv === 5) st.cycle[st.sess.type] = (st.cycle[st.sess.type] || 0) + 1;
      st.ver[st.sess.type] = nx;
      st.sess = null; ui.rest = null; save(); showWorkout(false);
    });
    var fr = document.getElementById("finishRepeat");
    if (fr) fr.addEventListener("click", function(){ logSession(); st.ver[st.sess.type] = st.sess.ver; st.sess = null; ui.rest = null; save(); showWorkout(false); });
    var rb = document.getElementById("resumeBtn");
    if (rb) rb.addEventListener("click", function(){ var s2 = st.sess; s2.finished = false; s2.partial = false; s2.running = true; s2.startedAt = Date.now(); save(); renderWorkout(); });
    var u2 = document.getElementById("undoBtn2"); if (u2) u2.addEventListener("click", undoLast);
    wireWorkoutCommon(); wireList(el);
    return;
  }

  var blk = day.blocks[x.bi], it = x.it, sch = parseScheme(it[1]);
  var ex = EX[it[0]] || look(EX, it[0]) || {}, kg = curKg(it), last = st.last[it[0]];
  var nextK = nextSetIdx(x.bi, x.ii, x.n), code = codeOf(day, x.bi, x.ii);
  var ss = isSS(blk), alt = ss && st.ssMode !== "seq", wod = isWod(blk);
  h += '<div class="blk"><span class="eyebrow" style="color:var(--mint)">' + esc(blk.name) + '</span><span class="mono" style="font-size:11px;color:var(--nmuted)">' + esc(wod ? blk.min + "′" : (ss && !alt ? ssRestLabel(blk) : blk.rest)) + '</span></div>';
  var r = ui.rest, now = Date.now(), restHtml = "";
  if (r && !wod){
    var left = Math.max(0, (r.end - now) / 1000);
    restHtml += '<div class="rest">' + ringSvg(left, r.total, r.kind === "hold" ? "#9FD2B0" : "#E2B266") + '<div class="info">';
    if (r.kind === "hold") restHtml += '<div class="eyebrow" style="color:var(--mint)">A contar · ' + esc(sch.reps) + '</div><p>Aguenta. No fim a série fica marcada sozinha.</p>';
    else restHtml += '<div class="eyebrow" style="color:var(--amber)">Descanso</div><p>A seguir: <strong>' + (nextK >= 0 ? code + ' · ' + esc(enShort(it[0])) + ' · série ' + (nextK + 1) + ' de ' + x.n : 'próximo exercício') + '</strong></p><button class="tech" id="restSkip" style="min-height:40px">Saltar descanso</button>';
    restHtml += '</div></div>';
  }
  var setsHtml = '<div class="sets">';
  for (var k = 0; k < x.n; k++){
    var key = x.bi + "." + x.ii + "." + k, d = s.done[key];
    var vtxt = (kg != null ? fmtKg(d && d.kg != null ? d.kg : kg) + " " + unitOf(it) + " × " : "") + sch.reps;
    if (d){
      setsHtml += '<button class="set done" data-unmark="' + key + '" aria-label="Série ' + (k + 1) + ' feita — tocar para desmarcar"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#9FD2B0"/><path d="M5 9.2l2.6 2.6L13 6.4" stroke="#0E1712" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="l">Série ' + (k + 1) + '</span><span class="v">' + esc(vtxt) + ' · desfazer</span></button>';
    } else if (k === nextK){
      setsHtml += '<div class="set cur"><button class="ring-dot" data-mark="' + k + '" aria-label="Marcar série ' + (k + 1) + ' como feita" style="width:28px;height:28px;background:none;padding:0"></button><span class="l">Série ' + (k + 1) + '</span>';
      if (kg != null) setsHtml += '<button class="step" id="kgDec" aria-label="Menos peso">−</button><label class="kg-wrap"><span class="vh">Peso em kg</span><input class="kg-in tnum" id="kgInput" type="text" inputmode="decimal" autocomplete="off" value="' + fmtKg(kg) + '"><span class="kg-u">' + (perHand(it[3]) ? "kg/m" : "kg") + '</span></label><button class="step" id="kgInc" aria-label="Mais peso">+</button>';
      else if (sch.secs > 0) setsHtml += '<button class="hold" id="holdBtn">Contar ' + (sch.secs >= 60 ? mmss(sch.secs).replace(/^0/, "") : sch.secs + "s") + (/\/lado/.test(sch.reps) ? ' × 2 lados' : '') + '</button>';
      else setsHtml += '<span class="v" style="color:var(--nsoft);font-weight:500">' + esc(sch.reps) + ' · ' + noLoadLabel(it[0]) + '</span>';
      setsHtml += '</div>';
    } else {
      setsHtml += '<button class="set pend" data-mark="' + k + '" aria-label="Marcar série ' + (k + 1) + ' como feita"><span class="ring-dot"></span><span class="l">Série ' + (k + 1) + '</span><span class="v">' + esc(vtxt) + ' · marcar</span></button>';
    }
  }
  setsHtml += '</div>';
  var undoHtml = canUndo() ? '<button class="tech" id="undoBtn"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 2.5L4.5 7 9 11.5" stroke="#9FD2B0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Desfazer</button>' : '';
  var skipHtml = nextK >= 0 && !wod ? '<button class="tech" id="skipBtn">Saltar exercício</button>' : '';

  if (wod){
    h += wodCard(day, x.bi, undoHtml + (nextK >= 0 ? '<button class="tech" id="skipBtn">Saltar bloco</button>' : ''));
  } else if (alt){
    h += ssBlockCard(day, x, blk, restHtml, setsHtml, undoHtml + skipHtml);
  } else {
    h += '<div class="card">';
    if (ss) h += ssBanner(day, x, blk, alt);
    h += '<div class="ex-top"><div><div class="code">' + code + '</div><div class="disp ex-name">' + esc(enName(it[0])) + '</div><div class="ex-en">' + esc(ptName(it[0])) + '</div></div><div class="figbox">' + fig(it[0]) + '</div></div>';
    if (ex.setup) h += '<div class="ex-where">' + esc(ex.setup) + '</div>';
    var feel = look(FEEL, it[0]);
    if (feel) h += '<div class="ex-how"><strong style="color:var(--chalk);font-weight:600">Sentir:</strong> ' + esc(feel[0]) + '</div>';
    h += '<div class="ex-meta"><span>' + esc(it[1]) + '</span><span class="sep">|</span><span>esforço ' + (it[2] || "—") + '/10</span>' + (refKg(it[3]) != null ? '<span class="sep">|</span><span>ref. ' + esc(it[3]) + '</span>' : '') + (last && last.kg != null ? '<span class="sep">|</span><span>última: ' + fmtKg(last.kg) + ' kg</span>' : '') + '</div>';
    var shint = sideHint(it); if (shint) h += '<div class="side-hint">' + esc(shint) + '</div>';
    h += restHtml + setsHtml;
    h += '<div class="acts"><button class="tech" id="techBtn">Ver técnica <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 2.5L9.5 7 5 11.5" stroke="#9FD2B0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="tech" data-swapin="' + x.bi + '.' + x.ii + '">⇄ Trocar</button>' + undoHtml + skipHtml + '</div>';
    h += '</div>';
  }

  h += exerciseList(day, x) + endHtml(doneSets, totalSets) + '</div>';

  var btnLabel;
  if (wod){
    var w = wodState(x.bi), started = w.running || w.accum > 0;
    btnLabel = w.finished ? "Próximo exercício" : (!started ? "Começar " + wodLabel(blk) : (w.running ? "Pausar" : "Continuar"));
  } else btnLabel = (r && r.kind === "hold") ? "Parar contagem" : (nextK < 0 ? "Próximo exercício" : "Série " + (nextK + 1) + " de " + x.n + " feita");
  h += '<div class="bbar"><div class="in">';
  if (!wod){ h += '<div class="presets" role="group" aria-label="Descanso rápido">'; [30,60,90].forEach(function(sec){ h += '<button data-rest="' + sec + '" aria-label="Descansar ' + sec + ' segundos">' + sec + '</button>'; }); h += '</div>'; }
  h += '<button class="main-btn" id="mainBtn">' + btnLabel + '</button></div></div>';

  el.innerHTML = h;
  wireWorkoutCommon(); wireList(el);
  var tb = document.getElementById("techBtn"); if (tb) tb.addEventListener("click", function(){ openSheet(it[0], {it:it, code:code, block:blk.name}); });
  el.querySelectorAll("[data-tech]").forEach(function(b){ b.addEventListener("click", function(e){ e.stopPropagation(); var p = b.getAttribute("data-tech").split("."); var tIt = itemAt(day, +p[0], +p[1]); openSheet(tIt[0], {it:tIt, code:codeOf(day, +p[0], +p[1]), block:day.blocks[+p[0]].name}); }); });
  el.querySelectorAll("[data-swapin]").forEach(function(b){ b.addEventListener("click", function(e){ e.stopPropagation(); var p = b.getAttribute("data-swapin").split("."); openSwap(+p[0], +p[1], true); }); });
  el.querySelectorAll("[data-sspick]").forEach(function(b){ b.addEventListener("click", function(){ setFocus(x.bi, parseInt(b.getAttribute("data-sspick"), 10)); }); });
  var sb = document.getElementById("skipBtn"); if (sb) sb.addEventListener("click", function(){ if (wod) wodFinish(x.bi); else markItemDone(x.bi, x.ii); });
  var ub = document.getElementById("undoBtn"); if (ub) ub.addEventListener("click", undoLast);
  var ea = document.getElementById("endAsk"); if (ea) ea.addEventListener("click", function(){ ui.confirmEnd = true; renderWorkout(); var eb = document.getElementById("endYes"); if (eb) eb.scrollIntoView({block:"center"}); });
  var ey = document.getElementById("endYes"); if (ey) ey.addEventListener("click", endEarly);
  var en = document.getElementById("endNo"); if (en) en.addEventListener("click", function(){ ui.confirmEnd = false; renderWorkout(); });
  var tg = document.getElementById("ssToggle");
  if (tg) tg.addEventListener("click", function(){ st.ssMode = st.ssMode === "seq" ? "alt" : "seq"; ui.rest = null; save(); renderWorkout(); });
  var rs = document.getElementById("restSkip"); if (rs) rs.addEventListener("click", function(){ ui.rest = null; renderWorkout(); });
  el.querySelectorAll("[data-mark]").forEach(function(b){ b.addEventListener("click", function(){ unlockAudio(); markDone(parseInt(b.getAttribute("data-mark"), 10)); }); });
  el.querySelectorAll("[data-unmark]").forEach(function(b){ b.addEventListener("click", function(){ unmarkSet(b.getAttribute("data-unmark")); }); });
  var dec = document.getElementById("kgDec"), inc = document.getElementById("kgInc"), stepKg = perHand(it[3]) ? 1 : 2.5;
  if (dec) dec.addEventListener("click", function(){ st.weights[wKey(it[0])] = Math.max(0, (curKg(it) || 0) - stepKg); save(); renderWorkout(); });
  if (inc) inc.addEventListener("click", function(){ st.weights[wKey(it[0])] = (curKg(it) || 0) + stepKg; save(); renderWorkout(); });
  var kin = document.getElementById("kgInput");
  if (kin){
    kin.addEventListener("focus", function(){ try { kin.select(); } catch(e){} });
    var commit = function(){
      var v = parseFloat(String(kin.value).replace(",", ".").replace(/[^\d.]/g, ""));
      if (!isNaN(v) && v >= 0 && v <= 500){ st.weights[wKey(it[0])] = Math.round(v * 10) / 10; save(); }
      renderWorkout();
    };
    kin.addEventListener("change", commit);
    kin.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); kin.blur(); } });
  }
  var hold = document.getElementById("holdBtn"); if (hold) hold.addEventListener("click", function(){ var sides = /\/lado/.test(sch.reps); startHold(sides ? sch.secs * 2 : sch.secs); if (sides) ui.rest.sides = true; });
  var wg = document.getElementById("wodGo"); if (wg) wg.addEventListener("click", function(){ wodStart(x.bi); });
  var wp = document.getElementById("wodPause"); if (wp) wp.addEventListener("click", function(){ wodPause(x.bi); });
  var wd = document.getElementById("wodDone"); if (wd) wd.addEventListener("click", function(){ wodFinish(x.bi); });
  var rd = document.getElementById("rndDec"); if (rd) rd.addEventListener("click", function(){ wodRounds(x.bi, -1); });
  var ri = document.getElementById("rndInc"); if (ri) ri.addEventListener("click", function(){ wodRounds(x.bi, 1); });
  document.getElementById("mainBtn").addEventListener("click", function(){
    unlockAudio();
    if (wod){
      var w2 = wodState(x.bi), started2 = w2.running || w2.accum > 0;
      if (w2.finished){ ui.viewDone = null; var nx0 = firstPending(day, {bi:x.bi, ii:blk.items.length - 1}); st.sess.focus = nx0 ? {bi:nx0.bi, ii:nx0.ii} : null; save(); renderWorkout(); return; }
      if (!started2 || !w2.running) wodStart(x.bi); else wodPause(x.bi);
      return;
    }
    if (ui.rest && ui.rest.kind === "hold"){ ui.rest = null; renderWorkout(); return; }
    if (nextK < 0){ ui.viewDone = null; var nx = firstPending(day, x); st.sess.focus = nx ? {bi:nx.bi, ii:nx.ii} : null; save(); renderWorkout(); return; }
    markDone();
  });
  el.querySelectorAll("[data-rest]").forEach(function(b){ b.addEventListener("click", function(){ startRest(parseInt(b.getAttribute("data-rest"),10)); }); });
}

function ssBlockCard(day, x, blk, restHtml, setsHtml, extraActs){
  var r = parseRest(blk.rest), bi = x.bi;
  var n0 = setsOf(blk.items[0]), n1 = setsOf(blk.items[1]);
  var d0 = doneOf(bi, 0, n0), d1 = doneOf(bi, 1, n1), rounds = Math.max(n0, n1);
  var round = Math.min(rounds, Math.min(d0, d1) + 1);
  var h = '<div class="card ssb">';
  h += '<div class="ss-top"><span class="eyebrow" style="color:var(--amber)">Ronda ' + round + ' de ' + rounds + '</span><span class="ss-seq"><span class="ss-chip ' + (x.ii === 0 ? 'cur' : (d0 >= n0 ? 'ok' : '')) + '"><b>' + codeOf(day, bi, 0) + '</b></span><span class="ss-chip ' + (x.ii === 1 ? 'cur' : (d1 >= n1 ? 'ok' : '')) + '"><b>' + codeOf(day, bi, 1) + '</b></span><button class="ss-tg" id="ssToggle">Um de cada vez</button></span></div>';
  h += '<p class="ss-note">' + codeOf(day, bi, 0) + ' → ' + r.between + 's → ' + codeOf(day, bi, 1) + ' → ' + r.after + 's → repete. Uma série de cada, sempre a alternar.</p>';
  h += restHtml;
  [0, 1].forEach(function(ii){
    var it = blk.items[ii], n = setsOf(it), d = doneOf(bi, ii, n), on = ii === x.ii, kg = curKg(it);
    var tag = on ? "Agora" : (d >= n ? "Feito" : "A seguir");
    h += '<div class="sp' + (on ? ' on' : '') + '">';
    h += '<div class="sp-top"><div style="min-width:0"><div class="sp-id"><span class="sp-code">' + codeOf(day, bi, ii) + '</span><span class="sp-tag' + (on ? ' now' : '') + '">' + tag + '</span></div>';
    h += '<div class="disp sp-name">' + esc(enName(it[0])) + '</div><div class="ex-en">' + esc(ptName(it[0])) + '</div></div><div class="sp-fig">' + fig(it[0]) + '</div></div>';
    h += '<div class="ex-meta"><span>' + esc(it[1]) + '</span><span class="sep">|</span><span>esforço ' + (it[2] || "—") + '/10</span>' + (kg != null ? '<span class="sep">|</span><span>' + fmtKg(kg) + ' ' + unitOf(it) + '</span>' : '') + '</div>';
    var sh2 = sideHint(it); if (sh2 && on) h += '<div class="side-hint">' + esc(sh2) + '</div>';
    if (on) h += setsHtml;
    else {
      h += '<div class="pills">';
      for (var k = 0; k < n; k++){ var dd = st.sess.done[bi + "." + ii + "." + k]; h += '<span class="pill' + (dd ? ' ok' : '') + '">S' + (k + 1) + (dd ? ' ✓' : '') + '</span>'; }
      h += '</div>';
    }
    h += '<div class="acts"><button class="tech" data-tech="' + bi + '.' + ii + '">Técnica e explicação</button><button class="tech" data-swapin="' + bi + '.' + ii + '">⇄ Trocar</button>' + (on ? extraActs : (d < n ? '<button class="tech" data-sspick="' + ii + '">Fazer este agora</button>' : '')) + '</div>';
    h += '</div>';
  });
  return h + '</div>';
}
function ssBanner(day, x, blk, alt){
  var r = parseRest(blk.rest), bi = x.bi;
  var n0 = setsOf(blk.items[0]), n1 = setsOf(blk.items[1]);
  var d0 = doneOf(bi, 0, n0), d1 = doneOf(bi, 1, n1), rounds = Math.max(n0, n1);
  var h = '<div class="ss">';
  if (alt){
    var round = Math.min(rounds, Math.min(d0, d1) + 1);
    h += '<div class="ss-top"><span class="eyebrow" style="color:var(--amber)">Supersérie · ronda ' + round + ' de ' + rounds + '</span><button class="ss-tg" id="ssToggle">Fazer um de cada vez</button></div>';
    h += '<div class="ss-seq">';
    [0, 1].forEach(function(ii){
      var dn = ii === 0 ? d0 : d1, doneRound = dn >= round, cur = x.ii === ii;
      var cls = cur ? "cur" : (doneRound ? "ok" : "");
      h += '<span class="ss-chip ' + cls + '"><b>' + codeOf(day, bi, ii) + '</b> ' + esc(enShort(blk.items[ii][0])) + (doneRound && !cur ? ' ✓' : '') + '</span>';
      h += '<span class="ss-rest">' + (ii === 0 ? r.between + 's' : r.after + 's ↺') + '</span>';
    });
    h += '</div><p class="ss-note">Alternas entre os dois: fazes uma série de cada, descansas ' + r.after + 's e repetes. A app troca sozinha.</p>';
  } else {
    h += '<div class="ss-top"><span class="eyebrow" style="color:var(--nmuted)">Um de cada vez</span><button class="ss-tg" id="ssToggle">Voltar a alternar (supersérie)</button></div>';
    h += '<div class="ss-seq"><span class="ss-chip ' + (x.ii === 0 ? "cur" : (d0 >= n0 ? "ok" : "")) + '"><b>' + codeOf(day, bi, 0) + '</b> × ' + n0 + '</span><span class="ss-rest">depois</span><span class="ss-chip ' + (x.ii === 1 ? "cur" : (d1 >= n1 ? "ok" : "")) + '"><b>' + codeOf(day, bi, 1) + '</b> × ' + n1 + '</span><span class="ss-rest">' + r.after + 's entre séries</span></div>';
  }
  return h + '</div>';
}
function endEarly(){
  var s = st.sess; if (!s) return;
  s.finished = true; s.partial = true; s.endSec = elapsed(); s.accum = s.endSec * 1000; s.running = false;
  ui.rest = null; ui.confirmEnd = false; save(); renderWorkout();
  try { document.getElementById("wk").scrollTo(0, 0); } catch(e){}
}
function logSession(){
  var s = st.sess, day = sessDay(), total = 0;
  allItems(day).forEach(function(y){ total += y.n; });
  var ex = [], wods = [];
  allItems(day).forEach(function(y){
    var sets = [], nm = y.it[0];
    for (var k = 0; k < y.n; k++){ var d = s.done[y.bi + "." + y.ii + "." + k]; sets.push(d ? (d.kg != null ? d.kg : true) : null); if (d && d.n) nm = d.n; }
    ex.push({c:codeOf(day, y.bi, y.ii), n:nm, r:parseScheme(y.it[1]).reps, s:sets});
  });
  day.blocks.forEach(function(b, bi){
    if (!isWod(b)) return; var w = s.wod && s.wod[bi]; if (!w || !(w.finished || w.accum > 0)) return;
    wods.push({name:b.name + " · " + wodTitle(b), kind:wodLabel(b), rounds:(b.wod.kind === "amrap" || b.wod.kind === "fortime") ? w.rounds : null, sec:Math.round((w.sec != null ? w.sec : w.accum / 1000))});
  });
  var entry = {date:new Date().toISOString().slice(0,10), type:s.type, ver:day.verLabel, loc:s.loc, dur:s.dur, title:day.isProgram ? day.title + ' · ' + day.stageTitle : day.title, done:Object.keys(s.done).length, total:total, sec:Math.round(s.endSec || 0), partial:!!s.partial, ex:ex, wod:wods};
  (st.log = st.log || []).push(entry);
  if (st.log.length > 200) st.log = st.log.slice(-200);
}
function endHtml(doneSets, totalSets){
  if (ui.confirmEnd){
    return '<div class="endbox"><div class="eyebrow" style="color:var(--amber)">Terminar já?</div><p>Fizeste ' + doneSets + ' de ' + totalSets + ' séries. Fica registado só o que fizeste — o resto fica como não feito.</p><div class="acts"><button class="main-btn alt" id="endYes" style="flex-grow:1;min-height:48px">Sim, terminar</button><button class="tech" id="endNo">Continuar</button></div></div>';
  }
  return '<button class="tech endbtn" id="endAsk">Terminar treino agora</button>';
}
function exerciseList(day, x){
  var h = '<div class="next"><div class="eyebrow" style="font-size:10px;color:var(--nmuted);padding-bottom:4px">Exercícios do treino · toca para mudar</div>';
  var lastBi = -1;
  allItems(day).forEach(function(y){
    if (y.bi !== lastBi){
      lastBi = y.bi; var bk = day.blocks[y.bi];
      var sub = isWod(bk) ? wodTitle(bk) : (isSS(bk) ? (st.ssMode !== "seq" ? "alternar " + codeOf(day, y.bi, 0) + " ⇄ " + codeOf(day, y.bi, 1) : "um de cada vez") : bk.rest);
      h += '<div class="lhead"><span>' + esc(bk.name) + '</span><span>' + esc(sub) + '</span></div>';
    }
    var dn = doneOf(y.bi, y.ii, y.n), full = dn >= y.n, isCur = x && x.bi === y.bi && (x.ii === y.ii || isWod(day.blocks[y.bi]));
    var col = isCur ? "#9FD2B0" : (full ? "#4F6457" : "#9DAAA1");
    var stTxt = full ? "✓ feito" : (isWod(day.blocks[y.bi]) ? y.it[1] : dn + "/" + y.n);
    h += '<button class="nrow' + (isCur ? " on" : "") + '" data-focus="' + y.bi + '.' + y.ii + '"' + (isCur ? ' aria-current="step"' : '') + '><span class="c" style="color:' + col + '">' + codeOf(day, y.bi, y.ii) + '</span><span class="nm" style="' + (full && !isCur ? "color:#6E7D73;text-decoration:line-through;text-decoration-color:#3A4A40" : (isCur ? "color:#EEF1E8;font-weight:600" : "")) + '">' + esc(enName(y.it[0])) + '</span><span class="v" style="' + (full ? "color:#9FD2B0" : "") + '">' + esc(stTxt) + '</span></button>';
  });
  return h + '</div>';
}
function wireList(el){
  el.querySelectorAll("[data-focus]").forEach(function(b){
    b.addEventListener("click", function(){
      var p = b.getAttribute("data-focus").split("."), bi = +p[0], ii = +p[1];
      var day = sessDay(), it = itemAt(day, bi, ii), n = setsOf(it);
      if (doneOf(bi, ii, n) >= n){
        ui.viewDone = bi + "." + ii; ui.rest = null; st.sess.focus = {bi:bi, ii:ii}; save(); renderWorkout();
        try { document.getElementById("wk").scrollTo(0, 0); } catch(e){}
      } else setFocus(bi, ii);
    });
  });
}

function wireWorkoutCommon(){
  var sb2 = document.getElementById("soundBtn");
  if (sb2) sb2.addEventListener("click", function(){ st.sound = st.sound === true ? false : true; save(); if (st.sound) play("start"); renderWorkout(); });
  var wb = document.getElementById("wakeBtn");
  if (wb) wb.addEventListener("click", function(){
    if (st.keepAwake === false){ st.keepAwake = true; save(); wakeOn(); }
    else if (wake.on){ st.keepAwake = false; save(); wakeOff(); }
    else { wake.userTried = true; wakeOn(); }
  });
  paintWake();
  var lb = document.getElementById("locBtn"); if (lb) lb.addEventListener("click", function(){ ui.locPick = !ui.locPick; renderWorkout(); });
  document.querySelectorAll("[data-setloc]").forEach(function(b){ b.addEventListener("click", function(){ st.sess.loc = b.getAttribute("data-setloc"); st.loc = st.sess.loc; ui.locPick = false; ui.rest = null; save(); renderWorkout(); toast("Treino adaptado a " + LOCS[st.sess.loc].name); }); });
  document.getElementById("wkBack").addEventListener("click", function(){ ui.rest = null; ui.locPick = false; showWorkout(false); });
  document.getElementById("clockBtn").addEventListener("click", function(){
    var s = st.sess; if (!s || s.finished) return;
    if (s.running){ s.accum = elapsed() * 1000; s.running = false; } else { s.running = true; s.startedAt = Date.now(); }
    save(); renderWorkout();
  });
}

/* ---------- ticker ---------- */
setInterval(function(){
  if (document.getElementById("wk").hidden || !st.sess) return;
  var s = st.sess, day = sessDay(), total = day.min * 60, e = s.finished ? s.endSec : elapsed();
  var ct = document.getElementById("clockTxt"); if (ct) ct.textContent = mmss(e);
  var dot = document.getElementById("trackDot"); if (dot) dot.style.left = "calc(" + Math.min(100, e / total * 100).toFixed(1) + "% * (1 - 18 / 100))";
  var r = ui.rest;
  if (r){
    var left = Math.max(0, (r.end - Date.now()) / 1000);
    var arc = document.getElementById("ringArc"), tx = document.getElementById("ringTxt");
    if (arc) arc.setAttribute("stroke-dashoffset", (326.7 * (1 - left / r.total)).toFixed(1));
    if (tx) tx.textContent = left >= 60 ? mmss(left).replace(/^0/, "") : Math.ceil(left) + "s";
    var sec = Math.ceil(left);
    if (r.kind === "hold" && r.sides && !r.switched && left <= r.total / 2){ r.switched = true; play("go"); vib([150,80,150]); var inf = document.querySelector(".rest .info p"); if (inf) inf.textContent = "Troca de lado!"; }
    if (sec <= 3 && sec >= 1 && r.lastCount !== sec){ r.lastCount = sec; play("count"); }
    if (r.kind === "rest" && r.total >= 20 && sec === 10 && r.lastCount !== 10){ r.lastCount = 10; play("tick"); }
    if (left <= 0){
      beep();
      if (r.kind === "hold"){ ui.rest = null; markDone(); }
      else { ui.rest = null; renderWorkout(); }
    }
  }
  /* WOD em curso */
  if (!s.finished && s.focus && s.wod && s.wod[s.focus.bi] && s.wod[s.focus.bi].running){
    var bi = s.focus.bi, b = day.blocks[bi], w = s.wod[bi], info = wodInfo(b, w), k = b.wod.kind;
    if (info.over){ w.accum += Date.now() - w.startedAt; w.running = false; w.startedAt = null; w.accum = wodTotal(b) * 1000; play("green"); vib([300,100,300]); if (k === "amrap" || k === "emom" || k === "circuit") wodFinish(bi); else { save(); renderWorkout(); } return; }
    if (info.phase && w.lastPhase !== info.phase){ if (w.lastPhase != null){ play("go"); vib(info.work === false ? 80 : [120,60,120]); } w.lastPhase = info.phase; renderWorkout(); return; }
    var big = document.getElementById("wodBig"), bar = document.querySelector("#wodBar i");
    var txt, pct, warn;
    if (k === "amrap"){ txt = mmss(info.left); pct = info.el / info.total; warn = info.left <= 30; }
    else if (k === "emom"){ txt = Math.ceil(info.left) + "s"; pct = 1 - info.left / 60; warn = info.left <= 5; }
    else if (k === "fortime"){ txt = mmss(info.el); pct = info.el / info.total; warn = info.left <= 60; }
    else { txt = Math.ceil(info.left) + "s"; pct = info.work ? 1 - info.left / b.wod.work : 1 - info.left / b.wod.rest; warn = info.left <= 3; }
    if (big){ big.textContent = txt; big.className = "big" + (warn ? " warn" : ""); }
    if (bar) bar.style.width = (Math.min(1, pct) * 100).toFixed(1) + "%";
    var sec2 = Math.ceil(info.left);
    if (sec2 <= 3 && sec2 >= 1 && w.lastCount !== sec2 && k !== "fortime"){ w.lastCount = sec2; play("count"); }
  }
}, 250);

/* ---------- tabs ---------- */
function setTab(t){
  ui.tab = t;
  document.getElementById("home").hidden = t !== "home";
  document.getElementById("lib").hidden = t !== "lib";
  document.getElementById("nutri").hidden = t !== "nutri";
  document.getElementById("profile").hidden = t !== "profile";
  document.getElementById("chat").hidden = t !== "chat";
  document.getElementById("tabChat").setAttribute("aria-current", t === "chat" ? "page" : "false");
  document.getElementById("tabProfile").setAttribute("aria-current", t === "profile" ? "page" : "false");
  document.getElementById("tabHome").setAttribute("aria-current", t === "home" ? "page" : "false");
  document.getElementById("tabLib").setAttribute("aria-current", t === "lib" ? "page" : "false");
  document.getElementById("tabNutri").setAttribute("aria-current", t === "nutri" ? "page" : "false");
  if (t === "lib") renderLib(); else if (t === "nutri") renderNutri(); else if (t === "profile") renderProfile(); else if (t === "chat") renderChat(); else renderHome();
  window.scrollTo(0, 0);
}
document.getElementById("tabHome").addEventListener("click", function(){ setTab("home"); });
document.getElementById("tabLib").addEventListener("click", function(){ setTab("lib"); });
document.getElementById("tabNutri").addEventListener("click", function(){ setTab("nutri"); });
document.getElementById("tabProfile").addEventListener("click", function(){ setTab("profile"); });
document.getElementById("tabChat").addEventListener("click", function(){ setTab("chat"); });
document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !document.getElementById("sheet").hidden) closeSheet(); });

renderHome();
if (st.sess && !st.sess.finished && st.sess.running) showWorkout(true);
if ("serviceWorker" in navigator && location.protocol === "https:") { navigator.serviceWorker.register("sw.js").catch(function(){}); }
window.__dfc = {st:st, TYPES:TYPES, VARIANTS:VARIANTS, LIB:LIB, EX_EN:EX_EN, FIG:FIG, FEEL:FEEL, ALIAS:ALIAS, resolveDay:resolveDay, fig:fig, look:look};
})();
</script>
</body>
</html>
