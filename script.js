/* ============================================
   THEME TOGGLE
============================================ */
(function themeInit(){
  const root = document.documentElement;
  const stored = null; // no localStorage available in this environment fallback
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  let theme = stored || (prefersLight ? 'light' : 'dark');
  applyTheme(theme);

  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  });

  function applyTheme(t){
    if(t === 'light'){
      root.setAttribute('data-theme', 'light');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      toggle.setAttribute('aria-pressed', 'false');
    }
    // Redraw chart with theme-correct grid colors
    if(window.__redrawChart) window.__redrawChart();
  }
})();

/* ============================================
   NAV: scroll shadow + mobile menu
============================================ */
(function navInit(){
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('mobile-open');
    if(isOpen){
      links.style.display = 'flex';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.flexDirection = 'column';
      links.style.gap = '0';
      links.style.background = 'var(--bg-elevated)';
      links.style.borderTop = '1px solid var(--border)';
      links.style.borderBottom = '1px solid var(--border)';
      Array.from(links.children).forEach(a => { a.style.padding = '1rem 1.5rem'; a.style.borderBottom = '1px solid var(--border)'; });
    } else {
      links.style.display = '';
    }
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('mobile-open');
    links.style.display = '';
  }));

  document.getElementById('resumeBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Resume download would trigger here — attach your PDF link to enable it.');
  });
})();

/* ============================================
   REVEAL ON SCROLL
============================================ */
(function revealInit(){
  document.querySelectorAll('.section, .stat-card, .skill-card, .project-card, .timeline-item').forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ============================================
   HERO STAT COUNTERS
============================================ */
(function countersInit(){
  const nums = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));

  function animateCount(el){
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1400;
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();

/* ============================================
   DASHBOARD CHART
============================================ */
(function dashboardInit(){
  const datasets = {
    revenue: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data: [42, 46, 44, 51, 58, 55, 63, 69, 66, 74, 80, 88],
      color: '#3b82f6',
      trend: '↑ +18.4%', conf: '94.2%', time: '0.09s', rows: 12
    },
    growth: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data: [8, 11, 10, 14, 17, 16, 20, 24, 23, 27, 31, 36],
      color: '#14b8a6',
      trend: '↑ +26.1%', conf: '91.7%', time: '0.11s', rows: 12
    },
    churn: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data: [6.4, 6.1, 6.5, 5.8, 5.5, 5.6, 5.1, 4.7, 4.9, 4.3, 3.9, 3.6],
      color: '#f87171',
      trend: '↓ -43.8%', conf: '96.0%', time: '0.07s', rows: 12
    }
  };

  const ctx = document.getElementById('mainChart');
  let chart;
  let currentMetric = 'revenue';

  function gridColor(){
    return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(148,163,184,0.14)';
  }
  function textColor(){
    return getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim() || '#9aa5b8';
  }

  function buildChart(metric){
    const d = datasets[metric];
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [{
          label: metric,
          data: d.data,
          borderColor: d.color,
          backgroundColor: hexToRgba(d.color, 0.14),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: d.color,
          borderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#f9fafb',
            bodyColor: '#9aa5b8',
            borderColor: d.color,
            borderWidth: 1,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          x: { grid: { color: gridColor(), drawTicks: false }, ticks: { color: textColor(), font: { family: 'JetBrains Mono', size: 10 } } },
          y: { grid: { color: gridColor() }, ticks: { color: textColor(), font: { family: 'JetBrains Mono', size: 10 } } }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });

    document.getElementById('metaRows').textContent = d.rows;
    document.getElementById('metaTrend').textContent = d.trend;
    document.getElementById('metaConf').textContent = d.conf;
    document.getElementById('metaTime').textContent = d.time;
  }

  function hexToRgba(hex, alpha){
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  document.getElementById('metricPills').addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if(!btn) return;
    document.querySelectorAll('.pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-selected','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
    currentMetric = btn.dataset.metric;
  });

  document.getElementById('runQuery').addEventListener('click', () => {
    buildChart(currentMetric);
  });

  buildChart(currentMetric);
  window.__redrawChart = () => buildChart(currentMetric);
})();

