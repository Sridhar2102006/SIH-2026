import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.url.includes('5173'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
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

  const state = await send('Runtime.evaluate', {
    expression: `({
      url: window.location.href,
      hasPublicVerificationRoot: Boolean(document.querySelector('.public-verification-root')),
      hasAppViewport: Boolean(document.querySelector('.app-viewport')),
      topBarTitle: document.querySelector('.topbar-title')?.textContent,
      bodyTextSnippet: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 300)
    })`,
    returnByValue: true
  });
  console.log('App state:', state?.result?.value);
  ws.close();
}

run().catch(console.error);
