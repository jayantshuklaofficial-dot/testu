

  // Scatter floating numerology digits / symbols across the background
  (function(){
    const symbols = ['1','2','3','4','5','6','7','8','9','∞','☉','☽','✦','◇'];
    const wrap = document.querySelector('.bg-wrap');
    const count = 22;
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'float-shape';
      el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
      const size = 14 + Math.random()*30;
      el.style.fontSize = size + 'px';
      el.style.left = Math.random()*100 + '%';
      el.style.top = Math.random()*100 + '%';
      const dur = 8 + Math.random()*10;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (Math.random()*-dur) + 's';
      wrap.appendChild(el);
    }
  })();

  /* =========================================================
     GOOGLE SHEET AUTO-UPDATE
     1. Open Google Sheets -> create a new sheet, add header row:
        Timestamp | Name | Email | Mobile | City | Occupation
     2. Extensions -> Apps Script -> paste the doGet/doPost code
        given in the chat reply -> Deploy -> Web app
        (Execute as: Me, Who has access: Anyone)
     3. Copy the deployment URL and paste it below.
  ========================================================= */
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjMQQeo6_TTHXNqWK6PSHqq5REp1criaV17XzxMPMKGg_vb--5ikLqEit0HZ55RTG9/exec";

  const form = document.getElementById('numerologyForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Save locally too so vsl.html can greet the user by name if needed
    try{ sessionStorage.setItem('numerologyLead', JSON.stringify(data)); }catch(err){}

    const redirectNow = () => { window.location.href = 'https://bajajkajal.com/vsl'; };

    if(!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf('PASTE_YOUR') !== -1){
      // No sheet connected yet — just redirect so the page still works end-to-end
      console.warn('Google Sheet URL not configured yet. Skipping sheet write.');
      redirectNow();
      return;
    }

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script web apps don't return CORS headers by default
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(redirectNow)
    .catch(function(err){
      console.error('Sheet submission error:', err);
      // Still redirect the user even if the sheet write fails, so they aren't stuck
      redirectNow();
    });
  });

