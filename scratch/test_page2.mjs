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
    // Reload page to get fresh bundle
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 1200));

    // Override viewport height to 1350px so Page 2 (1122.5px) is 100% visible inside viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1512,
      height: 1350,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Scroll Page 2 into view
    await send('Runtime.evaluate', {
      expression: 'document.querySelector(".fr02-page-2").scrollIntoView({ behavior: "instant", block: "start" })'
    });
    await new Promise(r => setTimeout(r, 300));

    // Get element bounds
    const boxRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = document.querySelector(".fr02-page-2");
        const r = p.getBoundingClientRect();
        const first = p.firstElementChild.getBoundingClientRect();
        const footer = p.lastElementChild.getBoundingClientRect();
        return {
          clip: { x: r.x, y: r.y, width: r.width, height: r.height },
          firstBottom: first.bottom - r.top,
          footerTop: footer.top - r.top,
          footerBottom: footer.bottom - r.top,
          pageHeight: r.height
        };
      })()`,
      returnByValue: true
    });

    const metrics = boxRes.result.value;
    console.log('Metrics:', metrics);

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, metrics.clip.x),
        y: Math.max(0, metrics.clip.y),
        width: metrics.clip.width,
        height: metrics.clip.height,
        scale: 1.5
      }
    });

    const outPath = '/Users/vanthiev/.gemini/antigravity-ide/brain/ad0961bf-e777-485b-a48e-d45cb26963e6/page_2_perfect.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved perfect screenshot to:', outPath);

    await send('Emulation.clearDeviceMetricsOverride');
    ws.close();
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
