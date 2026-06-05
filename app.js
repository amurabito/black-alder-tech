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

  const simulationSequence = [
    // SETUP CONTAINER
    { text: '[SYSTEM] Initializing HIL validation workspace...', progress: 1, status: 'SETUP CONTAINER', statusClass: 'testing', delay: 80 },
    { text: '[SYSTEM] Loading client test plan profile: black-alder-compliance-spec-v3', progress: 3, status: 'SETUP CONTAINER', delay: 90 },
    { text: '[SYSTEM] Instantiating isolated Docker service container...', progress: 5, status: 'SETUP CONTAINER', delay: 120 },
    { text: '[SYSTEM] Docker image: black-alder-hil-runner:v3.2.1-mfg-prod', progress: 7, status: 'SETUP CONTAINER', delay: 80 },
    { text: '[SYSTEM] Mounting system volume: host:/opt/hil/config -> container:/etc/hil/config (ro)', progress: 9, status: 'SETUP CONTAINER', delay: 80 },
    { text: '[SYSTEM] Attaching container interface eth0 to overlay network \'hil_lan_bridge\'', progress: 11, status: 'SETUP CONTAINER', delay: 110 },
    { text: '[SUCCESS] Docker service container \'hil_runner_084x\' booted. [ID: 8f410c9d]', class: 'log-success', progress: 13, status: 'SETUP CONTAINER', delay: 150 },

    // LOCKING RF SYNTH
    { text: '[INSTRUMENT] Scanning system interfaces for physical instrumentation...', progress: 15, status: 'LOCKING RF SYNTH', delay: 140 },
    { text: '[INSTRUMENT] Found VISA interface: GPIB0::16::INSTR (Keysight N5182B MXG)', progress: 17, status: 'LOCKING RF SYNTH', delay: 100 },
    { text: '[INSTRUMENT] Commencing phase lock protocol with Keysight MXG synthesizer...', progress: 19, status: 'LOCKING RF SYNTH', delay: 180 },
    { text: '[INSTRUMENT] Tuning RF synthesizer output to 2.445 GHz (WLAN Channel 7)...', progress: 21, status: 'LOCKING RF SYNTH', delay: 200 },
    { text: '[INSTRUMENT] RF signal generator output level set to initial -40.0 dBm', progress: 23, status: 'LOCKING RF SYNTH', delay: 100 },
    { text: '[SUCCESS] Synthesizer phase-locked loop (PLL) verified. [Freq error < 1.1 ppm]', class: 'log-success', progress: 26, status: 'LOCKING RF SYNTH', rssi: -105, snr: 2, per: 100, delay: 160 },
    { text: '[SYSTEM] Energizing Device Under Test (DUT-084X) via PoE Injector Port 4...', progress: 28, status: 'LOCKING RF SYNTH', delay: 350 },

    // FLASHING FIRMWARE
    { text: '[JTAG] Establishing high-speed SWD communications link (4000 kHz)...', progress: 30, status: 'FLASHING FIRMWARE', delay: 150 },
    { text: '[JTAG] Processor detected: ARM Cortex-M7 core active.', progress: 32, status: 'FLASHING FIRMWARE', delay: 90 },
    { text: '[JTAG] Clearing target flash sectors 0x08000000 - 0x080FFFFF...', progress: 35, status: 'FLASHING FIRMWARE', delay: 280 },
    { text: '[JTAG] Flashing golden firmware binary: compliance_v4.0.1_rc3.bin...', progress: 38, status: 'FLASHING FIRMWARE', delay: 450 },
    { text: '[SUCCESS] Flash write completed and verified via CRC32 check [CRC: 0xF3B07A11]', class: 'log-success', progress: 41, status: 'FLASHING FIRMWARE', delay: 180 },
    { text: '[DUT] Releasing JTAG reset pin. Bootloader active.', progress: 43, status: 'FLASHING FIRMWARE', delay: 100 },
    { text: '[DUT] Bootstrapping kernel. Loading device drivers...', progress: 45, status: 'FLASHING FIRMWARE', delay: 120 },
    { text: '[DUT] Console output captured: \'System Ready; L2/L3 wireless stack initialized\'', progress: 47, status: 'FLASHING FIRMWARE', rssi: -98, snr: 5, per: 100, delay: 140 },

    // PRE-COMPLIANCE RUN
    { text: '[TEST] Launching regional domain regulatory pre-scan (FCC/ETSI rules)...', progress: 50, status: 'PRE-COMPLIANCE RUN', delay: 160 },
    { text: '[TEST] Auditing passive/active DFS channel selection response curves...', progress: 52, status: 'PRE-COMPLIANCE RUN', delay: 200 },
    { text: '[SUCCESS] DFS Radar signature simulated. Channel Switch Announcement verified in 142ms', class: 'log-success', progress: 55, status: 'PRE-COMPLIANCE RUN', rssi: -42, snr: 34, per: 0.01, delay: 180 },
    { text: '[TEST] Running Layer 2 association test (802.11ax, WPA3-SAE handshake)...', progress: 57, status: 'PRE-COMPLIANCE RUN', delay: 180 },
    { text: '[SUCCESS] Association complete. Handshake timing = 42.1ms (Pass)', class: 'log-success', progress: 59, status: 'PRE-COMPLIANCE RUN', delay: 100 },
    { text: '[DUT] Requesting IP address... DHCP lease acquired: 172.20.10.15 [DHCP server: 172.20.10.1]', progress: 61, status: 'PRE-COMPLIANCE RUN', delay: 150 },

    // COEX & OTA RUN
    { text: '[TEST] Activating coex stress module: WLAN TX (85% duty cycle) + Bluetooth RX', progress: 64, status: 'COEX & OTA RUN', delay: 200 },
    { text: '[WARNING] Coexistence interference: Bluetooth packet loss spiked to 4.8%', class: 'log-warn', progress: 67, status: 'COEX & OTA RUN', rssi: -85, snr: 12, per: 4.8, delay: 350 },
    { text: '[TEST] Deploying dynamic AFH (Adaptive Frequency Hopping) tuning matrix...', progress: 69, status: 'COEX & OTA RUN', delay: 150 },
    { text: '[TEST] Enabling priority pinning on DUT hardware interfaces GPIO_12/GPIO_13...', progress: 71, status: 'COEX & OTA RUN', delay: 120 },
    { text: '[SUCCESS] Coexistence mitigation resolved. Bluetooth packet error rate stabilized at 0.5%', class: 'log-success', progress: 74, status: 'COEX & OTA RUN', per: 0.5, delay: 250 },

    // PATH LOSS SWEEP
    { text: '[TEST] Commencing automated RF path loss sweep (attenuation 10dB -> 90dB)...', progress: 77, status: 'PATH LOSS SWEEP', delay: 220 },
    { text: '[TEST] Measuring receiver throughput curves (MCS0-MCS11) vs Path Loss...', progress: 79, status: 'PATH LOSS SWEEP', delay: 100 },
    { text: '[DATA] Sweep Step 1: Path Loss 30dB (RSSI -60dBm) -> Throughput: 724 Mbps [Pass]', progress: 81, status: 'PATH LOSS SWEEP', rssi: -60, snr: 30, per: 0.0, delay: 160 },
    { text: '[DATA] Sweep Step 2: Path Loss 60dB (RSSI -80dBm) -> Throughput: 192 Mbps [Pass]', progress: 84, status: 'PATH LOSS SWEEP', rssi: -80, snr: 18, per: 0.05, delay: 160 },
    { text: '[DATA] Sweep Step 3: Path Loss 85dB (RSSI -90dBm) -> Throughput: 14 Mbps [Pass]', progress: 87, status: 'PATH LOSS SWEEP', rssi: -90, snr: 7, per: 0.85, delay: 160 },
    { text: '[SUCCESS] RX sensitivity and throughput limits conform to client specifications.', class: 'log-success', progress: 90, status: 'PATH LOSS SWEEP', delay: 200 },

    // TEARDOWN & CLEANUP
    { text: '[SYSTEM] All automated test scripts executed. Initializing cleanup sequence...', progress: 92, status: 'TEARDOWN & CLEANUP', delay: 120 },
    { text: '[SYSTEM] Disabling GPIB synthesizer outputs. Powering down DUT-084X...', progress: 94, status: 'TEARDOWN & CLEANUP', rssi: null, snr: null, per: null, delay: 150 },
    { text: '[SYSTEM] Stopping Docker service container \'hil_runner_084x\'...', progress: 96, status: 'TEARDOWN & CLEANUP', delay: 120 },
    { text: '[SUCCESS] Docker container and overlay network bridges successfully pruned.', class: 'log-success', progress: 98, status: 'TEARDOWN & CLEANUP', delay: 140 },
    { text: '[SYSTEM] Archiving raw RF telemetry data, JUnit results, and console logs...', progress: 99, status: 'TEARDOWN & CLEANUP', delay: 180 },

    // SYSTEM ONLINE
    { text: '[SUCCESS] HIL CONFORMANCE TEST COMPLETED SUCCESSFULLY. STATUS: PASS.', class: 'log-success', progress: 100, status: 'SYSTEM ONLINE', statusClass: 'active', rssi: -38, snr: 36, per: 0.0, delay: 400 }
  ];

  const TEST_RUN_DURATION_MS = 39000;
  const baseSequenceDuration = simulationSequence.reduce((total, step) => total + (step.delay || 120), 0);
  const delayScale = TEST_RUN_DURATION_MS / baseSequenceDuration;

  let currentMetrics = { rssi: null, snr: null, per: null };
  let targetMetrics = { rssi: null, snr: null, per: null };
  let telemetryInterval = null;

  function startTelemetryUpdates() {
    if (telemetryInterval) clearInterval(telemetryInterval);
    telemetryInterval = setInterval(() => {
      // RSSI
      if (targetMetrics.rssi !== null) {
        if (currentMetrics.rssi === null) currentMetrics.rssi = targetMetrics.rssi;
        currentMetrics.rssi += (targetMetrics.rssi - currentMetrics.rssi) * 0.15;
        const noise = (Math.random() - 0.5) * 0.4;
        const val = currentMetrics.rssi + noise;
        metricRssi.textContent = `${val.toFixed(1)} dBm`;
        metricRssi.className = 'dash-metric-val cyan';
      } else {
        currentMetrics.rssi = null;
        metricRssi.textContent = '-- dBm';
        metricRssi.className = 'dash-metric-val muted';
      }

      // SNR
      if (targetMetrics.snr !== null) {
        if (currentMetrics.snr === null) currentMetrics.snr = targetMetrics.snr;
        currentMetrics.snr += (targetMetrics.snr - currentMetrics.snr) * 0.15;
        const noise = (Math.random() - 0.5) * 0.3;
        const val = currentMetrics.snr + noise;
        metricSnr.textContent = `${val.toFixed(1)} dB`;
        metricSnr.className = 'dash-metric-val purple';
      } else {
        currentMetrics.snr = null;
        metricSnr.textContent = '-- dB';
        metricSnr.className = 'dash-metric-val muted';
      }

      // PER
      if (targetMetrics.per !== null) {
        if (currentMetrics.per === null) currentMetrics.per = targetMetrics.per;
        currentMetrics.per += (targetMetrics.per - currentMetrics.per) * 0.15;
        const noise = (Math.random() - 0.5) * 0.06;
        let val = currentMetrics.per + noise;
        if (val < 0) val = 0;
        metricPer.textContent = `${val.toFixed(2)}%`;
        
        if (val >= 10) {
          metricPer.className = 'dash-metric-val red';
        } else if (val > 0.05) {
          metricPer.className = 'dash-metric-val orange';
        } else {
          metricPer.className = 'dash-metric-val green';
        }
      } else {
        currentMetrics.per = null;
        metricPer.textContent = '--%';
        metricPer.className = 'dash-metric-val muted';
      }
    }, 60);
  }

  function runSimulatedTest() {
    runBtn.disabled = true;
    termLogs.innerHTML = '';
    
    // Create & append cursor
    const cursor = document.createElement('div');
    cursor.className = 'log-line console-cursor';
    cursor.textContent = '█';
    termLogs.appendChild(cursor);

    progressBar.style.width = '0%';
    statusDot.className = 'dash-status-dot testing';
    statusText.textContent = 'TEST IN PROGRESS';

    // Reset values for start
    targetMetrics = { rssi: null, snr: null, per: null };
    currentMetrics = { rssi: null, snr: null, per: null };
    startTelemetryUpdates();

    let currentIndex = 0;

    function randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    function updateDashboardState(step) {
      if (!step) return;

      progressBar.style.width = `${step.progress}%`;
      statusDot.className = `dash-status-dot ${step.statusClass || 'testing'}`;
      statusText.textContent = step.status;

      if (step.rssi !== undefined) targetMetrics.rssi = step.rssi;
      if (step.snr !== undefined) targetMetrics.snr = step.snr;
      if (step.per !== undefined) targetMetrics.per = step.per;
    }

    function appendLogLine(step) {
      const logDiv = document.createElement('div');
      logDiv.className = `log-line ${step.class || ''}`;
      logDiv.textContent = step.text;
      termLogs.insertBefore(logDiv, cursor);
      termLogs.scrollTop = termLogs.scrollHeight;
    }

    function getBurstSize() {
      const roll = Math.random();
      if (roll > 0.84) return 3;
      if (roll > 0.48) return 2;
      return 1;
    }

    function getScaledStepDelay(step) {
      const naturalDelay = (step.delay || 120) * delayScale;
      const jitter = randomBetween(0.72, 1.34);
      return naturalDelay * jitter;
    }

    function getPauseAfterBurst(lastStep, nextStep, burstSize) {
      let pause = 0;

      if (nextStep && nextStep.status !== lastStep.status && Math.random() < 0.55) {
        pause += randomBetween(650, 1500);
      }

      const isHardwareWait = lastStep.text.includes('Tuning RF synthesizer')
        || lastStep.text.includes('Energizing Device')
        || lastStep.text.includes('Clearing target flash')
        || lastStep.text.includes('Flashing golden firmware')
        || lastStep.text.includes('coex stress')
        || lastStep.text.includes('path loss sweep')
        || lastStep.text.includes('Stopping Docker');

      if (isHardwareWait && Math.random() < 0.45) {
        pause += randomBetween(1400, 3200);
      } else if (Math.random() < 0.08) {
        pause += randomBetween(700, 1800);
      }

      if (burstSize > 1 && Math.random() < 0.45) {
        pause += randomBetween(220, 700);
      }

      return pause;
    }

    function printBurst() {
      if (currentIndex >= simulationSequence.length) {
        runBtn.disabled = false;
        return;
      }

      const burstStartIndex = currentIndex;
      let burstSize = getBurstSize();
      let maxBurstSize = 1;
      let accumulatedDelay = 0;

      for (let i = 1; i < burstSize && burstStartIndex + i < simulationSequence.length; i++) {
        if (simulationSequence[burstStartIndex + i].status !== simulationSequence[burstStartIndex].status) break;
        maxBurstSize++;
      }

      burstSize = Math.max(1, Math.min(maxBurstSize, simulationSequence.length - currentIndex));

      for (let burstOffset = 0; burstOffset < burstSize; burstOffset++) {
        const step = simulationSequence[currentIndex + burstOffset];
        accumulatedDelay += getScaledStepDelay(step);

        setTimeout(() => {
          updateDashboardState(step);
          appendLogLine(step);
        }, burstOffset === 0 ? 0 : randomBetween(35, 130) * burstOffset);
      }

      currentIndex += burstSize;

      const lastStep = simulationSequence[currentIndex - 1];
      const nextStep = simulationSequence[currentIndex];
      const realismPause = getPauseAfterBurst(lastStep, nextStep, burstSize);
      const nextDelay = Math.max(180, accumulatedDelay + realismPause);

      setTimeout(printBurst, nextDelay);
    }

    printBurst();
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
