import { createCanvas, Image } from 'canvas';
import { expect } from 'chai';

function setupBrowserEnv() {
  global.window = {};
  global.document = {
    createElement(tag) {
      if (tag === 'canvas') {
        return createCanvas(0, 0);
      }
      throw new Error('Unsupported element ' + tag);
    }
  };
  global.Image = Image;
}

function teardownBrowserEnv() {
  delete global.window;
  delete global.document;
  delete global.Image;
}

function makeImage(drawFn) {
  const canvas = createCanvas(10, 10);
  const ctx = canvas.getContext('2d');
  drawFn(ctx);
  return canvas.toBuffer('image/png');
}

describe('Node vs Browser hitmap', function() {
  const variations = {
    solid: makeImage(ctx => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0,0,10,10);
    }),
    circle: makeImage(ctx => {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(5,5,3,0,2*Math.PI);
      ctx.fill();
    }),
    diagonal: makeImage(ctx => {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(10,10);
      ctx.stroke();
    })
  };

  const results = [];

  for (const [name, buffer] of Object.entries(variations)) {
    it(`should produce same hitmap for ${name}`, async function() {
      const { createHitMap: nodeCreate } = await import('../dist/index.esm.js?node');
      const nodeMap = await nodeCreate(buffer, { base64Output: false });

      setupBrowserEnv();
      const { createHitMap: browserCreate } = await import('../dist/index.esm.js?browser');
      const browserMap = await browserCreate('data:image/png;base64,' + buffer.toString('base64'), { base64Output: false });
      teardownBrowserEnv();

      results.push({
        image: name,
        browser: Buffer.from(browserMap).toString('base64'),
        node: Buffer.from(nodeMap).toString('base64'),
        same: Buffer.compare(Buffer.from(browserMap), Buffer.from(nodeMap)) === 0
      });

      expect(Buffer.from(browserMap)).to.deep.equal(Buffer.from(nodeMap));
    });
  }

  after(() => {
    console.log('\nResults');
    console.log('| image | browser bitmap | node hitmap | isBrowserSameAsNode? |');
    console.log('|-------|----------------|-------------|----------------------|');
    for (const r of results) {
      console.log(`| ${r.image} | ${r.browser} | ${r.node} | ${r.same} |`);
    }
  });
});
