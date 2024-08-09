import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Student Grades Page Test', () => {
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

  test('Student Grades page loads and displays content', async () => {
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

      // Navigate to the student grades page
      await driver.get('http://localhost:5173/stu/grades/1');
      console.log('Navigated to /stu/grades');

      // Wait for the grades section to load
      const gradesSection = await driver.wait(until.elementLocated(By.css('.grades-section')), 30000);
      console.log('Grades section displayed');

      // Verify that the "Grades for" heading is displayed
      const gradesHeading = await driver.wait(until.elementLocated(By.css('.top-bar h1')), 30000);
      console.log('Grades heading located');
      expect(gradesHeading).toBeTruthy();

      // Verify that the grades table is displayed
      const gradesTable = await driver.wait(until.elementLocated(By.css('.grades-table')), 30000);
      console.log('Grades table located');
      expect(gradesTable).toBeTruthy();

      // Verify that at least one grade row is displayed
      const gradeRows = await driver.wait(until.elementsLocated(By.css('.grades-table tbody tr')), 30000);
      console.log('Grade rows located');
      expect(gradeRows.length).toBeGreaterThan(0);

      // Verify the total percentage is displayed
      const totalPercentage = await driver.wait(until.elementLocated(By.xpath('//td[text()="Total"]/following-sibling::td')), 30000);
      console.log('Total percentage located');
      expect(totalPercentage).toBeTruthy();

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
