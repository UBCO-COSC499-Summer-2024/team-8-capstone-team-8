import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Eval Dashboard Page Test', () => {
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

  test('Eval Dashboard page loads and displays content', async () => {
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

      // Verify that the notification container is displayed
      const notificationContainer = await driver.wait(until.elementLocated(By.css('.notification-container')), 30000);
      console.log('Notification container displayed');
      expect(notificationContainer).toBeTruthy();

      // // Verify that the courses header is displayed
      // const coursesHeader = await driver.wait(until.elementLocated(By.css('.message-container h1')), 30000);
      // console.log('Courses header displayed');
      // expect(coursesHeader).toBeTruthy();


      // // Verify that the course cards are displayed
      // const courseCards = await driver.wait(until.elementLocated(By.css('.course-cards')), 30000);
      // console.log('Course cards displayed');
      // expect(courseCards).toBeTruthy();

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
