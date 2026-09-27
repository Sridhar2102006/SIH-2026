async function testModalFlow() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const evalCode = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return r.result?.value;
  };

  console.log('1. Checking current page...');
  const title1 = await evalCode('document.querySelector("h1")?.innerText');
  console.log('Current H1:', title1);

  // Navigate to Hives
  console.log('2. Navigating to Hives...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Hives'))?.click()
  `);
  await new Promise(r => setTimeout(r, 600));

  // Open Hive H001 Detail
  console.log('3. Clicking H001 card...');
  await evalCode(`
    document.querySelector('.bk-hive-box-card')?.click()
  `);
  await new Promise(r => setTimeout(r, 600));

  // Open Register Frame Modal
  console.log('4. Clicking Register Frame...');
  await evalCode(`
    document.querySelector('.bk-hd-add-frame-btn')?.click()
  `);
  await new Promise(r => setTimeout(r, 600));

  const modalOpen = await evalCode('Boolean(document.querySelector(".bk-modal-overlay"))');
  console.log('Modal is open:', modalOpen);

  // Close modal via close button
  console.log('5. Clicking modal close button...');
  await evalCode(`
    document.querySelector('.bk-close-btn')?.click()
  `);
  await new Promise(r => setTimeout(r, 600));

  const modalStillOpen = await evalCode('Boolean(document.querySelector(".bk-modal-overlay"))');
  console.log('Modal is still open:', modalStillOpen);

  // Click All Hives back button
  console.log('6. Clicking All hives back button...');
  await evalCode(`
    document.querySelector('.bk-hd-back')?.click()
  `);
  await new Promise(r => setTimeout(r, 600));

  const h1Back = await evalCode('document.querySelector("h1")?.innerText');
  console.log('H1 after back:', h1Back);

  // Click Inspections tab
  console.log('7. Clicking Inspections bottom nav...');
  await evalCode(`
    Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Inspections'))?.click()
  `);
  await new Promise(r => setTimeout(r, 600));

  const h1Insp = await evalCode('document.querySelector("h1")?.innerText');
  console.log('H1 after Inspections click:', h1Insp);

  process.exit(0);
}

testModalFlow();
