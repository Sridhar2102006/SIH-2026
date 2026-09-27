

async function test() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const pageTarget = targets.find(t => t.url.includes('5173'));
  console.log('Target:', pageTarget.title, pageTarget.url);
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

  const res1 = await send('Runtime.evaluate', {
    expression: 'Boolean(window.__openPublicVerification)',
    returnByValue: true
  });
  console.log('window.__openPublicVerification exists:', res1?.result?.value);

  const res2 = await send('Runtime.evaluate', {
    expression: 'window.__openPublicVerification("HC-2409")',
    returnByValue: true
  });
  console.log('Called openPublicVerification');

  await new Promise(r => setTimeout(r, 600));

  const res3 = await send('Runtime.evaluate', {
    expression: 'document.querySelector(".public-verification-root") !== null',
    returnByValue: true
  });
  console.log('public-verification-root exists now:', res3?.result?.value);

  ws.close();
}

test().catch(console.error);
