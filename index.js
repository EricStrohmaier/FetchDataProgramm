const puppeteerExtra = require('puppeteer-extra');
const puppeteer = require('puppeteer-core');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();
puppeteerExtra.use(StealthPlugin());

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const urls = Array.from({ length: 101 }, (v, i) => `https://pinchofyum.com/recipes/all/page/${i + 1}`);

async function run() {
  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const page = await browser.newPage();

    // Set navigation timeout to 60 seconds (60000 milliseconds)
    await page.setDefaultNavigationTimeout(60000);

    for (const url of urls) {
      await page.goto(url);
      const articles = await page.$$('article');

      for (const article of articles) {
        const link = await article.$eval('a.block', (element) => element.getAttribute('href'));

        const category = await page.evaluate((article) => {
          const excludedCategories = [
            'category-sos-series',
            'category-soup',
            'category-quinoa',
            'category-healthy-choices',
            'category-january-meal-planning-bootcamp',
            'category-casserole',
            'category-legume',
            'category-avocado',
            'category-dairy-free',
            'category-the-soup-series',
            'category-holiday-series',
            'category-meal-prep',
            'category-life',
            'category-5-ingredients',
            'category-recipes',
            'category-all',
          ];

          const classList = Array.from(article.classList);

          return classList
            .filter((c) => c.startsWith('category-') && !excludedCategories.includes(c))
            .map((c) => c.substring(9));
        }, article);

        const title = await article.$eval('h3', (element) => element.textContent.trim());
        const imageSrc = await article.$eval('img', (img) => img.getAttribute('src'));

        if (category.length > 0) {
          const { data, error } = await supabase.from('recipes').insert([
            { link: link, title: title, category: category, imageSrc: imageSrc },
          ]);
          console.log(data);
          console.log(error);
        }
      }
    }
  } catch (e) {
    console.error('run failed', e);
  }
  await browser?.close();
}

if (require.main === module) {
  run();
}
