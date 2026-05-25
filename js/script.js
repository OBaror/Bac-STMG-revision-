/* BAC STMG 2026 — Script global */

// ── Bottom nav HTML injecté sur toutes les pages ─────────────
const BOTTOM_NAV = `
<nav class="bottom-nav" id="bottomNav">
  <div class="bottom-nav-items">
    <a href="index.html"           class="bottom-nav-item" data-page="index.html">
      <span class="bni-icon">🏠</span>Accueil
    </a>
    <a href="economie.html"        class="bottom-nav-item" data-page="economie.html">
      <span class="bni-icon">📊</span>Éco
    </a>
    <a href="droit.html"           class="bottom-nav-item" data-page="droit.html">
      <span class="bni-icon">⚖️</span>Droit
    </a>
    <a href="management.html"      class="bottom-nav-item" data-page="management.html">
      <span class="bni-icon">🏢</span>Mgmt
    </a>
    <a href="mercatique.html"      class="bottom-nav-item" data-page="mercatique.html">
      <span class="bni-icon">📣</span>Merca
    </a>
    <a href="gestion-finance.html" class="bottom-nav-item" data-page="gestion-finance.html">
      <span class="bni-icon">💰</span>G&F
    </a>
    <a href="annales.html"         class="bottom-nav-item" data-page="annales.html">
      <span class="bni-icon">📂</span>Annales
    </a>
    <a href="outils.html"          class="bottom-nav-item" data-page="outils.html">
      <span class="bni-icon">🧮</span>Outils
    </a>
  </div>
</nav>`;

// ── Hamburger toggle ─────────────────────────────────────────
function initHamburger() {
  const btn   = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = links.classList.toggle('open');
    btn.textContent = open ? '✕' : '☰';
    btn.setAttribute('aria-expanded', open);
  });

  // Fermer en cliquant ailleurs
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.textContent = '☰';
    }
  });

  // Fermer après navigation
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
  });
}

// ── Active nav link ──────────────────────────────────────────
function initActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .bottom-nav-item').forEach(a => {
    const href = a.getAttribute('href') || a.dataset.page || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ── Correction toggles ───────────────────────────────────────
function initCorrectionToggles() {
  document.querySelectorAll('.correction-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      if (!content) return;
      const open = content.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.innerHTML = open
        ? '<span>✕</span> Masquer la correction'
        : '<span>📖</span> Voir la correction';
    });
  });
}

// ── Quiz statiques (data-correct) ───────────────────────────
function initStaticQuiz() {
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const quiz = opt.closest('.quiz-section');
      if (!quiz || quiz.dataset.answered) return;
      quiz.dataset.answered = 'true';
      const correct = opt.dataset.correct === 'true';
      const feedback = quiz.querySelector('.quiz-feedback');
      quiz.querySelectorAll('.quiz-option').forEach(o => {
        if (o.dataset.correct === 'true') o.classList.add('correct');
      });
      if (!correct) {
        opt.classList.add('wrong');
        if (feedback) {
          feedback.className = 'quiz-feedback wrong';
          feedback.textContent = '❌ ' + (opt.dataset.wrongMsg || 'Mauvaise réponse — regarde la bonne réponse en vert.');
        }
      } else {
        if (feedback) {
          feedback.className = 'quiz-feedback correct';
          feedback.textContent = '✅ ' + (opt.dataset.rightMsg || 'Bonne réponse !');
        }
      }
    });
  });
}

// ── Progress tracking (localStorage) ────────────────────────
function initProgress() {
  const pageKey = location.pathname.split('/').pop() || 'index';
  document.querySelectorAll('.ch-done').forEach((cb, i) => {
    const key = `${pageKey}_ch${i}`;
    cb.checked = localStorage.getItem(key) === '1';
    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked ? '1' : '');
      updateProgress(pageKey);
    });
  });
  updateProgress(pageKey);
}

function updateProgress(pageKey) {
  const all  = document.querySelectorAll('.ch-done');
  const done = document.querySelectorAll('.ch-done:checked');
  const bar  = document.querySelector('.overall-progress-fill');
  const lbl  = document.querySelector('.overall-progress-label');
  if (!all.length) return;
  const pct = Math.round((done.length / all.length) * 100);
  if (bar) bar.style.width = pct + '%';
  if (lbl) lbl.textContent = `${done.length} / ${all.length} chapitres vus (${pct} %)`;
}

// ── Init global ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Injecter bottom nav si pas déjà présent
  if (!document.getElementById('bottomNav')) {
    document.body.insertAdjacentHTML('beforeend', BOTTOM_NAV);
  }

  initHamburger();
  initActiveNav();
  initCorrectionToggles();
  initStaticQuiz();
  initProgress();
});
