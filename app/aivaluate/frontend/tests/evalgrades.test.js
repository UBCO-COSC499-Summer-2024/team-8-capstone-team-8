import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Evaluator Grades Page Test', () => {
  let driver;

  beforeAll(async () => {
    try {
      driver = await new Builder().forBrowser('chrome').build(); // Try to initialize the driver
    } catch (error) {
      console.error('Failed to initialize the driver:', error); // Log if there is an error during initialization
    }
  });

  afterAll(async () => {
    if (driver) { // Check if driver is initialized
      try {
        await driver.quit(); // Attempt to quit the driver safely
      } catch (error) {
        console.error('Failed to quit the driver:', error); // Log if there is an error during quit
      }
    }
  });

  test('Evaluator Grades page loads and displays content', async () => {
    try {
      await driver.get('http://localhost:5173/eval/login');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /eval/login');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 30000);
      console.log('Email input located');

      // Wait for the password input to be present
      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 30000);
      console.log('Password input located');

      // Wait for the login button to be present
      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 30000);
      console.log('Login button located');

      await emailInput.sendKeys('testprof@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');

      // Wait for redirection to the evaluator home page
      await driver.wait(until.urlContains('/eval/dashboard'), 30000);
      console.log('Navigated to /eval/dashboard');

      // Navigate to the evaluator grades page
      await driver.get('http://localhost:5173/eval/grades/2');
      console.log('Navigated to /eval/grades');

      // Wait for the grades content to load
      const gradesSection = await driver.wait(until.elementLocated(By.css('.main-margin')), 30000);
      console.log('Grades section displayed');
      expect(gradesSection).toBeTruthy();

      // Verify that the "Grade Summary" heading is displayed
      const gradeSummaryHeading = await driver.wait(until.elementLocated(By.xpath('//h1[text()="Grade Summary"]')), 30000);
      expect(gradeSummaryHeading).toBeTruthy();
      console.log('Grade Summary heading displayed');

      // Verify that the search box is displayed
      const searchBox = await driver.wait(until.elementLocated(By.css('.search-box input')), 30000);
      expect(searchBox).toBeTruthy();
      console.log('Search box displayed');

      // Verify that the "Class Average" text is displayed
      const classAverageText = await driver.wait(until.elementLocated(By.xpath('//h2[contains(text(), "Class Average:")]')), 30000);
      expect(classAverageText).toBeTruthy();
      console.log('Class Average text displayed');

      // Verify that the grades table is displayed
      const gradesTable = await driver.wait(until.elementLocated(By.css('.grades-table')), 30000);
      expect(gradesTable).toBeTruthy();
      console.log('Grades table displayed');

      // Verify that at least one grade item is displayed
      const gradeItem = await driver.wait(until.elementLocated(By.css('.grades-table tbody tr')), 30000);
      expect(gradeItem).toBeTruthy();
      console.log('Grade item displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
