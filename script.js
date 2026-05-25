const $=(id)=>document.getElementById(id);

function money(v){return `${v.toFixed(2)}€`;}

$('compute').onclick=()=>{
  const ca=+$('ca').value||0, cv=+$('cv').value||0, cf=+$('cf').value||0, cp=+$('cp').value||0, dettes=+$('dettes').value||0;
  if(ca<=0){$('calcOut').textContent='Entre un CA > 0';return;}
  const mcv=ca-cv;
  const tmcv=mcv/ca;
  const seuil=tmcv>0?cf/tmcv:Infinity;
  const result=mcv-cf;
  const solv=dettes>0?cp/dettes:0;
  $('calcOut').innerHTML=`MCV=${money(mcv)} | TMCV=${(tmcv*100).toFixed(2)}% | Seuil=${Number.isFinite(seuil)?money(seuil):'Impossible'} | Résultat=${money(result)} | Solvabilité=${solv.toFixed(2)}`;
};

const checks=[...document.querySelectorAll('.annale')];
const saved=JSON.parse(localStorage.getItem('annalesChecks')||'[]');
checks.forEach((c,i)=>{
  c.checked=!!saved[i];
  c.addEventListener('change',()=>{
    const state=checks.map(x=>x.checked);
    localStorage.setItem('annalesChecks',JSON.stringify(state));
  });
});

const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.08});
document.querySelectorAll('.card').forEach(c=>io.observe(c));
