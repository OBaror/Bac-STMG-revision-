const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

document.getElementById('compute').addEventListener('click', () => {
  const ca = Number(document.getElementById('ca').value || 0);
  const cv = Number(document.getElementById('cv').value || 0);
  const cf = Number(document.getElementById('cf').value || 0);

  if (ca <= 0) {
    document.getElementById('results').textContent = 'Entre un CA supérieur à 0.';
    return;
  }

  const mcv = ca - cv;
  const tmcv = mcv / ca;
  const resultat = mcv - cf;
  const seuil = tmcv > 0 ? cf / tmcv : Infinity;

  document.getElementById('results').innerHTML = `
    MCV = ${mcv.toFixed(2)} €<br>
    TMCV = ${(tmcv * 100).toFixed(2)} %<br>
    Résultat = ${resultat.toFixed(2)} €<br>
    Seuil de rentabilité = ${Number.isFinite(seuil) ? seuil.toFixed(2) + ' €' : 'impossible (TMCV nul)'}
  `;
});
