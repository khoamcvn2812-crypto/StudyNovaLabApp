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
  await expect.poll(() => page.evaluate(() => S.words.filter(word => word.isTourDemo).map(word => word.term).sort())).toEqual([...demoWords].sort());

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
