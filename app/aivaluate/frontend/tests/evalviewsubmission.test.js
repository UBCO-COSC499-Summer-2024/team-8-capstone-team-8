import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Eval View Submissions Page Test', () => {
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

  
  test('Eval View Submissions page loads and displays content', async () => {
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

      // Wait for redirection to the evaluator dashboard
      await driver.wait(until.urlContains('/eval/dashboard'), 30000);
      console.log('Navigated to /eval/dashboard');

      // Navigate to the evaluator submissions page
      await driver.get('http://localhost:5173/eval/submissions/1');
      console.log('Navigated to /eval/submissions');

      // Wait for the top bar to be present
      const topBar = await driver.wait(until.elementLocated(By.css('.top-bar')), 30000);
      expect(topBar).toBeTruthy();
      console.log('Top bar displayed');

      // Verify the presence of the search input
      const searchInput = await driver.wait(until.elementLocated(By.css('.search-box input[type="text"]')), 30000);
      expect(searchInput).toBeTruthy();
      console.log('Search input displayed');

      // Perform a search
      await searchInput.sendKeys('test search');
      console.log('Performed search');

      // // Wait for the file items to be displayed
      // const fileItems = await driver.wait(until.elementsLocated(By.css('.file-item')), 30000);
      // expect(fileItems.length).toBeGreaterThan(0);
      // console.log('File items displayed');

      // Verify pagination controls are displayed
      const paginationControls = await driver.wait(until.elementLocated(By.css('.pagination-controls')), 30000);
      expect(paginationControls).toBeTruthy();
      console.log('Pagination controls displayed');

      // Verify navigation buttons are displayed and functional
      const prevButton = await driver.wait(until.elementLocated(By.css('.pagination-buttons button:first-child')), 30000);
      const nextButton = await driver.wait(until.elementLocated(By.css('.pagination-buttons button:last-child')), 30000);
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      console.log('Pagination buttons displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
