const $=id=>document.getElementById(id);
const state={
  scores:JSON.parse(localStorage.getItem('scores')||'{"Mercatique":40,"Gestion":40,"Management":40,"EcoDroit":40,"Philo":40,"Oral":40}'),
  annales:JSON.parse(localStorage.getItem('annales')||'[]'),
  exams:JSON.parse(localStorage.getItem('exams')||'[]'),
  streak:Number(localStorage.getItem('streak')||0),
  progressLog:JSON.parse(localStorage.getItem('progressLog')||'[]'),
  flashIdx:0
};
const quizBank={
  Mercatique:[{q:'Quel indicateur mesure la variation en % ?',a:['Taux d\'évolution','Part de marché','Marge'],ok:0}],
  Gestion:[{q:'Seuil de rentabilité atteint quand ?',a:['Résultat=0','CA=0','CF=0'],ok:0}],
  Management:[{q:'Une partie prenante est...',a:['Acteur concerné','Un client uniquement','Un fournisseur uniquement'],ok:0}],
  EcoDroit:[{q:'En droit, après les faits ?',a:['Problème juridique','Conclusion','Titre'],ok:0}],
  Philo:[{q:'La problématique sert à...',a:['Poser l\'enjeu','Résumer le cours','Faire une conclusion'],ok:0}],
  Oral:[{q:'Le pitch d\'ouverture dure environ...',a:['30 secondes','5 minutes','10 secondes'],ok:0}]
};
const flashcards=[
  {q:'Mercatique : les 4P ?',a:'Produit, Prix, Distribution, Communication.'},
  {q:'Gestion : formule du TMCV ?',a:'TMCV = MCV / CA.'},
  {q:'Droit : méthode ?',a:'Faits → problème → règle → application → conclusion.'}
];
function save(){localStorage.setItem('scores',JSON.stringify(state.scores));localStorage.setItem('annales',JSON.stringify(state.annales));localStorage.setItem('exams',JSON.stringify(state.exams));localStorage.setItem('streak',String(state.streak));localStorage.setItem('progressLog',JSON.stringify(state.progressLog));}
function avgScore(){const v=Object.values(state.scores);return Math.round(v.reduce((a,b)=>a+b,0)/v.length)}
function renderKpi(){
  const entries=Object.entries(state.scores).sort((a,b)=>a[1]-b[1]);
  $('kpiLevel').textContent=`Niveau ${Math.floor(avgScore()/10)}`;
  $('kpiProgress').textContent=`${avgScore()}%`;
  $('kpiWeak').textContent=entries[0][0];
  $('kpiStrong').textContent=entries.at(-1)[0];
  $('kpiStreak').textContent=state.streak;
}
function drawChart(){
  const c=$('progressChart'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
  ctx.strokeStyle='#2b4477';ctx.strokeRect(0,0,c.width,c.height);
  const data=state.progressLog.slice(-20); if(!data.length) return;
  ctx.beginPath();ctx.strokeStyle='#34d399';ctx.lineWidth=3;
  data.forEach((v,i)=>{const x=(i/(data.length-1||1))*(c.width-20)+10;const y=c.height-10-(v/100)*(c.height-20); if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
}
function renderPlan(){
  const weak=Object.entries(state.scores).sort((a,b)=>a[1]-b[1])[0][0];
  const plan=[`1h30 ${weak} (priorité faible score)`,`1h Annale ${weak} + correction active`,`45 min quiz adaptatif ${weak}`,'30 min flashcards + erreurs','30 min oral argumentation'];
  $('adaptivePlan').innerHTML=plan.map(i=>`<li>${i}</li>`).join('');
}
$('generatePlan').onclick=renderPlan;
function renderAnnales(){
  $('annales').innerHTML='';
  state.annales.forEach((a,i)=>{const li=document.createElement('li');li.innerHTML=`<span>${a.name} ${a.done?'✅':''}</span><div><button data-d='${i}'>Fait</button><button data-x='${i}'>X</button></div>`;$('annales').appendChild(li);});
}
$('annaleAdd').onclick=()=>{const v=$('annaleInput').value.trim();if(!v)return;state.annales.push({name:v,done:false});$('annaleInput').value='';save();renderAnnales();};
$('annales').onclick=e=>{if(e.target.dataset.d!==undefined)state.annales[e.target.dataset.d].done=true;if(e.target.dataset.x!==undefined)state.annales.splice(e.target.dataset.x,1);save();renderAnnales();};
function renderFlash(){const f=flashcards[state.flashIdx%flashcards.length];$('flashQ').textContent=f.q;$('flashA').textContent=f.a;$('flashA').classList.add('hidden');}
$('showAnswer').onclick=()=>$('flashA').classList.remove('hidden');
$('know').onclick=()=>{state.flashIdx++;state.streak++;state.progressLog.push(Math.min(100,avgScore()+1));save();renderFlash();renderKpi();drawChart();};
$('dontKnow').onclick=()=>{state.flashIdx++;state.streak=Math.max(0,state.streak-1);state.progressLog.push(Math.max(0,avgScore()-1));save();renderFlash();renderKpi();drawChart();};
$('calcBtn').onclick=()=>{const ca=+$('ca').value||0,cv=+$('cv').value||0,cf=+$('cf').value||0,cp=+$('cp').value||0,d=+$('dettes').value||0,a=+$('actif').value||0;if(ca<=0)return $('calcOut').textContent='CA > 0 requis';const mcv=ca-cv,tmcv=mcv/ca,res=mcv-cf,seuil=tmcv>0?cf/tmcv:Infinity,solv=d?cp/d:0,auto=a?cp/a:0,rent=cp?res/cp:0;$('calcOut').innerHTML=`MCV ${mcv.toFixed(2)}€ • TMCV ${(tmcv*100).toFixed(2)}% • Résultat ${res.toFixed(2)}€ • Seuil ${Number.isFinite(seuil)?seuil.toFixed(2)+'€':'Impossible'}<br>Solvabilité ${solv.toFixed(2)} • Autonomie ${auto.toFixed(2)} • Rentabilité financière ${(rent*100).toFixed(2)}%`;};
Object.keys(quizBank).forEach(s=>{$('quizSubject').innerHTML+=`<option>${s}</option>`});
let qidx=0; function renderQuiz(){const s=$('quizSubject').value||'Mercatique';const q=quizBank[s][qidx%quizBank[s].length];$('qq').textContent=q.q;$('qa').innerHTML='';$('qf').textContent='';q.a.forEach((txt,i)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=()=>{const ok=i===q.ok;$('qf').textContent=ok?'Correct ✅':'Incorrect ❌';state.scores[s]=Math.max(0,Math.min(100,state.scores[s]+(ok?4:-3)));state.progressLog.push(avgScore());save();renderKpi();drawChart();};$('qa').appendChild(b);});}
$('quizSubject').onchange=()=>{qidx=0;renderQuiz()};$('nextQ').onclick=()=>{qidx++;renderQuiz()};
let examInt=null;
$('startExam').onclick=()=>{clearInterval(examInt);let t=7200;examInt=setInterval(()=>{const h=String(Math.floor(t/3600)).padStart(2,'0'),m=String(Math.floor((t%3600)/60)).padStart(2,'0'),s=String(t%60).padStart(2,'0');$('examTimer').textContent=`${h}:${m}:${s}`;if(--t<0)clearInterval(examInt);},1000)};
$('stopExam').onclick=()=>clearInterval(examInt);
function renderExams(){ $('examHistory').innerHTML=state.exams.map(e=>`<li><span>${e.date} • ${e.score}/20</span><small>${e.errors}</small></li>`).join(''); }
$('saveExam').onclick=()=>{const score=+$('examScore').value||0,errors=$('examErrors').value.trim();const date=new Date().toLocaleDateString('fr-FR');state.exams.unshift({date,score,errors});state.scores.Gestion=Math.min(100,state.scores.Gestion+Math.round(score));state.progressLog.push(avgScore());save();renderExams();renderKpi();drawChart();};
renderAnnales();renderFlash();renderKpi();drawChart();renderPlan();renderQuiz();renderExams();
