/* ============================================================
   BAC STMG 2026 — Outils Interactifs
   Calculateurs · Flashcards · Quiz scorés
   ============================================================ */

// ── Utilitaires ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = (n, d=2) => Number(n).toLocaleString('fr-FR', {minimumFractionDigits:d, maximumFractionDigits:d});
const fmtEur = n => fmt(n, 2) + ' €';
const fmtPct = n => fmt(n, 2) + ' %';

function showResult(id, html, type='info') {
  const el = $(id);
  if (!el) return;
  el.innerHTML = html;
  el.className = `calc-result calc-result--${type}`;
  el.style.display = 'block';
  el.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// ╔══════════════════════════════════════════════════════════╗
//   CALCULATEURS GESTION & FINANCE
// ╚══════════════════════════════════════════════════════════╝

// ── 1. Seuil de rentabilité ──────────────────────────────────
window.calcSR = function() {
  const cf  = parseFloat($('sr-cf')?.value)  || 0;
  const ca  = parseFloat($('sr-ca')?.value)  || 0;
  const cv  = parseFloat($('sr-cv')?.value)  || 0;

  if (!cf || !ca) return showResult('sr-result', '⚠️ Remplis tous les champs obligatoires.', 'warn');
  if (ca <= 0)    return showResult('sr-result', '⚠️ Le CA doit être positif.', 'warn');

  const mcv  = ca - cv;
  const tmcv = mcv / ca;
  if (tmcv <= 0)  return showResult('sr-result', '⚠️ Les charges variables dépassent le CA — vérifier les saisies.', 'warn');

  const sr    = cf / tmcv;
  const ms    = ca - sr;
  const is    = (ms / ca) * 100;
  const pm    = (sr / ca) * 365;
  const ok    = ca >= sr;

  showResult('sr-result', `
    <div class="calc-grid">
      <div class="calc-kpi">
        <span class="calc-kpi-label">Marge sur coût variable</span>
        <span class="calc-kpi-value">${fmtEur(mcv)}</span>
      </div>
      <div class="calc-kpi">
        <span class="calc-kpi-label">Taux de MCV</span>
        <span class="calc-kpi-value">${fmtPct(tmcv*100)}</span>
      </div>
      <div class="calc-kpi calc-kpi--accent">
        <span class="calc-kpi-label">Seuil de rentabilité (SR)</span>
        <span class="calc-kpi-value">${fmtEur(sr)}</span>
      </div>
      <div class="calc-kpi">
        <span class="calc-kpi-label">Point mort</span>
        <span class="calc-kpi-value">${Math.ceil(pm)} jours</span>
      </div>
      <div class="calc-kpi ${ok?'calc-kpi--ok':'calc-kpi--danger'}">
        <span class="calc-kpi-label">Marge de sécurité</span>
        <span class="calc-kpi-value">${fmtEur(ms)}</span>
      </div>
      <div class="calc-kpi ${ok?'calc-kpi--ok':'calc-kpi--danger'}">
        <span class="calc-kpi-label">Indice de sécurité</span>
        <span class="calc-kpi-value">${fmtPct(is)}</span>
      </div>
    </div>
    <div class="calc-interpretation">
      ${ok
        ? `✅ <strong>Rentable</strong> — Le CA de ${fmtEur(ca)} dépasse le SR de ${fmtEur(sr)}. L'entreprise dégage un bénéfice de ${fmtEur(ms)}.`
        : `❌ <strong>Déficitaire</strong> — Le CA de ${fmtEur(ca)} est inférieur au SR de ${fmtEur(sr)}. Il faut augmenter le CA de ${fmtEur(-ms)} pour être rentable.`
      }
    </div>
  `, ok ? 'ok' : 'danger');
};

// ── 2. Calcul TVA ─────────────────────────────────────────────
window.calcTVA = function() {
  const mode  = document.querySelector('input[name="tva-mode"]:checked')?.value || 'ht-to-ttc';
  const montant = parseFloat($('tva-montant')?.value) || 0;
  const taux    = parseFloat($('tva-taux')?.value)    || 20;

  if (!montant) return showResult('tva-result', '⚠️ Saisis un montant.', 'warn');

  let ht, ttc, tva;
  if (mode === 'ht-to-ttc') {
    ht  = montant;
    tva = ht * (taux/100);
    ttc = ht + tva;
  } else {
    ttc = montant;
    ht  = ttc / (1 + taux/100);
    tva = ttc - ht;
  }

  showResult('tva-result', `
    <div class="calc-grid">
      <div class="calc-kpi"><span class="calc-kpi-label">Montant HT</span><span class="calc-kpi-value">${fmtEur(ht)}</span></div>
      <div class="calc-kpi calc-kpi--accent"><span class="calc-kpi-label">TVA (${taux}%)</span><span class="calc-kpi-value">${fmtEur(tva)}</span></div>
      <div class="calc-kpi calc-kpi--ok"><span class="calc-kpi-label">Montant TTC</span><span class="calc-kpi-value">${fmtEur(ttc)}</span></div>
    </div>
    <div class="calc-interpretation">Prix TTC = Prix HT × (1 + ${taux/100}) = ${fmtEur(ht)} × ${1+taux/100} = <strong>${fmtEur(ttc)}</strong></div>
  `, 'ok');
};

// ── 3. Tableau d'amortissement ────────────────────────────────
window.calcAmort = function() {
  const K = parseFloat($('amort-capital')?.value) || 0;
  const i = parseFloat($('amort-taux')?.value)    / 100 || 0;
  const n = parseInt($('amort-duree')?.value)     || 0;

  if (!K || !i || !n) return showResult('amort-result', '⚠️ Remplis tous les champs.', 'warn');

  const a = K * i / (1 - Math.pow(1+i, -n));
  let crd = K;
  let rows = '';

  for (let k = 1; k <= n; k++) {
    const intk = crd * i;
    const amk  = a - intk;
    crd       -= amk;
    if (crd < 0.01) crd = 0;
    rows += `<tr>
      <td>${k}</td>
      <td>${fmtEur(crd + amk)}</td>
      <td>${fmtEur(intk)}</td>
      <td>${fmtEur(amk)}</td>
      <td><strong>${fmtEur(a)}</strong></td>
      <td>${fmtEur(crd)}</td>
    </tr>`;
  }

  showResult('amort-result', `
    <p style="margin-bottom:1rem;color:var(--text2);">Annuité constante : <strong style="color:var(--amber)">${fmtEur(a)}</strong></p>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Année</th><th>CRD début</th><th>Intérêts</th><th>Amort. capital</th><th>Annuité</th><th>CRD fin</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `, 'info');
};

// ── 4. Soldes Intermédiaires de Gestion (SIG) ─────────────────
window.calcSIG = function() {
  const v  = (id) => parseFloat($(id)?.value) || 0;
  const ventes   = v('sig-ventes');
  const cmv      = v('sig-cmv');         // coût d'achat marchandises vendues
  const prod     = v('sig-prod');        // production vendue
  const ci       = v('sig-ci');          // consommations intermédiaires
  const subv     = v('sig-subv');        // subventions
  const impots   = v('sig-impots');
  const charges  = v('sig-charges');    // charges personnel
  const dotations= v('sig-dotations');
  const autresCharges = v('sig-autres-charges');
  const rfinancier = v('sig-r-financier');
  const rexcep   = v('sig-r-excep');
  const is       = v('sig-is');

  const mc   = ventes - cmv;
  const va   = mc + prod - ci;
  const ebe  = va + subv - impots - charges;
  const rexp = ebe - dotations - autresCharges;
  const rca  = rexp + rfinancier;
  const rnet = rca + rexcep - is;

  const kpi = (label, val, note='') => `
    <div class="calc-kpi ${val >= 0 ? 'calc-kpi--ok' : 'calc-kpi--danger'}">
      <span class="calc-kpi-label">${label}</span>
      <span class="calc-kpi-value">${fmtEur(val)}</span>
      ${note ? `<span class="calc-kpi-note">${note}</span>` : ''}
    </div>`;

  showResult('sig-result', `
    <div class="calc-grid">
      ${kpi('Marge commerciale', mc, 'Ventes - Coût achat')}
      ${kpi('Valeur Ajoutée', va, 'MC + Production - CI')}
      ${kpi('EBE', ebe, 'VA + Subv - Impôts - Salaires')}
      ${kpi("Résultat d'exploitation", rexp, 'EBE - Dotations')}
      ${kpi('Résultat courant', rca, 'R.expl + R.financier')}
      ${kpi('Résultat net', rnet, 'R.courant + R.excep - IS')}
    </div>
  `, rnet >= 0 ? 'ok' : 'danger');
};

// ╔══════════════════════════════════════════════════════════╗
//   CALCULATEURS MERCATIQUE
// ╚══════════════════════════════════════════════════════════╝

// ── 5. Taux de marge / marque ─────────────────────────────────
window.calcMarge = function() {
  const mode = document.querySelector('input[name="marge-mode"]:checked')?.value || 'from-cost';
  const val1 = parseFloat($('marge-v1')?.value) || 0;
  const val2 = parseFloat($('marge-v2')?.value) || 0;

  let ht, cout, marge, taux_marge, taux_marque;

  if (mode === 'from-cost') {
    cout = val1; ht = val2;
  } else {
    cout = val1; taux_marge = val2/100;
    ht   = cout / (1 - taux_marge);
  }

  marge       = ht - cout;
  taux_marge  = (marge / ht) * 100;
  taux_marque = (marge / cout) * 100;

  if (ht <= 0 || cout <= 0) return showResult('marge-result', '⚠️ Valeurs invalides.', 'warn');

  showResult('marge-result', `
    <div class="calc-grid">
      <div class="calc-kpi"><span class="calc-kpi-label">Prix de vente HT</span><span class="calc-kpi-value">${fmtEur(ht)}</span></div>
      <div class="calc-kpi"><span class="calc-kpi-label">Coût d'achat</span><span class="calc-kpi-value">${fmtEur(cout)}</span></div>
      <div class="calc-kpi calc-kpi--accent"><span class="calc-kpi-label">Marge brute</span><span class="calc-kpi-value">${fmtEur(marge)}</span></div>
      <div class="calc-kpi calc-kpi--ok"><span class="calc-kpi-label">Taux de marge</span><span class="calc-kpi-value">${fmtPct(taux_marge)}</span></div>
      <div class="calc-kpi calc-kpi--ok"><span class="calc-kpi-label">Taux de marque</span><span class="calc-kpi-value">${fmtPct(taux_marque)}</span></div>
    </div>
    <div class="calc-interpretation">
      <strong>Rappel formules :</strong><br>
      Taux de marge = (PV HT - Coût) / <em>PV HT</em> × 100 = ${fmtPct(taux_marge)}<br>
      Taux de marque = (PV HT - Coût) / <em>Coût</em> × 100 = ${fmtPct(taux_marque)}
    </div>
  `, 'ok');
};

// ── 6. Part de marché ─────────────────────────────────────────
window.calcPdm = function() {
  const ce  = parseFloat($('pdm-ca-ent')?.value)  || 0;
  const ct  = parseFloat($('pdm-ca-total')?.value)|| 0;
  const qe  = parseFloat($('pdm-q-ent')?.value)   || 0;
  const qt  = parseFloat($('pdm-q-total')?.value) || 0;
  const ac  = parseFloat($('pdm-acheteurs')?.value)|| 0;
  const ap  = parseFloat($('pdm-potentiels')?.value)|| 0;

  if (!ct && !qt) return showResult('pdm-result', '⚠️ Saisis au moins CA ou quantités totales.', 'warn');

  let html = '<div class="calc-grid">';
  if (ct > 0) {
    html += `<div class="calc-kpi calc-kpi--accent"><span class="calc-kpi-label">PDM en valeur</span><span class="calc-kpi-value">${fmtPct(ce/ct*100)}</span></div>`;
  }
  if (qt > 0) {
    html += `<div class="calc-kpi calc-kpi--accent"><span class="calc-kpi-label">PDM en volume</span><span class="calc-kpi-value">${fmtPct(qe/qt*100)}</span></div>`;
  }
  if (ap > 0) {
    html += `<div class="calc-kpi"><span class="calc-kpi-label">Taux de pénétration</span><span class="calc-kpi-value">${fmtPct(ac/ap*100)}</span></div>`;
  }
  html += '</div>';

  showResult('pdm-result', html, 'ok');
};

// ── 7. Prix psychologique ─────────────────────────────────────
window.calcPrixPsy = function() {
  const container = $('psy-entries');
  if (!container) return;
  const rows = container.querySelectorAll('.psy-row');
  const n    = rows.length;
  if (n === 0) return;

  let data = [];
  rows.forEach(row => {
    const prix    = parseFloat(row.querySelector('.psy-prix')?.value) || 0;
    const tropCher= parseInt(row.querySelector('.psy-trop-cher')?.value) || 0;
    const tropPeu = parseInt(row.querySelector('.psy-trop-peu')?.value) || 0;
    data.push({prix, tropCher, tropPeu});
  });

  data.sort((a,b) => a.prix - b.prix);

  // Calcul cumulatif
  let cumTropCher = 0, cumTropPeu = 0;
  // Trop peu cher = cumulatif descendant (du plus élevé vers le plus bas)
  let cumulTPC = 0;
  for (let i = data.length-1; i >= 0; i--) cumulTPC += data[i].tropPeu;

  let rows2 = '';
  let bestPrice = null, bestAcceptability = -1;
  let cTC = 0;
  let tcpArr = [];

  // Calculer % cumulatif trop peu cher (du plus cher vers le moins cher)
  let cTPCum = [];
  let running = 0;
  for (let i = data.length-1; i >= 0; i--) running += data[i].tropPeu;
  let runningDown = 0;
  for (let i = 0; i < data.length; i++) {
    runningDown += data[i].tropPeu;
    cTPCum[i] = (running - runningDown + data[i].tropPeu) / n * 100;
  }
  // Reset: trop peu cher cumulatif = tous ceux qui trouvent ce prix et + trop peu cher
  let cTPCumCorrect = [];
  let acc = 0;
  for (let i = data.length-1; i >= 0; i--) acc += data[i].tropPeu;
  let tmp = acc;
  for (let i = 0; i < data.length; i++) {
    cTPCumCorrect[i] = tmp / n * 100;
    tmp -= data[i].tropPeu;
  }

  let cTCArr = [];
  let cTCRunning = 0;
  for (let i = data.length-1; i >= 0; i--) {
    cTCRunning += data[i].tropCher;
    cTCArr[data.length-1-i] = cTCRunning;
  }
  cTCArr.reverse();

  for (let i = 0; i < data.length; i++) {
    const pctTC  = cTCArr[i] / n * 100;
    const pctTPC = cTPCumCorrect[i];
    const accept = 100 - pctTC - pctTPC;
    if (accept > bestAcceptability) {
      bestAcceptability = accept;
      bestPrice = data[i].prix;
    }
    rows2 += `<tr>
      <td><strong>${data[i].prix} €</strong></td>
      <td>${fmtPct(pctTPC)}</td>
      <td>${fmtPct(pctTC)}</td>
      <td class="${accept >= 0 ? 'text-ok' : 'text-danger'}">${fmtPct(Math.max(0, accept))}</td>
    </tr>`;
  }

  showResult('psy-result', `
    <div class="table-wrapper" style="margin-bottom:1rem">
      <table>
        <thead><tr><th>Prix</th><th>% trop peu cher (cumulé)</th><th>% trop cher (cumulé)</th><th>% acceptabilité</th></tr></thead>
        <tbody>${rows2}</tbody>
      </table>
    </div>
    <div class="calc-interpretation">
      🎯 <strong>Prix psychologique optimal : ${bestPrice} €</strong>
      — Taux d'acceptabilité de <strong>${fmtPct(bestAcceptability)}</strong>
    </div>
  `, 'ok');
};

window.addPsyRow = function() {
  const container = $('psy-entries');
  const n = container.querySelectorAll('.psy-row').length + 1;
  const div = document.createElement('div');
  div.className = 'psy-row';
  div.innerHTML = `
    <input type="number" class="psy-prix calc-input" placeholder="Prix (€)" min="0" step="0.5">
    <input type="number" class="psy-trop-peu calc-input" placeholder="Trop peu cher (nb)" min="0">
    <input type="number" class="psy-trop-cher calc-input" placeholder="Trop cher (nb)" min="0">
    <button class="btn-remove" onclick="this.closest('.psy-row').remove()">✕</button>
  `;
  container.appendChild(div);
};

// ╔══════════════════════════════════════════════════════════╗
//   SYSTÈME FLASHCARDS
// ╚══════════════════════════════════════════════════════════╝

const FLASHCARD_DECKS = {
  mercatique: [
    {q:'Définition de la segmentation', r:'Découpage du marché en groupes homogènes (segments) selon des critères communs (démographiques, comportementaux, psychographiques).'},
    {q:'Définition du positionnement', r:"Place qu'occupe un produit dans l'esprit des consommateurs par rapport à la concurrence."},
    {q:'Les 4P du marketing mix', r:'Produit (Product) · Prix (Price) · Distribution (Place) · Communication (Promotion)'},
    {q:'Taux de marge = ?', r:'(PV HT − Coût) / PV HT × 100'},
    {q:'Taux de marque = ?', r:'(PV HT − Coût) / Coût × 100'},
    {q:'Part de marché en valeur = ?', r:"CA de l'entreprise / CA total du marché × 100"},
    {q:'Différence marketing transactionnel / relationnel', r:'Transactionnel : orienté vente unique. Relationnel : construire une relation durable avec le client (fidélisation, CRM).'},
    {q:"Qu'est-ce que le CRM ?", r:"Customer Relationship Management — logiciel et stratégie de gestion de la relation client (historique, contacts, SAV, fidélisation)."},
    {q:'Cycle de vie du produit (4 phases)', r:'1. Lancement → 2. Croissance → 3. Maturité → 4. Déclin'},
    {q:'Prix psychologique = ?', r:"Prix pour lequel le taux d'acceptabilité des consommateurs est le plus élevé (ni trop cher, ni trop peu cher)."},
    {q:'Distribution intensive vs sélective vs exclusive', r:'Intensive : maximum de points de vente (Coca-Cola). Sélective : points de vente choisis (parfums). Exclusive : un seul distributeur par zone (auto).'},
    {q:"Inbound vs Outbound marketing", r:"Inbound : attirer le client vers soi (contenu, SEO). Outbound : aller vers le client (pub, e-mailing)."},
    {q:'Greenwashing = ?', r:"Communication environnementale trompeuse — exagérer les attributs écologiques d'un produit ou d'une marque."},
    {q:'NPS (Net Promoter Score) = ?', r:"% Promoteurs − % Détracteurs. Mesure la probabilité qu'un client recommande la marque."},
    {q:"Qu'est-ce que la notoriété spontanée ?", r:"Part des personnes qui citent spontanément la marque parmi les premières (Top of Mind = 1re citée)."},
    {q:'Définition du marché potentiel', r:'Consommateurs actuels + non-consommateurs relatifs (pourraient acheter si les freins sont levés).'},
    {q:'Étude qualitative vs quantitative', r:'Qualitative : comprendre les motivations (entretiens, focus group) — petit échantillon. Quantitative : mesurer des tendances (questionnaire) — grand échantillon.'},
    {q:"Qu'est-ce que la dissonance cognitive ?", r:'Sentiment de malaise post-achat quand le consommateur doute de son choix (remise en question de la décision).'},
    {q:'Omnicanal = ?', r:"Stratégie intégrant tous les canaux de vente et de communication (magasin, site web, appli, réseaux) de façon cohérente et complémentaire."},
    {q:"SEO vs SEA", r:"SEO (Search Engine Optimization) : référencement naturel gratuit. SEA (Search Engine Advertising) : référencement payant (Google Ads)."},
  ],
  gestion: [
    {q:'FR (Fonds de Roulement) = ?', r:'Capitaux permanents − Actif immobilisé net\nOU\n(Capitaux propres + Dettes LT) − Actif immobilisé'},
    {q:'BFR (Besoin en Fonds de Roulement) = ?', r:'(Stocks + Créances clients) − (Dettes fournisseurs + Dettes fiscales CT)'},
    {q:'Trésorerie nette = ?', r:'FR − BFR\nOU\nDisponibilités − Dettes financières CT'},
    {q:'Marge commerciale = ?', r:'Ventes HT − Coût d\'achat des marchandises vendues (CAMV)'},
    {q:'Valeur Ajoutée (VA) = ?', r:'Marge commerciale + Production de l\'exercice − Consommations intermédiaires'},
    {q:'EBE = ?', r:'VA + Subventions d\'exploitation − Impôts & taxes − Charges de personnel'},
    {q:'Seuil de rentabilité (SR) = ?', r:'Charges fixes (CF) / Taux de marge sur coût variable (TMCV)\nTMCV = MCV / CA'},
    {q:'Taux de marge sur coût variable (TMCV) = ?', r:'MCV / CA\nOÙ MCV = CA − Charges variables'},
    {q:'Point mort (en jours) = ?', r:'SR / CA × 365 (ou 360)'},
    {q:'Indice de sécurité = ?', r:'(CA − SR) / CA × 100'},
    {q:'TVA à décaisser = ?', r:'TVA collectée sur ventes − TVA déductible sur achats'},
    {q:'Prix TTC = ?', r:'Prix HT × (1 + taux TVA)\nEx : 100 € × 1,20 = 120 € TTC'},
    {q:'Indemnité légale de licenciement (ILL) = ?', r:'1/4 de mois de salaire brut par année pour les 10 premières années\n+ 1/3 de mois par année au-delà de 10 ans'},
    {q:'Taux de rentabilité financière = ?', r:'Résultat net / Capitaux propres × 100'},
    {q:'Ratio d\'endettement = ?', r:'Dettes financières / Capitaux propres × 100 (< 100% conseillé)'},
    {q:'Délai de règlement clients = ?', r:'Créances clients TTC / CA TTC × 360 (en jours)'},
    {q:'Délai de règlement fournisseurs = ?', r:'Dettes fournisseurs TTC / Achats TTC × 360 (en jours)'},
    {q:'Annuité constante d\'emprunt = ?', r:'a = K × [i / (1 − (1+i)^−n)]\nK = capital, i = taux période, n = nombre de périodes'},
    {q:'Charges variables vs charges fixes', r:'CV : varient avec l\'activité (matières premières, commissions). CF : indépendantes de l\'activité (loyer, salaires fixes, assurances).'},
    {q:'Soldes Intermédiaires de Gestion — cascade', r:'1. Marge commerciale → 2. VA → 3. EBE → 4. Résultat d\'exploitation → 5. Résultat courant → 6. Résultat net'},
  ],
};

let currentDeck = [];
let currentCardIndex = 0;
let cardFlipped = false;
let deckStats = {known: 0, review: 0, total: 0};

window.initFlashcards = function(subject) {
  const deck = FLASHCARD_DECKS[subject];
  if (!deck) return;
  currentDeck = [...deck].sort(() => Math.random() - 0.5);
  currentCardIndex = 0;
  deckStats = {known: 0, review: 0, total: deck.length};
  showCard();
  updateDeckProgress();
};

function showCard() {
  const card = currentDeck[currentCardIndex];
  if (!card) return;
  cardFlipped = false;

  const front = $('fc-front');
  const back  = $('fc-back');
  const wrapper = $('fc-card-wrapper');

  if (front) front.textContent = card.q;
  if (back)  back.innerHTML = card.r.replace(/\n/g, '<br>');
  if (wrapper) wrapper.classList.remove('flipped');

  const counter = $('fc-counter');
  if (counter) counter.textContent = `${currentCardIndex + 1} / ${currentDeck.length}`;

  const btns = $('fc-action-btns');
  if (btns) btns.style.display = cardFlipped ? 'flex' : 'none';
}

window.flipCard = function() {
  cardFlipped = !cardFlipped;
  const wrapper = $('fc-card-wrapper');
  if (wrapper) wrapper.classList.toggle('flipped', cardFlipped);

  const btns = $('fc-action-btns');
  if (btns) btns.style.display = cardFlipped ? 'flex' : 'none';
};

window.cardKnown = function() {
  deckStats.known++;
  nextCard();
};

window.cardReview = function() {
  deckStats.review++;
  // Remettre la carte à la fin du paquet
  const card = currentDeck.splice(currentCardIndex, 1)[0];
  currentDeck.push(card);
  showCard();
  updateDeckProgress();
};

function nextCard() {
  currentCardIndex++;
  if (currentCardIndex >= currentDeck.length) {
    // Fin du paquet
    const wrapper = $('fc-card-wrapper');
    const btns    = $('fc-action-btns');
    if (wrapper) wrapper.innerHTML = `
      <div class="fc-end">
        <div class="fc-end-icon">🎉</div>
        <h3>Paquet terminé !</h3>
        <p>${deckStats.known} bien sus · ${deckStats.review} à revoir</p>
        <button class="btn btn-primary btn-sm" onclick="restartDeck()">🔄 Recommencer</button>
      </div>`;
    if (btns) btns.style.display = 'none';
    return;
  }
  showCard();
  updateDeckProgress();
}

window.restartDeck = function() {
  const deckId = $('fc-deck-select')?.value;
  if (deckId) initFlashcards(deckId);
};

function updateDeckProgress() {
  const bar   = $('fc-progress-fill');
  const label = $('fc-progress-label');
  const pct   = deckStats.total > 0 ? Math.round((deckStats.known / deckStats.total) * 100) : 0;
  if (bar)   bar.style.width = pct + '%';
  if (label) label.textContent = `${deckStats.known} / ${deckStats.total} maîtrisées`;
}

// ╔══════════════════════════════════════════════════════════╗
//   QUIZ SCORÉ
// ╚══════════════════════════════════════════════════════════╝

const QUIZZES = {
  mercatique: {
    title: 'Quiz Mercatique',
    questions: [
      {q:'Quel est le taux de marge si PV HT = 100 € et coût = 60 € ?', opts:['40 %','60 %','66,7 %','33,3 %'], correct:0, expl:'Taux de marge = (100 − 60) / 100 × 100 = 40 %'},
      {q:'Le taux de marque se calcule par rapport au :', opts:['Prix de vente HT','Coût d\'achat','Prix TTC','Chiffre d\'affaires'], correct:1, expl:'Taux de marque = (PV HT − Coût) / Coût × 100'},
      {q:'La segmentation comportementale repose sur :', opts:['L\'âge et le sexe','Le revenu et la CSP','La fidélité et la fréquence d\'achat','La région géographique'], correct:2, expl:'Les critères comportementaux incluent : fidélité à la marque, fréquence d\'achat, occasion d\'usage.'},
      {q:'Apple pratique une stratégie de distribution :', opts:['Intensive','Sélective','Exclusive','Indirecte longue'], correct:1, expl:'Apple sélectionne ses revendeurs agréés et possède ses propres Apple Stores — c\'est une distribution sélective.'},
      {q:'Le NPS se calcule ainsi :', opts:['% satisfaits − % insatisfaits','% promoteurs − % détracteurs','% fidèles / total clients × 100','Chiffre d\'affaires / nombre clients'], correct:1, expl:'NPS = % promoteurs (note 9-10) − % détracteurs (note 0-6).'},
      {q:'Lequel est un facteur psychologique du comportement d\'achat ?', opts:['Le revenu','La famille','La motivation','La nationalité'], correct:2, expl:'Les facteurs psychologiques comprennent : motivation, perception, apprentissage, attitudes.'},
      {q:'Le prix d\'écrémage consiste à :', opts:['Fixer un prix bas pour pénétrer rapidement le marché','Fixer un prix élevé au lancement puis baisser','Aligner son prix sur la concurrence','Fixer le prix psychologique optimal'], correct:1, expl:'L\'écrémage vise les early adopters peu sensibles au prix. Ex : lancement iPhone.'},
      {q:'L\'inbound marketing repose principalement sur :', opts:['La publicité TV','La création de contenu et le SEO','Les appels sortants (cold calling)','Le mailing non sollicité'], correct:1, expl:'L\'inbound attire naturellement le client via contenu utile, SEO, réseaux sociaux.'},
      {q:'Quel terme désigne une communication environnementale trompeuse ?', opts:['Marketing vert','Greenwashing','Marketing social','Éco-conception'], correct:1, expl:'Le greenwashing = exagérer ou inventer des attributs environnementaux pour améliorer l\'image.'},
      {q:'La stratégie de ciblage concentré (niche) consiste à :', opts:['S\'adresser à tous les segments','Adapter le mix à chaque segment','Se focaliser sur un seul segment restreint','Personnaliser l\'offre individu par individu'], correct:2, expl:'La stratégie concentrée cible un seul segment avec une offre spécialisée.'},
    ]
  },
  gestion: {
    title: 'Quiz Gestion & Finance',
    questions: [
      {q:'Si CF = 50 000 € et TMCV = 40 %, le seuil de rentabilité est :', opts:['20 000 €','125 000 €','200 000 €','50 000 €'], correct:1, expl:'SR = CF / TMCV = 50 000 / 0,40 = 125 000 €'},
      {q:'La TVA à décaisser = ?', opts:['TVA collectée + TVA déductible','TVA collectée − TVA déductible','TVA déductible / TVA collectée','TVA collectée × taux'], correct:1, expl:'TVA à payer à l\'État = TVA facturée aux clients − TVA récupérée sur les achats.'},
      {q:'Le BFR représente :', opts:['L\'argent disponible en caisse','Le besoin de financement du cycle d\'exploitation','La différence entre actif et passif','Le résultat net de l\'exercice'], correct:1, expl:'BFR = (Stocks + Créances) − Dettes d\'exploitation. C\'est le décalage de trésorerie lié au cycle d\'exploitation.'},
      {q:"L'EBE correspond à :", opts:['Résultat net + IS','VA + Subventions − Impôts − Salaires','Marge commerciale − Charges variables','CA − Coût de revient'], correct:1, expl:'EBE = VA + Subv. exploitation − Impôts & taxes − Charges de personnel'},
      {q:'Prix TTC avec un taux de TVA de 20 % sur 250 € HT :', opts:['270 €','280 €','300 €','208,33 €'], correct:2, expl:'250 × 1,20 = 300 € TTC'},
      {q:'Une trésorerie nette négative signifie :', opts:['L\'entreprise est rentable','FR < BFR : besoin de financement non couvert','L\'entreprise a trop de liquidités','Le résultat est bénéficiaire'], correct:1, expl:'TN = FR − BFR. Si TN < 0, le FR ne suffit pas à couvrir le BFR → risque de tensions de trésorerie.'},
      {q:'Le taux de marge sur coût variable = ?', opts:['CF / CA','(CA − CV) / CA','(CA − CF) / CV','CV / CA'], correct:1, expl:'TMCV = MCV / CA = (CA − CV) / CA'},
      {q:'L\'annuité constante d\'un emprunt est calculée par :', opts:['K × i','K × i / (1 − (1+i)^−n)','K / n + K × i','K × n × i'], correct:1, expl:'C\'est la formule des annuités de fin de période à capital et taux constants.'},
      {q:'Un ratio d\'endettement supérieur à 100 % signifie :', opts:['L\'entreprise est rentable','Les dettes dépassent les capitaux propres','L\'entreprise a trop de trésorerie','Le BFR est positif'], correct:1, expl:'Ratio = Dettes financières / Capitaux propres. > 100 % = endettement excessif.'},
      {q:'Le délai de règlement fournisseurs se calcule par rapport aux :', opts:['Ventes TTC','Achats TTC','Achats HT','Charges fixes'], correct:1, expl:'Délai fournisseurs = Dettes fournisseurs TTC / Achats TTC × 360 jours.'},
    ]
  }
};

let quizState = {};

window.startQuiz = function(subject) {
  const quiz = QUIZZES[subject];
  if (!quiz) return;

  quizState = {
    subject,
    questions: [...quiz.questions].sort(() => Math.random() - 0.5),
    current: 0,
    score: 0,
    answers: []
  };

  renderQuizQuestion();
};

function renderQuizQuestion() {
  const container = $('quiz-container');
  if (!container) return;

  const {questions, current, score} = quizState;
  if (current >= questions.length) {
    renderQuizEnd();
    return;
  }

  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);

  container.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-progress-label">Question ${current + 1} / ${questions.length} · Score : ${score} / ${current}</div>
    </div>
    <div class="quiz-question-text">${q.q}</div>
    <div class="quiz-options-grid">
      ${q.opts.map((opt, i) => `
        <button class="quiz-opt" onclick="answerQuiz(${i})">
          <span class="quiz-opt-letter">${String.fromCharCode(65+i)}</span>
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

window.answerQuiz = function(chosen) {
  const {questions, current} = quizState;
  const q = questions[current];
  const correct = chosen === q.correct;

  if (correct) quizState.score++;
  quizState.answers.push({chosen, correct});

  const container = $('quiz-container');
  const opts = container.querySelectorAll('.quiz-opt');
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === chosen && !correct) btn.classList.add('wrong');
  });

  const feedback = document.createElement('div');
  feedback.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
  feedback.innerHTML = `${correct ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.'} — ${q.expl}`;
  container.appendChild(feedback);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-primary btn-sm';
  nextBtn.style.marginTop = '1rem';
  nextBtn.textContent = current + 1 < questions.length ? 'Question suivante →' : 'Voir mes résultats';
  nextBtn.onclick = () => { quizState.current++; renderQuizQuestion(); };
  container.appendChild(nextBtn);
};

