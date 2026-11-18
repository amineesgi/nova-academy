import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { answerCurrent, createProfile, playSession, startMission } from './helpers';

async function dbDump(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ profiles: { id: string; level: string; name: string; rewards: { xp: number } }[]; records: { profileId: string; skillId: string }[]; attempts: { profileId: string; skillId: string }[] }>((resolve, reject) => {
        const req = indexedDB.open('nova-academy');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const tx = req.result.transaction(['profiles', 'skillRecords', 'attempts'], 'readonly');
          const p = tx.objectStore('profiles').getAll();
          const r = tx.objectStore('skillRecords').getAll();
          const a = tx.objectStore('attempts').getAll();
          tx.oncomplete = () => resolve({ profiles: p.result, records: r.result, attempts: a.result });
        };
      }),
  );
}

// Première compétence de chaque matière du CM1 (accessible sans prérequis).
const FIRST_BY_SUBJECT = ['cm1-fr-comprehension', 'cm1-ma-num', 'cm1-en-hello', 'cm1-hi-reperes', 'cm1-geo-reperes', 'cm1-sc-matiere', 'cm1-emc-citoyennete', 'cm1-art-oeuvres'];

test('CM1 : accueil à trois parcours, création de profil, univers du Royaume des Inventeurs', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Le Jardin des Savoirs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le Royaume des Inventeurs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'L’Académie des Explorateurs' })).toBeVisible();
  await createProfile(page, 'cm1', 'Noa');
  await expect(page.getByText('CM1 · Niveau 1')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le Royaume des Inventeurs' })).toBeVisible();
  await expect(page.getByRole('group', { name: /Carte de Le Royaume des Inventeurs/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Cogi/ }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('atelier');
});

test('CM1 : mission complète, progression, récompenses, statistiques parentales et sauvegarde', async ({ page }) => {
  await createProfile(page, 'cm1', 'Inès');
  await startMission(page);
  await playSession(page, /Mission accomplie/);
  await expect(page.getByText(/\+\d+ XP/)).toBeVisible();
  await page.getByRole('button', { name: /Retour à la carte/ }).click();
  await expect(page.getByText('Accomplie', { exact: true })).toBeVisible();

  const db = await dbDump(page);
  const ines = db.profiles.find((p) => p.name === 'Inès')!;
  expect(ines.level).toBe('cm1');
  expect(ines.rewards.xp).toBeGreaterThan(0);
  const skills = db.records.filter((r) => r.profileId === ines.id).map((r) => r.skillId);
  expect(skills.length).toBeGreaterThan(0);
  expect(skills.every((s) => s.startsWith('cm1-'))).toBe(true);

  // Trésors : les points et badges sont visibles
  await page.getByRole('link', { name: /Trésors/ }).click();
  await expect(page.getByText(/XP au total/)).toBeVisible();
  await expect(page.getByText('Obtenu ✔').first()).toBeVisible();

  // Espace parent : vraies statistiques CM1
  await page.goto('./#/parent');
  await page.getByLabel('Code (4 chiffres)').fill('2468');
  await page.getByLabel('Confirmez le code').fill('2468');
  await page.getByRole('button', { name: /Créer le code/ }).click();
  await expect(page.getByRole('heading', { name: /Inès/ })).toBeVisible();
  await expect(page.getByText('CM1', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Détails' }).click();
  await expect(page.getByText(/BO n° 22 du 28-05-2026/).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Historique et corrections' }).click();
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  // Sauvegarde : le profil CM1 est exporté
  await page.getByRole('link', { name: /Sauvegardes/ }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter tous les profils' }).click()]);
  const json = JSON.parse(readFileSync((await download.path())!, 'utf8'));
  expect(json.data.profiles[0].level).toBe('cm1');
  expect(json.data.attempts.length).toBeGreaterThan(0);
});

test('CM1 : chaque matière a une leçon, des exercices et une correction', async ({ page }) => {
  await createProfile(page, 'cm1', 'Sami');
  const id = new URL(page.url()).hash.split('/')[2];
  // Planning parent : exploration libre (ouvre toutes les régions et compétences du CM1)
  await page.goto('./#/parent');
  await page.getByLabel('Code (4 chiffres)').fill('1357');
  await page.getByLabel('Confirmez le code').fill('1357');
  await page.getByRole('button', { name: /Créer le code/ }).click();
  await page.getByRole('link', { name: 'Détails' }).click();
  await page.getByRole('tab', { name: 'Planning' }).click();
  await page.getByLabel(/Exploration libre/).check();
  await page.getByRole('button', { name: /Enregistrer le planning/ }).click();
  await expect(page.getByText('Planning enregistré.')).toBeVisible();
  for (const skill of FIRST_BY_SUBJECT) {
    await page.goto(`./#/p/${id}/competence/${skill}`);
    await page.getByRole('button', { name: /Découvrir la leçon|Revoir la leçon/ }).click();
    await expect(page.getByRole('button', { name: /Explique-moi autrement/ })).toBeVisible();
    // Parcourt la leçon jusqu'au premier exercice
    for (let i = 0; i < 10 && !(await page.getByRole('button', { name: 'Valider' }).isVisible().catch(() => false)); i++) {
      await page.getByRole('button', { name: /^(Suivant|Je m’entraîne)/ }).first().click();
    }
    await answerCurrent(page);
    // Correction affichée (bonne réponse ou explication)
    await expect(page.getByRole('button', { name: /Question suivante|Voir mon bilan/ })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: /.+/ }).first()).toBeVisible();
    await page.getByRole('button', { name: /Question suivante|Voir mon bilan/ }).click();
    await expect(page.getByRole('button', { name: 'Valider' }).or(page.getByRole('heading', { name: /Mini-bilan/ }))).toBeVisible();
  }
  const db = await dbDump(page);
  const sami = db.profiles.find((p) => p.name === 'Sami')!;
  const done = new Set(db.attempts.filter((a) => a.profileId === sami.id).map((a) => a.skillId));
  for (const s of FIRST_BY_SUBJECT) expect(done.has(s), s).toBe(true);
});

test('CM1 : le défi des fractions et le test de positionnement fonctionnent', async ({ page }) => {
  await page.goto('./#/nouveau/cm1');
  await page.getByPlaceholder(/Ex\./).fill('Lou');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await page.getByRole('button', { name: 'On commence' }).click();
  const done = page.getByRole('heading', { name: /Merci Lou/ });
  const skip = page.getByRole('button', { name: 'Je ne sais pas encore' });
  for (let i = 0; i < 40; i++) {
    await expect(done.or(skip)).toBeVisible();
    if (await done.isVisible()) break;
    await skip.click({ timeout: 5000 }).catch(() => undefined);
  }
  await expect(page.getByText('Ce qu’on va travailler en premier')).toBeVisible();
  await page.getByRole('button', { name: /Voir ma carte/ }).click();
  await page.getByRole('link', { name: /Jeux/ }).click();
  await page.getByRole('link', { name: /Le défi des fractions/ }).click();
  const over = page.getByRole('heading', { name: /Défi terminé/ });
  for (let i = 0; i < 8; i++) {
    await expect(over.or(page.getByRole('button', { name: 'Valider' }))).toBeVisible();
    if (await over.isVisible()) break;
    await answerCurrent(page);
    await page.getByRole('button', { name: /Suivant|Résultats/ }).click();
  }
  await expect(over).toBeVisible();
});
