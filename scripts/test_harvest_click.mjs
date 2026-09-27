async function testHarvest() {
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

  // Navigate to Harvest tab
  await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Harvest'))?.click()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const check = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = Array.from(document.querySelectorAll('.bk-hcard-action')).find(b => b.textContent.includes('Record Harvest'));
        if (btn) {
          btn.click();
          return { found: true, text: btn.textContent.trim() };
        }
        return { found: false, allBtns: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()) };
      })()
    `,
    returnByValue: true
  });
  console.log('Record Harvest click:', check.result?.value);
  await new Promise(r => setTimeout(r, 600));

  const modal = await send('Runtime.evaluate', {
    expression: `
      ({
        overlay: Boolean(document.querySelector('.bk-modal-overlay')),
        title: document.querySelector('.bk-modal-title')?.textContent.trim()
      })
    `,
    returnByValue: true
  });
  console.log('Modal status:', modal.result?.value);
  process.exit(0);
}
testHarvest();
