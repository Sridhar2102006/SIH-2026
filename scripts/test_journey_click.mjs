async function test() {
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

  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btns = Array.from(document.querySelectorAll('.bottom-nav button')).map(b => b.textContent.trim());
        const jBtn = Array.from(document.querySelectorAll('.bottom-nav button')).find(b => b.textContent.includes('Journey'));
        if (jBtn) {
          jBtn.click();
          return { success: true, clicked: jBtn.textContent.trim(), all: btns };
        }
        return { success: false, all: btns };
      })()
    `,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result?.value);
  await new Promise(r => setTimeout(r, 600));

  const pageState = await send('Runtime.evaluate', {
    expression: `
      ({
        activeTab: document.querySelector('.bottom-nav button.active')?.textContent.trim(),
        title: document.querySelector('h1, h2')?.textContent.trim(),
        toast: document.querySelector('.toast, [role="alert"]')?.textContent.trim()
      })
    `,
    returnByValue: true
  });
  console.log('Page state:', pageState.result?.value);
  process.exit(0);
}
test();