/* ============================================
   PROJECT DATA + RENDER + FILTER + MODAL
============================================ */
(function projectsInit(){
  const projects = [
    {
      id: 'p1',
      title: 'Churn Prediction Engine',
      cat: 'predictive',
      catLabel: 'Predictive Analytics',
      problem: 'Subscription business losing 6.4% of customers monthly with no early warning signal.',
      metric: 'Reduced customer churn by 14%',
      stack: ['Python', 'scikit-learn', 'SQL', 'Snowflake'],
      deepProblem: 'The product team had no way to flag at-risk accounts before cancellation, so retention outreach was always reactive.',
      methodology: 'Built a gradient-boosted classifier on 18 months of behavioral and billing data, validated with stratified k-fold cross-validation.',
      pipeline: 'Snowflake → dbt transformations → Python feature store → model scoring job → Power BI risk dashboard, refreshed nightly.',
      insights: ['Usage drop-off in week 2 was the strongest churn predictor', 'Support ticket sentiment added 6% to model lift', 'Proactive outreach to top-decile risk accounts cut churn 14%'],
      github: '#', live: '#'
    },
    {
      id: 'p2',
      title: 'Executive Revenue Dashboard',
      cat: 'dashboards',
      catLabel: 'Interactive Dashboards',
      problem: 'Leadership waited three days for a manually assembled revenue deck every Monday.',
      metric: 'Cut reporting time from 3 days to 20 minutes',
      stack: ['Power BI', 'DAX', 'Azure SQL'],
      deepProblem: 'Finance manually pulled figures from four disconnected systems into a static PowerPoint, so numbers were already stale by the time leadership saw them.',
      methodology: 'Modeled a star schema in Azure SQL, wrote DAX measures for YoY and cohort views, and shipped a self-serve Power BI workspace with row-level security.',
      pipeline: 'ERP + CRM + billing exports → nightly ADF pipeline → Azure SQL warehouse → Power BI semantic model.',
      insights: ['Automated refresh eliminated the Monday fire drill entirely', 'Self-serve filters cut ad-hoc requests to the data team by 60%', 'Exec team now checks the dashboard daily instead of weekly'],
      github: '#', live: '#'
    },
    {
      id: 'p3',
      title: 'Marketing Attribution ETL',
      cat: 'etl',
      catLabel: 'ETL & SQL',
      problem: 'Ad spend data lived in five different platforms with no unified source of truth.',
      metric: 'Unified 5 data sources into 1 pipeline',
      stack: ['Python', 'Airflow', 'AWS S3', 'PostgreSQL'],
      deepProblem: 'Marketing could not tell which channel actually drove signups because spend, clicks, and conversions never lived in the same table.',
      methodology: 'Wrote incremental Python extractors for each ad platform, landed raw data in S3, and modeled a conformed attribution schema in PostgreSQL.',
      pipeline: 'Ad platform APIs → S3 raw zone → Airflow DAG (dedupe, conform) → PostgreSQL mart → Tableau attribution view.',
      insights: ['Last-touch attribution had been overcrediting paid search by 22%', 'Consolidated data cut monthly reporting effort by 30 hours', 'Enabled a proper multi-touch attribution model for the first time'],
      github: '#', live: '#'
    },
    {
      id: 'p4',
      title: 'Demand Forecasting Model',
      cat: 'predictive',
      catLabel: 'Predictive Analytics',
      problem: 'Inventory planning relied on gut-feel, causing frequent stockouts and overstock.',
      metric: 'Forecast accuracy improved to 99.8%',
      stack: ['Python', 'Pandas', 'Prophet', 'BigQuery'],
      deepProblem: 'Warehouse teams over- or under-ordered stock every quarter because planning had no statistical forecast to anchor to.',
      methodology: 'Combined SKU-level time series decomposition with a Prophet model tuned per product category, backtested against two years of held-out data.',
      pipeline: 'POS + warehouse data → BigQuery → Python forecasting job (weekly) → results written back to BigQuery → Looker Studio view.',
      insights: ['Seasonal SKUs benefited most from holiday regressors', 'Stockouts dropped noticeably in the two quarters after rollout', 'Forecast now anchors the quarterly purchasing meeting'],
      github: '#', live: '#'
    },
    {
      id: 'p5',
      title: 'Cohort Retention Explorer',
      cat: 'dashboards',
      catLabel: 'Interactive Dashboards',
      problem: 'Product team could not see how onboarding changes affected long-term retention.',
      metric: 'Surfaced a 3x retention gap between onboarding paths',
      stack: ['Tableau', 'SQL', 'BigQuery'],
      deepProblem: 'Every retention question required a bespoke SQL query, so the product team rarely looked at cohort data at all.',
      methodology: 'Built a parameterized cohort model in SQL and exposed it through an interactive Tableau explorer with adjustable cohort windows.',
      pipeline: 'Event stream → BigQuery → scheduled cohort aggregation query → Tableau live connection.',
      insights: ['Users onboarded via the guided flow retained 3x longer at day 90', 'Self-serve exploration replaced ~15 recurring ad-hoc requests a month', 'Finding directly informed the new default onboarding flow'],
      github: '#', live: '#'
    },
    {
      id: 'p6',
      title: 'Nightly Finance Reconciliation',
      cat: 'etl',
      catLabel: 'ETL & SQL',
      problem: 'Manual month-end reconciliation across ledgers took a full week and was error-prone.',
      metric: 'Reconciliation time cut from 5 days to 4 hours',
      stack: ['SQL', 'Python', 'AWS S3', 'Git'],
      deepProblem: 'Finance closed the books by hand-matching transactions across three ledgers in spreadsheets, with errors surfacing weeks later.',
      methodology: 'Version-controlled SQL matching logic in Git, automated with a scheduled Python job, and built exception reports for anything that failed to reconcile.',
      pipeline: 'Ledger exports → S3 → SQL matching engine (nightly) → exception report → Slack alert for finance review.',
      insights: ['95% of transactions now auto-reconcile with zero human touch', 'Close time dropped from 5 days to under half a day', 'Exceptions are caught the next morning instead of at month-end'],
      github: '#', live: '#'
    }
  ];

  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = projects.map(p => `
    <article class="project-card reveal" data-cat="${p.cat}" data-id="${p.id}">
      <div class="project-top"></div>
      <div class="project-body">
        <span class="project-cat">${p.catLabel}</span>
        <h3>${p.title}</h3>
        <p class="project-problem">${p.problem}</p>
        <p class="project-metric">${p.metric}</p>
        <div class="project-badges">
          ${p.stack.map(s => `<span class="badge">${s}</span>`).join('')}
        </div>
        <span class="project-cta">View Case Study <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </article>
  `).join('');

  // re-observe newly injected cards for reveal
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('in'); obs.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Filtering
  document.getElementById('filterRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    grid.querySelectorAll('.project-card').forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hide', !match);
    });
  });

  // Modal
  const overlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if(!card) return;
    const p = projects.find(x => x.id === card.dataset.id);
    if(!p) return;
    modalContent.innerHTML = `
      <span class="modal-cat">${p.catLabel}</span>
      <h3 id="modalTitle">${p.title}</h3>
      <div class="modal-section">
        <h4>Problem</h4>
        <p>${p.deepProblem}</p>
      </div>
      <div class="modal-section">
        <h4>Methodology</h4>
        <p>${p.methodology}</p>
      </div>
      <div class="modal-section">
        <h4>Data Pipeline</h4>
        <p>${p.pipeline}</p>
      </div>
      <div class="modal-section">
        <h4>Key Insights</h4>
        <ul>${p.insights.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
      <div class="modal-section">
        <h4>Tech Stack</h4>
        <div class="modal-badges">${p.stack.map(s => `<span class="badge">${s}</span>`).join('')}</div>
      </div>
      <div class="modal-links">
        <a href="${p.github}" class="btn btn-outline btn-sm"><i class="fa-brands fa-github"></i> GitHub Repo</a>
        <a href="${p.live}" class="btn btn-primary btn-sm"><i class="fa-solid fa-chart-line"></i> Live Dashboard</a>
      </div>
    `;
    openModal();
  });

  function openModal(){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });
})();