function renderQuizEnd() {
  const container = $('quiz-container');
  const {score, questions, answers} = quizState;
  const pct = Math.round((score / questions.length) * 100);
  const mention = pct >= 90 ? '🏆 Excellent !' : pct >= 70 ? '✅ Bien !' : pct >= 50 ? '📚 Assez bien' : '💪 Continue les révisions';

  let reviewHtml = '';
  questions.forEach((q, i) => {
    const a = answers[i];
    if (!a.correct) {
      reviewHtml += `<div class="quiz-review-item">
        <strong>Q${i+1}:</strong> ${q.q}<br>
        <span class="wrong-ans">✕ Ta réponse : ${q.opts[a.chosen]}</span><br>
        <span class="correct-ans">✓ Bonne réponse : ${q.opts[q.correct]}</span><br>
        <span class="expl">${q.expl}</span>
      </div>`;
    }
  });

  container.innerHTML = `
    <div class="quiz-end">
      <div class="quiz-end-score">${score} / ${questions.length}</div>
      <div class="quiz-end-pct">${pct} %</div>
      <div class="quiz-end-mention">${mention}</div>
      <div class="quiz-end-bar"><div class="quiz-progress-fill" style="width:${pct}%;background:${pct>=70?'var(--mgmt)':'var(--droit)'}"></div></div>
      ${reviewHtml ? `<div class="quiz-review"><h4>📌 Points à revoir :</h4>${reviewHtml}</div>` : '<p style="color:var(--text2);margin-top:1rem;">✨ Parfait, aucune erreur !</p>'}
      <button class="btn btn-primary" style="margin-top:1.5rem" onclick="startQuiz('${quizState.subject}')">🔄 Refaire le quiz</button>
    </div>
  `;
}

// ── Init global ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Correction toggles
  document.querySelectorAll('.correction-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const open = content.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.innerHTML = open
        ? '<span>✕</span> Masquer la correction'
        : '<span>📖</span> Voir la correction';
    });
  });

  // Quiz statiques (data-correct)
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const quiz = opt.closest('.quiz-section');
      if (quiz.dataset.answered) return;
      quiz.dataset.answered = 'true';
      const correct = opt.dataset.correct === 'true';
      const feedback = quiz.querySelector('.quiz-feedback');
      quiz.querySelectorAll('.quiz-option').forEach(o => {
        if (o.dataset.correct === 'true') o.classList.add('correct');
      });
      if (!correct) {
        opt.classList.add('wrong');
        feedback.className = 'quiz-feedback wrong';
        feedback.textContent = '❌ ' + (opt.dataset.wrongMsg || 'Mauvaise réponse. Regarde la bonne réponse en vert.');
      } else {
        feedback.className = 'quiz-feedback correct';
        feedback.textContent = '✅ ' + (opt.dataset.rightMsg || 'Bonne réponse !');
      }
    });
  });

  // Active nav link
  const path = location.pathname.split('/').pop();
  document.querySelectorAll('.navbar-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.style.background = 'var(--bg3)';
  });
});
