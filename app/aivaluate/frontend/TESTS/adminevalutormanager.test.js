import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Admin Evaluator Manager Page Test', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('Admin Evaluator Manager page loads and displays content', async () => {
    try {
      await driver.get('http://localhost:5173/admin/login');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /admin/login');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 20000);
      console.log('Email input located');

      // Wait for the password input to be present
      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 20000);
      console.log('Password input located');

      // Wait for the login button to be present
      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 20000);
      console.log('Login button located');

      await emailInput.sendKeys('admin@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');

      // Wait for redirection to the admin home page
      await driver.wait(until.urlContains('/admin/home'), 20000);
      console.log('Navigated to /admin/home');

      // Navigate to the evaluator manager page
      await driver.get('http://localhost:5173/admin/evaluatormanager');
      console.log('Navigated to /admin/evalmanager');

      // Wait for the evaluator manager content to load
      const evaluatorManagerSection = await driver.wait(until.elementLocated(By.css('.portal-container')), 20000);
      console.log('Evaluator manager section displayed');

      // Verify that the Professors heading is displayed
      const professorsHeading = await driver.wait(until.elementLocated(By.xpath('//h1[text()="Professors"]')), 20000);
      expect(professorsHeading).toBeTruthy();
      console.log('Professors heading displayed');

      // Verify that the search bar is displayed
      const searchBar = await driver.wait(until.elementLocated(By.css('.search-box input[type="text"]')), 20000);
      expect(searchBar).toBeTruthy();
      console.log('Search bar displayed');

      // Verify that the Add Evaluator button is displayed
      const addEvaluatorButton = await driver.wait(until.elementLocated(By.css('.addEvalButton')), 20000);
      expect(addEvaluatorButton).toBeTruthy();
      console.log('Add Evaluator button displayed');

      // Verify that the list of evaluators is displayed
      const evaluatorList = await driver.wait(until.elementLocated(By.css('.filetab')), 20000);
      expect(evaluatorList).toBeTruthy();
      console.log('Evaluator list displayed');

      // Verify pagination controls are displayed
      const paginationControls = await driver.wait(until.elementLocated(By.css('.pagination-controls')), 20000);
      expect(paginationControls).toBeTruthy();
      console.log('Pagination controls displayed');

      // Verify next and previous buttons are displayed
      const prevButton = await driver.wait(until.elementLocated(By.xpath('//button[text()="Previous"]')), 20000);
      const nextButton = await driver.wait(until.elementLocated(By.xpath('//button[text()="Next"]')), 20000);
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      console.log('Next and Previous buttons displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});