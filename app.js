/* =========================================================
   CONFIG — change these to match your backend
========================================================= */
const CONFIG = {
  RAZORPAY_KEY_ID: "rzp_test_XXXXXXXXXXXX", // <-- put your Razorpay Key ID (public) here
  CREATE_ORDER_URL: "backend/create_order.php",
  VERIFY_PAYMENT_URL: "backend/verify_payment.php",
  AMOUNT_INR: 3100,
  OFFER_HOURS: 3,
  OFFER_MINUTES: 43,
  OFFER_SECONDS: 48
};

document.addEventListener("DOMContentLoaded", () => {
  initStarfield();
  initRevealOnScroll();
  initDrawer();
  initTorchBorders();
  initSliders();
  initFaq();
  initCountdown();
  initStatsCounter();
  initStickyBar();
  initForms();
  initShowMore();
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* =========================================================
   GLOBAL TORCH BORDER — soft light that follows the cursor
   around the edge of whichever section it's hovering over
========================================================= */
function initTorchBorders(){
  document.querySelectorAll(".section").forEach(sec => {
    const glow = document.createElement("div");
    glow.className = "torch-border-glow";
    glow.setAttribute("aria-hidden", "true");
    sec.prepend(glow);

    sec.addEventListener("mousemove", (e) => {
      const r = sec.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%";
      const my = ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%";
      sec.style.setProperty("--mx", mx);
      sec.style.setProperty("--my", my);
    });
  });
}

/* =========================================================
   STARFIELD CANVAS (twinkling stars, gentle drift)
========================================================= */
function initStarfield(){
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [], w, h, docH;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;        // sirf screen jitna canvas — visual same rahega
    docH = document.documentElement.scrollHeight;   // density calculation ke liye pehle jaisa
    const count = Math.floor((w * Math.min(docH, 4000)) / 9000);
    stars = Array.from({ length: Math.min(count, 420) }, () => ({
      x: Math.random() * w,
      y: Math.random() * docH,     // pehle jaisa hi poori document height me spread
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.15 + 0.02,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.008
    }));
  }

  let t = 0;
  function draw(){
    t += 1;
    ctx.clearRect(0, 0, w, h);
    const scrollY = window.scrollY || window.pageYOffset;
    for (const s of stars) {
      const screenY = s.y - scrollY;               // sirf visible window me hi draw karo
      if (screenY < -10 || screenY > h + 10) continue;
      const alpha = 0.35 + 0.5 * Math.abs(Math.sin(t * s.twinkleSpeed + s.phase));
      ctx.beginPath();
      ctx.fillStyle = `rgba(240,225,180,${alpha.toFixed(2)})`;
      ctx.arc(s.x, screenY, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y -= s.speed;
      if (s.y < 0) s.y = docH;
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 250); });
}



function initLazyVideos(){
  document.querySelectorAll('iframe.vt-video, #video-message iframe').forEach(frame => {
    const realSrc = frame.src;
    frame.removeAttribute('src');   // load rok do abhi ke liye

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          frame.src = realSrc;      // ab autoplay khud load hote hi chalega, jaisa pehle chalta tha
          io.unobserve(frame);
        }
      });
    }, { rootMargin: '400px' });   // thoda pehle se load start ho jaye, abrupt na lage

    io.observe(frame);
  });
}


function pauseOffscreenAnimations(){
  const targets = document.querySelectorAll('.rashi-bg, .section-orbit-decor, .glow-frame');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const state = e.isIntersecting ? 'running' : 'paused';
      e.target.style.animationPlayState = state;
      e.target.querySelectorAll('*').forEach(c => c.style.animationPlayState = state);
    });
  }, { rootMargin: '200px' });
  targets.forEach(t => io.observe(t));
}
/* =========================================================
   SCROLL REVEAL
========================================================= */
function initRevealOnScroll(){
  const items = document.querySelectorAll(".reveal-up");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  requestAnimationFrame(() => {
    items.forEach(el => {
      el.classList.add("reveal-armed");
      io.observe(el);
    });
    setTimeout(() => {
      items.forEach(el => el.classList.add("is-visible"));
    }, 4000);
  });
}

/* =========================================================
   RIGHT-SIDE DRAWER
========================================================= */
function initDrawer(){
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");
  const openBtns = document.querySelectorAll("[data-open-drawer]");
  const closeBtns = document.querySelectorAll("[data-close-drawer]");

  function open(prefill){
    drawer.classList.add("show");
    overlay.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (prefill) applyPrefill(prefill);
  }
  function close(){
    drawer.classList.remove("show");
    overlay.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBtns.forEach(btn => btn.addEventListener("click", () => open()));
  closeBtns.forEach(btn => btn.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  window.__openDrawer = open;
  window.__closeDrawer = close;
}

function applyPrefill(data){
  const form = document.getElementById("drawerForm");
  if (!form) return;
  Object.entries(data).forEach(([key, value]) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) field.value = value;
  });
}

