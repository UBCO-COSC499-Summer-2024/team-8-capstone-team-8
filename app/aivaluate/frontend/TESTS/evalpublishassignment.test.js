import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Publish Assignment Page Test', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('Publish Assignment page loads and displays content', async () => {
    try {
      await driver.get('http://localhost:5173/eval/login');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /eval/login');

      // Wait for the email input to be present
      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 20000);
      console.log('Email input located');

      // Wait for the password input to be present
      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 20000);
      console.log('Password input located');

      // Wait for the login button to be present
      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 20000);
      console.log('Login button located');

      await emailInput.sendKeys('testprof@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');

      // Wait for redirection to the evaluator home page
      await driver.wait(until.urlContains('/eval/dashboard'), 20000);
      console.log('Navigated to /eval/dashboard');

      // Navigate to the publish assignment page
      await driver.get('http://localhost:5173/eval/assignments/1'); // Adjust the URL to match your route
      console.log('Navigated to /eval/assignments/1');

      // Wait for the assignment content to load
      const assignmentTitle = await driver.wait(until.elementLocated(By.css('.title-input')), 20000);
      console.log('Assignment title input displayed');
      expect(assignmentTitle).toBeTruthy();

      // Verify that the due date input is displayed
      const dueDateInput = await driver.wait(until.elementLocated(By.css('.deadline-input')), 20000);
      console.log('Due date input displayed');
      expect(dueDateInput).toBeTruthy();

      // Verify that the rubric text area is displayed
      const rubricTextArea = await driver.wait(until.elementLocated(By.css('.rubric-text')), 20000);
      console.log('Rubric text area displayed');
      expect(rubricTextArea).toBeTruthy();

      // Verify that the "View Submissions" button is displayed
      const viewSubmissionsButton = await driver.wait(until.elementLocated(By.css('.assignment-button')), 20000);
      console.log('View Submissions button displayed');
      expect(viewSubmissionsButton).toBeTruthy();

      // Verify that the "Publish Assignment" button is displayed
      const publishButton = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Publish Assignment")]')), 20000);
      console.log('Publish Assignment button displayed');
      expect(publishButton).toBeTruthy();

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
