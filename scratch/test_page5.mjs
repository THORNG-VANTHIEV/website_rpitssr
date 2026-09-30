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
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 1200));

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1512,
      height: 1400,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Runtime.evaluate', {
      expression: 'document.querySelector(".fr02-page-5").scrollIntoView({ behavior: "instant", block: "start" })'
    });
    await new Promise(r => setTimeout(r, 300));

    const boxRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = document.querySelector(".fr02-page-5");
        if (!p) return { error: "Page 5 not found" };
        const r = p.getBoundingClientRect();
        const children = Array.from(p.children).map((c, i) => {
          const cr = c.getBoundingClientRect();
          return {
            index: i,
            className: c.className,
            top: cr.top - r.top,
            bottom: cr.bottom - r.top,
            height: cr.height,
            scrollHeight: c.scrollHeight,
            offsetHeight: c.offsetHeight
          };
        });
        return {
          clip: { x: r.x, y: r.y, width: r.width, height: r.height },
          children,
          pageScrollHeight: p.scrollHeight,
          pageOffsetHeight: p.offsetHeight
        };
      })()`,
      returnByValue: true
    });

    const metrics = boxRes.result.value;
    console.log('Metrics:', JSON.stringify(metrics, null, 2));

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, metrics.clip.x),
        y: Math.max(0, metrics.clip.y),
        width: metrics.clip.width,
        height: metrics.clip.height,
        scale: 1.0
      }
    });

    const outPath = '/Users/vanthiev/.gemini/antigravity-ide/brain/ad0961bf-e777-485b-a48e-d45cb26963e6/page_5_current.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to:', outPath);

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
