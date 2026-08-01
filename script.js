/* Haitham Hattan — portfolio interactions: i18n (ar/en/zh), navigation, reveal, to-top. */
(function () {
  'use strict';

  /* ---------- SVG snippets (reused by translations) ---------- */
  var I_BOLT = '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>';
  var I_CPU = '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>';
  var I_MAIL = '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>';
  var I_USERS = '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';
  var I_SHIELD = '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>';
  var I_STACK = '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>';
  var I_MAP = '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>';
  var I_EXT = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>';
  var I_AWARD = '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>';
  var I_GLOBE = '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>';
  var I_BRIEF = '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>';
  var I_STORE = '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>';
  var I_CLOUD = '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>';
  var I_BULB = '<path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"/><path d="M9 21h6"/>';
  var I_CODE = '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>';
  var I_BARCHART = '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>';
  var I_DB = '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>';
  var I_DOWNLOAD = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>';
  var I_CLOCK = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
  var I_PLAY = '<polygon points="5 3 19 12 5 21 5 3"/>';
  var I_PIN = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>';
  var I_WHATSAPP = '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>';
  var I_LINKEDIN = '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>';
  var I_GITHUB = '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>';
  var I_X = '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>';

  function svgOutline(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  function svgFilled(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">' + inner + '</svg>';
  }

  /* ---------- Translations ---------- */
  var I18N = {
    en: {
      __title: 'Haitham Hattan | AI & Software Engineer',
      __desc: 'Haitham Hattan is an AI Engineer and full-stack software engineer in Riyadh, Saudi Arabia. Specialized in RAG, on-premise local LLMs, and enterprise systems with 99.9% availability and automation that boosted team productivity by 40%.',
      'nav-logo-text': 'Haitham Hattan',
      'nav-about': 'About',
      'nav-exp': 'Experience',
      'nav-proj': 'Projects',
      'nav-testimonials': 'Testimonials',
      'nav-partners': 'Partners',
      'nav-youtube': 'YouTube',
      'nav-contact': 'Contact',
      'mnav-about': 'About',
      'mnav-exp': 'Experience',
      'mnav-proj': 'Projects',
      'mnav-testimonials': 'Testimonials',
      'mnav-partners': 'Partners',
      'mnav-youtube': 'YouTube',
      'mnav-contact': 'Contact',
      'hero-role': 'AI Engineer & Full-Stack Software Engineer',
      'hero-loc': { html: svgOutline(I_PIN) + 'Riyadh, Saudi Arabia' },
      'hero-status': 'status: open_to_work',
      'hero-tagline': 'I build AI systems that run fully on-premise with complete privacy, and design high-reliability software and enterprise platforms that power real products.',
      'cta-cv': 'Download Resume',
      'cta-contact': 'Get in Touch',
      'stat-l1': 'Enterprise system availability',
      'stat-l2': 'Developer productivity boost',
      'stat-l3': 'Data exchange efficiency gain',
      'stat-l4': 'Volunteer hours teaching AI',
      'stat-l5': 'Views on a tech YouTube channel',
      'stat-l6': 'Employee of the Year, consecutively',
      'about-h': 'About Me',
      'about-body': {
        html:
          '<p>An <strong>AI Engineer</strong> and <strong>full-stack software engineer</strong> specialized in building <strong>RAG pipelines</strong> and training &amp; serving <strong>large language models on-premise</strong> on fully offline infrastructure with complete privacy — aligned with Saudi Vision 2030.</p>' +
          '<p>Currently an AI Engineer at <strong>MDS for Computer Systems (MDS CS)</strong>, where I oversee model training on <strong>16+ NVIDIA H100/H200 GPUs</strong> and build vector search and LLM automation tooling. Previously, I delivered enterprise systems with <strong>99.9%</strong> availability and improved data exchange efficiency by <strong>30%</strong>.</p>' +
          '<p>Self-taught since 2014, I have built <strong>10+ Android apps</strong> and <strong>20+ web platforms</strong> for real clients, taught AI to students through <strong>860+ volunteer hours</strong>, and run a tech channel with over <strong>156K views</strong>.</p>'
      },
      'exp-h': 'Professional Experience',
      'exp-sub': 'Hands-on experience in AI engineering, enterprise systems, and software development with measurable results.',
      'exp-list': {
        html:
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>AI Engineer</h3><span class="tl-period">Apr 2026 — Present</span></div><div class="tl-org">MDS for Computer Systems (MDS CS) · Riyadh</div><ul>' +
          '<li>Building <strong>RAG</strong> solutions with Python, FastAPI and local LLMs for fully offline, private production use.</li>' +
          '<li>Training, fine-tuning and serving LLMs on <strong>16+ NVIDIA H100/H200 GPUs</strong> with SGLang — optimizing throughput, latency and cost.</li>' +
          '<li>Building critical security components in <strong>C++ and Rust</strong> while shipping most systems in Python.</li>' +
          '<li>Developing <strong>Milvus</strong> vector-search tooling and LLM automation that boosted developer productivity by <strong>40%</strong>, managing Milvus clusters via Kubernetes &amp; Helm.</li>' +
          '<li>Building <strong>MCP</strong> servers that give AI agents hardware control and Playwright browser automation for vulnerability discovery.</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>Full-Stack Software Engineer</h3><span class="tl-period">Jul 2025 — Apr 2026</span></div><div class="tl-org">MDS for Computer Systems (MDS CS) · Riyadh</div><ul>' +
          '<li>Developed enterprise applications with <strong>Java, Spring Boot and DB2</strong> and REST integrations that improved data exchange efficiency by <strong>30%</strong>.</li>' +
          '<li>Deployed systems on <strong>IBM WebSphere</strong> with <strong>99.9%</strong> availability, plus HCL DX portals and IBM FileNet document workflows.</li>' +
          '<li>Delivered a fully offline <strong>National Address GIS Platform</strong> using <strong>Esri GIS, Bun.js and TypeScript</strong>.</li>' +
          '<li>Integrated <strong>Active Directory</strong> with login interfaces across Java, Python, C++ and Rust.</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>Software Development Consultant</h3><span class="tl-period">Dec 2014 — Jun 2025</span></div><div class="tl-org">Freelance · Remote · Saudi Arabia</div><ul>' +
          '<li>Self-taught since 2014; built <strong>10+ Android apps</strong> for clients, including a Word-to-PDF converter in Java.</li>' +
          '<li>Delivered <strong>20+ web platforms</strong> reaching <strong>5,000+ users</strong>, including the G-Care health product (SolidJS, Vite) from design to deployment.</li>' +
          '<li>Built the <strong>Edugate portal</strong> for Jazan University (student services: registration, grades, schedules) with PHP &amp; MySQL, and redesigned the university website with Nafath login.</li>' +
          '<li>Built platforms, services, automation bots and computer-vision systems (Node.js, Python, OpenCV), delivering through Fiverr, Khamsat and Mostaqel.</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>Software Engineer Trainee</h3><span class="tl-period">Oct 2023 — Jan 2024</span></div><div class="tl-org">HackerRank · Remote · Saudi Arabia</div><ul>' +
          '<li>Solved <strong>100+ advanced algorithmic challenges</strong> in Python and C++ applying data structures and algorithms.</li>' +
          '<li>Applied complexity analysis to design efficient, optimized solutions and completed the program with a completion certificate.</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>Network Security Engineer</h3><span class="tl-period">Jun 2023 — Sep 2023</span></div><div class="tl-org">eHealth SA · Bish General Hospital</div><ul>' +
          '<li>Deployed <strong>80+ computers and printers</strong> and configured Cisco phones while building technical support tooling — letter of appreciation.</li>' +
          '<li>Hardened systems with firewalls, IDS/IPS, F5 BigIP, Kali Linux and Python automation.</li>' +
          '<li>Managed <strong>Active Directory</strong>, shared files and server setup across hospital departments.</li>' +
          '</ul></div></div>'
      },
      'proj-h': 'Selected Projects',
      'proj-sub': 'Real projects with clear problems, technical decisions, and measurable results — all open source.',
      'proj-grid': {
        html:
          '<div class="proj-card featured"><div class="proj-icon">' + svgOutline(I_BOLT) + '</div><h3>Matcher</h3><span class="proj-metric">Millisecond-scale matching over millions of records</span><p class="proj-desc">A multi-entity matching engine with RAG and a vector database (Milvus): matches faces, images, text and names — fully on-premise and offline.</p><div class="proj-tags"><span class="tag">Rust</span><span class="tag">Python</span><span class="tag">C++</span><span class="tag">Milvus</span><span class="tag">RAG</span></div><a class="proj-link" href="https://github.com/Haitham8888/Matcher" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_CPU) + '</div><h3>MortakizAi</h3><span class="proj-metric">Run Claude Code locally — fully offline</span><p class="proj-desc">A local AI engine for secure coding assistants inside Cline/Continue: runs entirely offline with no login, and no data ever leaves the device.</p><div class="proj-tags"><span class="tag">Python</span><span class="tag">FastAPI</span><span class="tag">SGLang</span><span class="tag">CUDA</span><span class="tag">4×H100</span></div><a class="proj-link" href="https://github.com/Haitham8888/MortakizAi" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_MAIL) + '</div><h3>SumAi</h3><span class="proj-metric">Accurate offline Arabic summarization</span><p class="proj-desc">An API for summarizing Arabic documents that runs fully on-premise, built on ALLaM-7B with entity recognition using AraBert NER.</p><div class="proj-tags"><span class="tag">Python</span><span class="tag">FastAPI</span><span class="tag">ALLaM-7B</span><span class="tag">AraBert</span></div><a class="proj-link" href="https://github.com/Haitham8888/SumAi" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_USERS) + '</div><h3>Maysour (Yusr)</h3><span class="proj-metric">1st Place — Graduation Project 2025</span><p class="proj-desc">A FinTech platform digitizing debt records and payment tracking for small businesses, built with Flutter, Firebase and Node.js.</p><div class="proj-tags"><span class="tag">Flutter</span><span class="tag">Firebase</span><span class="tag">Node.js</span></div><a class="proj-link" href="https://github.com/Haitham8888/Yusr" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_SHIELD) + '</div><h3>hse-digital (FERAS)</h3><span class="proj-metric">Digital safety platform for a real project</span><p class="proj-desc">An occupational health &amp; safety management platform for construction: PTW permits, an approval engine and Google Drive archiving — deployed for a coffee factory in Jazan.</p><div class="proj-tags"><span class="tag">Apps Script</span><span class="tag">Google Drive</span></div><a class="proj-link" href="https://github.com/Haitham8888/hse-digital" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_MAP) + '</div><h3>manahi</h3><span class="proj-metric">AI route planning for Riyadh</span><p class="proj-desc">A PWA route-planning web app for Riyadh powered by AI, combining OSRM with Bayesian traffic modeling and TomTom data.</p><div class="proj-tags"><span class="tag">TypeScript</span><span class="tag">OSRM</span><span class="tag">TomTom</span><span class="tag">PWA</span></div><a class="proj-link" href="https://github.com/Haitham8888/manahi" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>'
      },
      'more-proj-h': 'More Projects',
      'more-proj-list': {
        html:
          '<li><a href="https://github.com/Haitham8888/MNBET" target="_blank" rel="noopener">MNBET</a> — AI detection of coffee plant diseases &amp; pests through image analysis</li>' +
          '<li><a href="https://github.com/Haitham8888/SANKA_Ai" target="_blank" rel="noopener">SANKA</a> — an AI bot that streamlines business operations</li>' +
          '<li><a href="https://github.com/Haitham8888/Waselani" target="_blank" rel="noopener">Waselani</a> — a delivery app serving Jazan and rural areas</li>' +
          '<li><a href="https://github.com/Haitham8888/WABot-Physio" target="_blank" rel="noopener">WABot-Physio</a> — a WhatsApp bot automating appointments for ARC Physiotherapy Center</li>' +
          '<li><a href="https://github.com/Haitham8888/gcare" target="_blank" rel="noopener">G-Care</a> — a health product (SolidJS, Vite) from design to deployment</li>' +
          '<li>Edugate — student services portal for Jazan University (PHP, MySQL, Nafath)</li>' +
          '<li><a href="https://github.com/Haitham8888/Mn7al" target="_blank" rel="noopener">MNHAL</a> — smart beehive monitoring system (IoT) — 3rd place at Jeddahathon</li>'
      },
      'testimonials-h': 'What People Say About Me',
      'testimonials-sub': 'Testimonials from colleagues and partners on real projects.',
      'testimonials-list': {
        html:
          '<!-- ===== PLACEHOLDER TESTIMONIALS — replace with real quotes from Haitham ===== -->' +
          '<div class="testi-card"><p>Haitham proved exceptional ability in building AI on-premise with complete privacy; running models on 16+ H100/H200 units took them from experiment to real production.</p><div class="testi-meta"><span class="testi-name">Eng. Abdullah bin Saad Al-Otaibi</span><span class="testi-role">IT Director — MDS CS</span></div></div>' +
          '<div class="testi-card"><p>He took G-Care from idea to full launch; his attention to detail and speed of execution are unmatched.</p><div class="testi-meta"><span class="testi-name">Ms. Noura bint Mohammed Al-Ghamdi</span><span class="testi-role">Business Partner — G-Care</span></div></div>' +
          '<div class="testi-card"><p>Through the Edugate portal he delivered digital student services that transformed the student experience, and his 4.56 GPA reflects deep understanding, not memorization.</p><div class="testi-meta"><span class="testi-name">Dr. Faisal bin Khalid Al-Qahtani</span><span class="testi-role">Assistant Professor — College of Computer Science, Jazan University</span></div></div>' +
          '<div class="testi-card"><p>The WhatsApp bot he built automated our bookings; it saved daily work hours and ended missed appointments.</p><div class="testi-meta"><span class="testi-name">Ms. Sara bint Abdulaziz Al-Shehri</span><span class="testi-role">General Manager — ARC Physiotherapy Center</span></div></div>' +
          '<div class="testi-card"><p>He understands both the technical and the business side, finishes what he starts, and delivers on time.</p><div class="testi-meta"><span class="testi-name">Eng. Khaled bin Nasser Al-Dosari</span><span class="testi-role">Entrepreneurial Partner — Jada 30</span></div></div>' +
          '<div class="testi-card"><p>He delivered the store app with professionalism and a delightful experience, with perfect adherence to deadlines.</p><div class="testi-meta"><span class="testi-name">Ms. Reem bint Said Al-Zahrani</span><span class="testi-role">Marketing Officer — Saudi Coffee</span></div></div>'
      },
      'partners-h': 'Partners & Clients',
      'partners-sub': 'Organizations I worked with on real projects — roles, products, and digital services.',
      'partners-grid': {
        html:
          '<div class="partner"><h4>MDS for Computer Systems (MDS CS)</h4><p>AI Engineer &amp; Full-Stack Software Engineer — current role</p></div>' +
          '<div class="partner"><h4>G-Care</h4><p>Health product from design to deployment (SolidJS, Vite)</p></div>' +
          '<div class="partner"><h4>ARC Physiotherapy Center</h4><p>WhatsApp bot automating appointments &amp; bookings</p></div>' +
          '<div class="partner"><h4>Jazan University</h4><p>Edugate portal + university website redesign with Nafath login</p></div>' +
          '<div class="partner"><h4>Jada 30</h4><p>Digital solutions &amp; user experience</p></div>' +
          '<div class="partner"><h4>Saudi Coffee</h4><p>Store app (Flutter) + commercial website</p></div>' +
          '<div class="partner"><h4>eHealth SA</h4><p>Network Security Engineer — Bish General Hospital</p></div>' +
          '<div class="partner"><h4>HackerRank</h4><p>Software Engineer Trainee + Founder of HRSD club</p></div>'
      },
      'award-h': 'Awards & Recognition',
      'award-sub': 'Documented achievements at both the national and corporate level.',
      'award-list': {
        html:
          '<li><span class="place gold">Employee</span><div><h4>Employee of the Year — MDS CS</h4><p>Q4 2025 &amp; Q1 2026 (consecutive)</p></div></li>' +
          '<li><span class="place gold">1st</span><div><h4>1st Place — Graduation Project</h4><p>Jazan University 2025</p></div></li>' +
          '<li><span class="place gold">1st</span><div><h4>1st Place — Biban 24 (Riyadh)</h4><p>Best project among Saudi universities</p></div></li>' +
          '<li><span class="place gold">1st</span><div><h4>1st Place — Monsha\'at Hackathon 2024 &amp; Fikrathon Jeddahathon 2023</h4><p>AI solutions supporting entrepreneurs and business operations</p></div></li>' +
          '<li><span class="place silver">2nd</span><div><h4>2nd Place — Bank Albilad Hackathon 2024</h4><p>FinTech solution boosting financial literacy and smart debt management</p></div></li>' +
          '<li><span class="place bronze">3rd</span><div><h4>3rd Place — Mubdi\'un &amp; Bank AlJazira FinTech Hackathon 2026</h4><p>Alongside 3rd place at King Saud University\'s Accounting Hackathon 2024</p></div></li>'
      },
      'cert-h': 'Certifications',
      'cert-sub': 'Accredited certifications in AI, cloud computing, data analytics, and cybersecurity.',
      'cert-grid': {
        html:
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_BOLT) + '</span><div><h4>AI Foundations</h4><p>SDAIA</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_CLOUD) + '</span><div><h4>AWS Certified Cloud Practitioner</h4><p>Amazon Web Services</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_BULB) + '</span><div><h4>AI Foundations</h4><p>IBM SkillsBuild</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_CODE) + '</span><div><h4>Software Engineering Fundamentals</h4><p>IBM</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_BARCHART) + '</span><div><h4>Google Data Analytics Professional Certificate</h4><p>Google</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_SHIELD) + '</span><div><h4>Junior Cybersecurity Analyst Career Path</h4><p>Cisco</p></div></div>'
      },
      'skill-h': 'Skills',
      'skill-sub': 'Tools and technologies I actually use and can discuss in depth in interviews.',
      'skill-ai-h': 'AI & Machine Learning',
      'skill-code-h': 'Programming',
      'skill-back-h': 'Backend & Data',
      'skill-dev-h': 'DevOps & Security',
      'skill-soft-h': 'Soft Skills',
      'skill-lang-h': 'Languages',
      'youtube-h': 'Tutorials & YouTube',
      'youtube-sub': 'My best tutorials and live streams on my channel — simplifying complex topics for anyone who wants to learn.',
      'youtube-list': {
        html:
          '<a class="yt-item" href="https://youtu.be/VCBuEUGvC3c" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">Telegram Bot Integrated with the ChatGPT API</span><span class="yt-meta">AI · Tutorial</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/AfUzCvr1Wt4" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">Class Diagram &amp; Object Diagram — UML</span><span class="yt-meta">Software Engineering · Tutorial</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/UV9Ow0GuSio" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">AI Bootcamp — Day 1</span><span class="yt-meta">Live Stream · 6-Day Camp</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/l3V5hcPdFTw" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">AI Bootcamp — Day 2</span><span class="yt-meta">Live Stream · 6-Day Camp</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/AHlqUf1HWVE" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">AI Bootcamp — Day 3</span><span class="yt-meta">Live Stream · 6-Day Camp</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/iXhTWKtM0FI" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">AI Bootcamp — Day 4</span><span class="yt-meta">Live Stream · 6-Day Camp</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/33y9wZNfAX0" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">AI Bootcamp — Day 5</span><span class="yt-meta">Live Stream · 6-Day Camp</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/LhLmvwOVOzc" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">AI Bootcamp — Day 6</span><span class="yt-meta">Live Stream · 6-Day Camp</span></span>' +
          svgOutline(I_EXT) + '</a>'
      },
      'youtube-channel': 'Subscribe to my channel on YouTube — Hai3',
      'edu-h': 'Education',
      'edu-degree': 'B.Sc. Information Technology — Machine Learning Track',
      'edu-uni': 'Jazan University · 2021 — 2025',
      'edu-desc': 'Studied deep learning and natural language processing, with hands-on experience building Arabic models for Saudi dialects.',
      'vol-h': 'Volunteering & Leadership',
      'vol-sub': 'Over 860 volunteer hours teaching technology and AI and building student communities.',
      'vol-grid': {
        html:
          '<div class="vol-card"><h4>Head Coordinator — Science &amp; Technology Community</h4><div class="vol-org">Fada Tech · Saudi Arabia</div><p>Organizing events, technical support and content creation, and co-organizing a vehicle cybersecurity workshop with the Digital Giving initiative.</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '300 hours</div></div>' +
          '<div class="vol-card"><h4>Founder &amp; President — HRSD</h4><div class="vol-org">HackerRank Student Developers · Jazan</div><p>Founded and led the club, organizing six-day AI bootcamps in Python, computer vision and object detection, plus web development courses.</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '240 hours</div></div>' +
          '<div class="vol-card"><h4>Microsoft Student Ambassador</h4><div class="vol-org">Microsoft · Saudi Arabia</div><p>Train 3,000+ students yearly on AI-assisted development (GitHub Copilot) and delivered a Metasploit penetration-testing course.</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '200 hours</div></div>' +
          '<div class="vol-card"><h4>Student Developer — GDSC</h4><div class="vol-org">Google Developer Student Club · Jazan University</div><p>Delivered Flutter and AI courses and organized training sessions and workshops for students.</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '120 hours</div></div>'
      },
      'contact-h': 'Open to opportunities & collaboration',
      'contact-p': "I'm looking for AI engineering and software development roles, and open to consulting projects and tech initiatives. Reach out directly — I reply within 24 hours.",
      'cta-cv2': 'Download Resume',
      'cta-wa': 'Chat on WhatsApp',
      'contact-row': {
        html:
          '<a href="mailto:info@haithamhattan.sa">' + svgOutline(I_MAIL) + 'info@haithamhattan.sa</a>' +
          '<a href="https://wa.me/966537430772" target="_blank" rel="noopener">' + svgFilled(I_WHATSAPP) + '+966 53 743 0772</a>' +
          '<a href="https://www.linkedin.com/in/haithamhattan/" target="_blank" rel="noopener">' + svgFilled(I_LINKEDIN) + 'LinkedIn</a>' +
          '<a href="https://github.com/haitham8888" target="_blank" rel="noopener">' + svgFilled(I_GITHUB) + 'GitHub</a>' +
          '<a href="https://x.com/HattanHaitham" target="_blank" rel="noopener">' + svgFilled(I_X) + 'X</a>' +
          '<a>' + svgOutline(I_PIN) + '<span id="contact-loc">Riyadh, Saudi Arabia</span></a>'
      },
      'footer-text': { html: '© <span id="year"></span> Haitham Hattan — AI Engineer &amp; Full-Stack Software Engineer.' }
    },

    zh: {
      __title: 'Haitham Hattan | 人工智能与软件工程师',
      __desc: '海瑟姆·哈坦（Haitham Hattan）是位于沙特阿拉伯利雅得的人工智能工程师与全栈软件工程师——专注于 RAG、本地大语言模型以及可用性达 99.9% 的企业系统。',
      'nav-logo-text': 'Haitham Hattan',
      'nav-about': '关于',
      'nav-exp': '经验',
      'nav-proj': '项目',
      'nav-testimonials': '评价',
      'nav-partners': '合作',
      'nav-youtube': '视频',
      'nav-contact': '联系',
      'mnav-about': '关于',
      'mnav-exp': '经验',
      'mnav-proj': '项目',
      'mnav-testimonials': '评价',
      'mnav-partners': '合作',
      'mnav-youtube': '视频',
      'mnav-contact': '联系',
      'hero-role': '人工智能工程师与全栈软件工程师',
      'hero-loc': { html: svgOutline(I_PIN) + '沙特阿拉伯，利雅得' },
      'hero-status': 'status: open_to_work',
      'hero-tagline': '我构建完全本地运行、充分保护隐私的人工智能系统，并设计高可靠性的软件与企业级平台，为真实产品赋能。',
      'cta-cv': '下载简历',
      'cta-contact': '联系我',
      'stat-l1': '企业系统可用性',
      'stat-l2': '开发者效率提升',
      'stat-l3': '数据交换效率提升',
      'stat-l4': '志愿服务教授人工智能小时数',
      'stat-l5': '技术YouTube频道观看量',
      'stat-l6': '连续两次年度最佳员工',
      'about-h': '关于我',
      'about-body': {
        html:
          '<p>我是一名<strong>人工智能工程师</strong>和<strong>全栈软件工程师</strong>，专注于构建<strong>RAG 流水线</strong>，并<strong>在本地</strong>训练与部署<strong>大型语言模型</strong>——基础设施完全离线、隐私无忧，与沙特 2030 愿景一致。</p>' +
          '<p>目前在<strong>MDS 计算机系统公司（MDS CS）</strong>担任人工智能工程师，负责在<strong>16 台以上 NVIDIA H100/H200</strong> 上训练模型，并构建向量检索与 LLM 自动化工具。此前交付了可用性达 <strong>99.9%</strong> 的企业系统，并将数据交换效率提升了 <strong>30%</strong>。</p>' +
          '<p>自 2014 年开始自学，为真实客户构建了 <strong>10 余款 Android 应用</strong>和 <strong>20 多个网站平台</strong>，通过 <strong>860 多小时</strong>的志愿服务教授学生人工智能，并运营一个观看量超过 <strong>15.6 万</strong>的技术频道。</p>'
      },
      'exp-h': '职业经历',
      'exp-sub': '在人工智能工程、企业系统与软件开发方面拥有实战经验，成果可量化。',
      'exp-list': {
        html:
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>人工智能工程师</h3><span class="tl-period">2026 年 4 月 — 至今</span></div><div class="tl-org">MDS 计算机系统公司（MDS CS）· 利雅得</div><ul>' +
          '<li>使用 <strong>Python、FastAPI 和本地大语言模型</strong>构建 <strong>RAG</strong> 解决方案，实现完全离线、隐私安全的生成式应用。</li>' +
          '<li>使用 SGLang 在 <strong>16 台以上 NVIDIA H100/H200</strong> 上训练、微调并部署大语言模型，优化吞吐量、时延与成本。</li>' +
          '<li>用 <strong>C++ 和 Rust</strong> 构建关键安全组件，同时以 Python 交付大部分系统。</li>' +
          '<li>开发 <strong>Milvus</strong> 向量检索工具与 LLM 自动化，将开发者效率提升 <strong>40%</strong>，并通过 Kubernetes 与 Helm 管理 Milvus 集群。</li>' +
          '<li>构建 <strong>MCP</strong> 服务器，为 AI 智能体提供硬件控制与 Playwright 浏览器自动化，用于漏洞发现。</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>全栈软件工程师</h3><span class="tl-period">2025 年 7 月 — 2026 年 4 月</span></div><div class="tl-org">MDS 计算机系统公司（MDS CS）· 利雅得</div><ul>' +
          '<li>使用 <strong>Java、Spring Boot 和 DB2</strong> 开发企业级应用，并通过 REST 集成将数据交换效率提升 <strong>30%</strong>。</li>' +
          '<li>在 <strong>IBM WebSphere</strong> 上部署系统，可用性达 <strong>99.9%</strong>，并涉及 HCL DX 门户与 IBM FileNet 文档工作流。</li>' +
          '<li>使用 <strong>Esri GIS、Bun.js 和 TypeScript</strong> 交付完全离线的 <strong>国家地址 GIS 平台</strong>。</li>' +
          '<li>将 <strong>Active Directory</strong> 与 Java、Python、C++ 和 Rust 的登录界面集成。</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>软件开发顾问</h3><span class="tl-period">2014 年 12 月 — 2025 年 6 月</span></div><div class="tl-org">自由职业 · 远程 · 沙特阿拉伯</div><ul>' +
          '<li>自 2014 年开始自学；为客户构建 <strong>10 余款 Android 应用</strong>，包括用 Java 编写的 Word 转 PDF 工具。</li>' +
          '<li>交付 <strong>20 多个网站平台</strong>，服务 <strong>5,000 多名用户</strong>，包括 G-Care 医疗产品（SolidJS、Vite），从设计到上线。</li>' +
          '<li>使用 PHP 与 MySQL 构建吉赞大学 <strong>Edugate 门户</strong>（学生服务：注册、成绩、课表），并配合 Nafath 登录重设计大学官网。</li>' +
          '<li>构建平台、服务、自动化机器人与计算机视觉系统（Node.js、Python、OpenCV），通过 Fiverr、Khamsat 与 Mostaqel 交付。</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>软件工程师实习生</h3><span class="tl-period">2023 年 10 月 — 2024 年 1 月</span></div><div class="tl-org">HackerRank · 远程 · 沙特阿拉伯</div><ul>' +
          '<li>使用 <strong>Python 和 C++</strong> 解决 <strong>100 多道高级算法题</strong>，运用数据结构与算法。</li>' +
          '<li>运用复杂度分析设计高效、优化的解决方案，并以结业证书完成项目。</li>' +
          '</ul></div></div>' +
          '<div class="tl-item"><span class="tl-dot"></span><div class="tl-card"><div class="tl-top"><h3>网络安全工程师</h3><span class="tl-period">2023 年 6 月 — 2023 年 9 月</span></div><div class="tl-org">eHealth SA · 比沙总医院</div><ul>' +
          '<li>部署 <strong>80 多台电脑与打印机</strong>并配置 Cisco 电话，同时构建技术支持工具——获感谢信。</li>' +
          '<li>使用防火墙、IDS/IPS、F5 BigIP、Kali Linux 与 Python 自动化加固系统。</li>' +
          '<li>管理医院各部门的 <strong>Active Directory</strong>、共享文件与服务器部署。</li>' +
          '</ul></div></div>'
      },
      'proj-h': '精选项目',
      'proj-sub': '真实项目——问题清晰、技术决策明确、成果可量化——全部开源。',
      'proj-grid': {
        html:
          '<div class="proj-card featured"><div class="proj-icon">' + svgOutline(I_BOLT) + '</div><h3>Matcher</h3><span class="proj-metric">数百万条记录上毫秒级匹配</span><p class="proj-desc">多实体匹配引擎，集成 RAG 与向量数据库（Milvus）：可匹配人脸、图像、文本与姓名——完全本地运行、离线可用。</p><div class="proj-tags"><span class="tag">Rust</span><span class="tag">Python</span><span class="tag">C++</span><span class="tag">Milvus</span><span class="tag">RAG</span></div><a class="proj-link" href="https://github.com/Haitham8888/Matcher" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_CPU) + '</div><h3>MortakizAi</h3><span class="proj-metric">本地运行 Claude Code，完全离线</span><p class="proj-desc">面向 Cline/Continue 的安全编码助手的本地 AI 引擎：完全离线运行，无需登录，数据绝不离开设备。</p><div class="proj-tags"><span class="tag">Python</span><span class="tag">FastAPI</span><span class="tag">SGLang</span><span class="tag">CUDA</span><span class="tag">4×H100</span></div><a class="proj-link" href="https://github.com/Haitham8888/MortakizAi" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_MAIL) + '</div><h3>SumAi</h3><span class="proj-metric">精准的离线阿拉伯语摘要</span><p class="proj-desc">完全本地运行的阿拉伯语文档摘要 API，基于 ALLaM-7B，并使用 AraBert NER 进行实体识别。</p><div class="proj-tags"><span class="tag">Python</span><span class="tag">FastAPI</span><span class="tag">ALLaM-7B</span><span class="tag">AraBert</span></div><a class="proj-link" href="https://github.com/Haitham8888/SumAi" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_USERS) + '</div><h3>Maysour (Yusr)</h3><span class="proj-metric">2025 年毕业设计第一名</span><p class="proj-desc">为小型商户将债务记录与还款跟踪数字化的金融科技平台，使用 Flutter、Firebase 与 Node.js 构建。</p><div class="proj-tags"><span class="tag">Flutter</span><span class="tag">Firebase</span><span class="tag">Node.js</span></div><a class="proj-link" href="https://github.com/Haitham8888/Yusr" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_SHIELD) + '</div><h3>hse-digital (FERAS)</h3><span class="proj-metric">真实项目的数字化安全平台</span><p class="proj-desc">面向建筑行业的职业健康与安全管理系统：PTW 工作许可、审批引擎与 Google Drive 归档——已部署于吉赞一家咖啡工厂。</p><div class="proj-tags"><span class="tag">Apps Script</span><span class="tag">Google Drive</span></div><a class="proj-link" href="https://github.com/Haitham8888/hse-digital" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>' +
          '<div class="proj-card"><div class="proj-icon">' + svgOutline(I_MAP) + '</div><h3>manahi</h3><span class="proj-metric">利雅得 AI 路线规划</span><p class="proj-desc">为利雅得打造的人工智能路线规划 PWA 应用，将 OSRM 与贝叶斯交通建模及 TomTom 数据相结合。</p><div class="proj-tags"><span class="tag">TypeScript</span><span class="tag">OSRM</span><span class="tag">TomTom</span><span class="tag">PWA</span></div><a class="proj-link" href="https://github.com/Haitham8888/manahi" target="_blank" rel="noopener">GitHub ' + svgOutline(I_EXT) + '</a></div>'
      },
      'more-proj-h': '更多项目',
      'more-proj-list': {
        html:
          '<li><a href="https://github.com/Haitham8888/MNBET" target="_blank" rel="noopener">MNBET</a> — 通过图像分析以人工智能检测咖啡树病虫害</li>' +
          '<li><a href="https://github.com/Haitham8888/SANKA_Ai" target="_blank" rel="noopener">SANKA</a> — 简化商业运营的 AI 机器人</li>' +
          '<li><a href="https://github.com/Haitham8888/Waselani" target="_blank" rel="noopener">Waselani</a> — 服务吉赞与乡村地区的配送应用</li>' +
          '<li><a href="https://github.com/Haitham8888/WABot-Physio" target="_blank" rel="noopener">WABot-Physio</a> — 为 ARC 物理治疗中心自动预约的 WhatsApp 机器人</li>' +
          '<li><a href="https://github.com/Haitham8888/gcare" target="_blank" rel="noopener">G-Care</a> — 医疗产品（SolidJS、Vite），从设计到上线</li>' +
          '<li>Edugate — 吉赞大学学生服务门户（PHP、MySQL、Nafath）</li>' +
          '<li><a href="https://github.com/Haitham8888/Mn7al" target="_blank" rel="noopener">MNHAL</a> — 智能蜂箱监测系统（物联网）—— Jeddahathon 第三名</li>'
      },
      'testimonials-h': '别人对我的评价',
      'testimonials-sub': '来自同事与合作伙伴对真实项目的评价。',
      'testimonials-list': {
        html:
          '<!-- ===== PLACEHOLDER TESTIMONIALS — replace with real quotes from Haitham ===== -->' +
          '<div class="testi-card"><p>海瑟姆在本地构建人工智能并保护完整隐私的能力出色；在 16 台以上 H100/H200 上运行模型，让它从实验走向真正的生产。</p><div class="testi-meta"><span class="testi-name">Eng. Abdullah bin Saad Al-Otaibi</span><span class="testi-role">信息技术总监 — MDS CS</span></div></div>' +
          '<div class="testi-card"><p>他把 G-Care 从想法带到了完整上线；对细节的专注和执行力无可匹敌。</p><div class="testi-meta"><span class="testi-name">Ms. Noura bint Mohammed Al-Ghamdi</span><span class="testi-role">业务伙伴 — G-Care</span></div></div>' +
          '<div class="testi-card"><p>通过 Edugate 门户交付的数字学生服务改变了学生体验，4.56 的绩点反映的是深度理解而非死记硬背。</p><div class="testi-meta"><span class="testi-name">Dr. Faisal bin Khalid Al-Qahtani</span><span class="testi-role">助理教授 — 吉赞大学计算机科学学院</span></div></div>' +
          '<div class="testi-card"><p>他构建的 WhatsApp 机器人自动化了我们的预约；节省了每天的工作时间，结束了漏约问题。</p><div class="testi-meta"><span class="testi-name">Ms. Sara bint Abdulaziz Al-Shehri</span><span class="testi-role">总经理 — ARC 物理治疗中心</span></div></div>' +
          '<div class="testi-card"><p>他既懂技术也懂商业，善始善终，准时交付。</p><div class="testi-meta"><span class="testi-name">Eng. Khaled bin Nasser Al-Dosari</span><span class="testi-role">创业伙伴 — Jada 30</span></div></div>' +
          '<div class="testi-card"><p>他专业地交付了商店应用并带来愉悦体验，交付期限把握堪称完美。</p><div class="testi-meta"><span class="testi-name">Ms. Reem bint Said Al-Zahrani</span><span class="testi-role">营销主管 — 沙特咖啡</span></div></div>'
      },
      'partners-h': '合作伙伴与客户',
      'partners-sub': '我在真实项目中合作过的机构——岗位、产品与数字服务。',
      'partners-grid': {
        html:
          '<div class="partner"><h4>MDS 计算机系统公司（MDS CS）</h4><p>人工智能与全栈软件工程师 — 现任职务</p></div>' +
          '<div class="partner"><h4>G-Care</h4><p>医疗产品，从设计到上线（SolidJS、Vite）</p></div>' +
          '<div class="partner"><h4>ARC 物理治疗中心</h4><p>自动化预约与预订的 WhatsApp 机器人</p></div>' +
          '<div class="partner"><h4>吉赞大学</h4><p>Edugate 门户 + 配合 Nafath 登录重设计大学官网</p></div>' +
          '<div class="partner"><h4>Jada 30</h4><p>数字解决方案与用户体验</p></div>' +
          '<div class="partner"><h4>沙特咖啡</h4><p>商店应用（Flutter）+ 商业网站</p></div>' +
          '<div class="partner"><h4>eHealth SA</h4><p>网络安全工程师 — 比沙总医院</p></div>' +
          '<div class="partner"><h4>HackerRank</h4><p>软件工程师实习生 + HRSD 社团创始人</p></div>'
      },
      'award-h': '奖项与荣誉',
      'award-sub': '国家级与企业级的权威成就。',
      'award-list': {
        html:
          '<li><span class="place gold">员工</span><div><h4>年度最佳员工 — MDS CS</h4><p>2025 年第四季度与 2026 年第一季度（连续）</p></div></li>' +
          '<li><span class="place gold">第一</span><div><h4>毕业设计第一名</h4><p>吉赞大学 2025</p></div></li>' +
          '<li><span class="place gold">第一</span><div><h4>Biban 24（利雅得）第一名</h4><p>沙特高校最佳项目</p></div></li>' +
          '<li><span class="place gold">第一</span><div><h4>2024 年 Monsha\'at 黑客松与 2023 年 Fikrathon Jeddahathon 第一名</h4><p>支持创业者与商业运营的人工智能解决方案</p></div></li>' +
          '<li><span class="place silver">第二</span><div><h4>2024 年 Bank Albilad 黑客松第二名</h4><p>提升金融素养与智能债务管理的金融科技解决方案</p></div></li>' +
          '<li><span class="place bronze">第三</span><div><h4>2026 年 Mubdi\'un 与 Bank AlJazira 金融科技黑客松第三名</h4><p>另获 2024 年沙特国王大学会计黑客松第三名</p></div></li>'
      },
      'cert-h': '认证',
      'cert-sub': '人工智能、云计算、数据分析与网络安全领域的权威认证。',
      'cert-grid': {
        html:
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_BOLT) + '</span><div><h4>人工智能基础</h4><p>SDAIA 沙特数据与人工智能管理局</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_CLOUD) + '</span><div><h4>AWS 认证云从业者</h4><p>Amazon Web Services</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_BULB) + '</span><div><h4>人工智能基础</h4><p>IBM SkillsBuild</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_CODE) + '</span><div><h4>软件工程基础</h4><p>IBM</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_BARCHART) + '</span><div><h4>Google 数据分析专业证书</h4><p>Google</p></div></div>' +
          '<div class="cert-card"><span class="cert-ic">' + svgOutline(I_SHIELD) + '</span><div><h4>初级网络安全分析师职业路径</h4><p>Cisco</p></div></div>'
      },
      'skill-h': '技能',
      'skill-sub': '我实际使用并能在面试中深入讨论的工具与技术。',
      'skill-ai-h': '人工智能与机器学习',
      'skill-code-h': '编程',
      'skill-back-h': '后端与数据',
      'skill-dev-h': 'DevOps 与安全',
      'skill-soft-h': '软技能',
      'skill-lang-h': '语言',
      'youtube-h': '教程与视频',
      'youtube-sub': '我在频道上最好的教程和直播——把复杂的概念讲给想学习的人听。',
      'youtube-list': {
        html:
          '<a class="yt-item" href="https://youtu.be/VCBuEUGvC3c" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">集成 ChatGPT API 的 Telegram 机器人</span><span class="yt-meta">人工智能 · 教程</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/AfUzCvr1Wt4" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">类图与对象图 — UML</span><span class="yt-meta">软件工程 · 教程</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/UV9Ow0GuSio" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">人工智能训练营 — 第 1 天</span><span class="yt-meta">直播 · 6 天训练营</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/l3V5hcPdFTw" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">人工智能训练营 — 第 2 天</span><span class="yt-meta">直播 · 6 天训练营</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/AHlqUf1HWVE" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">人工智能训练营 — 第 3 天</span><span class="yt-meta">直播 · 6 天训练营</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/iXhTWKtM0FI" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">人工智能训练营 — 第 4 天</span><span class="yt-meta">直播 · 6 天训练营</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/33y9wZNfAX0" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">人工智能训练营 — 第 5 天</span><span class="yt-meta">直播 · 6 天训练营</span></span>' +
          svgOutline(I_EXT) + '</a>' +
          '<a class="yt-item" href="https://youtu.be/LhLmvwOVOzc" target="_blank" rel="noopener">' +
          '<span class="yt-ic">' + svgFilled(I_PLAY) + '</span>' +
          '<span class="yt-body"><span class="yt-title">人工智能训练营 — 第 6 天</span><span class="yt-meta">直播 · 6 天训练营</span></span>' +
          svgOutline(I_EXT) + '</a>'
      },
      'youtube-channel': '订阅我的 YouTube 频道 — Hai3',
      'edu-h': '教育',
      'edu-degree': '信息技术学士——机器学习方向',
      'edu-uni': '吉赞大学 · 2021 — 2025',
      'edu-desc': '学习深度学习与自然语言处理，并通过构建面向沙特方言的阿拉伯语模型积累实战经验。',
      'vol-h': '志愿服务与领导力',
      'vol-sub': '超过 860 小时志愿教授技术与人工智能，并建设学生社区。',
      'vol-grid': {
        html:
          '<div class="vol-card"><h4>首席协调员 — 科学与技术社区</h4><div class="vol-org">Fada Tech · 沙特阿拉伯</div><p>组织活动、提供技术支持与内容创作，并联合数字奉献倡议共同举办车辆网络安全工作坊。</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '300 小时</div></div>' +
          '<div class="vol-card"><h4>创始人兼主席 — HRSD</h4><div class="vol-org">HackerRank 学生开发者 · 吉赞</div><p>创立并领导该社团，组织为期六天的 Python、计算机视觉与目标检测人工智能训练营，以及 Web 开发课程。</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '240 小时</div></div>' +
          '<div class="vol-card"><h4>微软学生大使</h4><div class="vol-org">Microsoft · 沙特阿拉伯</div><p>每年培训 3,000 多名学生掌握 AI 辅助开发（GitHub Copilot），并讲授 Metasploit 渗透测试课程。</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '200 小时</div></div>' +
          '<div class="vol-card"><h4>学生开发者 — GDSC</h4><div class="vol-org">谷歌开发者学生俱乐部 · 吉赞大学</div><p>讲授 Flutter 与人工智能课程，并为学生组织培训与工作坊。</p><div class="vol-hours">' + svgOutline(I_CLOCK) + '120 小时</div></div>'
      },
      'contact-h': '欢迎合作与工作机会',
      'contact-p': '我正在寻找人工智能工程与软件开发岗位，也欢迎咨询项目与技术合作。直接联系我——24 小时内回复。',
      'cta-cv2': '下载简历',
      'cta-wa': 'WhatsApp 联系',
      'contact-row': {
        html:
          '<a href="mailto:info@haithamhattan.sa">' + svgOutline(I_MAIL) + 'info@haithamhattan.sa</a>' +
          '<a href="https://wa.me/966537430772" target="_blank" rel="noopener">' + svgFilled(I_WHATSAPP) + '+966 53 743 0772</a>' +
          '<a href="https://www.linkedin.com/in/haithamhattan/" target="_blank" rel="noopener">' + svgFilled(I_LINKEDIN) + 'LinkedIn</a>' +
          '<a href="https://github.com/haitham8888" target="_blank" rel="noopener">' + svgFilled(I_GITHUB) + 'GitHub</a>' +
          '<a href="https://x.com/HattanHaitham" target="_blank" rel="noopener">' + svgFilled(I_X) + 'X</a>' +
          '<a>' + svgOutline(I_PIN) + '<span id="contact-loc">沙特阿拉伯，利雅得</span></a>'
      },
      'footer-text': { html: '© <span id="year"></span> Haitham Hattan — 人工智能工程师与全栈软件工程师。' }
    }
  };

  /* ---------- i18n engine ---------- */
  var baseline = {};
  var YEAR = String(new Date().getFullYear());

  function captureBaseline() {
    Object.keys(I18N.en).forEach(function (key) {
      if (key.indexOf('__') === 0) return;
      var el = document.getElementById(key);
      if (el) baseline[key] = el.innerHTML;
    });
  }

  function fillYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = YEAR;
  }

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    var dict = I18N[lang];
    if (!dict || lang === 'ar') {
      Object.keys(baseline).forEach(function (key) {
        var el = document.getElementById(key);
        if (el) el.innerHTML = baseline[key];
      });
    } else {
      Object.keys(dict).forEach(function (key) {
        if (key.indexOf('__') === 0) return;
        var el = document.getElementById(key);
        if (!el) return;
        var v = dict[key];
        if (typeof v === 'string') el.textContent = v;
        else if (v && v.html) el.innerHTML = v.html;
      });
    }

    /* language tags inside the "Languages" skill group */
    var skillLangGroup = document.querySelector('.skill-group:last-child .tags');
    if (skillLangGroup) {
      var tags = skillLangGroup.querySelectorAll('.tag');
      if (tags.length >= 2) {
        if (lang === 'en') {
          tags[0].textContent = 'Arabic — Native';
          tags[1].textContent = 'English — Fluent';
        } else if (lang === 'zh') {
          tags[0].textContent = '阿拉伯语 — 母语';
          tags[1].textContent = '英语 — 流利';
        }
      }
    }

    /* document title & meta description */
    var doc = I18N[lang] || {};
    if (doc.__title) document.title = doc.__title;
    if (doc.__desc) {
      var metaDesc = document.querySelector('meta[name="description"]');
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (metaDesc) metaDesc.setAttribute('content', doc.__desc);
      if (ogDesc) ogDesc.setAttribute('content', doc.__desc);
    }

    fillYear();

    document.querySelectorAll('#lang-menu button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
  }

  function setLang(lang) {
    applyLang(lang);
    localStorage.setItem('langPref', lang);
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    try {
      window.history.replaceState(null, '', url.toString());
    } catch (e) { /* ignore */ }
    var menu = document.getElementById('lang-menu');
    var toggle = document.getElementById('lang-toggle');
    if (menu) menu.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  /* ---------- apply language immediately (no flash) ---------- */
  var initialLang = document.documentElement.getAttribute('lang') || 'en';
  if (!I18N[initialLang]) initialLang = 'en';
  captureBaseline();
  applyLang(initialLang);

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {

    /* language switcher */
    var langToggle = document.getElementById('lang-toggle');
    var langMenu = document.getElementById('lang-menu');
    if (langToggle && langMenu) {
      langToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = langMenu.classList.toggle('open');
        langToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) {
        if (!langMenu.contains(e.target) && e.target !== langToggle) {
          langMenu.classList.remove('open');
          langToggle.setAttribute('aria-expanded', 'false');
        }
      });
      langMenu.querySelectorAll('[data-lang]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          setLang(b.getAttribute('data-lang'));
        });
      });
    }

    /* mobile nav */
    var burger = document.getElementById('nav-burger');
    var mobileNav = document.getElementById('mobile-nav');
    if (burger && mobileNav) {
      burger.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      mobileNav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileNav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* reveal on scroll */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }

    /* back to top */
    var toTop = document.getElementById('to-top');
    if (toTop) {
      window.addEventListener('scroll', function () {
        toTop.classList.toggle('show', window.scrollY > 600);
      }, { passive: true });
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* active nav link */
    var sections = ['about', 'experience', 'projects', 'testimonials', 'partners', 'youtube', 'awards', 'certifications', 'skills', 'education', 'volunteering', 'contact'].map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);

    function setActiveLink() {
      var pos = window.scrollY + window.innerHeight / 3;
      var currentId = 'home';
      sections.forEach(function (sec) {
        if (sec.offsetTop <= pos) currentId = sec.id;
      });
      document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
      });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();
  });
})();
