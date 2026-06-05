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
      statusMsg: 'SETUP CONTAINER',
      log: [
        { text: '[INFO] Initializing HIL test controller workspace...', class: '' },
        { text: '[INFO] Spinning up Docker service container: black-alder-hil-runner:v3.2.1', class: '' },
        { text: '[SUCCESS] Docker container \'hil_runner_084x\' created (sha256:8f410c9d...)', class: 'log-success' },
        { text: '[INFO] Volume mount: host:/opt/hil/config -> container:/etc/hil/config (ro)', class: '' },
        { text: '[INFO] Attaching container to overlay network \'hil_lan_bridge\' (172.20.0.0/16)', class: '' }
      ],
      metrics: { rssi: '-- dBm', snr: '-- dB', per: '--%' }
    },
    {
      progress: 25,
      status: 'testing',
      statusMsg: 'LOCKING RF SYNTH',
      log: [
        { text: '[INFO] Connecting via VISA interface to local RF instrumentation...', class: '' },
        { text: '[INFO] Keysight MXG: Tuning and locking local oscillators to 2.445 GHz...', class: '' },
        { text: '[SUCCESS] RF instrument phase-locked loop (PLL) verified. [Err < 1.5 ppm]', class: 'log-success' },
        { text: '[INFO] Powering on Device Under Test (DUT-084X) via PoE injector...', class: '' }
      ],
      metrics: { rssi: '-105 dBm', snr: '2 dB', per: '100%' }
    },
    {
      progress: 40,
      status: 'testing',
      statusMsg: 'FLASHING FIRMWARE',
      log: [
        { text: '[INFO] Uploading golden image firmware (v4.0.1-rc3) to SoC flash over JTAG...', class: '' },
        { text: '[SUCCESS] Firmware write and verify complete. Booting DUT...', class: 'log-success' },
        { text: '[INFO] UART console output matched: \'System Ready; L2/L3 stack initialized\'', class: '' }
      ],
      metrics: { rssi: '-98 dBm', snr: '5 dB', per: '100%' }
    },
    {
      progress: 55,
      status: 'testing',
      statusMsg: 'PRE-COMPLIANCE RUN',
      log: [
        { text: '[INFO] Starting pre-conformance readiness sweep for regional domains (FCC/ETSI)...', class: '' },
        { text: '[INFO] Auditing channel selection algorithms and active DFS detection latency...', class: '' },
        { text: '[SUCCESS] DFS channel switch announcement (CSA) compliance validated. [Latency < 180ms]', class: 'log-success' },
        { text: '[INFO] Simulating WFA-conformance Layer 2 association checks (WPA3-SAE, 802.11ax)...', class: '' },
        { text: '[SUCCESS] Simulated association complete. IP: 172.20.10.15 [DHCP success]', class: 'log-success' }
      ],
      metrics: { rssi: '-42 dBm', snr: '34 dB', per: '0.01%' }
    },
    {
      progress: 70,
      status: 'testing',
      statusMsg: 'COEX & OTA RUN',
      log: [
        { text: '[INFO] Running WLAN/BT coexistence (coex) stress-test [WLAN TX 80% duty, BT RX]', class: '' },
        { text: '[WARN] Coex interference detected: Bluetooth packet loss increased to 4.2%', class: 'log-warn' },
        { text: '[INFO] Applying coex mitigation profile (AFH enabled, priority-pinning active)...', class: '' },
        { text: '[SUCCESS] Coexistence validated. Bluetooth packet error rate stabilized.', class: 'log-success' },
        { text: '[INFO] Simulating OTA radiated path loss: ramping attenuators from 10dB to 60dB...', class: '' }
      ],
      metrics: { rssi: '-85 dBm', snr: '12 dB', per: '4.2%' }
    },
    {
      progress: 85,
      status: 'testing',
      statusMsg: 'PATH LOSS SWEEP',
      log: [
        { text: '[INFO] Measuring throughput curves (MCS0-MCS11) vs Path Loss...', class: '' },
        { text: '[INFO] Path Loss 30dB (RSSI -60dBm) -> Throughput: 718 Mbps [Pass]', class: '' },
        { text: '[INFO] Path Loss 60dB (RSSI -80dBm) -> Throughput: 185 Mbps [Pass]', class: '' },
        { text: '[INFO] Path Loss 85dB (RSSI -90dBm) -> Throughput: 12 Mbps [Pass]', class: '' },
        { text: '[SUCCESS] Link budget and path loss throughput limits verified within spec.', class: 'log-success' }
      ],
      metrics: { rssi: '-90 dBm', snr: '7 dB', per: '0.82%' }
    },
    {
      progress: 95,
      status: 'testing',
      statusMsg: 'TEARDOWN & CLEANUP',
      log: [
        { text: '[INFO] Test suite completed. Commencing container and hardware shutdown...', class: '' },
        { text: '[INFO] Disabling instrument RF outputs. Powering down DUT-084X...', class: '' },
        { text: '[INFO] Stopping Docker container \'hil_runner_084x\'...', class: '' },
        { text: '[SUCCESS] Docker container and virtual networks successfully pruned.', class: 'log-success' },
        { text: '[INFO] Archiving telemetry data, JUnit XML reports, and console logs...', class: '' }
      ],
      metrics: { rssi: '-- dBm', snr: '-- dB', per: '--%' }
    },
    {
      progress: 100,
      status: 'active',
      statusMsg: 'SYSTEM ONLINE',
      log: [
        { text: '[SUCCESS] HIL SYSTEM TEST COMPLETE: All compliance constraints and RF performance specs PASSED.', class: 'log-success' }
      ],
      metrics: { rssi: '-38 dBm', snr: '36 dB', per: '0.00%' }
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

      // Append Terminal Log(s)
      const logs = Array.isArray(step.log) ? step.log : [{ text: step.log, class: step.logClass || '' }];
      logs.forEach(logObj => {
        const logLine = typeof logObj === 'string' ? { text: logObj, class: '' } : logObj;
        const logDiv = document.createElement('div');
        logDiv.className = `log-line ${logLine.class || ''}`;
        logDiv.textContent = logLine.text;
        termLogs.appendChild(logDiv);
      });

      // Auto-scroll terminal
      termLogs.scrollTop = termLogs.scrollHeight;

      currentStep++;

      // Timing delay based on stage for realistic flow
      let delay = 1500;
      if (step.progress === 55 || step.progress === 70) delay = 2200; // longer for intensive scans
      if (step.progress === 85) delay = 2000;

      setTimeout(nextStep, delay);
    }

    // Begin sequence
    nextStep();
  }

  runBtn.addEventListener('click', runSimulatedTest);
}

