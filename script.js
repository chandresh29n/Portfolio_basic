/* ============================================================
   script.js — builds the page from data.js and runs ALL animation
   from ONE requestAnimationFrame loop (smooth on 60/120/144 Hz screens).
   You normally do NOT need to edit this file.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Pick data (editor.html can preview unsaved changes) ---------- */
  var D = PORTFOLIO;
  try {
    if (/[?&]preview=1/.test(location.search)) {
      var saved = localStorage.getItem("portfolio-preview");
      if (saved) D = JSON.parse(saved);
    }
  } catch (e) { /* storage blocked: use data.js */ }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Icons ---------- */
  var ICON = {
    code: '<svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
    layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5"/></svg>',
    tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.3-.7-.7-2.3 2.4-2.4z"/></svg>',
    cpu: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    cap: '<svg viewBox="0 0 24 24"><path d="M22 10L12 5 2 10l10 5 10-5zM6 12v5c3 2.5 9 2.5 12 0v-5"/></svg>',
    brief: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    ext: '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg>'
  };

  /* ---------- Fill basic text ---------- */
  document.title = D.siteTitle || D.name + " | " + D.title;
  var meta = $('meta[name="description"]');
  if (meta && D.siteDescription) meta.setAttribute("content", D.siteDescription);

  $("#brandName").textContent = D.name;
  var initial = (D.name || "C").trim().charAt(0).toUpperCase();
  $$(".cube i").forEach(function (f) { f.textContent = initial; });
  $("#availability span").textContent = D.availability || "";
  if (!D.availability) $("#availability").style.display = "none";
  $("#heroTitle").textContent = D.title;
  $("#heroLead").textContent = (D.about && D.about.summary || "").split(". ").slice(0, 1).join(". ").replace(/\.?$/, ".");
  $("#photoToon").src = D.photo.illustrated;
  $("#photoReal").src = D.photo.original;
  $("#aboutSummary").textContent = D.about.summary;
  $("#aboutSecondary").textContent = D.about.secondary || "";
  var resumeBtn = $("#resumeBtn");
  if (D.resumeFile) resumeBtn.setAttribute("href", D.resumeFile); else resumeBtn.style.display = "none";
  $("#contactLead").textContent =
    "I'm looking for a remote, part-time internship where I can learn and contribute. If you have an opportunity or a project idea, I'd love to hear from you.";
  $("#footerText").textContent = "© " + new Date().getFullYear() + " " + D.name + " · Built with HTML, CSS & JavaScript";

  /* Hero name: animated 3D letters, last word gets the gradient */
  (function () {
    var words = D.name.trim().split(/\s+/), out = "", i = 0;
    words.forEach(function (w, wi) {
      var last = wi === words.length - 1 && words.length > 1;
      out += '<span class="word' + (last ? " grad" : "") + '" style="display:inline-block;white-space:nowrap;perspective:600px">';
      w.split("").forEach(function (ch) {
        out += '<span class="ch" style="animation-delay:' + (0.9 + i * 0.055).toFixed(2) + 's">' + esc(ch) + "</span>";
        i++;
      });
      out += "</span> ";
    });
    $("#heroName").innerHTML = out;
    $("#heroName").setAttribute("aria-label", D.name);
  })();

  /* Socials */
  function socialLink(href, icon, label) {
    return href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="' + label + '">' + ICON[icon] + "</a>" : "";
  }
  $("#heroSocials").innerHTML =
    socialLink(D.social.github, "github", "GitHub") +
    socialLink(D.social.linkedin, "linkedin", "LinkedIn") +
    (D.email ? '<a href="mailto:' + esc(D.email) + '" aria-label="Email">' + ICON.mail + "</a>" : "");

  /* Stats */
  $("#stats").innerHTML = (D.stats || []).map(function (s) {
    return '<div class="stat"><strong data-count="' + Number(s.value) + '" data-suffix="' + esc(s.suffix || "") + '">0' + esc(s.suffix || "") + "</strong><span>" + esc(s.label) + "</span></div>";
  }).join("");

  /* Marquee (duplicated for a seamless loop) */
  var allSkills = [];
  D.skills.forEach(function (g) { g.items.forEach(function (i) { allSkills.push(i); }); });
  var run = allSkills.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
  $("#marquee").innerHTML = run + run + run + run;

  /* About */
  $("#interests").innerHTML = (D.about.interests || []).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
  function fact(icon, label, value) { return '<div class="fact"><div class="fact-ic">' + ICON[icon] + "</div><div><small>" + label + "</small><span>" + esc(value) + "</span></div></div>"; }
  var edu = D.education && D.education[0];
  $("#aboutCard").innerHTML =
    "<h3>Quick facts</h3>" +
    fact("pin", "Based in", D.location) +
    (edu ? fact("cap", "Studying", edu.degree.replace(/^B\.Tech,?\s*/i, "B.Tech · ")) : "") +
    (edu ? fact("brief", "University", edu.school.split(",")[0]) : "") +
    fact("code", "Focus", "Web dev · UI/UX · Python");

  /* Skills cards */
  $("#skillsGrid").innerHTML = D.skills.map(function (g, i) {
    return '<article class="skill-card reveal reveal-3d" data-tilt="6" style="--d:' + (i * 0.08).toFixed(2) + 's"><div class="skill-top"><div class="skill-ic">' +
      (ICON[g.icon] || ICON.code) + "</div><h3>" + esc(g.group) + '</h3></div><div class="chips">' +
      g.items.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div></article>";
  }).join("");

  /* Experience */
  $("#expGrid").innerHTML = (D.experience || []).map(function (x, i) {
    return '<article class="exp-card reveal reveal-3d" data-tilt="7" style="--d:' + (i * 0.12).toFixed(2) + 's"><div class="exp-top"><div class="skill-ic">' + ICON.brief + '</div><span class="tl-period">' + esc(x.period) + "</span></div><h3>" + esc(x.role) + "</h3><p class=\"exp-co\">" + esc(x.company) + "</p><p>" + esc(x.description) + '</p><div class="stack">' +
      (x.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div></article>";
  }).join("");

  /* Projects */
  $("#projectsGrid").innerHTML = D.projects.map(function (p, i) {
    var links = "";
    if (p.github) links += '<a href="' + esc(p.github) + '" target="_blank" rel="noopener">' + ICON.github.replace("<svg", '<svg style="width:1.1em;height:1.1em"') + " Code</a>";
    if (p.demo) links += '<a href="' + esc(p.demo) + '" target="_blank" rel="noopener">' + ICON.ext.replace("<svg", '<svg style="width:1.1em;height:1.1em"') + " Live demo</a>";
    return '<article class="project-card reveal reveal-3d" data-tilt="9" style="--d:' + (i * 0.1).toFixed(2) + 's"><span class="project-num">0' + (i + 1) + "</span><h3>" + esc(p.name) +
      "</h3><ul>" + p.description.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + '</ul><div class="stack">' +
      p.stack.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div>" +
      (links ? '<div class="project-links">' + links + "</div>" : "") + "</article>";
  }).join("");

  /* Journey */
  $("#timeline").innerHTML = D.education.map(function (e, i) {
    return '<div class="tl-item reveal reveal-3d" style="--d:' + (i * 0.1).toFixed(2) + 's"><span class="tl-period">' + esc(e.period) + "</span><h4>" + esc(e.degree) + "</h4><p>" + esc(e.school) + "</p></div>";
  }).join("");
  $("#activities").innerHTML = D.activities.map(function (a, i) { return '<li class="reveal" style="--d:' + (i * 0.08).toFixed(2) + 's">' + esc(a) + "</li>"; }).join("");
  $("#certs").innerHTML = D.certifications.map(function (c, i) {
    var n = parseFloat(c.score) || 100;
    return '<div class="cert reveal reveal-3d" data-tilt="7" style="--d:' + (i * 0.1).toFixed(2) + 's"><div><h4>' + esc(c.title) + "</h4><p>" + esc(c.issuer) +
      '</p></div><div class="score" data-score="' + n + '">' + esc(c.score) + "</div></div>";
  }).join("");
  $("#aboutCard").setAttribute("data-tilt", "7");
  $("#aboutCard").classList.add("reveal-3d");
  $("#contactCard").setAttribute("data-tilt", "2.5");

  /* Contact */
  var items = "";
  if (D.email) items += '<li><a href="mailto:' + esc(D.email) + '"><div class="fact-ic">' + ICON.mail + "</div>" + esc(D.email) + "</a></li>";
  if (D.showPhone && D.phone) items += '<li><a href="tel:' + esc(D.phone.replace(/\s/g, "")) + '"><div class="fact-ic">' + ICON.phone + "</div>" + esc(D.phone) + "</a></li>";
  if (D.social.github) items += '<li><a href="' + esc(D.social.github) + '" target="_blank" rel="noopener"><div class="fact-ic">' + ICON.github + "</div>GitHub</a></li>";
  if (D.social.linkedin) items += '<li><a href="' + esc(D.social.linkedin) + '" target="_blank" rel="noopener"><div class="fact-ic">' + ICON.linkedin + "</div>LinkedIn</a></li>";
  items += '<li><a href="#contact" tabindex="-1"><div class="fact-ic">' + ICON.pin + "</div>" + esc(D.location) + "</a></li>";
  $("#contactList").innerHTML = items;

  /* ---------- Contact form ---------- */
  var form = $("#contactForm"), note = $("#formNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("input, textarea", form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = "Please fill in all fields correctly."; return; }
    var data = { name: form.name.value.trim(), email: form.email.value.trim(), message: form.message.value.trim() };
    if (D.formEndpoint) {
      note.textContent = "Sending...";
      fetch(D.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; note.textContent = "Thanks! Your message has been sent."; form.reset(); })
        .catch(function () { note.textContent = "Could not send. Please email me directly."; });
    } else {
      var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
      location.href = "mailto:" + D.email + "?subject=" + encodeURIComponent("Portfolio message from " + data.name) + "&body=" + encodeURIComponent(body);
      note.textContent = "Opening your email app...";
    }
  });

  /* ============================================================
     Shared animation state — one object read by every effect
     ============================================================ */
  var S = {
    w: innerWidth, h: innerHeight, pageH: document.documentElement.scrollHeight,
    scroll: window.scrollY, vel: 0,
    mx: 0, my: 0, tmx: 0, tmy: 0,          /* pointer, -1..1 (smoothed / target) */
    t: 0
  };
  function measure() {
    S.w = innerWidth; S.h = innerHeight;
    S.pageH = Math.max(document.documentElement.scrollHeight, S.h);
    orbitR = stage.offsetWidth * 0.58;
  }

  /* ---------- 3D WebGL background ---------- */
  var glCanvas = $("#gl"), scene = null;
  var lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (D.enable3D !== false && window.Scene3D) {
    scene = Scene3D.create(glCanvas, { particles: 220 });
    if (scene && lowPower) scene.setQuality(0);
  }
  if (!scene) glCanvas.style.display = "none";

  /* ---------- Loader ---------- */
  var loader = $("#loader"), loaderDone = false;
  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    loader.classList.add("done");
    document.body.classList.add("ready");
    startReveals();
  }
  window.addEventListener("load", function () { setTimeout(hideLoader, reduceMotion ? 0 : 900); });
  setTimeout(hideLoader, 3800); /* safety net */

  /* ---------- Typed roles ---------- */
  (function () {
    var el = $("#typed"), roles = D.roles && D.roles.length ? D.roles : [D.title];
    if (reduceMotion) { el.textContent = roles[0]; return; }
    var r = 0, c = 0, del = false;
    (function tick() {
      var word = roles[r];
      el.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1500); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; return setTimeout(tick, 350); }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    })();
  })();

  /* ---------- Reveal on scroll + counters ---------- */
  function animateCount(el) {
    var end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null, dur = 1600;
    if (reduceMotion) { el.textContent = end + suf; return; }
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  function animateScore(el) {
    var end = +el.dataset.score, t0 = null;
    (function step(t) {
      if (!t0) t0 = t;
      var p = reduceMotion ? 1 : Math.min((t - t0) / 1400, 1);
      el.style.setProperty("--v", (end * (1 - Math.pow(1 - p, 3))).toFixed(1));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  function startReveals() {
    $$(".hero .reveal").forEach(function (el, i) { el.style.setProperty("--d", (0.15 + i * 0.1).toFixed(2) + "s"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("in");
        $$("[data-count]", el).forEach(animateCount);
        if (el.dataset.score) animateScore(el);
        $$("[data-score]", el).forEach(animateScore);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Nav: scroll state, active link, mobile menu ---------- */
  var nav = $("#nav"), bar = $("#progress"), links = $$("#navLinks a");
  var sections = links.map(function (a) { return $(a.getAttribute("href")); });
  var lastNavState = "";
  function updateNav() {
    var y = S.scroll, h = S.pageH - S.h;
    nav.classList.toggle("scrolled", y > 20);
    bar.style.transform = "scaleX(" + (h > 0 ? clamp(y / h, 0, 1) : 0).toFixed(4) + ")";
    var cur = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < S.h * 0.4) cur = i; });
    if (String(cur) !== lastNavState) {
      lastNavState = String(cur);
      links.forEach(function (a, i) { a.classList.toggle("active", i === cur); });
    }
  }
  var burger = $("#burger"), menu = $("#navLinks");
  function setMenu(open) { burger.setAttribute("aria-expanded", open); menu.classList.toggle("open", open); }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- 3D photo flip ---------- */
  /* The hover area is the NON-rotating wrapper (.photo-float), never the flipping
     element itself, so the cursor can't "fall off" while the photo is edge-on.
     A short delay on leaving stops flicker at the edges. */
  var flipper = $("#photoFrame"), flipHit = $(".photo-float"), flipTimer;
  function setFlip(on) { flipper.classList.toggle("show-real", on); }
  function toggleReal() { setFlip(!flipper.classList.contains("show-real")); }
  flipHit.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(flipTimer); setFlip(true);
  });
  flipHit.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(flipTimer); flipTimer = setTimeout(function () { setFlip(false); }, 160);
  });
  flipHit.addEventListener("pointerup", function (e) {          /* touch / pen: tap to flip */
    if (e.pointerType !== "mouse") toggleReal();
  });
  flipper.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleReal(); } });
  $(".photo-hint").textContent = finePointer ? "Hover the photo to flip it" : "Tap the photo to flip";

  /* ---------- Hero 3D stage: tilt, orbiting spheres, scroll depth ---------- */
  var stage = $("#photoStage"), heroCopy = $("#heroCopy"), orbitR = 250;
  var ORB = [
    { sz: 26, c: "#ffb3c8", c2: "#b0204f", sp: 0.9, ph: 0.0 },
    { sz: 16, c: "#b8bdff", c2: "#424be0", sp: -0.62, ph: 2.2 },
    { sz: 20, c: "#ffd2b3", c2: "#ff6a3d", sp: 0.5, ph: 4.2 }
  ].map(function (o) {
    var el = document.createElement("i");
    el.className = "orb";
    el.style.cssText = "--sz:" + o.sz + "px;--c:" + o.c + ";--c2:" + o.c2;
    stage.appendChild(el);
    o.el = el;
    return o;
  });
  var tiltX = 0, tiltY = 0;
  function updateHero(dt) {
    var p = clamp(S.scroll / (S.h * 0.95), 0, 1);
    if (S.scroll > S.h * 1.3) return;
    var k = 1 - Math.exp(-dt * 6);
    var idleX = Math.sin(S.t * 0.7) * 3, idleY = Math.cos(S.t * 0.5) * 5;
    var txX = reduceMotion ? 0 : -S.my * 9 + idleX, txY = reduceMotion ? 0 : S.mx * 14 + idleY;
    tiltX += (txX - tiltX) * k; tiltY += (txY - tiltY) * k;
    stage.style.transform = "rotateX(" + (tiltX + p * 16).toFixed(2) + "deg) rotateY(" + tiltY.toFixed(2) + "deg) translateY(" + (p * 40).toFixed(1) + "px) scale(" + (1 - p * 0.08).toFixed(3) + ")";
    heroCopy.style.transform = "translate3d(0," + (-p * 36).toFixed(1) + "px,0)";
    heroCopy.style.opacity = (1 - p * 0.75).toFixed(3);
    /* orbiting spheres on a tilted ellipse (front of / behind the photo) */
    for (var i = 0; i < ORB.length; i++) {
      var o = ORB[i], th = S.t * o.sp + o.ph, s = Math.sin(th);
      o.el.style.transform = "translate3d(" + (Math.cos(th) * orbitR).toFixed(1) + "px," + (s * orbitR * 0.342).toFixed(1) + "px," + (40 + s * orbitR * 0.94).toFixed(1) + "px) scale(" + (1 + s * 0.28).toFixed(3) + ")";
    }
  }

  /* ---------- 3D skill sphere (drag to spin) ---------- */
  var sphereEl = $("#sphere"), nodes = [], sphereVisible = false;
  var sRotX = 0.35, sRotY = 0, vX = 0, vY = 0.25, dragging = false, lastPX = 0, lastPY = 0, sphereR = 180;
  (function buildSphere() {
    var COLORS = ["#b0204f", "#424be0", "#d9531e", "#0f8f80", "#a43a9a"], list = [];
    /* round-robin across groups so every skill group shows up on the sphere */
    for (var k = 0; list.length < 40; k++) {
      var added = false;
      D.skills.forEach(function (g, gi) { if (g.items[k] && list.length < 40) { list.push({ t: g.items[k], c: COLORS[gi % COLORS.length] }); added = true; } });
      if (!added) break;
    }
    var n = list.length, golden = Math.PI * (3 - Math.sqrt(5));
    list.forEach(function (it, i) {
      var y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0, r = Math.sqrt(Math.max(0, 1 - y * y)), th = golden * i;
      var el = document.createElement("span");
      el.className = "sph-node"; el.textContent = it.t; el.style.setProperty("--c", it.c);
      sphereEl.appendChild(el);
      nodes.push({ el: el, x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
    });
  })();
  function sphereResize() { sphereR = sphereEl.offsetWidth * 0.38; }
  function drawSphere() {
    var cX = Math.cos(sRotX), sX = Math.sin(sRotX), cY = Math.cos(sRotY), sY = Math.sin(sRotY), fov = 2.6;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var x1 = n.x * cY + n.z * sY, z1 = -n.x * sY + n.z * cY;        /* rotate around Y */
      var y2 = n.y * cX - z1 * sX, z2 = n.y * sX + z1 * cX;            /* then around X  */
      var persp = fov / (fov - z2 * 0.9);
      n.el.style.transform = "translate(-50%,-50%) translate(" + (x1 * sphereR * persp).toFixed(1) + "px," + (y2 * sphereR * persp).toFixed(1) + "px) scale(" + (0.62 + (z2 + 1) * 0.3).toFixed(3) + ")";
      n.el.style.opacity = (0.28 + (z2 + 1) * 0.36).toFixed(3);
      n.el.style.zIndex = Math.round((z2 + 1) * 50);
    }
  }
  sphereEl.addEventListener("pointerdown", function (e) {
    dragging = true; lastPX = e.clientX; lastPY = e.clientY; sphereEl.classList.add("drag");
    try { sphereEl.setPointerCapture(e.pointerId); } catch (err) {}
  });
  sphereEl.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastPX, dy = e.clientY - lastPY; lastPX = e.clientX; lastPY = e.clientY;
    sRotY += dx * 0.008; sRotX = clamp(sRotX + dy * 0.008, -1.2, 1.2);
    vY = dx * 0.06; vX = dy * 0.06;
  });
  function endDrag() { dragging = false; sphereEl.classList.remove("drag"); }
  sphereEl.addEventListener("pointerup", endDrag);
  sphereEl.addEventListener("pointercancel", endDrag);
  new IntersectionObserver(function (en) { sphereVisible = en[0].isIntersecting; }, { rootMargin: "100px" }).observe(sphereEl);
  function updateSphere(dt) {
    if (!sphereVisible) return;
    if (!dragging) {
      var base = reduceMotion ? 0 : 0.28;
      vY += (base - vY) * (1 - Math.exp(-dt * 1.6));     /* inertia settles to a slow spin */
      vX += (0 - vX) * (1 - Math.exp(-dt * 2.2));
      sRotY += vY * dt; sRotX = clamp(sRotX + vX * dt, -1.2, 1.2);
      sRotX += (0.35 - sRotX) * (1 - Math.exp(-dt * 0.6)) * 0.4;
    }
    drawSphere();
  }

  /* ---------- 3D tilt cards (pointer devices only) ---------- */
  var tilts = [];
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (el) {
      var T = { el: el, max: parseFloat(el.getAttribute("data-tilt")) || 6, rx: 0, ry: 0, trx: 0, tr_y: 0, hover: false, on: false };
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse" || !el.classList.contains("in")) return;
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        T.tr_y = (px - 0.5) * 2 * T.max; T.trx = -(py - 0.5) * 2 * T.max;
        el.style.setProperty("--mx", (px * r.width).toFixed(0) + "px"); el.style.setProperty("--my", (py * r.height).toFixed(0) + "px");
        if (!T.on) { T.on = true; el.classList.add("is-tilting"); }
        T.hover = true;
      });
      el.addEventListener("pointerleave", function () { T.hover = false; T.trx = 0; T.tr_y = 0; });
      tilts.push(T);
    });
  }
  function updateTilts(dt) {
    var k = 1 - Math.exp(-dt * 11);
    for (var i = 0; i < tilts.length; i++) {
      var T = tilts[i];
      if (!T.on) continue;
      T.rx += (T.trx - T.rx) * k; T.ry += (T.tr_y - T.ry) * k;
      if (!T.hover && Math.abs(T.rx) < 0.03 && Math.abs(T.ry) < 0.03) {
        T.on = false; T.rx = T.ry = 0; T.el.style.transform = ""; T.el.classList.remove("is-tilting");
        continue;
      }
      T.el.style.transform = "perspective(1000px) rotateX(" + T.rx.toFixed(2) + "deg) rotateY(" + T.ry.toFixed(2) + "deg) scale3d(" + (T.hover ? 1.025 : 1) + "," + (T.hover ? 1.025 : 1) + ",1)";
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Pointer / scroll / resize inputs (cheap: they only store numbers) ---------- */
  var glow = $("#cursorGlow"), gx = 0, gy = 0, px = 0, py = 0;
  window.addEventListener("pointermove", function (e) {
    S.tmx = (e.clientX / S.w - 0.5) * 2; S.tmy = (e.clientY / S.h - 0.5) * 2;
    px = e.clientX; py = e.clientY;
    if (finePointer) glow.style.opacity = 1;
  }, { passive: true });
  document.addEventListener("pointerleave", function () { S.tmx = 0; S.tmy = 0; });

  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { measure(); sphereResize(); }, 120); });
  window.addEventListener("load", function () { measure(); sphereResize(); setTimeout(function () { measure(); }, 600); });
  if (window.ResizeObserver) {
    var roT;
    new ResizeObserver(function () { clearTimeout(roT); roT = setTimeout(measure, 150); }).observe(document.body);
  }
  measure(); sphereResize(); drawSphere();

  /* ============================================================
     THE LOOP — everything animated is driven from here
     ============================================================ */
  var last = performance.now(), marqueeBox = $("#marqueeBox"), skew = 0, lastSkew = 0;
  var perfFrames = 0, perfAcc = 0, perfStage = 0, lastScroll = -1;

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (dt <= 0) return;
    S.t += dt;

    /* inputs */
    var y = window.scrollY;
    var instVel = (y - S.scroll) / dt / 1000;                  /* ~ screens per second */
    S.vel += (instVel - S.vel) * (1 - Math.exp(-dt * 8));
    var scrolled = y !== S.scroll;
    S.scroll = y;
    var km = 1 - Math.exp(-dt * 5);
    S.mx += (S.tmx - S.mx) * km; S.my += (S.tmy - S.my) * km;

    /* effects */
    if (scrolled || lastScroll < 0) { updateNav(); lastScroll = y; }
    updateHero(dt);
    updateSphere(dt);
    updateTilts(dt);

    if (finePointer && !reduceMotion) {                       /* cursor glow */
      gx += (px - gx) * (1 - Math.exp(-dt * 9)); gy += (py - gy) * (1 - Math.exp(-dt * 9));
      glow.style.transform = "translate3d(" + (gx - 190).toFixed(1) + "px," + (gy - 190).toFixed(1) + "px,0)";
    }
    skew += (clamp(S.vel * 5, -7, 7) - skew) * (1 - Math.exp(-dt * 6));    /* marquee skews with scroll speed */
    if (Math.abs(skew - lastSkew) > 0.04) { marqueeBox.style.setProperty("--skew", skew.toFixed(2) + "deg"); lastSkew = skew; }

    if (scene && !scene.isLost()) {
      if (!reduceMotion || scrolled) scene.render(reduceMotion ? 0 : S.t, reduceMotion ? 0 : dt, S);
    }

    /* adaptive quality: if the device struggles, drop to a lighter scene automatically */
    if (scene && loaderDone && perfStage < 2) {
      perfFrames++; perfAcc += dt;
      if (perfFrames >= 90) {
        var avg = perfAcc / perfFrames;
        if (avg > 0.034 && perfStage === 0) { scene.setQuality(0); perfStage = 1; }
        else if (avg > 0.045 && perfStage === 1) { glCanvas.style.display = "none"; scene = null; perfStage = 2; }
        else { perfStage = avg > 0.034 ? perfStage : 2; }
        perfFrames = 0; perfAcc = 0;
      }
    }
  }
  requestAnimationFrame(frame);
})();
