import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Forgot Password Page Test', () => {
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

  test('Forgot Password page loads and submits form', async () => {
    try {
      await driver.get('http://localhost:5173/admin/forgotpassword');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /admin/forgotpassword');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Email Address"]')), 30000);
      console.log('Email input located');

      // Wait for the confirm email input to be present
      const confirmEmailInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Confirm Email Address"]')), 30000);
      console.log('Confirm Email input located');

      // Wait for the submit button to be present
      const submitButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 30000);
      console.log('Submit button located');

      await emailInput.sendKeys('admin@email.com');
      await confirmEmailInput.sendKeys('admin@email.com');
      await submitButton.click();
      console.log('Forgot Password form submitted');

      // Wait for a success or error message to be displayed
      const message = await driver.wait(until.elementLocated(By.css('.message, .error-message')), 30000);
      console.log('Message displayed');

      // Verify that the message is displayed
      expect(message).toBeTruthy();

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
