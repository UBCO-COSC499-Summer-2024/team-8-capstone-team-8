import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Student Account Page Test', () => {
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

  test('Student Account page loads and displays account details', async () => {
    try {
      await driver.get('http://localhost:5173/stu/login');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /stu/login');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 30000);
      console.log('Email input located');

      // Wait for the password input to be present
      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 30000);
      console.log('Password input located');

      // Wait for the login button to be present
      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 30000);
      console.log('Login button located');

      await emailInput.sendKeys('aayush@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');

      // Wait for redirection to the student dashboard
      await driver.wait(until.urlContains('/stu/dashboard'), 30000);
      console.log('Navigated to /stu/dashboard');

      // Navigate to the student account page
      await driver.get('http://localhost:5173/stu/account');
      console.log('Navigated to /stu/account');

      // Wait for the account details to load
      const accountDetails = await driver.wait(until.elementLocated(By.css('.account-details')), 30000);
      console.log('Account details section displayed');

      // Verify that the First Name field is displayed
      const firstNameField = await driver.wait(until.elementLocated(By.xpath('//div[text()="First Name"]/following-sibling::div')), 30000);
      expect(firstNameField).toBeTruthy();
      console.log('First Name field displayed');

      // Verify that the Last Name field is displayed
      const lastNameField = await driver.wait(until.elementLocated(By.xpath('//div[text()="Last Name"]/following-sibling::div')), 30000);
      expect(lastNameField).toBeTruthy();
      console.log('Last Name field displayed');

      // Verify that the Email field is displayed
      const emailField = await driver.wait(until.elementLocated(By.xpath('//div[text()="Email"]/following-sibling::div')), 30000);
      expect(emailField).toBeTruthy();
      console.log('Email field displayed');

      // Verify that the Password field is displayed
      const passwordField = await driver.wait(until.elementLocated(By.xpath('//div[text()="Password"]/following-sibling::div')), 30000);
      expect(passwordField).toBeTruthy();
      console.log('Password field displayed');

      // Verify that the Account ID field is displayed
      const accountIdField = await driver.wait(until.elementLocated(By.xpath(`//div[text()="Student ID"]/following-sibling::div`)), 30000);
      expect(accountIdField).toBeTruthy();
      console.log('Account ID field displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
