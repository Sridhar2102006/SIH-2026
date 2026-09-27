import fs from 'node:fs';

async function test() {
  const list = await (await fetch('http://localhost:9222/json')).json();
  const page = list.find(p => p.url.includes('5173'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) rej(msg.error);
        else res(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  // Enable Console and Runtime
  await send('Console.enable');
  await send('Runtime.enable');
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('JS EXCEPTION THROWN:', JSON.stringify(msg.params.exceptionDetails, null, 2));
    }
  });

  console.log('Waiting for .app-content to mount...');
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const chk = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector(".app-content") && document.querySelectorAll(".bottom-nav-inner .nav-item").length > 0)',
      returnByValue: true
    });
    if (chk.result.value) {
      console.log(`Mounted after ${(i+1)*200}ms`);
      break;
    }
  }

  // Click on "Ready to Ship" nav button
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('.bottom-nav-inner .nav-item'));
      const readyBtn = btns.find(b => b.textContent.includes('Ready'));
      if (readyBtn) {
        readyBtn.click();
        return 'Clicked Ready to Ship button';
      }
      return 'Ready button not found: ' + btns.map(b => b.textContent.trim()).join(', ');
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1000));

  const domCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const content = document.querySelector('.app-content');
      return {
        url: window.location.href,
        contentClasses: content ? content.className : null,
        childrenCount: content ? content.children.length : 0,
        innerHtmlSnippet: content ? content.innerHTML.substring(0, 500) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM check after click:', domCheck.result.value);

  const data = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/debug_dispatch_click.png', Buffer.from(data.data, 'base64'));
  console.log('Saved debug screenshot: scripts/debug_dispatch_click.png');

  ws.close();
}

test().catch(console.error);
