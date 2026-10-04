// Valida exercícios, figuras e durações: node tools/check.js (depois de tools/build.sh)
const fs=require('fs');const html=fs.readFileSync('index.html','utf8');
const m=html.match(/<script>\n\(function\(\)\{([\s\S]*)\}\)\(\);\n<\/script>/);let src=m[1];
const stub={getElementById:()=>({addEventListener(){},hidden:true,innerHTML:'',querySelectorAll:()=>[],style:{}}),addEventListener(){},querySelectorAll:()=>[],createElement:()=>({style:{},appendChild(){},click(){},remove(){}}),body:{appendChild(){},style:{}},querySelector:()=>null};
global.document=stub;global.window={};global.navigator={};global.localStorage={getItem:()=>null,setItem(){}};global.location={protocol:'http:'};global.setInterval=()=>0;global.Blob=function(){};global.URL={createObjectURL:()=>'',revokeObjectURL(){}};
src=src.replace('renderHome();\nif (st.sess','//\nif (st.sess');eval(src);const d=window.__dfc;
let used=new Set();for(const t in d.TYPES){d.TYPES[t].versions.forEach((v,vi)=>{for(const loc of ['gym','condo','home']){const day=d.resolveDay(t,vi,loc,'long');day.blocks.forEach(b=>b.items.forEach(it=>used.add(it[0])));}});}
const noFig=[...used].filter(n=>!d.look(d.FIG,n)), noFeel=[...used].filter(n=>!d.look(d.FEEL,n));
console.log('no FIG:',noFig);console.log('no FEEL:',noFeel);
for(const t in d.TYPES){const row=[];for(const dur of ['long','short']){row.push(dur+'='+[0,1,2].map(v=>d.resolveDay(t,v,'gym',dur).min).join('/'));}console.log(t.padEnd(8),row.join('  '));}
let all=0,withFig=0;d.LIB.forEach(g=>g.items.forEach(i=>{all++;if(d.look(d.FIG,i[0]))withFig++;}));console.log('lib',all,'with fig',withFig);
