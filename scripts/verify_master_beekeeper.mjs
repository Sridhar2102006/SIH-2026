import fs from 'fs';

async function run() {
  console.log('Connecting to browser CDP on port 9222...');
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  if (!page) {
    console.error('No page target found on 5173');
    process.exit(1);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const saveShot = async (name) => {
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.data, 'base64');
    fs.writeFileSync(`scripts/${name}.png`, buffer);
    console.log(`Saved scripts/${name}.png`);
  };

  const evalCode = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return r.result?.value;
  };

  console.log('1. Setting persona to pure Beekeeper in localStorage...');
  await evalCode(`
    (function() {
      const sess = {
        userId: 'usr-sarah-lindqvist',
        name: 'Sarah Lindqvist',
        operator: 'Sarah Lindqvist',
        email: 'sarah@meadowbrook.org',
        isAuthenticated: true,
        isOnboardingComplete: true,
        designations: ['BEEKEEPER'],
        capabilities: [
          'HIVE_MANAGEMENT',
          'HIVE_MONITORING',
          'HIVE_INSPECTION',
          'HIVE_IMAGE_CAPTURE',
          'BEE_HEALTH_SCAN',
          'CONNECTED_HIVE_MONITORING',
          'HONEY_COLLECTION',
          'COLLECTION_BATCH_LINK',
          'BATCH_TRACEABILITY'
        ],
        workContexts: { areas: ['field'], handles: ['hives', 'frames'] }
      };
      localStorage.setItem('honeychain_user_session', JSON.stringify(sess));
      localStorage.setItem('honeychain_auth_session', JSON.stringify(sess));
    })()
  `);

  console.log('2. Navigating to root / and waiting for startup...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  for (let i = 0; i < 40; i++) {
    const hasNav = await evalCode(`Boolean(document.querySelector('.bottom-nav'))`);
    if (hasNav) break;
    await sleep(250);
  }
  await sleep(600);

  // 1. Beekeeper Home
  console.log('3. Capturing Beekeeper Home...');
  await saveShot('beekeeper_01_home');

  const navTabs = await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav .nav-label')).map(el => el.textContent.trim())
  `);
  console.log('Composed Navigation Tabs:', navTabs);

  // 2. Hives Tab
  console.log('4. Navigating to Hives & Apiaries...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Hives'));
    if (btn) btn.click();
  `);
  await sleep(700);
  await saveShot('beekeeper_02_hives_list');

  // 3. Apiary Yards Subtab
  console.log('5. Viewing Apiary Yards...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('.bk-subnav-btn')).find(b => b.textContent.includes('Apiary'));
    if (btn) btn.click();
  `);
  await sleep(600);
  await saveShot('beekeeper_03_apiaries_list');

  // 4. AP1 Apiary Detail
  console.log('6. Viewing AP1 Apiary Detail...');
  await evalCode(`
    const apCard = document.querySelector('.bk-ap-card');
    if (apCard) apCard.click();
  `);
  await sleep(600);
  await saveShot('beekeeper_04_apiary_detail');

  // 5. Back to Hives and open Hive H001 Detail
  console.log('7. Opening Hive H001 Detail...');
  await evalCode(`
    const backBtn = document.querySelector('.bk-ap-back');
    if (backBtn) backBtn.click();
  `);
  await sleep(400);
  await evalCode(`
    const hivesBtn = Array.from(document.querySelectorAll('.bk-subnav-btn')).find(b => b.textContent.includes('Hive Boxes'));
    if (hivesBtn) hivesBtn.click();
  `);
  await sleep(400);
  await evalCode(`
    const hiveCard = document.querySelector('.bk-hive-box-card');
    if (hiveCard) hiveCard.click();
  `);
  await sleep(700);
  await saveShot('beekeeper_05_hive_detail');

  // 6. Open Register Frame modal from Hive Detail
  console.log('8. Opening Register Frame Modal...');
  await evalCode(`
    const regBtn = document.querySelector('.bk-hd-add-frame-btn');
    if (regBtn) regBtn.click();
  `);
  await sleep(600);
  await saveShot('beekeeper_06_register_frame_modal');

  // Step 1 -> Step 2
  await evalCode(`
    const nextBtn = document.querySelector('.bk-next-btn');
    if (nextBtn) nextBtn.click();
  `);
  await sleep(400);
  // Step 2 -> Step 3
  await evalCode(`
    const nextBtn = document.querySelector('.bk-next-btn');
    if (nextBtn) nextBtn.click();
  `);
  await sleep(400);
  // Step 3: Pick F8
  await evalCode(`
    const fPill = Array.from(document.querySelectorAll('.bk-frame-pill')).find(p => p.textContent.includes('F8'));
    if (fPill) fPill.click();
  `);
  await sleep(400);
  // Step 3 -> Step 4 (Verify)
  await evalCode(`
    const nextBtn = document.querySelector('.bk-next-btn');
    if (nextBtn) nextBtn.click();
  `);
  await sleep(400);
  await saveShot('beekeeper_07_register_frame_verify');

  // Close Register Modal
  await evalCode(`
    const closeBtn = document.querySelector('.bk-modal-overlay .bk-close-btn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(400);

  // 7. Open Frame Detail Modal
  console.log('9. Opening Frame Detail Modal...');
  await evalCode(`
    const frameCard = document.querySelector('.bk-hd-frame-card');
    if (frameCard) frameCard.click();
  `);
  await sleep(600);
  await saveShot('beekeeper_08_frame_detail');

  // Close Frame Detail Modal
  await evalCode(`
    const closeBtn = document.querySelector('.bk-modal-overlay .bk-close-btn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(400);

  // Navigate to Inspections tab
  console.log('10. Navigating to Inspections Tab...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Inspections'));
    if (btn) btn.click();
  `);
  await sleep(700);
  await saveShot('beekeeper_09_inspections_view');

  // 8. Open AI Health Scan Workstation
  console.log('11. Opening AI Health Scan Workstation...');
  await evalCode(`
    const wsBtn = Array.from(document.querySelectorAll('.bk-insp-btn, .bk-ws-launch-link')).find(b => b.textContent.includes('Workstation') || b.textContent.includes('workstation'));
    if (wsBtn) wsBtn.click();
  `);
  await sleep(600);
  await saveShot('beekeeper_10_workstation_position');

  // Capture frame
  console.log('12. Capturing frame in Workstation...');
  await evalCode(`
    const capBtn = document.querySelector('.bk-ws-capture-btn');
    if (capBtn) capBtn.click();
  `);
  await sleep(500);

  // Run AI analysis
  await evalCode(`
    const anBtn = Array.from(document.querySelectorAll('.bk-ws-controls button')).find(b => b.textContent.includes('Analyze'));
    if (anBtn) anBtn.click();
  `);
  await sleep(1800);
  await saveShot('beekeeper_11_workstation_ai_result');

  // Close workstation
  await evalCode(`
    const closeBtn = document.querySelector('.bk-ws-viewport .bk-close-btn, .bk-ws-overlay .bk-close-btn, .bk-modal-overlay .bk-close-btn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(400);

  // 9. Navigate to Harvest tab
  console.log('13. Navigating to Harvest Tab...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Harvest'));
    if (btn) btn.click();
  `);
  await sleep(700);
  await saveShot('beekeeper_12_harvest_view');

  // Open Record Harvest Modal
  console.log('14. Opening Record Harvest Modal...');
  await evalCode(`
    const harvBtn = Array.from(document.querySelectorAll('.bk-hcard-action')).find(b => b.textContent.includes('Record Harvest'));
    if (harvBtn) harvBtn.click();
  `);
  await sleep(600);
  // Advance to details
  await evalCode(`
    const nextBtn = document.querySelector('.bk-modal-overlay .bk-next-btn');
    if (nextBtn) nextBtn.click();
  `);
  await sleep(400);
  // Advance to confirm
  await evalCode(`
    const nextBtn = document.querySelector('.bk-modal-overlay .bk-next-btn');
    if (nextBtn) nextBtn.click();
  `);
  await sleep(400);
  await saveShot('beekeeper_13_harvest_confirm');

  // Close harvest modal
  await evalCode(`
    const closeBtn = document.querySelector('.bk-modal-overlay .bk-close-btn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(400);

  // Open Submit to Processor Modal
  console.log('15. Opening Submit to Processor Modal...');
  await evalCode(`
    const subBtn = Array.from(document.querySelectorAll('.bk-action-callout button, .bk-hcard-action')).find(b => b.textContent.includes('Submit to Processor') || b.textContent.includes('Submit for Processing'));
    if (subBtn) subBtn.click();
  `);
  await sleep(600);
  await saveShot('beekeeper_14_submit_processor_modal');

  // Close submit modal
  await evalCode(`
    const closeBtn = document.querySelector('.bk-modal-overlay .bk-close-btn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(400);

  // 10. Navigate to My Honey Journey
  console.log('16. Navigating to My Honey Journey...');
  await evalCode(`
    const btn = Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Journey'));
    if (btn) btn.click();
  `);
  await sleep(700);
  await saveShot('beekeeper_15_honey_journey_view');

  console.log('ALL BEEKEEPER SCREENSHOT VERIFICATIONS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
