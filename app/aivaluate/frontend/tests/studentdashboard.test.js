import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Student Dashboard Page Test', () => {
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

  test('Student Dashboard page loads and displays courses', async () => {
    try {
      await driver.get('http://localhost:5173/stu/login');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /stu/login');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 20000);
      console.log('Email input located');

      // Wait for the password input to be present
      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 20000);
      console.log('Password input located');

      // Wait for the login button to be present
      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 20000);
      console.log('Login button located');

      await emailInput.sendKeys('aayush@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');



      // Wait for redirection to the student dashboard
      await driver.wait(until.urlContains('/stu/dashboard'), 20000);
      console.log('Navigated to /stu/dashboard');

      // Verify that the dashboard page has loaded
      const dashboardElement = await driver.wait(until.elementLocated(By.css('.dashboard')), 20000);
      expect(dashboardElement).toBeTruthy();
      console.log('Dashboard page displayed');

      

      // Verify that the courses section is displayed
      const coursesSection = await driver.findElement(By.xpath('//h1[text()="Your courses..."]'));
      expect(coursesSection).toBeTruthy();
      console.log('Courses section displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
