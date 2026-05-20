/*
   Black Alder Technology LLC - Interactive & Dynamic Features
   Author: Antigravity AI
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initRFVisualizer();
  initValidationDashboard();
  initContactForm();
});

/* --- Navigation & Scroll Effects --- */
function initNavbar() {
  const header = document.querySelector('header');
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');

  // Add shadow and reduce padding on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    // Simple button animation
    const spans = menuBtn.querySelectorAll('span');
    spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
    spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '1';
    spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(7px, -7px)' : 'none';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = menuBtn.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

/* --- Interactive RF Signal Visualizer --- */
function initRFVisualizer() {
  const canvas = document.getElementById('rf-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const freqSlider = document.getElementById('freq-slider');
  const ampSlider = document.getElementById('amp-slider');
  const freqVal = document.getElementById('freq-val');
  const ampVal = document.getElementById('amp-val');

  // Set canvas resolution
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let offset = 0;

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    const freq = parseFloat(freqSlider.value);
    const amp = parseFloat(ampSlider.value);
    
    // Update text labels
    freqVal.textContent = `${freq.toFixed(1)} GHz`;
    ampVal.textContent = `${amp} dBm`;

    // Draw grid background
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw center baseline
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // 1. Draw Primary RF Carrier Wave (electric cyan glow)
    ctx.strokeStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      // Combination of primary sine wave + a secondary high frequency harmonic for realism
      const radian = (x / width) * Math.PI * 2 * freq;
      const carrier = Math.sin(radian + offset) * amp;
      const harmonic = Math.sin(radian * 2.5 + offset * 1.5) * (amp * 0.15); // Noise/harmonics
      const y = height / 2 + carrier + harmonic;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 2. Draw Secondary Out-of-Phase/Reflected wave (muted purple, thinner)
    ctx.shadowBlur = 0; // Disable shadow for secondary wave to avoid lag
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const radian = (x / width) * Math.PI * 2 * freq;
      const reflected = Math.cos(radian - offset * 0.7) * (amp * 0.5);
      const y = height / 2 + reflected;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Update phase offset for motion effect
    offset += 0.05;
    requestAnimationFrame(draw);
  }

  // Start the drawing loop
  draw();
}

/* --- Automated HIL Validation Dashboard --- */
function initValidationDashboard() {
  const runBtn = document.getElementById('btn-run-test');
  const progressBar = document.getElementById('test-progress-bar');
  const statusDot = document.getElementById('test-status-dot');
  const statusText = document.getElementById('test-status-text');
  
  // Dashboard Metrics
  const metricRssi = document.getElementById('metric-rssi');
  const metricSnr = document.getElementById('metric-snr');
  const metricPer = document.getElementById('metric-per');
  const termLogs = document.getElementById('terminal-logs');

  if (!runBtn) return;

  const testSteps = [
    {
      progress: 10,
      status: 'testing',
      statusMsg: 'INITIALIZING',
      log: '[INFO] Powering up automated HIL validation platform (v2.8.4)...',
      logClass: '',
      metrics: { rssi: '-95 dBm', snr: '8 dB', per: '24.5%' }
    },
    {
      progress: 20,
      status: 'testing',
      statusMsg: 'LOCKING SYNTH',
      log: '[INFO] Tuning RF synthesizer local oscillators to carrier 2.445 GHz...',
      logClass: '',
      metrics: { rssi: '-88 dBm', snr: '12 dB', per: '18.2%' }
    },
    {
      progress: 30,
      status: 'testing',
      statusMsg: 'LOCKING SYNTH',
      log: '[SUCCESS] Frequency synthesizer phase-locked loop (PLL) verified. [Err < 2 ppm]',
      logClass: 'log-success',
      metrics: { rssi: '-85 dBm', snr: '15 dB', per: '12.0%' }
    },
    {
      progress: 40,
      status: 'testing',
      statusMsg: 'PAIRING DUT',
      log: '[WARN] Attenuators adjusting path loss to simulate high-interference indoor environment...',
      logClass: 'log-warn',
      metrics: { rssi: '-92 dBm', snr: '6 dB', per: '35.4%' }
    },
    {
      progress: 50,
      status: 'testing',
      statusMsg: 'PAIRING DUT',
      log: '[INFO] Initializing BLE 5.3 advertisement sweep on channels 37, 38, 39...',
      logClass: '',
      metrics: { rssi: '-91 dBm', snr: '7 dB', per: '31.2%' }
    },
    {
      progress: 60,
      status: 'testing',
      statusMsg: 'PAIRING DUT',
      log: '[SUCCESS] Connected to wireless Device Under Test (DUT-084X). Handshake completed.',
      logClass: 'log-success',
      metrics: { rssi: '-42 dBm', snr: '34 dB', per: '0.01%' }
    },
    {
      progress: 70,
      status: 'testing',
      statusMsg: 'VALIDATING',
      log: '[INFO] Initiating packet injection stress-test (100k packets, PRBS9 payload)...',
      logClass: '',
      metrics: { rssi: '-44 dBm', snr: '31 dB', per: '0.02%' }
    },
    {
      progress: 80,
      status: 'testing',
      statusMsg: 'VALIDATING',
      log: '[INFO] Sweeping TX power output settings: checking linearity and spectral mask compliance...',
      logClass: '',
      metrics: { rssi: '-38 dBm', snr: '38 dB', per: '0.00%' }
    },
    {
      progress: 90,
      status: 'testing',
      statusMsg: 'GENERATING REPT',
      log: '[SUCCESS] Harmonic emissions margin verified [Second: -52 dBc | Third: -61 dBc]. Pass.',
      logClass: 'log-success',
      metrics: { rssi: '-40 dBm', snr: '36 dB', per: '0.00%' }
    },
    {
      progress: 95,
      status: 'testing',
      statusMsg: 'GENERATING REPT',
      log: '[INFO] Computing comprehensive RSSI/SNR histograms and packet throughput matrices...',
      logClass: '',
      metrics: { rssi: '-40 dBm', snr: '36 dB', per: '0.00%' }
    },
    {
      progress: 100,
      status: 'active',
      statusMsg: 'SYSTEM ONLINE',
      log: '[SUCCESS] HIL SYSTEM TEST COMPLETE: All compliance constraints and RF performance specs PASSED.',
      logClass: 'log-success',
      metrics: { rssi: '-39 dBm', snr: '37 dB', per: '0.00%' }
    }
  ];

  function runSimulatedTest() {
    runBtn.disabled = true;
    termLogs.innerHTML = '';
    progressBar.style.width = '0%';
    
    // Set initial testing visual state
    statusDot.className = 'dash-status-dot testing';
    statusText.textContent = 'TEST IN PROGRESS';

    let currentStep = 0;

    function nextStep() {
      if (currentStep >= testSteps.length) {
        runBtn.disabled = false;
        return;
      }

      const step = testSteps[currentStep];

      // Update progress bar width
      progressBar.style.width = `${step.progress}%`;

      // Update Status Indicator
      statusDot.className = `dash-status-dot ${step.status}`;
      statusText.textContent = step.statusMsg;

      // Update Metrics
      metricRssi.textContent = step.metrics.rssi;
      metricSnr.textContent = step.metrics.snr;
      metricPer.textContent = step.metrics.per;

      // Append Terminal Log
      const logDiv = document.createElement('div');
      logDiv.className = `log-line ${step.logClass}`;
      logDiv.textContent = step.log;
      termLogs.appendChild(logDiv);

      // Auto-scroll terminal
      termLogs.scrollTop = termLogs.scrollHeight;

      currentStep++;

      // Timing delay based on stage for realistic flow
      let delay = 1200;
      if (step.progress === 70 || step.progress === 80) delay = 1800; // longer for intensive tests
      if (step.progress === 95) delay = 1500;

      setTimeout(nextStep, delay);
    }

    // Begin sequence
    nextStep();
  }

  runBtn.addEventListener('click', runSimulatedTest);
}

/* --- High-Tech Contact Form Verification --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const resultDiv = document.getElementById('form-result');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const details = document.getElementById('form-details').value;

    // Loading State Visual Cue
    submitBtn.disabled = true;
    submitBtn.textContent = 'TRANSMITTING MESSAGE DATA...';

    // Simulate network transmission delay
    setTimeout(() => {
      submitBtn.textContent = 'TRANSMISSION COMPLETE';
      
      // Beautiful glowing feedback
      resultDiv.className = 'form-result success';
      resultDiv.innerHTML = `
        <strong>[TRANSMISSION CAPTURED]</strong><br>
        Thank you, ${name}. Your inquiry has been routed directly to our hardware & wireless validation engineering desk. 
        A Black Alder representative will respond to <strong>${email}</strong> shortly.
      `;
      resultDiv.style.display = 'block';

      // Clear inputs
      form.reset();
      
      // Reset button after a brief period
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'TRANSMIT SECURE INQUIRY';
      }, 4000);

    }, 1800);
  });
}
