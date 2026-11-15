import { expect, test } from '@playwright/test';
import { answerCurrent, createProfile, playSession, startMission } from './helpers';

async function readDb(page: import('@playwright/test').Page) {
  return page.evaluate(
    () =>
      new Promise<{ profiles: { id: string; level: string; name: string }[]; records: { profileId: string; skillId: string }[] }>((resolve, reject) => {
        const req = indexedDB.open('nova-academy');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['profiles', 'skillRecords'], 'readonly');
          const p = tx.objectStore('profiles').getAll();
          const r = tx.objectStore('skillRecords').getAll();
          tx.oncomplete = () => resolve({ profiles: p.result, records: r.result });
        };
      }),
  );
}

test('une élève de CE2 termine une mission, puis un élève de CM2 aussi — sans mélange des données', async ({ page }) => {
  await createProfile(page, 'ce2', 'Lili');
  await startMission(page);
  await playSession(page, /Mission accomplie/);
  await expect(page.getByText(/XP/).first()).toBeVisible();
  await page.getByRole('button', { name: /Retour à la carte/ }).click();
  await expect(page.getByText('Accomplie')).toBeVisible();

  await createProfile(page, 'cm2', 'Max');
  await startMission(page);
  await playSession(page, /Mission accomplie/);

  const db = await readDb(page);
  const lili = db.profiles.find((p) => p.name === 'Lili')!;
  const max = db.profiles.find((p) => p.name === 'Max')!;
  expect(lili.level).toBe('ce2');
  expect(max.level).toBe('cm2');
  const liliSkills = db.records.filter((r) => r.profileId === lili.id).map((r) => r.skillId);
  const maxSkills = db.records.filter((r) => r.profileId === max.id).map((r) => r.skillId);
  expect(liliSkills.length).toBeGreaterThan(0);
  expect(maxSkills.length).toBeGreaterThan(0);
  expect(liliSkills.every((s) => s.startsWith('ce2-'))).toBe(true);
  expect(maxSkills.every((s) => s.startsWith('cm2-'))).toBe(true);

  // Le navigateur est fermé puis rouvert : la progression est toujours là.
  await page.close();
  const again = await page.context().newPage();
  await again.goto('./');
  await expect(again.getByText('Lili')).toBeVisible();
  await expect(again.getByText('Max')).toBeVisible();

  // L'espace parent affiche de vraies données pour chaque profil.
  await again.goto('./#/parent');
  await again.getByLabel('Code (4 chiffres)').fill('1234');
  await again.getByLabel('Confirmez le code').fill('1234');
  await again.getByRole('button', { name: /Créer le code/ }).click();
  await expect(again.getByRole('heading', { name: /Lili/ })).toBeVisible();
  await expect(again.getByRole('heading', { name: /Max/ })).toBeVisible();
  await expect(again.getByText(/Mission faite/).first()).toBeVisible();
});

test('le test de positionnement se fait sans note et oriente les révisions', async ({ page }) => {
  await page.goto('./#/nouveau/cm2');
  await page.getByPlaceholder(/Ex\./).fill('Sam');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await page.getByRole('button', { name: 'On commence' }).click();
  const done = page.getByRole('heading', { name: /Merci Sam/ });
  const skip = page.getByRole('button', { name: 'Je ne sais pas encore' });
  for (let i = 0; i < 40; i++) {
    await expect(done.or(skip)).toBeVisible();
    if (await done.isVisible()) break;
    await skip.click({ timeout: 5000 }).catch(() => undefined);
  }
  await expect(page.getByText('Ce qu’on va travailler en premier')).toBeVisible();
  await expect(page.getByText(/note/i)).toHaveCount(0);
  await page.getByRole('button', { name: /Voir ma carte/ }).click();
  await expect(page.getByText(/révisions? prévues?/)).toBeVisible();
});

test('les mini-jeux fonctionnent et enregistrent les réponses', async ({ page }) => {
  await createProfile(page, 'ce2', 'Zoé');
  await page.getByRole('link', { name: /Jeux/ }).click();
  await page.getByRole('link', { name: /La course aux calculs/ }).click();
  const over = page.getByRole('heading', { name: /Défi terminé/ });
  for (let i = 0; i < 12; i++) {
    await expect(over.or(page.getByRole('button', { name: 'Valider' }))).toBeVisible();
    if (await over.isVisible()) break;
    await answerCurrent(page);
    await page.getByRole('button', { name: /Avancer|Résultats/ }).click();
  }
  await expect(page.getByRole('heading', { name: /Défi terminé/ })).toBeVisible();
  await page.getByRole('link', { name: 'Autres défis' }).click();
  await page.getByRole('link', { name: /English Quest/ }).click();
  await expect(page.getByText('Étape 1 : les paires')).toBeVisible();
});
