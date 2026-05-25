// BAC STMG 2026 - Interactive Script

// ---- Correction Toggles ----
document.querySelectorAll('.correction-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    const isOpen = content.classList.contains('open');
    content.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
    btn.textContent = isOpen ? '📖 Voir la correction' : '✕ Masquer la correction';
  });
});

// ---- Quiz ----
document.querySelectorAll('.quiz-option').forEach(opt => {
  opt.addEventListener('click', () => {
    const quiz = opt.closest('.quiz-section');
    if (quiz.dataset.answered) return;
    quiz.dataset.answered = 'true';

    const correct = opt.dataset.correct === 'true';
    const feedback = quiz.querySelector('.quiz-feedback');
    const allOpts = quiz.querySelectorAll('.quiz-option');

    allOpts.forEach(o => {
      if (o.dataset.correct === 'true') o.classList.add('correct');
    });

    if (!correct) {
      opt.classList.add('wrong');
      feedback.className = 'quiz-feedback wrong';
      feedback.textContent = '❌ ' + (opt.dataset.wrongMsg || 'Mauvaise réponse. Regarde la bonne réponse surlignée en vert.');
    } else {
      feedback.className = 'quiz-feedback correct';
      feedback.textContent = '✅ ' + (opt.dataset.rightMsg || 'Bonne réponse !');
    }
  });
});

// ---- Progress tracking with localStorage ----
function initProgress() {
  const chapters = document.querySelectorAll('.chapter');
  if (!chapters.length) return;

  const pageKey = window.location.pathname.split('/').pop() || 'index';

  chapters.forEach((ch, i) => {
    const key = `${pageKey}_ch${i}`;
    const done = localStorage.getItem(key) === 'done';
    const checkbox = ch.querySelector('.ch-done');
    if (checkbox) {
      checkbox.checked = done;
      checkbox.addEventListener('change', () => {
        localStorage.setItem(key, checkbox.checked ? 'done' : '');
        updateOverallProgress();
      });
    }
  });

  updateOverallProgress();
}

function updateOverallProgress() {
  const bar = document.querySelector('.overall-progress-fill');
  if (!bar) return;
  const total = document.querySelectorAll('.ch-done').length;
  const done = document.querySelectorAll('.ch-done:checked').length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  bar.style.width = pct + '%';
  const label = document.querySelector('.overall-progress-label');
  if (label) label.textContent = `${done}/${total} chapitres vus (${pct}%)`;
}

// ---- Smooth nav highlight ----
function highlightNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') && path.includes(a.getAttribute('href')));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initProgress();
  highlightNav();
});
