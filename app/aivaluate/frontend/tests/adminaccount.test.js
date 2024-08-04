import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Admin Account Page Test', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('Admin Account page loads and displays account details', async () => {
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
      console.log('Navigated to /admin/dashboard');

      // Navigate to the admin account page
      await driver.get('http://localhost:5173/admin/account');
      console.log('Navigated to /admin/account');

      // Wait for the account details to load
      const accountDetails = await driver.wait(until.elementLocated(By.css('.account-details')), 20000);
      console.log('Account details section displayed');

      // Verify that the First Name field is displayed
      const firstNameField = await driver.wait(until.elementLocated(By.xpath('//div[text()="First Name"]/following-sibling::div')), 20000);
      expect(firstNameField).toBeTruthy();
      console.log('First Name field displayed');

      // Verify that the Last Name field is displayed
      const lastNameField = await driver.wait(until.elementLocated(By.xpath('//div[text()="Last Name"]/following-sibling::div')), 20000);
      expect(lastNameField).toBeTruthy();
      console.log('Last Name field displayed');

      // Verify that the Email field is displayed
      const emailField = await driver.wait(until.elementLocated(By.xpath('//div[text()="Email"]/following-sibling::div')), 20000);
      expect(emailField).toBeTruthy();
      console.log('Email field displayed');

      // Verify that the Password field is displayed
      const passwordField = await driver.wait(until.elementLocated(By.xpath('//div[text()="Password"]/following-sibling::div')), 20000);
      expect(passwordField).toBeTruthy();
      console.log('Password field displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
