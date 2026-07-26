import { test, expect } from '@playwright/test';

const demoWords = ['achieve', 'benefit', 'challenge', 'education', 'environment', 'healthy', 'important', 'improve', 'reduce', 'support'];

async function prepare(page, path) {
  await page.addInitScript(() => {
    localStorage.setItem('studynova_tour_home_completed_v1', 'true');
    localStorage.setItem('studynova_tour_writing_completed_v1', 'true');
    localStorage.setItem('studynova_tour_cloud_completed_v1', 'true');
  });
  await page.goto(path);
  await page.waitForFunction(() => window.StudyNovaTour);
}

test('every guided-tour selector resolves on its owning page', async ({ page }) => {
  await prepare(page, '/index.html');
  const mainMissing = await page.evaluate(() => [...StudyNovaTour.steps.home, ...StudyNovaTour.steps.cloud]
    .map(step => step[0]).filter(selector => !document.querySelector(selector)));
  expect(mainMissing).toEqual([]);

  await prepare(page, '/studynova_writing_vault.html');
  const writingMissing = await page.evaluate(() => StudyNovaTour.steps.writing
    .map(step => step[0]).filter(selector => !document.querySelector(selector)));
  expect(writingMissing).toEqual([]);
});

test('ten isolated demo words render in Vocabulary and all Review modes', async ({ page }) => {
  await prepare(page, '/index.html');
  await page.evaluate(() => StudyNovaTour.start('home', true));
  // Follow the real UI: Continue once, then use each visible highlighted control.
  await page.locator('.sn-tour-next').click();
  await page.locator('.sn-tour-target').click(); // Vocabulary
  await page.locator('.sn-tour-target').click(); // Add
  await page.locator('.sn-tour-next').click();   // Bulk input
  await page.locator('.sn-tour-next').click();   // Bulk import
  await page.locator('.sn-tour-target').click(); // AI Coach

  await expect(page.locator('#page-vocab')).toHaveClass(/active/);
  await expect(page.locator('#page-vocab')).toBeVisible();
  await expect(page.locator('#word-list')).toHaveClass(/sn-tour-target/);
  await expect(page.locator('#word-list .tour-demo-word:visible')).toHaveCount(10);
  await expect(page.locator('#word-list .tour-demo-label:visible')).toHaveCount(10);
  await expect(page.locator('#sn-ai-modal')).not.toHaveClass(/open/);
  await expect.poll(() => page.evaluate(() => S.words.filter(word => word.isTourDemo).map(word => word.term).sort())).toEqual([...demoWords].sort());
  expect(await page.evaluate(() => {
    const demos = S.words.filter(word => word.isTourDemo);
    return demos.length === 10 && demos.every(word => word.tourSessionId === demos[0].tourSessionId);
  })).toBe(true);

  await page.evaluate(() => { goTo('vocab'); renderVocab(); });
  for (const word of demoWords) await expect(page.locator('#word-list')).toContainText(word);

  for (const mode of ['flash', 'mc', 'fill']) {
    const rendered = await page.evaluate(mode => {
      document.getElementById('rv-mode').value = mode;
      S.rvWords = S.words.filter(word => word.isTourDemo);
      const terms = [];
      for (S.rvIdx = 0; S.rvIdx < S.rvWords.length; S.rvIdx++) {
        renderRvCard(mode);
        terms.push(S.rvWords[S.rvIdx].term);
        const card = document.querySelector('#rv-area [data-review-term]');
        if (!card || card.dataset.reviewTerm !== S.rvWords[S.rvIdx].term) {
          throw new Error(`${S.rvWords[S.rvIdx].term} did not render in ${mode}`);
        }
      }
      return terms.sort();
    }, mode);
    expect(rendered).toEqual([...demoWords].sort());
  }

  const persistedDemoCount = await page.evaluate(() => {
    save();
    return JSON.parse(localStorage.getItem('vocabmaster_data_v1')).words.filter(word => word.isTourDemo).length;
  });
  expect(persistedDemoCount).toBe(0);

  const isolation = await page.evaluate(() => {
    const demo = S.words.find(word => word.isTourDemo);
    S.words.unshift({ id: 42, term: 'real-word', def: 'real', status: 'new', at: '2026-07-26', rv: 0 });
    novaApplySrs(demo, 'easy');
    renderTest();
    const before = JSON.stringify(S.words.find(word => word.id === 42));
    const testCount = document.getElementById('test-area').textContent;
    document.querySelector('.sn-tour-close').click();
    return {
      demoCount: S.words.filter(word => word.isTourDemo).length,
      realUnchanged: JSON.stringify(S.words.find(word => word.id === 42)) === before,
      realPresent: S.words.some(word => word.id === 42),
      testCount
    };
  });
  expect(isolation.demoCount).toBe(0);
  expect(isolation.realPresent).toBe(true);
  expect(isolation.realUnchanged).toBe(true);
  expect(isolation.testCount).toContain('1');
});

test('clicking an actionable highlighted target performs its action and advances once', async ({ page }) => {
  await prepare(page, '/index.html');
  await page.evaluate(() => StudyNovaTour.start('home', true));
  await page.locator('.sn-tour-next').click();
  await expect(page.locator('.sn-tour-progress')).toHaveText('2/10');

  await page.locator('.sn-tour-target').click();
  await expect(page.locator('#page-vocab')).toHaveClass(/active/);
  await expect(page.locator('.sn-tour-progress')).toHaveText('3/10');
});
