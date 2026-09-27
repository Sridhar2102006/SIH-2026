async function testWS() {
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

  const r1 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.querySelector('.bk-ws-launch-link');
        if (btn) {
          btn.click();
          return 'Clicked .bk-ws-launch-link';
        }
        const b2 = document.querySelector('.bk-insp-btn');
        if (b2) {
          b2.click();
          return 'Clicked .bk-insp-btn';
        }
        return 'Neither found';
      })()
    `,
    returnByValue: true
  });
  console.log('Click result:', r1.result?.value);
  await new Promise(r => setTimeout(r, 600));

  const modalCheck = await send('Runtime.evaluate', {
    expression: `
      ({
        overlay: Boolean(document.querySelector('.bk-modal-overlay')),
        wsTitle: document.querySelector('.bk-modal-title')?.textContent.trim()
      })
    `,
    returnByValue: true
  });
  console.log('Modal Check:', modalCheck.result?.value);
  process.exit(0);
}
testWS();
