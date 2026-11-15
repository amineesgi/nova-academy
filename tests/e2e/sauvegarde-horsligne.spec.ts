import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { answerCurrent, createProfile, startMission } from './helpers';

test('une sauvegarde exportée se restaure sur un autre ordinateur (nouveau navigateur)', async ({ page, browser }) => {
  await createProfile(page, 'ce2', 'Lina');
  await page.goto('./#/parent');
  await page.getByLabel('Code (4 chiffres)').fill('4321');
  await page.getByLabel('Confirmez le code').fill('4321');
  await page.getByRole('button', { name: /Créer le code/ }).click();
  await page.getByRole('link', { name: /Sauvegardes/ }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter tous les profils' }).click()]);
  const file = await download.path();
  const json = JSON.parse(readFileSync(file!, 'utf8'));
  expect(json.format).toBe('nova-academy-backup');
  expect(json.data.profiles[0].name).toBe('Lina');

  // « Autre ordinateur » : un contexte de navigateur vierge.
  const ctx = await browser.newContext({ baseURL: 'http://localhost:4173/nova-academy/' });
  const other = await ctx.newPage();
  await other.goto('./#/parent');
  await other.getByLabel('Code (4 chiffres)').fill('1111');
  await other.getByLabel('Confirmez le code').fill('1111');
  await other.getByRole('button', { name: /Créer le code/ }).click();
  await other.getByRole('link', { name: /Sauvegardes/ }).click();
  await other.locator('input[type=file]').setInputFiles(file!);
  await expect(other.getByText(/Profils trouvés : Lina/)).toBeVisible();
  await other.getByRole('button', { name: 'Importer', exact: true }).click();
  await expect(other.getByText('Sauvegarde importée avec succès.')).toBeVisible();
  await other.goto('./');
  await expect(other.getByText('Lina')).toBeVisible();

  // Un fichier invalide est refusé avec un message clair.
  await other.goto('./#/parent/sauvegardes');
  await other.getByLabel('Code (4 chiffres)').fill('1111');
  await other.getByRole('button', { name: 'Entrer' }).click();
  await other.locator('input[type=file]').setInputFiles({ name: 'faux.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(other.getByText(/n’est pas une sauvegarde Nova Academy/)).toBeVisible();
  await ctx.close();
});

test('l’application fonctionne sans Internet après la première visite', async ({ page, context }) => {
  await page.goto('./');
  // Attend que le service worker ait tout mis en cache.
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return !!reg?.active;
  }, undefined, { timeout: 60_000 });
  await page.waitForFunction(async () => (await caches.keys()).some((k) => k.includes('precache')), undefined, { timeout: 60_000 });
  // La page doit être contrôlée par le service worker (après son activation).
  await expect(async () => {
    await page.reload();
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  }).toPass({ timeout: 60_000 });
  await createProfile(page, 'cm2', 'Hors-ligne');

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Hors-ligne/ })).toBeVisible();
  // Leçon + exercice + correction + sauvegarde, sans réseau
  await startMission(page);
  for (let i = 0; i < 12 && !(await page.getByRole('button', { name: 'Valider' }).isVisible().catch(() => false)); i++) {
    await page.getByRole('button', { name: /^(Suivant|Je m’entraîne)/ }).first().click();
  }
  await answerCurrent(page);
  await expect(page.getByRole('button', { name: /Question suivante|Voir mon bilan/ })).toBeVisible();
  // Audio local disponible hors ligne
  const audioOk = await page.evaluate(async () => {
    const list = (await (await fetch('audio/manifest.json')).json()) as string[];
    const r = await fetch(`audio/${list[0]}.mp3`);
    return r.ok && (await r.arrayBuffer()).byteLength > 1000;
  });
  expect(audioOk).toBe(true);
  // Les mini-jeux s'ouvrent hors ligne
  await page.goto('./#/');
  await page.getByText('Hors-ligne').click();
  await page.getByRole('link', { name: /Jeux/ }).click();
  await page.getByRole('link', { name: /Le défi des fractions/ }).click();
  await expect(page.getByRole('button', { name: 'Valider' })).toBeVisible();
  await context.setOffline(false);
});

test('un profil enregistré par une ancienne version reste compatible', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('nova-academy');
        req.onsuccess = () => {
          const tx = req.result.transaction('profiles', 'readwrite');
          // Profil minimal (champs ajoutés plus tard absents)
          tx.objectStore('profiles').put({ id: 'ancien-1', level: 'ce2', name: 'Ancienne', createdAt: '2026-09-01T08:00:00.000Z', avatar: { skin: 0, hair: 1, hairColor: 0, outfit: 0, accessory: null, background: 0 }, mascot: 'pip', theme: 'jardin', rewards: { xp: 120, stars: 5, badges: [], cosmetics: [] }, diagnosticDone: true });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      }),
  );
  await page.reload();
  await page.getByText('Ancienne').click();
  await expect(page.getByRole('heading', { name: /Ancienne/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Lancer la mission/ })).toBeVisible();
});
