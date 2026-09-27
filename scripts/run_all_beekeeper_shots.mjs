import fs from 'fs';

async function runMasterVerification() {
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

  console.log('1. Ensuring Beekeeper persona...');
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

  console.log('2. Navigating to Home...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Home'))?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_01_home...');
  await saveShot('beekeeper_01_home');

  console.log('3. Navigating to Hives list...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Hives'))?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_02_hives_list...');
  await saveShot('beekeeper_02_hives_list');

  console.log('4. Navigating to Apiary Yards...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-subnav-btn')).find(b => b.textContent.includes('Apiary'))?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_03_apiaries_list...');
  await saveShot('beekeeper_03_apiaries_list');

  console.log('5. Viewing AP1 Apiary Detail...');
  await evalCode(`
    document.querySelector('.bk-ap-card')?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_04_apiary_detail...');
  await saveShot('beekeeper_04_apiary_detail');

  console.log('6. Returning to Hives and opening Hive H001 Detail...');
  await evalCode(`
    document.querySelector('.bk-ap-back')?.click()
  `);
  await sleep(300);
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-subnav-btn')).find(b => b.textContent.includes('Hive Boxes'))?.click()
  `);
  await sleep(300);
  await evalCode(`
    document.querySelector('.bk-hive-box-card')?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_05_hive_detail...');
  await saveShot('beekeeper_05_hive_detail');

  console.log('7. Opening Register Frame Modal...');
  await evalCode(`
    document.querySelector('.bk-hd-add-frame-btn')?.click()
  `);
  await sleep(500);
  console.log('Capturing beekeeper_06_register_frame_modal...');
  await saveShot('beekeeper_06_register_frame_modal');

  console.log('8. Advancing to Register Frame Verify (Step 4)...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(300);
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(300);
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-frame-pill')).find(p => p.textContent.includes('F8'))?.click()
  `);
  await sleep(300);
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(500);
  console.log('Capturing beekeeper_07_register_frame_verify...');
  await saveShot('beekeeper_07_register_frame_verify');

  console.log('9. Closing Register Frame Modal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('10. Opening Frame Detail Modal...');
  await evalCode(`document.querySelector('.bk-hd-frame-card')?.click()`);
  await sleep(500);
  console.log('Capturing beekeeper_08_frame_detail...');
  await saveShot('beekeeper_08_frame_detail');

  console.log('11. Closing Frame Detail Modal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('12. Returning to Hives list...');
  await evalCode(`document.querySelector('.bk-hd-back')?.click()`);
  await sleep(300);

  console.log('13. Navigating to Inspections Tab...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Inspections'))?.click()
  `);
  await sleep(700);
  console.log('Capturing beekeeper_09_inspections_view...');
  await saveShot('beekeeper_09_inspections_view');

  console.log('14. Opening AI Health Scan Workstation...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-insp-btn, .bk-ws-launch-link')).find(b => b.textContent.toLowerCase().includes('workstation'))?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_10_workstation_position...');
  await saveShot('beekeeper_10_workstation_position');

  console.log('15. Capturing frame and running AI Analysis...');
  await evalCode(`document.querySelector('.bk-ws-capture-btn')?.click()`);
  await sleep(500);
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-ws-controls button')).find(b => b.textContent.includes('Analyze'))?.click()
  `);
  await sleep(1800);
  console.log('Capturing beekeeper_11_workstation_ai_result...');
  await saveShot('beekeeper_11_workstation_ai_result');

  console.log('16. Closing AI Workstation...');
  await evalCode(`
    document.querySelector('.bk-ws-viewport .bk-close-btn, .bk-ws-overlay .bk-close-btn, .bk-modal-overlay .bk-close-btn')?.click()
  `);
  await sleep(400);

  console.log('17. Navigating to Harvest Tab...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Harvest'))?.click()
  `);
  await sleep(700);
  console.log('Capturing beekeeper_12_harvest_view...');
  await saveShot('beekeeper_12_harvest_view');

  console.log('18. Opening Record Harvest Modal...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-hcard-action')).find(b => b.textContent.includes('Record Harvest'))?.click()
  `);
  await sleep(600);
  // Advance to Details
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(300);
  // Advance to Confirm
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-next-btn')?.click()`);
  await sleep(500);
  console.log('Capturing beekeeper_13_harvest_confirm...');
  await saveShot('beekeeper_13_harvest_confirm');

  console.log('19. Closing Harvest Modal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('20. Opening Submit to Processor Modal...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bk-action-callout button, .bk-hcard-action')).find(b => b.textContent.includes('Submit for Processing') || b.textContent.includes('Submit to Processor'))?.click()
  `);
  await sleep(600);
  console.log('Capturing beekeeper_14_submit_processor_modal...');
  await saveShot('beekeeper_14_submit_processor_modal');

  console.log('21. Closing Submit Modal...');
  await evalCode(`document.querySelector('.bk-modal-overlay .bk-close-btn')?.click()`);
  await sleep(400);

  console.log('22. Navigating to My Honey Journey Tab...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Journey'))?.click()
  `);
  await sleep(700);
  console.log('Capturing beekeeper_15_honey_journey_view...');
  await saveShot('beekeeper_15_honey_journey_view');

  console.log('=== ALL 15 MASTER BEEKEEPER SCREENSHOTS CAPTURED PERFECTLY! ===');
  process.exit(0);
}

runMasterVerification().catch(err => {
  console.error('Master verification error:', err);
  process.exit(1);
});
