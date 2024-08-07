import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Admin Course Manager Page Test', () => {
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

  test('Admin Course Manager page loads and displays content', async () => {
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
      await driver.wait(until.urlContains('/admin/evaluatormanager'), 20000);
      console.log('Navigated to /admin/home');

      // Navigate to the course manager page
      await driver.get('http://localhost:5173/admin/coursemanager');
      console.log('Navigated to /admin/coursemanager');

      // Wait for the course manager content to load
      const courseManagerSection = await driver.wait(until.elementLocated(By.css('.portal-container')), 20000);
      console.log('Course manager section displayed');

      // Verify that the Courses heading is displayed
      const coursesHeading = await driver.wait(until.elementLocated(By.xpath('//h1[text()="Courses"]')), 20000);
      expect(coursesHeading).toBeTruthy();
      console.log('Courses heading displayed');


      // Verify that the list of courses is displayed
      const courseList = await driver.wait(until.elementLocated(By.css('.filetab')), 20000);
      expect(courseList).toBeTruthy();
      console.log('Course list displayed');

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
