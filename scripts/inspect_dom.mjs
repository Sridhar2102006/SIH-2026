async function test() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const pageTarget = targets.find(t => t.url.includes('5173'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise(resolve => {
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

  const dom = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        hasRoot: Boolean(document.querySelector('.public-verification-root')),
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText, className: b.className })),
        h3s: Array.from(document.querySelectorAll('h3')).map(h => h.innerText)
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM state:', JSON.stringify(dom.result.value, null, 2));
  ws.close();
}

test().catch(console.error);
