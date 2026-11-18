import { expect, type Page } from '@playwright/test';

/** Crée un profil depuis l'accueil et revient sur sa carte (tour de découverte reporté). */
export async function createProfile(page: Page, level: 'ce2' | 'cm1' | 'cm2', name: string) {
  await page.goto('./');
  await page.locator(`a[href="#/nouveau/${level}"]`).click();
  await page.getByPlaceholder(/Ex\./).fill(name);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('heading', { name: 'Le tour de découverte' })).toBeVisible();
  await page.getByRole('button', { name: 'Plus tard' }).click();
  await expect(page.getByRole('heading', { name: new RegExp(name) })).toBeVisible();
}

/**
 * Répond à la question affichée de façon générique (pas forcément juste) :
 * le but est de vérifier que chaque type d'exercice peut être complété et corrigé.
 */
export async function answerCurrent(page: Page) {
  const main = page.locator('main');
  const choice = main.locator('.choices button.choice:not([disabled])');
  if ((await choice.count()) && !(await main.getByRole('group', { name: /Colonne de gauche/ }).count())) {
    await choice.first().click();
  } else if (await main.getByRole('group', { name: 'Éléments à placer' }).count()) {
    const pool = main.getByRole('group', { name: 'Éléments à placer' }).locator('button');
    while ((await pool.count()) > 0) await pool.first().click();
  } else if (await main.getByRole('group', { name: 'Éléments à ranger' }).count()) {
    const items = main.getByRole('group', { name: 'Éléments à ranger' }).locator('button.token');
    while ((await items.count()) > 0) {
      await items.first().click();
      await main.locator('.dropzone button.btn-sm:not([disabled])').first().click();
    }
  } else if (await main.getByRole('group', { name: /Colonne de gauche/ }).count()) {
    const lefts = main.getByRole('group', { name: /Colonne de gauche/ }).locator('button');
    const n = await lefts.count();
    for (let i = 0; i < n; i++) {
      await lefts.nth(i).click();
      await main.getByRole('group', { name: /Colonne de droite/ }).locator('button:not([disabled])').nth(i).click();
    }
  } else if (await main.getByRole('group', { name: /Opération posée/ }).count()) {
    await main.getByLabel(/Résultat, chiffre de la colonne 1 /).fill('7');
  } else if (await main.getByRole('group', { name: /Bande partagée/ }).count()) {
    await main.getByRole('group', { name: /Bande partagée/ }).locator('button').first().click();
  } else if (await main.getByRole('group', { name: 'Mots de la phrase' }).count()) {
    await main.getByRole('group', { name: 'Mots de la phrase' }).locator('button').first().click();
  } else if (await main.locator('svg [role="button"]').count()) {
    await main.locator('svg [role="button"]').first().click({ force: true });
  } else if (await choice.count()) {
    await choice.first().click();
  } else if (await main.locator('textarea').count()) {
    await main.locator('textarea').fill('Le chat dort.');
  } else if (await main.locator('input.input').count()) {
    await main.locator('input.input').first().fill('12');
  }
  await page.getByRole('button', { name: 'Valider' }).click();
  const retry = page.getByRole('button', { name: 'Réessayer' });
  if (await retry.isVisible().catch(() => false)) {
    await retry.click();
    await answerCurrent(page);
  }
}

/** Fait toute une séance (leçons + exercices + bilans) jusqu'à l'écran final. */
export async function playSession(page: Page, doneTitle: RegExp) {
  for (let guard = 0; guard < 120; guard++) {
    if (await page.getByRole('heading', { name: doneTitle }).isVisible().catch(() => false)) return;
    const next = page.getByRole('button', { name: /^(Suivant|Je m’entraîne|Question suivante|Voir mon bilan|Étape suivante|Terminer la séance|Continuer)/ });
    if (await page.getByRole('button', { name: 'Valider' }).isVisible().catch(() => false)) {
      await answerCurrent(page);
      continue;
    }
    if (await page.getByRole('button', { name: 'Étape suivante', exact: false }).first().isVisible().catch(() => false) && (await page.locator('ol .btn-sm').count())) {
      await page.locator('ol .btn-sm').first().click();
      continue;
    }
    if (await next.first().isVisible().catch(() => false)) {
      await next.first().click({ timeout: 5000 }).catch(() => undefined);
      continue;
    }
    await page.waitForTimeout(300);
  }
  await expect(page.getByRole('heading', { name: doneTitle })).toBeVisible();
}

/** Lance la mission du jour (en passant le tour de découverte s'il n'a pas été fait). */
export async function startMission(page: Page) {
  const skip = page.getByRole('button', { name: 'Passer et aller à la mission' });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  else await page.getByRole('button', { name: /Lancer la mission/ }).click();
}
