
/* =========================================================
   CONFIG — edit these lines before going live
   ========================================================= */
// 1) Paste your deployed Google Apps Script Web App URL here.
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwu96S-rPMv3fZe1uR7fxP95wy2sGGfoWi0jLoX07kx7Pn27G-wua3hdObapba9bcNm/exec";
// 2) Where visitors land after they submit (the "unlocked" video/thank-you page).
const REDIRECT_URL = "https://acharyavinaybajrangi.com/life-prediction-report/";
/* ========================================================= */

// Scatter drifting zodiac glyphs across the background.
(function(){
  const signs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const layer = document.getElementById('zodiacLayer');
  const count = window.innerWidth < 480 ? 8 : 14;
  for(let i=0;i<count;i++){
    const span = document.createElement('span');
    span.className = 'zglyph';
    span.textContent = signs[i % signs.length];
    span.style.left = (Math.random()*94 + 2) + 'vw';
    span.style.top = (Math.random()*94 + 2) + 'vh';
    span.style.fontSize = (Math.random()*18 + 16) + 'px';
    span.style.animationDuration = (Math.random()*6 + 6) + 's';
    span.style.animationDelay = (Math.random()*4) + 's';
    layer.appendChild(span);
  }
})();

// Simple ambient starfield, matching the source site's cosmic background.
(function(){
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({length: Math.floor((canvas.width*canvas.height)/9000)}, () => ({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.3 + 0.2,
      a: Math.random()*0.6 + 0.2,
      d: Math.random()*0.02 + 0.005
    }));
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(s=>{
      s.a += s.d;
      if(s.a>0.9||s.a<0.15) s.d*=-1;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(232,195,119,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();
})();

// Form validation + submission
const form = document.getElementById('leadForm');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');

function setError(fieldName, on){
  const el = form.querySelector(`[data-field="${fieldName}"]`);
  if(el) el.classList.toggle('error', on);
}

function validate(data){
  let ok = true;
  if(!data.name.trim()){ setError('name', true); ok = false; } else setError('name', false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  if(!emailOk){ setError('email', true); ok = false; } else setError('email', false);

  const mobileOk = /^[0-9+\-\s]{7,15}$/.test(data.mobile.trim());
  if(!mobileOk){ setError('mobile', true); ok = false; } else setError('mobile', false);

  if(!data.city.trim()){ setError('city', true); ok = false; } else setError('city', false);

  return ok;
}

form.addEventListener('submit', async function(e){
  e.preventDefault();
  statusMsg.textContent = '';
  statusMsg.className = 'status-msg';

  const data = {
    name: form.name.value,
    email: form.email.value,
    mobile: form.mobile.value,
    city: form.city.value,
    timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }),
    source: window.location.href
  };

  if(!validate(data)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try{
    // 1) Send lead data to Google Sheet
    if(GOOGLE_SHEET_ENDPOINT && !GOOGLE_SHEET_ENDPOINT.startsWith('PASTE_')){
      await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors', // Apps Script web apps don't return CORS headers to browser fetch
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
    }

    // 2) Fire Meta Pixel "Lead" event
    if(typeof fbq === 'function'){
      fbq('track', 'Lead', {
        content_name: 'Life Prediction Report Form',
        status: 'submitted'
      });
    }

    statusMsg.textContent = 'Success! Redirecting…';
    statusMsg.classList.add('success');
    setTimeout(() => { window.location.href = REDIRECT_URL; }, 700);
  }catch(err){
    submitBtn.disabled = false;
    submitBtn.textContent = '✦ Click to Unlock the Video to Know More!';
    statusMsg.textContent = "Something went wrong. Please try again.";
    statusMsg.classList.add('error');
  }
});
