/* =============================================================
   app.js  —  All quiz logic
   ============================================================= */

/* ── Constants ─────────────────────────────────────────────── */
const TIMER_SECONDS = 120;   // 3 minutes
const MAX_SCORE     = 24;    // 8 questions × 3 points each
const LOCAL_KEY     = 'wqLocalLB_v1';

/* ── Questions & Answers ────────────────────────────────────
   Each answer has a score:
     3 = Smart  (wealth-builder move)
     2 = Good   (solid but not optimal)
     1 = Okay   (safe but limiting)
     0 = Poor   (pure consumption / avoidance)
   ─────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    q:    'You just received an unexpected $1,000 bonus. What do you do?',
    tag:  'Money habits',
    answers: [
      { emoji: '🛍️', title: 'Spend it all',          hint: 'Retail therapy, here I come',        score: 0, label: 'Poor'  },
      { emoji: '🏦', title: 'Put it in savings',      hint: 'Safe in the bank, untouched',        score: 1, label: 'Okay'  },
      { emoji: '⚖️', title: 'Invest half, save half', hint: 'Balanced deployment',                score: 2, label: 'Good'  },
      { emoji: '📈', title: 'Invest it fully',        hint: 'Index fund or stocks',               score: 3, label: 'Smart' }
    ]
  },
  {
    q:    'You have a free weekend with zero plans. What actually happens?',
    tag:  'Daily habits',
    answers: [
      { emoji: '📺', title: 'Binge shows all weekend', hint: 'Full couch mode, zero guilt',       score: 0, label: 'Poor'  },
      { emoji: '🎮', title: 'Gaming or hobbies',       hint: 'Fun but not productive',            score: 1, label: 'Okay'  },
      { emoji: '🔨', title: 'Work on a side project',  hint: 'Building something real',           score: 2, label: 'Good'  },
      { emoji: '📚', title: 'Learn a valuable skill',  hint: 'Course, book, or deep practice',   score: 3, label: 'Smart' }
    ]
  },
  {
    q:    'A mentor tells you: "You\'re leaving money on the table." You...',
    tag:  'Career vision',
    answers: [
      { emoji: '🙄', title: 'Ignore it — I\'m comfortable', hint: 'My salary is enough for me',  score: 0, label: 'Poor'  },
      { emoji: '🤔', title: 'Think about it, do nothing',   hint: 'Interesting but too risky',   score: 1, label: 'Okay'  },
      { emoji: '💡', title: 'Ask them what they mean',      hint: 'Start exploring your options', score: 2, label: 'Good'  },
      { emoji: '🚀', title: 'Build a plan immediately',     hint: 'Action over hesitation',       score: 3, label: 'Smart' }
    ]
  },
  {
    q:    'A business idea you spent 3 months on completely flops. You...',
    tag:  'Resilience',
    answers: [
      { emoji: '😔', title: 'Give up on entrepreneurship', hint: 'It wasn\'t meant to be',       score: 0, label: 'Poor'  },
      { emoji: '😤', title: 'Take a long break from it',   hint: 'Need time away from it all',   score: 1, label: 'Okay'  },
      { emoji: '🔍', title: 'Analyse then restart',        hint: 'Deep post-mortem, then retry', score: 2, label: 'Good'  },
      { emoji: '🔁', title: 'Pivot immediately',           hint: 'Failure = market feedback',    score: 3, label: 'Smart' }
    ]
  },
  {
    q:    'You find out a colleague earns 30% more for the same role. You...',
    tag:  'Wealth mindset',
    answers: [
      { emoji: '😡', title: 'Complain but stay put',       hint: 'Life\'s unfair, whatever',            score: 0, label: 'Poor'  },
      { emoji: '😶', title: 'Say nothing and accept it',   hint: 'Don\'t want to rock the boat',        score: 1, label: 'Okay'  },
      { emoji: '💬', title: 'Negotiate your salary',       hint: 'Have the uncomfortable talk',          score: 2, label: 'Good'  },
      { emoji: '⚙️', title: 'Negotiate + build leverage',  hint: 'Side income makes you untouchable',   score: 3, label: 'Smart' }
    ]
  }
   {
  q:    'You’re about to make a big purchase (phone, car, etc.). What do you do?',
  tag:  'Spending decisions',
  answers: [
    { emoji: '🛍️', title: 'Buy it instantly',        hint: 'If I want it, I get it',            score: 0, label: 'Poor'  },
    { emoji: '💸', title: 'Check price quickly',     hint: 'Just making sure it’s fair',       score: 1, label: 'Okay'  },
    { emoji: '🔎', title: 'Compare options',         hint: 'Research before buying',           score: 2, label: 'Good'  },
    { emoji: '🧠', title: 'Delay & evaluate need',   hint: 'Avoid impulsive spending',         score: 3, label: 'Smart' }
  ]
},
{
  q:    'You have an extra 2 hours every day. How do you use it?',
  tag:  'Time management',
  answers: [
    { emoji: '📱', title: 'Scroll social media',         hint: 'Time disappears quickly',             score: 0, label: 'Poor'  },
    { emoji: '😌', title: 'Relax and rest',              hint: 'Recharge your energy',                score: 1, label: 'Okay'  },
    { emoji: '🏃', title: 'Exercise or self-care',       hint: 'Improve physical/mental health',      score: 2, label: 'Good'  },
    { emoji: '🧠', title: 'Learn & build income skills', hint: 'Invest in your future',              score: 3, label: 'Smart' }
  ]
},
{
  q:    'You’re offered a risky opportunity with high potential reward. You…',
  tag:  'Risk mindset',
  answers: [
    { emoji: '🚫', title: 'Avoid it completely',         hint: 'Too risky for me',                    score: 0, label: 'Poor'  },
    { emoji: '⚖️', title: 'Consider but decline',        hint: 'Not comfortable with uncertainty',   score: 1, label: 'Okay'  },
    { emoji: '🔎', title: 'Research before deciding',    hint: 'Calculated risk only',               score: 2, label: 'Good'  },
    { emoji: '🔥', title: 'Take the opportunity fast',   hint: 'High risk, high reward mindset',     score: 3, label: 'Smart' }
  ]
}

];

/* ── Tier definitions ───────────────────────────────────────── */
function getTier(pct) {
  if (pct <= 25) return {
    label: 'NPC',
    full:  'NPC mindset',
    color: '#DC2626',
    bg:    '#FEE2E2',
    tc:    '#7F1D1D',
    desc:  "You're living on autopilot. Money comes in, money goes out, and you never ask why. The system was designed for people who think exactly like you do — and it's working against you. Wake up."
  };
  if (pct <= 50) return {
    label: 'Employee',
    full:  'Employee mindset',
    color: '#D97706',
    bg:    '#FEF3C7',
    tc:    '#78350F',
    desc:  "You're aware something needs to change but you're not moving fast enough. You talk about it more than you do it. The gap between where you are and where you want to be is made of excuses. Time to close it."
  };
    if (pct <= 70) return {
    label: 'Hustler',
    full:  'Hustler mindset',
    color: '#532f05',
    bg:    '#FEF3C7',
    tc:    '#78350F',
    desc:  'You have the right instincts but aren\'t acting fast enough. You understand the game — now play it more aggressively. Execution is your missing piece.'
  };
  return {
    label: 'Rich dad himself',
    full:  'Wealth mindset',
    color: '#0EA875',
    bg:    '#D6F5EB',
    tc:    '#065C41',
    desc:  'You think in systems, not salaries. You see failure as data and risk as leverage. You\'re already ahead — stay consistent and let compounding do the rest.'
  };
}