/* =========================================================
   SLIDERS (celeb strip + preview pages)
========================================================= */
function initSliders(){
  document.querySelectorAll("[data-slider]").forEach(root => {
    const track = root.querySelector("[data-slider-track]");
    if (!track) return;
    const viewport = root.querySelector(".slider-viewport") || track.parentElement;
    const slides = Array.from(track.children);
    const prevBtn = root.querySelector("[data-slider-prev]");
    const nextBtn = root.querySelector("[data-slider-next]");
    const dotsWrap = root.querySelector("[data-slider-dots]");
    let index = 0;
    let visible = 1;
    let timer = null;

    function gapPx(){
      const g = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "22");
      return isNaN(g) ? 22 : g;
    }

    function slideStep(){
      const w = slides[0]?.getBoundingClientRect().width || 260;
      return w + gapPx();
    }

    function getVisibleCount(){
      const w = viewport.clientWidth || root.clientWidth;
      const step = slideStep();
      return Math.max(1, Math.round(w / step));
    }

    function maxIndex(){ return Math.max(0, slides.length - visible); }

    function renderDots(){
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let i = 0; i <= maxIndex(); i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        if (i === index) b.classList.add("active");
        b.addEventListener("click", () => { index = i; update(); restartAutoplay(); });
        dotsWrap.appendChild(b);
      }
    }

    function update(){
      const step = slideStep();
      track.style.transform = `translateX(-${index * step}px)`;
      if (dotsWrap) {
        [...dotsWrap.children].forEach((d, i) => d.classList.toggle("active", i === index));
      }
    }

    function recalc(){
      visible = getVisibleCount();
      index = Math.min(index, maxIndex());
      renderDots();
      update();
    }

    prevBtn?.addEventListener("click", () => { index = index <= 0 ? maxIndex() : index - 1; update(); restartAutoplay(); });
    nextBtn?.addEventListener("click", () => { index = index >= maxIndex() ? 0 : index + 1; update(); restartAutoplay(); });

    recalc();

    window.addEventListener("load", recalc);
    const imgs = track.querySelectorAll("img");
    imgs.forEach(img => { if (!img.complete) img.addEventListener("load", recalc, { once: true }); });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalc, 200);
    });

    const autoplay = parseInt(root.dataset.autoplay || "0", 10);
    function startAutoplay(){
      if (autoplay <= 0) return;
      timer = setInterval(() => {
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }, autoplay);
    }
    function stopAutoplay(){ if (timer) { clearInterval(timer); timer = null; } }
    function restartAutoplay(){ stopAutoplay(); startAutoplay(); }

    startAutoplay();
    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);

    let dragStartX = 0;
    let dragDeltaX = 0;
    let isDragging = false;
    const DRAG_THRESHOLD_RATIO = 0.18;

    function baseTransformPx(){ return index * slideStep(); }

    viewport.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches.length) return;
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragDeltaX = 0;
      stopAutoplay();
      track.style.transition = "none";
    }, { passive: true });

    viewport.addEventListener("touchmove", (e) => {
      if (!isDragging || !e.touches || !e.touches.length) return;
      dragDeltaX = e.touches[0].clientX - dragStartX;
      track.style.transform = `translateX(${-(baseTransformPx()) + dragDeltaX}px)`;
    }, { passive: true });

    function endDrag(){
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = "";
      const step = slideStep();
      if (Math.abs(dragDeltaX) > step * DRAG_THRESHOLD_RATIO) {
        if (dragDeltaX < 0) {
          index = index >= maxIndex() ? 0 : index + 1;
        } else {
          index = index <= 0 ? maxIndex() : index - 1;
        }
      }
      dragDeltaX = 0;
      update();
      restartAutoplay();
    }

    viewport.addEventListener("touchend", endDrag);
    viewport.addEventListener("touchcancel", endDrag);
  });
}

/* =========================================================
   FAQ ACCORDION
========================================================= */
function initFaq(){
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq-item").forEach(other => {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

/* =========================================================
   COUNTDOWN TIMER (offer ends in)
========================================================= */
function initCountdown(){
  const clocks = document.querySelectorAll("[data-countdown]");
  if (!clocks.length) return;
  const FULL_SECONDS = (CONFIG.OFFER_HOURS * 3600) + (CONFIG.OFFER_MINUTES * 60) + CONFIG.OFFER_SECONDS;
  let totalSeconds = FULL_SECONDS;

  function render(){
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    clocks.forEach(c => c.textContent = `${h}:${m}:${s}`);
  }
  render();
  setInterval(() => {
    totalSeconds = totalSeconds > 0 ? totalSeconds - 1 : FULL_SECONDS;
    render();
  }, 1000);
}

/* =========================================================
   STATS COUNTER (5,00,000+)
========================================================= */
function initStatsCounter(){
  const el = document.querySelector("[data-count]");
  if (!el) return;
  const target = parseInt(el.dataset.count, 10);
  let started = false;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        animateCount(el, target);
      }
    });
  }, { threshold: 0.5 });
  io.observe(el);
}

