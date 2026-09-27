import { chromium } from 'playwright';

const base = process.env.PDF_STUDIO_URL || 'http://127.0.0.1:8765/APP-Applications/pdf-studio/app-0.9.26.html';
const fixture = process.env.PDF_STUDIO_FIXTURE || '/tmp/pdf-studio-ui-contract.pdf';

function fail(message) {
  throw new Error(message);
}
async function visible(page, selector) {
  const loc = page.locator(selector);
  if (await loc.count() < 1) return false;
  return loc.first().isVisible();
}
async function expectVisible(page, selector, label) {
  if (!(await visible(page, selector))) fail(label + ' absent ou invisible : ' + selector);
}
async function expectValue(page, selector, expected, label) {
  const value = await page.locator(selector).inputValue();
  if (value !== expected) fail(label + ' : attendu ' + expected + ', obtenu ' + value);
}

const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push('console: ' + msg.text());
});

try {
  await page.goto(base, {waitUntil:'domcontentloaded', timeout:60000});
  try {
    await page.waitForSelector('#home', {state:'attached', timeout:15000});
  } catch (e) {
    const diag = await page.evaluate(() => ({
      title: document.title,
      err: document.querySelector('#err')?.innerText || '',
      body: (document.body?.innerText || '').slice(0,2400),
      readyState: document.readyState,
      scripts: [...document.scripts].map(s => s.src || s.id || 'inline').slice(-20)
    }));
    fail('Application non assemblée : '+JSON.stringify(diag));
  }
  if (!(await page.locator('#home').isVisible())) {
    const cls = await page.locator('#home').getAttribute('class');
    fail('Accueil présent mais invisible, class='+cls);
  }

  // Open PDF editor workspace.
  await page.locator('.card[data-tool="pdf"]').click();
  await page.waitForSelector('#workspace.view.active', {timeout:10000});

  // Static UI contract: these controls must exist before a PDF is loaded.
  await expectVisible(page, '#alpha0926Config', '0. Configuration');
  await expectVisible(page, '#personalConnect0926', 'Connexion / Espace personnel');
  await expectVisible(page, '#pageScopeBar0926', 'Barre de portée');
  await expectVisible(page, '#pagePreviewNav0926', 'Navigation vignettes');
  await expectVisible(page, '#thumbZoom0926', 'Zoom vignettes');
  await expectVisible(page, '#loadSourcePreset0926', 'Bouton Charger source');
  await expectVisible(page, '#loadDestinationPreset0926', 'Bouton Charger sortie');
  await expectVisible(page, '#activateOutputMode0926', 'Activation mode de sortie');
  await expectVisible(page, '#sidebarResizer', 'Poignée de largeur panneau gauche');
  await expectVisible(page, '#alpha0926MenuConnection', 'Menu Connexion');
  await expectVisible(page, '#alpha0926MenuTranslation', 'Menu Traduction');
  await expectVisible(page, '#alpha0926MenuStamp', 'Menu Tampons');
  await expectVisible(page, '#alpha0926_STAMP_DATE', 'Date du tampon');
  await expectVisible(page, '#alpha0926_DATE_A', 'Date A');
  await expectVisible(page, '#alpha0926_DATE_B', 'Date B');
  await expectVisible(page, '#alpha0926_DATE_C', 'Date C');
  await expectVisible(page, '#alpha0926_DATE_D', 'Date D');
  await expectValue(page, '#sourcePreset', 'manual', 'Source par défaut');
  await expectValue(page, '#destinationPreset', 'manual', 'Sortie par défaut');

  // Connection entry must remain actionable even before OAuth is configured.
  if (await page.locator('#personalConnect0926').isDisabled()) fail('Connexion désactivée');
  await page.locator('#personalConnect0926').click();
  await page.waitForTimeout(150);
  const configOpen = await page.locator('#alpha0926Config').evaluate(el => el.open === true);
  if (!configOpen) fail('La connexion n’ouvre pas 0. Configuration');
  const oauthVisible = await visible(page, '#alpha0926GoogleClientId');
  if (!oauthVisible) fail('Champ Client ID OAuth non accessible');

  // Load a synthetic multi-page PDF.
  await page.locator('#fallbackOpenFiles').setInputFiles(fixture);
  await page.waitForFunction(() => document.querySelectorAll('#pageStrip .pageThumb').length >= 10, null, {timeout:30000});
  await page.waitForTimeout(500);

  const thumbCount = await page.locator('#pageStrip .pageThumb').count();
  const checkCount = await page.locator('#pageStrip .pageSelectCheck0926').count();
  if (checkCount !== thumbCount) fail(`Cases vignettes : ${checkCount}/${thumbCount}`);

  // The checkbox must physically sit in the upper-left corner of every thumbnail.
  const geometry = await page.locator('#pageStrip .pageThumb').evaluateAll(thumbs => thumbs.map(t => {
    const c=t.querySelector('.pageSelectCheck0926');
    if(!c)return null;
    const tr=t.getBoundingClientRect(), cr=c.getBoundingClientRect();
    return {left:cr.left-tr.left, top:cr.top-tr.top, visible:getComputedStyle(c).display!=='none'&&getComputedStyle(c).visibility!=='hidden'};
  }));
  for (const [i,g] of geometry.entries()) {
    if (!g || !g.visible || g.left < -1 || g.left > 14 || g.top < -1 || g.top > 14) fail('Case page '+(i+1)+' mal positionnée : '+JSON.stringify(g));
  }

  // Multi-selection by checkboxes switches scope to selected.
  const checks = page.locator('#pageStrip .pageSelectCheck0926');
  await checks.nth(0).check();
  await checks.nth(2).check();
  await page.waitForTimeout(100);
  await expectValue(page, '#pageScopeSelect0926', 'selected', 'Portée après cases cochées');
  const info = await page.locator('#pageSelectionInfo0926').innerText();
  if (!/^2\s*\/\s*\d+/.test(info)) fail('Compteur de sélection incorrect : '+info);

  // All / none controls.
  await page.locator('#pageSelectAll0926').click();
  await page.waitForTimeout(100);
  const checkedAll = await page.locator('#pageStrip .pageSelectCheck0926:checked').count();
  if (checkedAll !== thumbCount) fail('Tout cocher : '+checkedAll+'/'+thumbCount);
  await page.locator('#pageClear0926').click();
  await page.waitForTimeout(100);
  const checkedNone = await page.locator('#pageStrip .pageSelectCheck0926:checked').count();
  if (checkedNone !== 0) fail('Tout décocher laisse '+checkedNone+' page(s)');

  // Explicit scope options.
  await page.locator('#pageScopeSelect0926').selectOption('all');
  await expectValue(page, '#pageScopeSelect0926', 'all', 'Portée tout le document');
  await page.locator('#pageScopeSelect0926').selectOption('current');
  await expectValue(page, '#pageScopeSelect0926', 'current', 'Portée page en cours');

  // Thumbnail zoom must actually enlarge the thumbnail.
  const widthBefore = await page.locator('#pageStrip .pageThumb').first().evaluate(el => el.getBoundingClientRect().width);
  await page.locator('#thumbZoomIn0926').click();
  await page.waitForTimeout(120);
  const widthAfter = await page.locator('#pageStrip .pageThumb').first().evaluate(el => el.getBoundingClientRect().width);
  if (!(widthAfter > widthBefore + 2)) fail('Zoom vignettes sans effet : '+widthBefore+' -> '+widthAfter);

  // Horizontal navigation must have an overflow and move it.
  const overflow = await page.locator('#pageStrip').evaluate(el => ({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollLeft:el.scrollLeft}));
  if (!(overflow.scrollWidth > overflow.clientWidth)) fail('Pas de débordement horizontal des vignettes : '+JSON.stringify(overflow));
  await page.locator('#pageStripRight0926').click();
  await page.waitForTimeout(500);
  const scrollAfter = await page.locator('#pageStrip').evaluate(el => el.scrollLeft);
  if (!(scrollAfter > 0)) fail('Navigation horizontale sans déplacement');

  // Sidebar collapse / restore and width drag.
  const side = page.locator('#sidebarPanel');
  const sideWidthBefore = await side.evaluate(el => el.getBoundingClientRect().width);
  const grip = page.locator('#sidebarResizer');
  const box = await grip.boundingBox();
  if (!box) fail('Poignée panneau sans géométrie');
  await page.mouse.move(box.x+box.width/2, box.y+80);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+90, box.y+80, {steps:5});
  await page.mouse.up();
  await page.waitForTimeout(100);
  const sideWidthAfter = await side.evaluate(el => el.getBoundingClientRect().width);
  if (!(sideWidthAfter > sideWidthBefore + 30)) fail('Redimensionnement panneau sans effet : '+sideWidthBefore+' -> '+sideWidthAfter);

  await page.locator('#sidebarCycle').click();
  await page.locator('#sidebarCycle').click();
  await page.waitForTimeout(100);
  const hidden = await page.locator('#mainLayout').evaluate(el => el.classList.contains('sidebarHidden'));
  if (!hidden) fail('Panneau gauche non masqué après cycle');
  await page.locator('#sidebarCycle').click();
  await page.waitForTimeout(100);
  const restored = await page.locator('#mainLayout').evaluate(el => !el.classList.contains('sidebarHidden'));
  if (!restored) fail('Panneau gauche non restauré');

  // Interface self-audit must report no red cross after PDF load.
  const audit = await page.locator('#alpha0926Audit').innerText();
  if (audit.includes('❌')) fail('Auto-contrôle interface en échec:\n'+audit);

  console.log(JSON.stringify({
    ok:true,
    thumbCount,
    checkCount,
    widthBefore,
    widthAfter,
    scrollAfter,
    sideWidthBefore,
    sideWidthAfter,
    audit
  }, null, 2));
} finally {
  if (errors.length) console.error(errors.join('\n'));
  await browser.close();
}