/* ── Medal helper ───────────────────────────────────────────── */
function medal(i) {
  return ['🥇', '🥈', '🥉'][i] || '';
}

/* ── Initials helper ────────────────────────────────────────── */
function initials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Local storage leaderboard (fallback) ───────────────────── */
function localSave(name, pct, tier) {
  let lb = localLoad();
  const ts = Date.now();
  lb.push({ name, pct, tier, ts });
  lb.sort((a, b) => b.pct - a.pct);
  lb = lb.slice(0, 20);
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(lb)); } catch (e) {}
  return { lb, myId: ts };
}

function localLoad() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch (e) { return []; }
}

/* ── State ──────────────────────────────────────────────────── */
let playerName = '';
let currentQ   = 0;
let score      = 0;
let secsLeft   = TIMER_SECONDS;
let timerInterval = null;
let timedOut   = false;
let startTime  = 0;

/* ── Timer ──────────────────────────────────────────────────── */
function startTimer() {
  secsLeft = TIMER_SECONDS;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secsLeft--;
    updateTimerDisplay();
    if (secsLeft <= 0) {
      clearInterval(timerInterval);
      timedOut = true;
      showResult();
    }
  }, 1000);
  updateTimerDisplay();
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const el   = document.getElementById('t-txt');
  const pill = document.getElementById('t-pill');
  if (!el) return;
  const m = Math.floor(secsLeft / 60);
  const s = secsLeft % 60;
  el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
  if (pill) pill.className = secsLeft <= 30 ? 'timer-pill warn' : 'timer-pill';
}