/* ============================================
   TIMELINE
============================================ */
(function timelineInit(){
  const roles = [
    {
      period: '2023 — Present',
      title: 'Senior Data Analyst',
      org: 'Northbridge Retail Co.',
      points: [
        'Own the analytics roadmap for a $40M e-commerce division',
        'Built the churn model and executive dashboard suite used company-wide',
        'Mentor two junior analysts on SQL and dashboard standards'
      ]
    },
    {
      period: '2021 — 2023',
      title: 'Data Analyst',
      org: 'Fintech Solutions Inc.',
      points: [
        'Automated month-end reconciliation, cutting close time by 90%',
        'Partnered with product on cohort analysis for onboarding redesign',
        'Migrated legacy reporting from Excel to a governed Power BI workspace'
      ]
    },
    {
      period: '2019 — 2021',
      title: 'Junior Business Analyst',
      org: 'DataCraft Consulting',
      points: [
        'Delivered ad-hoc SQL analysis for 12+ client engagements',
        'Built first version of the client-facing KPI dashboard template',
        'Learned the fundamentals of ETL pipelines and A/B testing design'
      ]
    }
  ];

  const wrap = document.getElementById('timeline');
  wrap.innerHTML = roles.map(r => `
    <div class="timeline-item reveal">
      <span class="timeline-dot"></span>
      <span class="timeline-period">${r.period}</span>
      <h3>${r.title}</h3>
      <span class="timeline-org">${r.org}</span>
      <ul>${r.points.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>
  `).join('');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('in'); obs.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  wrap.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ============================================
   ROI CALCULATOR
============================================ */
(function roiInit(){
  const revenue = document.getElementById('roiRevenue');
  const hours = document.getElementById('roiHours');
  const rate = document.getElementById('roiRate');
  const automation = document.getElementById('roiAutomation');

  const revenueVal = document.getElementById('roiRevenueVal');
  const hoursVal = document.getElementById('roiHoursVal');
  const rateVal = document.getElementById('roiRateVal');
  const automationVal = document.getElementById('roiAutomationVal');

  const hoursSavedEl = document.getElementById('roiHoursSaved');
  const costSavedEl = document.getElementById('roiCostSaved');
  const annualEl = document.getElementById('roiAnnual');

  function fmtMoney(n){
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function recalc(){
    const rev = parseFloat(revenue.value);
    const hrs = parseFloat(hours.value);
    const r = parseFloat(rate.value);
    const auto = parseFloat(automation.value) / 100;

    revenueVal.textContent = fmtMoney(rev);
    hoursVal.textContent = hrs + ' hrs';
    rateVal.textContent = '$' + r + ' / hr';
    automationVal.textContent = automation.value + '%';

    const hoursSaved = hrs * auto;
    const costSaved = hoursSaved * r;
    const annual = costSaved * 12;

    hoursSavedEl.textContent = Math.round(hoursSaved);
    costSavedEl.textContent = fmtMoney(costSaved);
    annualEl.textContent = fmtMoney(annual);
  }

  [revenue, hours, rate, automation].forEach(input => input.addEventListener('input', recalc));
  recalc();
})();

/* ============================================
   CONTACT FORM VALIDATION
============================================ */
(function formInit(){
  const form = document.getElementById('contactForm');
  const name = document.getElementById('cName');
  const email = document.getElementById('cEmail');
  const msg = document.getElementById('cMsg');
  const errName = document.getElementById('errName');
  const errEmail = document.getElementById('errEmail');
  const errMsg = document.getElementById('errMsg');
  const success = document.getElementById('formSuccess');

  function setError(field, errEl, message){
    field.closest('.form-field').classList.toggle('invalid', !!message);
    errEl.textContent = message || '';
  }

  function validEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.textContent = '';
    let valid = true;

    if(name.value.trim().length < 2){
      setError(name, errName, 'Please enter your name.');
      valid = false;
    } else setError(name, errName, '');

    if(!validEmail(email.value.trim())){
      setError(email, errEmail, 'Please enter a valid email.');
      valid = false;
    } else setError(email, errEmail, '');

    if(msg.value.trim().length < 10){
      setError(msg, errMsg, 'Message should be at least 10 characters.');
      valid = false;
    } else setError(msg, errMsg, '');

    if(!valid) return;

    const submitLabel = document.getElementById('submitLabel');
    submitLabel.textContent = 'Sending…';
    setTimeout(() => {
      submitLabel.textContent = 'Send Message';
      success.textContent = `Thanks, ${name.value.trim().split(' ')[0]} — message received. I'll reply soon.`;
      form.reset();
    }, 900);
  });
})();
