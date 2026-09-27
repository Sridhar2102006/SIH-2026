import fs from 'node:fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const list = await (await fetch('http://localhost:9222/json')).json();
  const page = list.find(p => p.url.includes('5173'));
  if (!page) {
    console.error('No Vite dev page found on port 5173');
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

  const screenshot = async (filename) => {
    const data = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/${filename}`, Buffer.from(data.data, 'base64'));
    console.log(`[CDP] Saved screenshot: scripts/${filename}`);
  };

  const evalCode = async (expr) => {
    let code;
    if (expr.trim().startsWith('(() =>') || expr.trim().startsWith('(function')) {
      code = expr;
    } else if (expr.includes('const ') || expr.includes('let ') || expr.includes('var ') || expr.includes(';') || expr.includes('\n')) {
      code = `(() => {\n${expr}\n})()`;
    } else {
      code = `(() => {\nreturn (${expr});\n})()`;
    }
    const res = await send('Runtime.evaluate', { expression: code, returnByValue: true });
    if (res?.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails);
    }
    return res?.result?.value;
  };

  console.log('\n=== RUNNING MASTER DISPATCH / DISTRIBUTOR E2E VERIFICATION ===\n');

  // 1. Authenticate as Jordan Hayes (Master Dispatch & Fulfillment Lead)
  console.log('1. Setting authenticated session as Pure Distributor & Dispatch Lead...');
  await evalCode(`
    const dispatchSession = {
      userId: 'usr-jordan-hayes',
      name: 'Jordan Hayes',
      operator: 'Jordan Hayes',
      email: 'jordan.hayes@honeychain.dist',
      isAuthenticated: true,
      isOnboardingComplete: true,
      designations: ['DISTRIBUTOR'],
      capabilities: [
        'DISTRIBUTION_WORKSPACE',
        'DISPATCH_PLANNING',
        'PACKAGE_QR_VALIDATE',
        'SHIPMENT_CREATE',
        'SHIPMENT_RELEASE',
        'DELIVERY_TRACKING',
        'DELIVERY_CONFIRMATION',
        'BATCH_TRACEABILITY',
        'SHIPMENT_DISPATCH',
        'INVENTORY_MANAGEMENT',
        'PACKAGE_HONEY',
        'TRACEABILITY_VERIFICATION'
      ],
      workContexts: { areas: ['Finished Goods Staging Bay 3', 'Outbound Loading Dock'], handles: ['Cryptographic QR Scanners', 'Pallet Manifests', 'Cold-Chain Dispatch'] }
    };
    window.localStorage.setItem('honeychain_user_session', JSON.stringify(dispatchSession));
    window.location.hash = '#home';
  `);
  await send('Page.reload');

  // Wait until splash finishes and app content is mounted
  console.log('Waiting for application to mount...');
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    const hasMain = await evalCode(`Boolean(document.querySelector('.dispatch-home-container, .app-content') && document.querySelectorAll('.bottom-nav-inner .nav-item').length > 0)`);
    if (hasMain) {
      console.log(`Main application content mounted after ${(i+1)*250}ms`);
      break;
    }
  }
  await sleep(1000);

  // 2. Capture Dispatch Home Dashboard
  console.log('2. Inspecting Dispatch Home Dashboard ("What needs to leave today?")...');
  await screenshot('dispatch_01_home_dashboard.png');

  // 3. Inspect Composed Navigation Tabs
  console.log('3. Verifying composed navigation for pure Distributor user...');
  const navTabs = await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav-inner .nav-item')).map(el => el.textContent.trim()).filter(Boolean)
  `);
  console.log('Composed Navigation items:', navTabs);

  // 4. Click Ready to Ship Nav Button
  console.log('4. Navigating to Ready to Ship Queue via Navigation Tab...');
  await evalCode(`
    const btns = Array.from(document.querySelectorAll('.bottom-nav-inner .nav-item'));
    const readyBtn = btns.find(b => b.textContent.includes('Ready'));
    if (readyBtn) readyBtn.click();
  `);
  await sleep(1000);
  await screenshot('dispatch_02_ready_packages_queue.png');

  // 5. Open Physical QR Scanner Modal for PKG-2026-00125
  console.log('5. Opening Physical QR Scanner Modal for PKG-2026-00125...');
  await evalCode(`
    const revalBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Re-Validate QR') || b.textContent.includes('Scan Physical QR') || b.textContent.includes('Launch Physical QR'));
    if (revalBtn) revalBtn.click();
  `);
  await sleep(800);

  // Simulate scanning valid QR via test pill
  await evalCode(`
    const validBtn = document.querySelector('[data-test="scan-pill-valid"]');
    if (validBtn) validBtn.click();
  `);
  await sleep(1000);
  await screenshot('dispatch_03_physical_qr_scanner_valid.png');

  // 6. Test Mismatched QR (Wrong QR Test: Expecting PKG-2026-00125, but scanning wrong package PKG-2026-00118)
  console.log('6. Testing QR Mismatch protection...');
  await evalCode(`
    const mismatchBtn = document.querySelector('[data-test="scan-pill-mismatch"]');
    if (mismatchBtn) mismatchBtn.click();
  `);
  await sleep(1000);
  await screenshot('dispatch_04_scanner_mismatch_error.png');

  // Close scanner modal
  await evalCode(`
    const closeBtn = document.querySelector('[data-test="close-dispatch-scanner"]') || document.querySelector('.modal-header button');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(600);

  // 7. Open 6-Tier Traceability Lineage Modal
  console.log('7. Opening 6-Tier Traceability Lineage Modal for PKG-2026-00125...');
  await evalCode(`
    const traceBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Trace Lineage') || b.textContent.includes('Trace'));
    if (traceBtn) traceBtn.click();
  `);
  await sleep(800);
  await screenshot('dispatch_05_package_traceability_modal.png');

  // Close traceability modal
  await evalCode(`
    const closeBtn = document.querySelector('[data-test="close-package-traceability"]') || document.querySelector('.modal-header button');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(600);

  // 8. Navigate to Shipments Manifests (#shipments)
  console.log('8. Navigating to Shipments Manifests...');
  await evalCode(`
    const btns = Array.from(document.querySelectorAll('.bottom-nav-inner .nav-item'));
    const shipNavBtn = btns.find(b => b.textContent.includes('Shipments'));
    if (shipNavBtn) shipNavBtn.click();
  `);
  await sleep(1000);
  await screenshot('dispatch_06_shipments_manifests.png');

  // 9. Inspect Release Guard Checklist
  console.log('9. Scrolling Release Guard Checklist into view...');
  await evalCode(`
    const guardBox = document.querySelector('[data-test="release-guard-box"]');
    if (guardBox) guardBox.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await sleep(600);
  await screenshot('dispatch_07_release_guard_blocked.png');

  // 10. Navigate to Deliveries & Tracking (#deliveries)
  console.log('10. Navigating to Active Deliveries & Tracking (#deliveries)...');
  await evalCode(`
    const btns = Array.from(document.querySelectorAll('.bottom-nav-inner .nav-item'));
    const trackNavBtn = btns.find(b => b.textContent.includes('Tracking') || b.textContent.includes('Deliveries'));
    if (trackNavBtn) trackNavBtn.click();
  `);
  await sleep(1000);
  await screenshot('dispatch_08_deliveries_tracking_view.png');

  // 11. Open Proof of Delivery (POD) Modal
  console.log('11. Opening Proof of Delivery (POD) Modal...');
  await evalCode(`
    const podBtn = document.querySelector('[data-test="open-pod-modal"]');
    if (podBtn) podBtn.click();
  `);
  await sleep(800);
  await screenshot('dispatch_09_proof_of_delivery_modal.png');

  console.log('\n=== MASTER DISPATCH / DISTRIBUTOR VERIFICATION COMPLETE ===\n');
  ws.close();
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