/* ── Progress segments ──────────────────────────────────────── */
function renderSegments() {
  const bar = document.getElementById('segs');
  const lbl = document.getElementById('seg-lbl');
  if (!bar) return;
  bar.innerHTML = QUESTIONS.map((_, i) => {
    let cls = 'seg';
    if (i < currentQ)    cls += ' done';
    else if (i === currentQ) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');
  if (lbl) lbl.textContent = currentQ + '/' + QUESTIONS.length;
}

/* ── SCREEN: Setup ──────────────────────────────────────────── */
function showSetupScreen() {
  document.getElementById('main').innerHTML = `
    <div class="setup-screen">
      <div class="setup-icon">
        <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" stroke="#6C63FF" stroke-width="2"/>
          <path d="M9 15h12M15 9v12" stroke="#6C63FF" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="setup-title">Connect global leaderboard</div>
      <div class="setup-sub">
        So all players worldwide see the same scores.<br>
        Takes about 3 minutes using a free Supabase account.
      </div>

      <div class="setup-step">
        <div class="step-num">1</div>
        <div>
          <div class="step-label">Create a free Supabase project</div>
          <div class="step-desc">Go to <strong>supabase.com</strong> → New project → pick a name and region → Create.</div>
        </div>
      </div>

      <div class="setup-step">
        <div class="step-num">2</div>
        <div>
          <div class="step-label">Run this SQL in your project</div>
          <div class="step-desc">Project → SQL Editor → paste and run:</div>
          <div class="setup-code"><span class="kw">create table</span> leaderboard (
  id         bigserial <span class="kw">primary key</span>,
  name       text <span class="kw">not null</span>,
  pct        integer <span class="kw">not null</span>,
  tier       text,
  created_at timestamptz <span class="kw">default</span> now()
);
<span class="kw">alter table</span> leaderboard <span class="kw">enable row level security</span>;
<span class="kw">create policy</span> <span class="str">"read all"</span>   <span class="kw">on</span> leaderboard <span class="kw">for select using</span> (true);
<span class="kw">create policy</span> <span class="str">"insert all"</span> <span class="kw">on</span> leaderboard <span class="kw">for insert with check</span> (true);</div>
        </div>
      </div>

      <div class="setup-step">
        <div class="step-num">3</div>
        <div>
          <div class="step-label">Open supabase.js and paste your keys</div>
          <div class="step-desc">
            In your project go to <strong>Project Settings → API</strong> and copy:<br>
            — <strong>Project URL</strong> → paste into <code>SUPABASE_URL</code><br>
            — <strong>anon / public key</strong> → paste into <code>SUPABASE_KEY</code>
          </div>
        </div>
      </div>

      <button class="btn-primary" onclick="showNameScreen()" style="margin-top:0.5rem">
        Got it, continue →
      </button>
      <span class="skip-link" onclick="showNameScreen()">Skip — use local leaderboard only</span>
    </div>`;
}

/* ── SCREEN: Name entry ─────────────────────────────────────── */
function showNameScreen() {
  const isGlobal = isSupabaseReady();
  document.getElementById('main').innerHTML = `
    <div class="name-screen">
      <div class="ns-icon">
        <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" stroke="#6C63FF" stroke-width="2"/>
          <path d="M15 8v1.5M15 20.5V22M11.5 12.5C11.5 10.6 13.1 9 15 9s3.5 1.6 3.5 3.5c0 1.7-1.5 3-3.5 3.5S11.5 18 11.5 20c0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5"
            stroke="#6C63FF" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="ns-title">Wealth Mindset Quiz</div>
      <div class="ns-sub">
        5 real questions that reveal how you think about money, risk, and growth.
        You have <strong>3 minutes</strong>.
      </div>

      <div class="ns-features">
        <div class="ns-feat">
          <div class="feat-dot" style="background: var(--p)"></div>
          <span class="feat-txt">5 questions</span>
        </div>
        <div class="ns-feat">
          <div class="feat-dot" style="background: var(--teal)"></div>
          <span class="feat-txt">3 min timer</span>
        </div>
        <div class="ns-feat">
          <div class="feat-dot" style="background: var(--amber)"></div>
          <span class="feat-txt">Scored 0 – 3 per Q</span>
        </div>
        <div class="ns-feat">
          <div class="feat-dot" style="background: ${isGlobal ? 'var(--teal)' : 'var(--red)'}"></div>
          <span class="feat-txt">${isGlobal ? '🌐 Global leaderboard' : '📱 Local leaderboard'}</span>
        </div>
      </div>

      <div class="ns-label">Your name</div>
      <div class="ns-input-wrap">
        <span class="ns-ico">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <circle cx="8" cy="5.5" r="2.5" stroke="#9CA3AF" stroke-width="1.3"/>
            <path d="M2.5 13c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </span>
        <input
          class="ns-input"
          type="text"
          id="name-inp"
          placeholder="e.g. Alex, Jordan..."
          maxlength="20"
          oninput="onNameInput()"
          onkeydown="if(event.key==='Enter') beginQuiz()"
        />
      </div>
      <button class="btn-primary" id="start-btn" disabled onclick="beginQuiz()">
        Start the quiz →
      </button>
    </div>`;

  setTimeout(() => {
    const el = document.getElementById('name-inp');
    if (el) el.focus();
  }, 80);
}

function onNameInput() {
  const val = document.getElementById('name-inp').value.trim();
  const btn = document.getElementById('start-btn');
  if (btn) btn.disabled = val.length < 2;
}

function beginQuiz() {
  const val = document.getElementById('name-inp').value.trim();
  if (val.length < 2) return;
  playerName = val;
  currentQ   = 0;
  score      = 0;
  timedOut   = false;
  secsLeft   = TIMER_SECONDS;
  startTime  = Date.now();
  renderQuizShell();
  startTimer();
}

/* ── SCREEN: Quiz ───────────────────────────────────────────── */
function renderQuizShell() {
  document.getElementById('main').innerHTML = `
    <div class="quiz-header">
      <div class="hdr-row">
        <div class="hdr-left">
          <div class="hdr-avatar">${initials(playerName)}</div>
          <div>
            <div class="hdr-name">${playerName}</div>
            <div class="hdr-sub">Wealth mindset quiz</div>
          </div>
        </div>
        <div class="timer-pill" id="t-pill">
          <div class="t-dot"></div>
          <span class="t-txt" id="t-txt">3:00</span>
        </div>
      </div>
      <div class="steps-row">
        <div class="segs" id="segs"></div>
        <span class="seg-lbl" id="seg-lbl">0/5</span>
      </div>
    </div>
    <div id="q-body"></div>`;

  renderQuestion();
}

function renderQuestion() {
  renderSegments();
  const qd   = QUESTIONS[currentQ];
  const body = document.getElementById('q-body');
  body.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'quiz-body';
  wrap.innerHTML = `
    <div class="score-key">
      <span class="sk-item"><span class="sk-dot" style="background:#0EA875"></span>Smart (3pts)</span>
      <span class="sk-item"><span class="sk-dot" style="background:#D97706"></span>Good (2pts)</span>
      <span class="sk-item"><span class="sk-dot" style="background:#DC2626"></span>Okay (1pt)</span>
      <span class="sk-item"><span class="sk-dot" style="background:#D1D5DB"></span>Poor (0pts)</span>
    </div>
    <div class="q-tag">${qd.tag}</div>
    <div class="q-txt">${qd.q}</div>
    <div class="ans-grid" id="ans-grid"></div>`;

  body.appendChild(wrap);

  const grid = document.getElementById('ans-grid');
  qd.answers.forEach(ans => {
    const badgeClass = { 3: 'sb-3', 2: 'sb-2', 1: 'sb-1', 0: 'sb-0' }[ans.score];
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.innerHTML = `
      <div class="ans-emoji">${ans.emoji}</div>
      <div class="ans-content">
        <div class="ans-title">${ans.title}</div>
        <div class="ans-hint">${ans.hint}</div>
        <div class="score-badge ${badgeClass}">${ans.label} · ${ans.score}pts</div>
      </div>
      <div class="ans-check"><div class="chk-inner"></div></div>`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.ans-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      setTimeout(() => {
        score += ans.score;
        currentQ++;
        if (currentQ >= QUESTIONS.length) {
          stopTimer();
          showResult();
        } else {
          renderQuestion();
        }
      }, 320);
    });

    grid.appendChild(btn);
  });
}

