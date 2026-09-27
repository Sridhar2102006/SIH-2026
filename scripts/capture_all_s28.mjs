import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sridh/.gemini/antigravity-ide/brain/376452b6-17d5-4aab-a736-3c8277087e84';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  try {
    const res = await fetch('http://localhost:9222/json');
    const targets = await res.json();
    const pageTarget = targets.find((t) => t.url && t.url.includes('5173'));
    if (!pageTarget) {
      console.error('Could not find localhost:5173 target in Edge');
      return;
    }
    console.log('Connecting to target:', pageTarget.title, pageTarget.url);

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id)(msg);
          pending.delete(msg.id);
        }
      } catch (e) {}
    };

    const send = (method, params = {}) => {
      const id = idCounter++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((r) => (ws.onopen = r));
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      mobile: true
    });

    const evalCode = async (code) => {
      const result = await send('Runtime.evaluate', {
        expression: code,
        returnByValue: true
      });
      return result.result?.value;
    };

    // Open public verification view
    console.log('Opening Screen 28 Public Verification...');
    await evalCode(`(() => {
      if (window.__openPublicVerification) {
        window.__openPublicVerification('HC-2409');
      }
    })()`);
    await delay(600);

    const setScenario = async (ref, offline = false) => {
      await evalCode(`(() => {
        if (window.__setPublicVerificationScenario) {
          window.__setPublicVerificationScenario('${ref}', ${offline});
        }
        const root = document.querySelector('.public-verification-root');
        if (root) root.scrollTop = 0;
      })()`);
      await delay(600);
    };

    // ─────────────────────────────────────────────────────────────
    // 1. Confirmed / Verified Hero & Product Identity
    // ─────────────────────────────────────────────────────────────
    console.log('1. Capturing Verified Hero & Product Identity...');
    await setScenario('HC-2409', false);
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_01_verified_hero.png'),
      Buffer.from(shot1.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 2. Honey Journey Vertical Timeline (Scrolled)
    // ─────────────────────────────────────────────────────────────
    console.log('2. Capturing Honey Journey Timeline...');
    await evalCode(`(() => {
      const journey = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Honey journey'));
      if (journey) {
        journey.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    })()`);
    await delay(500);
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_02_honey_journey_timeline.png'),
      Buffer.from(shot2.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 3. Technical Proof Expanded & "What does verified mean?"
    // ─────────────────────────────────────────────────────────────
    console.log('3. Capturing Technical Proof Expanded...');
    await evalCode(`(() => {
      const btn = document.querySelector('.public-proof-toggle-btn');
      if (btn) btn.click();
    })()`);
    await delay(400);
    await evalCode(`(() => {
      const btn = document.querySelector('.public-proof-toggle-btn');
      if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await delay(500);
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_03_technical_proof_expanded.png'),
      Buffer.from(shot3.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 4. Verification Needs Review State (HC-2408)
    // ─────────────────────────────────────────────────────────────
    console.log('4. Capturing Needs Review State (HC-2408)...');
    await setScenario('HC-2408', false);
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_04_needs_review_state.png'),
      Buffer.from(shot4.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 5. In Progress / Not Verified State (HC-2412)
    // ─────────────────────────────────────────────────────────────
    console.log('5. Capturing In Progress / Not Verified State (HC-2412)...');
    await setScenario('HC-2412', false);
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_05_in_progress_state.png'),
      Buffer.from(shot5.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 6. Stale / Invalidated Historical State (HC-2401)
    // ─────────────────────────────────────────────────────────────
    console.log('6. Capturing Stale / Invalidated State (HC-2401)...');
    await setScenario('HC-2401', false);
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_06_stale_invalidated_state.png'),
      Buffer.from(shot6.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 7. Not Found State (INVALID-REF)
    // ─────────────────────────────────────────────────────────────
    console.log('7. Capturing Not Found Error State...');
    await setScenario('INVALID-REF', false);
    const shot7 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_07_not_found_error_state.png'),
      Buffer.from(shot7.result.data, 'base64')
    );

    // ─────────────────────────────────────────────────────────────
    // 8. Lookup Modal with QR Simulation
    // ─────────────────────────────────────────────────────────────
    console.log('8. Capturing Lookup Modal & QR Simulation...');
    await setScenario('HC-2409', false);
    await evalCode(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Look up') || b.innerText.includes('Verify another'));
      if (btn) btn.click();
    })()`);
    await delay(500);
    const shot8 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_08_lookup_modal_and_qr.png'),
      Buffer.from(shot8.result.data, 'base64')
    );

    // Close Lookup Modal with specific class
    await evalCode(`(() => {
      const closeBtn = document.querySelector('.public-lookup-modal-close-btn');
      if (closeBtn) closeBtn.click();
    })()`);
    await delay(400);

    // ─────────────────────────────────────────────────────────────
    // 9. Full Hash Modal Viewer
    // ─────────────────────────────────────────────────────────────
    console.log('9. Capturing Full Hash Modal Viewer...');
    await evalCode(`(() => {
      // Expand proof if not already open
      const btn = document.querySelector('.public-proof-toggle-btn');
      if (btn) btn.click();
    })()`);
    await delay(400);
    await evalCode(`(() => {
      // Click Expand button
      const expandBtn = document.querySelector('.public-hash-expand-btn');
      if (expandBtn) expandBtn.click();
    })()`);
    await delay(500);
    const shot9 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'screen28_09_full_hash_modal.png'),
      Buffer.from(shot9.result.data, 'base64')
    );

    console.log('All 9 Screen 28 scenarios successfully captured on existing browser tab!');
    ws.close();
  } catch (err) {
    console.error('CDP capture error:', err);
  }
}

run();
