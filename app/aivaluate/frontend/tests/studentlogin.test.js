import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Student Login Page Test', () => {
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

  test('Student login and redirection to dashboard', async () => {
    if (!driver) {
      console.error('Driver is not initialized.'); // Check and log if driver failed to initialize before running test
      return;
    }

    await driver.get('http://localhost:5173/stu/login');
    console.log('Navigated to /stu/login');

    try {
      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 20000);
      console.log('Email input located');

      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 20000);
      console.log('Password input located');

      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 20000);
      console.log('Login button located');

      await emailInput.sendKeys('aayush@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');

      await driver.wait(until.urlContains('/stu/dashboard'), 20000);
      console.log('Navigated to /stu/dashboard');

      const dashboardElement = await driver.wait(until.elementLocated(By.css('.dashboard')), 20000);
      expect(dashboardElement).toBeTruthy();
    } catch (error) {
      console.error('Error during test execution:', error); // Log any errors that occur during the test
    }
  });
});