/* ── SCREEN: Result ─────────────────────────────────────────── */
async function showResult() {
  stopTimer();

  const pct     = Math.round((score / MAX_SCORE) * 100);
  const tier    = getTier(pct);
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const em      = Math.floor(elapsed / 60);
  const es      = elapsed % 60;
  const timeStr = timedOut ? 'Timed out' : (em > 0 ? em + 'm ' : '') + es + 's';
  const useDB   = isSupabaseReady();
  const circ    = 2 * Math.PI * 47;

  /* Inject result HTML */
  document.getElementById('main').innerHTML = `
    <div class="result-wrap">
      ${timedOut
        ? `<div class="timeout-bar">⏱ Time's up! Results based on ${currentQ}/${QUESTIONS.length} questions.</div>`
        : ''}
      <div class="res-hero">
        <div class="res-top">
          <div class="res-left">
            <div class="tier-badge" style="background:${tier.bg}">
              <div class="tier-badge-dot" style="background:${tier.color}"></div>
              <span style="color:${tier.tc}">${tier.full}</span>
            </div>
            <div class="res-score">
              ${score}<span class="res-denom">/${MAX_SCORE}</span>
            </div>
            <div class="res-name-row" id="rank-row">
              Saving score, <b>${playerName}</b>...
            </div>
            <p class="res-desc">${tier.desc}</p>
          </div>

          <div class="ring-wrap">
            <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
              <circle class="ring-bg"   cx="55" cy="55" r="47"/>
              <circle class="ring-fill" cx="55" cy="55" r="47" id="ring-f"
                stroke="${tier.color}"
                stroke-dasharray="${circ.toFixed(1)}"
                stroke-dashoffset="${circ.toFixed(1)}"/>
            </svg>
            <div class="ring-ctr">
              <div class="ring-pct" id="ring-p">0%</div>
              <div class="ring-lbl">score</div>
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat"><div class="stat-lbl">Questions</div><div class="stat-val">${currentQ}/${QUESTIONS.length}</div></div>
          <div class="stat"><div class="stat-lbl">Points</div><div class="stat-val">${score}/${MAX_SCORE}</div></div>
          <div class="stat"><div class="stat-lbl">Time</div><div class="stat-val">${timeStr}</div></div>
          <div class="stat"><div class="stat-lbl">Board</div><div class="stat-val">${useDB ? '🌐 Global' : '📱 Local'}</div></div>
        </div>
      </div>

      <div class="lb-section">
        <div class="lb-title">
          <div class="lb-icon">
            <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
              <rect x="1"    y="5" width="2.5" height="6" rx="1" fill="#6C63FF"/>
              <rect x="4.75" y="2" width="2.5" height="9" rx="1" fill="#6C63FF"/>
              <rect x="8.5"  y="7" width="2.5" height="4" rx="1" fill="#6C63FF"/>
            </svg>
          </div>
          Leaderboard
          <span class="lb-mode-label">${useDB ? '· global · all players' : '· this device only'}</span>
        </div>
        <div id="lb-body">
          <div class="lb-status">
            <div class="lb-spinner"></div>
            Saving your score...
          </div>
        </div>
      </div>

      <div class="restart-wrap">
        <button class="btn-ghost" onclick="restart()">Play again with a different name</button>
      </div>
    </div>`;

  /* Animate ring */
  setTimeout(() => {
    const fill    = document.getElementById('ring-f');
    const pctEl   = document.getElementById('ring-p');
    if (fill) fill.style.strokeDashoffset = (circ - (pct / 100) * circ).toFixed(1);
    let count = 0;
    const iv = setInterval(() => {
      count = Math.min(count + 2, pct);
      if (pctEl) pctEl.textContent = count + '%';
      if (count >= pct) clearInterval(iv);
    }, 16);
  }, 120);

  /* Save score and load leaderboard */
  let lb, myId, usingDB = false;

  if (useDB) {
    const saved = await supabaseSave(playerName, pct, tier.label);
    if (saved) {
      const all = await supabaseLoad();
      if (all) {
        lb    = all;
        myId  = saved.id;
        usingDB = true;
      }
    }
    if (!lb) {
      showLeaderboardError('Could not reach Supabase. Check your URL and key in supabase.js. Showing local scores instead.');
      const res = localSave(playerName, pct, tier.label);
      lb   = res.lb;
      myId = res.myId;
    }
  } else {
    const res = localSave(playerName, pct, tier.label);
    lb   = res.lb;
    myId = res.myId;
  }

  /* Update rank row */
  const rank    = usingDB
    ? lb.findIndex(e => e.id === myId) + 1
    : lb.findIndex(e => e.ts === myId) + 1;

  const rankRow = document.getElementById('rank-row');
  if (rankRow) {
    rankRow.innerHTML = `Nice work, <b>${playerName}</b> — ranked <b>#${rank || '?'}</b> of ${lb.length}`;
  }

  renderLeaderboardTable(lb, myId, usingDB);
}

