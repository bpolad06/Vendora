import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.VENDORA_TEST_MODULES
    ? process.env.VENDORA_TEST_MODULES + '/playwright'
    : 'playwright',
);
const browser = await chromium.launch({
  executablePath:
    process.env.VENDORA_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const base = 'http://127.0.0.1:3000';
async function business(p = page) {
  return p.evaluate(async () => {
    const { useStore } = await import('/src/store/useStore.ts');
    const { products, orders, sellers, logs } = useStore.getState();
    return { products, orders, sellers, logs };
  });
}
async function login(role) {
  await page.goto(base + '/login');
  await page
    .getByRole('button', {
      name: { buyer: 'Alıcı', seller: 'Satıcı', admin: 'Admin' }[role],
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Daxil ol', exact: true }).click();
  await page.waitForURL(base + '/' + role);
}
async function logout() {
  await page.goto(base + '/');
  await page.getByRole('button', { name: 'Çıxış', exact: true }).click();
  await page.goto(base + '/login');
}
try {
  await fs.mkdir('qa', { recursive: true });
  await page.goto(base + '/');
  await page.getByRole('heading', { name: 'Bazarı kəşf edin' }).waitFor();
  await page
    .locator('img')
    .evaluateAll((images) => images.forEach((img) => (img.loading = 'eager')));
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.screenshot({ path: 'qa/marketplace-desktop.png', fullPage: true });
  const initial = await business();
  const p = initial.products.find(
    (p) => p.published && p.sellerId === 'vuqar' && p.stock >= p.minOrder,
  );
  assert.ok(p, 'published product exists');
  await page.goto(base + '/p/' + p.id);
  await page.getByLabel('Miqdar', { exact: true }).fill(String(p.minOrder));
  await page.getByRole('button', { name: 'Səbətə əlavə et', exact: true }).click();
  await page.goto(base + '/signup');
  await page.getByLabel('Ad və soyad', { exact: true }).fill('QA Alıcı');
  await page.getByLabel('E-poçt', { exact: true }).fill('qa-buyer@vendora.test');
  await page.getByLabel('Şifrə', { exact: true }).fill('Testing123!');
  await page.getByLabel('Şifrəni təkrarlayın', { exact: true }).fill('Testing123!');
  await page.getByRole('button', { name: 'Hesab yarat', exact: true }).click();
  await page.waitForURL(base + '/buyer');
  await page.goto(base + '/admin');
  await page.waitForURL(base + '/buyer');
  await page.goto(base + '/cart');
  await page.getByRole('button', { name: 'Sifarişi tamamla', exact: true }).click();
  await page.waitForURL(base + '/checkout');
  await page.getByLabel('Telefon', { exact: true }).fill('+994 50 123 45 67');
  await page.getByLabel('Ünvan', { exact: true }).fill('Bakı, Test küçəsi 12');
  await page.getByRole('button', { name: /Sifarişi təsdiqlə/ }).click();
  await page.waitForURL(/buyer\/orders\?success=1/);
  const bought = await business();
  const order = bought.orders.find((o) => o.customerName === 'QA Alıcı');
  assert.ok(order);
  assert.equal(bought.products.find((x) => x.id === p.id).stock, p.stock - p.minOrder);
  assert.equal(order.items[0].qty, p.minOrder);
  await page.reload();
  await page.getByText(order.number, { exact: true }).waitFor();
  console.log(
    'PASS: buyer signup, guest cart migration, checkout, stock decrease, persisted orders, buyer role protection',
  );
  await logout();
  await login('seller');
  await page.goto(base + '/admin');
  await page.waitForURL(base + '/seller');
  await page.goto(base + '/seller/orders');
  await page.getByLabel('Sifariş axtar').fill(order.number);
  await page.getByText(order.number, { exact: true }).waitFor();
  await page.getByLabel(order.number + ' statusu').selectOption('Hazırlanır');
  assert.equal((await business()).orders.find((o) => o.id === order.id).status, 'Hazırlanır');
  await page.goto(base + '/seller/products');
  await page.getByRole('button', { name: 'Yeni məhsul', exact: true }).click();
  await page.getByLabel('Məhsul adı', { exact: true }).fill('QA Şəkilli məhsul');
  await page.getByLabel('Satış qiyməti (₼)', { exact: true }).fill('12.50');
  await page.getByLabel('Alış qiyməti (₼)', { exact: true }).fill('8');
  await page.getByLabel('Stok', { exact: true }).fill('20');
  await page.locator('input[type=file]').setInputFiles('public/product-placeholder.svg');
  await page.getByRole('button', { name: 'Yadda saxla', exact: true }).click();
  await page.getByText('QA Şəkilli məhsul', { exact: true }).waitFor();
  const added = (await business()).products.find((x) => x.name === 'QA Şəkilli məhsul');
  assert.equal(added.sellerId, 'vuqar');
  assert.ok(added.image.startsWith('data:image/jpeg'));
  assert.equal(added.published, false);
  await page.getByRole('button', { name: 'QA Şəkilli məhsul satış statusu', exact: true }).click();
  const syncPage = await context.newPage();
  await syncPage.goto(base + '/search?q=QA%20Şəkilli');
  await syncPage.getByRole('heading', { name: 'QA Şəkilli məhsul', exact: true }).waitFor();
  await page.getByRole('button', { name: 'QA Şəkilli məhsul satış statusu', exact: true }).click();
  await syncPage.getByText('Axtarışınıza uyğun məhsul yoxdur.', { exact: true }).waitFor();
  await syncPage.close();
  console.log(
    'PASS: seller isolation, order status, product creation, photo upload, publish toggle, cross-tab sync',
  );
  await logout();
  await login('admin');
  await page.goto(base + '/admin/orders');
  await page.getByLabel('Sifariş axtar').fill(order.number);
  await page.getByLabel(order.number + ' statusu').selectOption('Ləğv edildi');
  const canceled = await business();
  assert.equal(canceled.products.find((x) => x.id === p.id).stock, p.stock);
  assert.equal(canceled.orders.find((x) => x.id === order.id).status, 'Ləğv edildi');
  await page.goto(base + '/admin/sellers');
  await page.getByRole('heading', { name: 'Satıcılar', exact: true }).waitFor();
  await page.goto(base + '/admin/users');
  await page.getByText('qa-buyer@vendora.test', { exact: true }).waitFor();
  await page.goto(base + '/admin');
  await page.screenshot({ path: 'qa/admin-desktop.png', fullPage: true });
  console.log('PASS: admin users/sellers, cancel restores stock, dynamic dashboard');
  await logout();
  await page.goto(base + '/signup?role=seller');
  await page.getByLabel('Ad və soyad', { exact: true }).fill('QA Satıcı');
  await page.getByLabel('Mağazanın adı', { exact: true }).fill('QA Yeni Mağaza');
  await page.getByLabel('E-poçt', { exact: true }).fill('qa-seller@vendora.test');
  await page.getByLabel('Şifrə', { exact: true }).fill('Testing123!');
  await page.getByLabel('Şifrəni təkrarlayın', { exact: true }).fill('Testing123!');
  await page.getByRole('button', { name: 'Hesab yarat', exact: true }).click();
  await page.waitForURL(base + '/seller');
  await page.goto(base + '/seller/products');
  await page.getByText('Məhsul yoxdur. İlk məhsulunuzu əlavə edin.', { exact: true }).waitFor();
  await page.goto(base + '/seller/profile');
  await page.getByLabel('Telefon', { exact: true }).fill('+994 55 222 33 44');
  await page.getByRole('button', { name: 'Yadda saxla', exact: true }).click();
  await page.getByText('Mağaza məlumatları yeniləndi.', { exact: true }).waitFor();
  console.log('PASS: seller signup creates isolated store and editable profile');
  await logout();
  await page.goto(base + '/login');
  await page.getByLabel('E-poçt', { exact: true }).fill('buyer@vendora.az');
  await page.getByLabel('Şifrə', { exact: true }).fill('wrongpassword');
  await page.getByRole('button', { name: 'Daxil ol', exact: true }).click();
  await page.getByText('E-poçt və ya şifrə yanlışdır.', { exact: true }).waitFor();
  await page.goto(base + '/admin');
  await page.waitForURL(base + '/login');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/');
  await page
    .locator('img')
    .evaluateAll((images) => images.forEach((img) => (img.loading = 'eager')));
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.screenshot({ path: 'qa/marketplace-mobile.png', fullPage: true });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  assert.equal(overflow, false, 'mobile has no horizontal overflow');
  assert.deepEqual(errors, [], 'no runtime exceptions');
  console.log(
    'PASS: invalid login, anonymous role protection, mobile layout, no runtime exceptions',
  );
  console.log('ALL CHECKS PASSED');
} finally {
  await browser.close();
}
