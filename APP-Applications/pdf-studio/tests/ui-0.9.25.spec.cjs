const { test, expect } = require('@playwright/test');

test('PDF Studio 0.9.25 renders the functional UI', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e)));

  await page.goto('http://127.0.0.1:4173/APP-Applications/pdf-studio/app-0.9.25.html', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/0\.9\.25/);

  await page.locator('#home .card[data-tool="pdf"]').click();
  await expect(page.locator('#workspace')).toHaveClass(/active/);

  await expect(page.locator('#configSection0925')).toBeVisible();
  await expect(page.locator('#configSection0925 > summary')).toContainText('0. Configuration');
  await expect(page.locator('#quickDates0925 input[type="date"]')).toHaveCount(5);

  await expect(page.locator('#sourcePreset')).toHaveValue('manual');
  await expect(page.locator('#destinationPreset')).toHaveValue('manual');
  await expect(page.locator('#loadSourcePreset0925')).toBeVisible();
  await expect(page.locator('#loadDestinationPreset0925')).toBeVisible();
  await expect(page.locator('#loadDemoPreset')).toHaveCount(0);
  await expect(page.locator('.demoFilesBox')).toHaveCount(0);

  await expect(page.locator('#siteNav0925 a[href="../../"]')).toBeVisible();
  await expect(page.locator('#siteNav0925 a[href="../studios/"]')).toBeVisible();

  const resizer = page.locator('#sidebarResizer');
  await expect(resizer).toBeVisible();
  const box = await resizer.boundingBox();
  expect(box && box.width).toBeGreaterThan(0);

  await page.locator('#sideHidden0925').click();
  await expect(page.locator('#mainLayout')).toHaveClass(/sidebarHidden/);
  await page.locator('#sidebarShow0925').click();
  await expect(page.locator('#mainLayout')).not.toHaveClass(/sidebarHidden/);

  await page.locator('#fallbackOpenFiles').setInputFiles('/tmp/nlab-demo/files/demo-input/PDF/pdf-texte-actif.pdf');
  await expect(page.locator('#pageStrip .pageThumb')).toHaveCount(3, { timeout: 20000 });
  await expect(page.locator('#pageStrip .pageCheck0925')).toHaveCount(3);
  await expect(page.locator('#pageScopeBar0925')).toBeVisible();
  await expect(page.locator('#pageScope0925 option')).toHaveCount(3);

  await page.locator('#pageStrip .pageCheck0925').nth(0).check();
  await page.locator('#pageStrip .pageCheck0925').nth(1).check();
  await expect(page.locator('#scopeCount0925')).toContainText('2 / 3');
  await expect(page.locator('#pageScope0925')).toHaveValue('selected');

  await page.locator('#pageScope0925').selectOption('current');
  await expect(page.locator('#pageScope0925')).toHaveValue('current');
  await page.locator('#pageScope0925').selectOption('all');
  await expect(page.locator('#pageScope0925')).toHaveValue('all');

  await page.locator('#outputMode').selectOption('same-source');
  await page.locator('#activateOutputMode0925').click();
  await expect(page.locator('#outputState0925')).toContainText('Mode actif');
  await expect(page.locator('#destinationChoiceName')).toContainText('même dossier');

  await expect(page.locator('#namingSection0925')).toHaveCount(1);
  await expect(page.locator('#translationSection0925')).toHaveCount(1);

  expect(pageErrors, 'browser page errors').toEqual([]);
});