/* ── Leaderboard rendering ──────────────────────────────────── */
function showLeaderboardError(msg) {
  const body = document.getElementById('lb-body');
  if (!body) return;
  body.insertAdjacentHTML('afterbegin', `<div class="lb-error">⚠ ${msg}</div>`);
}

function renderLeaderboardTable(lb, myId, usingDB) {
  const body = document.getElementById('lb-body');
  if (!body) return;

  if (!lb || lb.length === 0) {
    const errDiv = body.querySelector('.lb-error');
    if (!errDiv) {
      body.innerHTML = `<p style="font-size:13px;color:var(--text-4);text-align:center;padding:1rem 0">No scores yet.</p>`;
    }
    return;
  }

  const rows = lb.map((entry, i) => {
    const t     = getTier(entry.pct);
    const isYou = usingDB ? entry.id === myId : entry.ts === myId;
    return `
      <tr class="${isYou ? 'lb-you' : ''}">
        <td style="width:36px;font-weight:600;color:var(--text-2)">${medal(i) || '#' + (i + 1)}</td>
        <td style="font-weight:${isYou ? 600 : 400}">
          ${entry.name}${isYou ? `<span class="you-tag">You</span>` : ''}
        </td>
        <td style="width:52px;font-weight:600;font-family:'Sora',sans-serif">${entry.pct}%</td>
        <td style="width:88px">
          <span class="tier-chip" style="background:${t.bg};color:${t.tc}">${t.label}</span>
        </td>
      </tr>`;
  }).join('');

  const table = `
    <table class="lb-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
          <th>Tier</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  const errDiv = body.querySelector('.lb-error');
  if (errDiv) {
    errDiv.insertAdjacentHTML('afterend', table);
  } else {
    body.innerHTML = table;
  }
}

/* ── Restart ────────────────────────────────────────────────── */
function restart() {
  playerName = '';
  currentQ   = 0;
  score      = 0;
  timedOut   = false;
  showNameScreen();
}

/* ── Boot ───────────────────────────────────────────────────── */
// Show setup screen if Supabase is not yet configured,
// otherwise go straight to name entry.
if (isSupabaseReady()) {
  showNameScreen();
} else {
  showSetupScreen();
}
