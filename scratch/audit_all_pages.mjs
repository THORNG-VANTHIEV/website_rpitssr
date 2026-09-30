import fs from 'fs';

async function run() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.url.includes('5173/apply?test_print=true')) || targets[0];
  console.log('Connecting to target:', pageTarget.url);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onopen = async () => {
    // Reload page to get latest code
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 1200));

    // Ensure printMode is 'all'
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ទាំងអស់'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const pages = [
      { selector: '.fr02-page-1', num: 1, isLandscape: false },
      { selector: '.fr02-page-2', num: 2, isLandscape: false },
      { selector: '.fr02-page-3', num: 3, isLandscape: true },
      { selector: '.fr02-page-4', num: 4, isLandscape: true },
      { selector: '.fr02-page-5', num: 5, isLandscape: false }
    ];

    const results = [];

    for (const p of pages) {
      // Set viewport appropriate for page
      await send('Emulation.setDeviceMetricsOverride', {
        width: p.isLandscape ? 1700 : 1512,
        height: p.isLandscape ? 1100 : 1400,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Runtime.evaluate', {
        expression: `document.querySelector("${p.selector}").scrollIntoView({ behavior: "instant", block: "start" })`
      });
      await new Promise(r => setTimeout(r, 300));

      const boxRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector("${p.selector}");
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            offsetHeight: el.offsetHeight
          };
        })()`,
        returnByValue: true
      });

      const metrics = boxRes.result.value;
      if (!metrics) {
        console.error(`Page ${p.num} not found with selector ${p.selector}`);
        continue;
      }

      console.log(`Page ${p.num} metrics:`, metrics);

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: Math.max(0, metrics.x),
          y: Math.max(0, metrics.y),
          width: metrics.width,
          height: metrics.height,
          scale: 1.0
        }
      });

      const outPath = `/Users/vanthiev/.gemini/antigravity-ide/brain/ad0961bf-e777-485b-a48e-d45cb26963e6/rendered_page-${p.num}.png`;
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved Page ${p.num} screenshot to: ${outPath}`);

      results.push({
        page: p.num,
        isLandscape: p.isLandscape,
        metrics,
        saved: outPath
      });
    }

    await send('Emulation.clearDeviceMetricsOverride');
    ws.close();
    console.log('Audit capture complete. Captured', results.length, 'pages.');
    process.exit(0);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  ws.onerror = (err) => {
    console.error('WS error:', err);
    process.exit(1);
  };
}

run();