function animateCount(el, target){
  const duration = 1800;
  const start = performance.now();
  function frame(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = formatIndianNumber(value) + (progress >= 1 ? "+" : "");
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function formatIndianNumber(num){
  return num.toLocaleString("en-IN");
}

/* =========================================================
   SHOW MORE (breakdown grid)
========================================================= */
function initShowMore(){
  const btn = document.getElementById("showMoreBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const hidden = document.querySelectorAll(".bd-hidden:not(.bd-show)");
    hidden.forEach(el => el.classList.add("bd-show"));
    btn.style.display = "none";
  });
}

/* =========================================================
   STICKY FLOATING BOTTOM BAR
========================================================= */
function initStickyBar(){
  const bar = document.getElementById("floatingBar");
  if (!bar) return;
  // Always visible — shows the moment the site opens, no scrolling required.
  bar.classList.add("show");
}
/* =========================================================
   FORMS — inline form + drawer form → Razorpay checkout
========================================================= */
function initForms(){
  const inlineForm = document.getElementById("inlineForm");
  const drawerForm = document.getElementById("drawerForm");

  inlineForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = collectFormData(inlineForm);
    window.__openDrawer(data);
  });

  drawerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (typeof fbq === "function") {
      fbq("track", "CompleteRegistration", {
        value: 3100,
        currency: "INR"
      });
    }
    handlePayment(drawerForm);
  });
}

function collectFormData(form){
  const fd = new FormData(form);
  const data = {};
  fd.forEach((value, key) => data[key] = value);
  return data;
}



async function handlePayment(form) {

  const submitBtn =
    form.querySelector("#proceedToPayBtn") ||
    form.querySelector('[type="submit"]');

  const data = collectFormData(form);

  // ==========================================
  // VALIDATE FORM
  // ==========================================
  if (!validateLeadData(data)) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  const originalLabel = submitBtn.textContent;

  submitBtn.disabled = true;
  submitBtn.textContent = "Please wait…";


  // ==========================================
  // GOOGLE SHEET WEB APP URL
  // ==========================================
  const GOOGLE_SHEET_URL =
    "https://script.google.com/macros/s/AKfycbwu96S-rPMv3fZe1uR7fxP95wy2sGGfoWi0jLoX07kx7Pn27G-wua3hdObapba9bcNm/exec";


  // ==========================================
  // RAZORPAY STATIC PAYMENT PAGE
  // ==========================================
  const RAZORPAY_PAYMENT_URL =
    "https://rzp.io/rzp/gvADqUt8";


  // ==========================================
  // SEND DATA TO GOOGLE SHEET
  // WITHOUT FETCH / CORS PROBLEM
  // ==========================================
  try {

    // Hidden iframe
    const iframe = document.createElement("iframe");
    iframe.name = "googleSheetFrame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);


    // Hidden form
    const googleForm = document.createElement("form");

    googleForm.method = "POST";
    googleForm.action = GOOGLE_SHEET_URL;
    googleForm.target = "googleSheetFrame";
    googleForm.style.display = "none";


    // Add fields
    const fields = {
      name: data.name || "",
      gender: data.gender || "",
      email: data.email || "",
      country_code: data.country_code || "",
      mobile: data.mobile || "",
      dob: data.dob || "",
      tob: data.tob || "",
      language: data.language || "",
      pob: data.pob || ""
    };


    Object.keys(fields).forEach(function(key) {

      const input = document.createElement("input");

      input.type = "hidden";
      input.name = key;
      input.value = fields[key];

      googleForm.appendChild(input);

    });


    document.body.appendChild(googleForm);

    // Submit to Google Sheet
    googleForm.submit();


    // ==========================================
    // REDIRECT TO RAZORPAY
    // ==========================================
    setTimeout(function() {

      window.location.href = RAZORPAY_PAYMENT_URL;

    }, 700);


  } catch (error) {

    console.error("Google Sheet Error:", error);

    // Even if Google Sheet fails,
    // customer should still go to payment page.
    window.location.href = RAZORPAY_PAYMENT_URL;

  }

}

function validateLeadData(data) {

  if (
    !data.name ||
    !data.gender ||
    !data.email ||
    !data.country_code ||
    !data.mobile ||
    !data.dob ||
    !data.tob ||
    !data.pob
  ) {
    return false;
  }

  const emailOk =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  const mobileOk =
    /^[0-9]{7,15}$/.test(data.mobile);

  return emailOk && mobileOk;
}
