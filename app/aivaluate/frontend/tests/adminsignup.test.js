import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Admin Signup Page Test', () => {
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

  test('Admin Signup page loads and allows account creation', async () => {
    try {
      await driver.get('http://localhost:5173/admin/signup');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /admin/signup');

      // Wait for the first name input to be present
      const firstNameInput = await driver.wait(until.elementLocated(By.css('input[placeholder="First Name"]')), 20000);
      console.log('First name input located');

      // Fill in the first name
      await firstNameInput.sendKeys('Test');
      console.log('First name entered');

      // Wait for the last name input to be present
      const lastNameInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Last Name"]')), 20000);
      console.log('Last name input located');

      // Fill in the last name
      await lastNameInput.sendKeys('Admin');
      console.log('Last name entered');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Email Address"]')), 20000);
      console.log('Email input located');

      // Fill in the email
      await emailInput.sendKeys('iamadmin@email.com');
      console.log('Email entered');

      // Wait for the password input to be present
      const passwordInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Password"]')), 20000);
      console.log('Password input located');

      // Fill in the password
      await passwordInput.sendKeys('pass1234');
      console.log('Password entered');

      // Wait for the confirm password input to be present
      const confirmPasswordInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Confirm Password"]')), 20000);
      console.log('Confirm password input located');

      // Fill in the confirm password
      await confirmPasswordInput.sendKeys('pass1234');
      console.log('Confirm password entered');

      // Wait for the access key input to be present
      const accessKeyInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Access Key"]')), 20000);
      console.log('Access key input located');

      // Fill in the access key
      await accessKeyInput.sendKeys('adminaccesskey');
      console.log('Access key entered');

      // Submit the form
      const submitButton = await driver.wait(until.elementLocated(By.css('.auth-submit')), 20000);
      await submitButton.click();
      console.log('Submit button clicked');

      // Wait for redirection to the login page
      await driver.wait(until.urlContains('/admin/login'), 20000);
      console.log('Navigated to /admin/login');

      // Verify that the login page has loaded
      const loginElement = await driver.wait(until.elementLocated(By.css('.auth-title')), 20000);
      expect(loginElement).toBeTruthy();
      console.log('Login page displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
