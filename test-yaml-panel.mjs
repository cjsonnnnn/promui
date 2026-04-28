import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/tmp/pw-browsers/chromium-1217/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
page.setDefaultTimeout(60000);  // 60s timeout for slow operations

const consoleMsgs = [];
const errors = [];
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', err => errors.push(err.message));

console.log('=== Loading app ===');
await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);

console.log('Monaco present initially:', Boolean(await page.$('.monaco-editor')));

// Find collapse button in YamlPreview header (last button in justify-between header with 3+ span>button)
const findCollapseBtn = () => page.evaluateHandle(() => {
  const headers = document.querySelectorAll('[class*="justify-between"]');
  for (const header of headers) {
    const spans = header.querySelectorAll('span > button');
    if (spans.length >= 3) return spans[spans.length - 1];
  }
  return null;
});

const cb = (await findCollapseBtn()).asElement();
console.log('Collapse button found:', Boolean(cb));

console.log('\n=== TEST: Collapse YAML panel ===');
if (cb) {
  const t0 = Date.now();
  await cb.click();
  await page.waitForTimeout(1000);
  console.log(`Collapse click completed in ${Date.now() - t0}ms`);
  console.log('Monaco still in DOM after collapse:', Boolean(await page.$('.monaco-editor')));
  console.log('Expand button appeared:', Boolean(await page.$('button[title="Expand YAML Panel"]')));

  console.log('\n=== TEST: Expand YAML panel ===');
  const expBtn = await page.$('button[title="Expand YAML Panel"]');
  if (expBtn) {
    const t1 = Date.now();
    // Use evaluate to dispatch click directly (avoids Playwright's stability waiting)
    await page.evaluate(btn => btn.click(), expBtn);
    await page.waitForTimeout(3000);
    console.log(`Expand + 3s settle took ${Date.now() - t1}ms`);
    console.log('Monaco present after expand:', Boolean(await page.$('.monaco-editor')));
    console.log('Page responsive:', Boolean(await page.$('button:not([disabled])') ));

    // 2nd cycle
    console.log('\n=== TEST: 2nd collapse/expand cycle ===');
    const cb2 = (await findCollapseBtn()).asElement();
    if (cb2) {
      await page.evaluate(btn => btn.click(), cb2);
      await page.waitForTimeout(1000);
      const expBtn2 = await page.$('button[title="Expand YAML Panel"]');
      if (expBtn2) {
        await page.evaluate(btn => btn.click(), expBtn2);
        await page.waitForTimeout(3000);
        console.log('Monaco after 2nd expand:', Boolean(await page.$('.monaco-editor')));
        console.log('Page responsive after 2nd cycle:', Boolean(await page.$('button:not([disabled])')));
      }
    }
  } else {
    console.log('Expand button not found');
  }
}

if (errors.length) {
  console.log('\n=== Errors ===');
  errors.forEach(e => console.log('ERROR:', e));
} else {
  console.log('\nNo page errors.');
}

// Print last 10 console messages
const relevant = consoleMsgs.filter(m => !m.includes('[verbose]') && !m.includes('Download the React'));
if (relevant.length) {
  console.log('\n=== Last console messages ===');
  relevant.slice(-10).forEach(m => console.log(m));
}

await browser.close();
console.log('\n=== DONE ===');
