import fs from 'fs';

async function run() {
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
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  };

  console.log('Connecting to application and loading home dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(2500);

  // Close any overlay/modal if open
  await evalCode(`
    (() => {
      if (window.__closePublicVerification) window.__closePublicVerification();
      if (window.__closeProductScanner) window.__closeProductScanner();
      if (window.__closeProductQrManagement) window.__closeProductQrManagement();
      if (window.__closeProductPackaging) window.__closeProductPackaging();
    })()
  `);
  await sleep(1000);

  // Helper to switch persona using window.__setPersonaPreset or clicking pill
  const switchPersona = async (personaId) => {
    const result = await evalCode(`
      (() => {
        // Open persona switcher
        const pill = document.querySelector('.hv-persona-pill');
        if (pill) pill.click();
        return true;
      })()
    `);
    await sleep(600);

    const selectResult = await evalCode(`
      (() => {
        const btns = Array.from(document.querySelectorAll('.hv-persona-option'));
        const target = btns.find(b => {
          const text = b.textContent || '';
          if ('${personaId}' === 'PERSONA_A_BEEKEEPER' && text.includes('User A: Beekeeper')) return true;
          if ('${personaId}' === 'PERSONA_B_BEEKEEPER_PROCESSOR' && text.includes('User B: Beekeeper + Processor')) return true;
          if ('${personaId}' === 'PERSONA_C_PROCESSOR_QUALITY' && text.includes('User C: Processor + Quality')) return true;
          if ('${personaId}' === 'PERSONA_D_QUALITY_SPECIALIST' && text.includes('User D: Quality Specialist')) return true;
          if ('${personaId}' === 'PERSONA_E_QUALITY_VERIFICATION' && text.includes('User E: Quality + Verification')) return true;
          if ('${personaId}' === 'PERSONA_F_PROCESSOR_QUALITY_PACKAGING' && text.includes('User F: Processor + Quality + Packaging')) return true;
          if ('${personaId}' === 'PERSONA_G_DISTRIBUTION_TRACEABILITY' && text.includes('User G: Distribution + Traceability')) return true;
          if ('${personaId}' === 'PERSONA_H_FULLSTACK_OPERATOR' && text.includes('User H: Full-Stack Lead')) return true;
          if ('${personaId}' === 'PERSONA_I_ZERO_PERMISSIONS' && text.includes('User I: Zero-Permission')) return true;
          return false;
        });
        if (target) {
          target.click();
          return { found: true, text: target.textContent };
        }
        return { found: false };
      })()
    `);
    await sleep(1000);
    return selectResult;
  };

  const getDashboardState = async () => {
    return await evalCode(`
      (() => {
        const bodyText = document.body.innerText;
        const quickActions = Array.from(document.querySelectorAll('.hv-qa-lbl')).map(el => el.innerText.trim());
        const sectionTitles = Array.from(document.querySelectorAll('.hv-sec-title')).map(el => el.innerText.trim());
        const isZeroFallback = Boolean(document.querySelector('.hv-zero-perm-card'));
        const identityText = document.querySelector('.hv-pp-title')?.innerText || '';
        return {
          identityText,
          sectionTitles,
          quickActions,
          isZeroFallback,
          hasFieldModule: sectionTitles.includes('Field & Colonies'),
          hasProductionModule: sectionTitles.includes('Production & Batches'),
          hasQualityModule: sectionTitles.includes('Quality & Laboratory Purity'),
          hasFulfillmentModule: sectionTitles.includes('Fulfillment & Packaging'),
          hasTrustModule: sectionTitles.includes('Trust & Verification')
        };
      })()
    `);
  };

  console.log('--- TEST 1: User A (Beekeeper) ---');
  await switchPersona('PERSONA_A_BEEKEEPER');
  let state = await getDashboardState();
  console.log('User A state:', state);
  if (!state.hasFieldModule) throw new Error('User A must have Field & Colonies module');
  if (state.hasQualityModule) throw new Error('User A must NOT have Quality module');
  if (state.hasFulfillmentModule) throw new Error('User A must NOT have Fulfillment module');
  await saveShot('dynamic_dashboard_01_beekeeper');

  console.log('--- TEST 2: User B (Beekeeper + Processor) ---');
  await switchPersona('PERSONA_B_BEEKEEPER_PROCESSOR');
  state = await getDashboardState();
  console.log('User B state:', state);
  if (!state.hasFieldModule || !state.hasProductionModule) throw new Error('User B must have Field AND Production modules');
  if (state.hasQualityModule) throw new Error('User B must NOT have Quality module');
  await saveShot('dynamic_dashboard_02_beekeeper_processor');

  console.log('--- TEST 3: User C (Processor + Quality) ---');
  await switchPersona('PERSONA_C_PROCESSOR_QUALITY');
  state = await getDashboardState();
  console.log('User C state:', state);
  if (state.hasFieldModule) throw new Error('User C must NOT have Field & Colonies module');
  if (!state.hasProductionModule || !state.hasQualityModule) throw new Error('User C must have Production AND Quality modules');
  await saveShot('dynamic_dashboard_03_processor_quality');

  console.log('--- TEST 4: User D (Quality Specialist) ---');
  await switchPersona('PERSONA_D_QUALITY_SPECIALIST');
  state = await getDashboardState();
  console.log('User D state:', state);
  if (state.hasFieldModule) throw new Error('User D must NOT have Field & Colonies module');
  if (!state.hasQualityModule) throw new Error('User D must have Quality module');
  await saveShot('dynamic_dashboard_04_quality_specialist');

  console.log('--- TEST 5: User E (Quality + Verification) ---');
  await switchPersona('PERSONA_E_QUALITY_VERIFICATION');
  state = await getDashboardState();
  console.log('User E state:', state);
  if (!state.hasQualityModule || !state.hasTrustModule) throw new Error('User E must have Quality AND Trust modules');
  await saveShot('dynamic_dashboard_05_quality_verification');

  console.log('--- TEST 6: User F (Processor + Quality + Packaging) ---');
  await switchPersona('PERSONA_F_PROCESSOR_QUALITY_PACKAGING');
  state = await getDashboardState();
  console.log('User F state:', state);
  if (!state.hasProductionModule || !state.hasQualityModule || !state.hasFulfillmentModule) {
    throw new Error('User F must have Production, Quality, AND Fulfillment modules');
  }
  await saveShot('dynamic_dashboard_06_processor_quality_packaging');

  console.log('--- TEST 7: User G (Distribution + Traceability) ---');
  await switchPersona('PERSONA_G_DISTRIBUTION_TRACEABILITY');
  state = await getDashboardState();
  console.log('User G state:', state);
  if (!state.hasFulfillmentModule || !state.hasTrustModule) {
    throw new Error('User G must have Fulfillment and Trust modules');
  }
  await saveShot('dynamic_dashboard_07_distributor_traceability');

  console.log('--- TEST 8: User H (Full-Stack Lead) ---');
  await switchPersona('PERSONA_H_FULLSTACK_OPERATOR');
  state = await getDashboardState();
  console.log('User H state:', state);
  if (!state.hasFieldModule || !state.hasProductionModule || !state.hasQualityModule || !state.hasTrustModule) {
    throw new Error('User H must have synthesized all authorized modules');
  }
  await saveShot('dynamic_dashboard_08_fullstack_lead');

  console.log('--- TEST 9: User I (Zero-Permission Fallback) ---');
  await switchPersona('PERSONA_I_ZERO_PERMISSIONS');
  state = await getDashboardState();
  console.log('User I state:', state);
  if (!state.isZeroFallback) throw new Error('User I must display ZeroPermissionFallback');
  await saveShot('dynamic_dashboard_09_zero_permission_fallback');

  console.log('--- TEST 10: Open Persona Switcher Modal ---');
  await evalCode(`document.querySelector('.hv-zdh-btn')?.click() || document.querySelector('.hv-persona-pill')?.click()`);
  await sleep(600);
  await saveShot('dynamic_dashboard_10_persona_switcher_modal');

  console.log('ALL 10 DYNAMIC CAPABILITY-BASED DASHBOARD TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