/* --- High-Tech Contact Form Verification & Integration --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const resultDiv = document.getElementById('form-result');

  if (!form) return;

  // TO MAKE THIS FORM DELIVER REAL EMAILS:
  // 1. Go to https://web3forms.com and enter your email to get a free Access Key.
  // 2. Paste your Access Key into the constant below:
  const WEB3FORMS_ACCESS_KEY = "e853e568-6cf0-4192-a6d9-c54ac632967a"; 

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const details = document.getElementById('form-details').value;

    // Loading State Visual Cue
    submitBtn.disabled = true;
    submitBtn.textContent = 'TRANSMITTING SECURE MESSAGE...';
    resultDiv.style.display = 'none';

    if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
      // Fallback: Simulation mode with a helpful tip
      setTimeout(() => {
        submitBtn.textContent = 'TRANSMISSION COMPLETE';
        
        resultDiv.className = 'form-result success';
        resultDiv.innerHTML = `
          <strong>[SIMULATION MODE ACTIVE]</strong><br>
          Thank you, ${name}! Your test transmission was successful.<br>
          <span style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px; display: block;">
            💡 <strong>To make this form deliver real emails:</strong> Register for a free access key at <a href="https://web3forms.com" target="_blank" style="color: hsl(var(--primary-cyan)); text-decoration: underline;">Web3Forms</a> and add it to <code>app.js</code>.
          </span>
        `;
        resultDiv.style.display = 'block';
        form.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Transmit Secure Inquiry';
        }, 4000);
      }, 1500);
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name,
          email: email,
          message: details,
          subject: `New Client Inquiry from ${name} (${email})`
        })
      });

      const json = await response.json();
      if (response.status === 200) {
        submitBtn.textContent = 'TRANSMISSION COMPLETE';
        resultDiv.className = 'form-result success';
        resultDiv.innerHTML = `
          <strong>[TRANSMISSION CAPTURED]</strong><br>
          Thank you, ${name}. Your inquiry has been routed directly to our hardware & wireless validation engineering desk. 
          A Black Alder representative will respond to <strong>${email}</strong> shortly.
        `;
        resultDiv.style.display = 'block';
        form.reset();
      } else {
        throw new Error(json.message || "Endpoint error");
      }
    } catch (error) {
      console.error(error);
      submitBtn.textContent = 'TRANSMISSION FAILED';
      resultDiv.className = 'form-result error';
      resultDiv.innerHTML = `
        <strong>[TRANSMISSION ERROR]</strong><br>
        Failed to transmit data: ${error.message}. Please reach out directly to 
        <a href="mailto:black.alder.tech@gmail.com" style="color: inherit; text-decoration: underline;">black.alder.tech@gmail.com</a>.
      `;
      resultDiv.style.display = 'block';
    } finally {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Transmit Secure Inquiry';
      }, 4000);
    }
  });
}
