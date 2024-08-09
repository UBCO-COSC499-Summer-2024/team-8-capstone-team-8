import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Eval Help Page Test', () => {
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

  test('Eval Help page loads and displays content', async () => {
    try {
      await driver.get('http://localhost:5173/eval/login');

      console.log('Navigated to /eval/login');

      const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 30000);
      console.log('Email input located');

      const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 30000);
      console.log('Password input located');

      const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 30000);
      console.log('Login button located');

      await emailInput.sendKeys('testprof@email.com');
      await passwordInput.sendKeys('pass123');
      await loginButton.click();
      console.log('Login form submitted');

      await driver.wait(until.urlContains('/eval/dashboard'), 30000);
      console.log('Navigated to /eval/dashboard');

      await driver.get('http://localhost:5173/eval/help');
      console.log('Navigated to /eval/help');

      const helpSection = await driver.wait(until.elementLocated(By.css('.help-section')), 30000);
      console.log('Help section displayed');

      // const homeHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Home"]')), 30000);
      // console.log('Home section located');
      // expect(homeHeading).toBeTruthy();

      // const studentGradesHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Student Grades"]')), 30000);
      // console.log('Student Grades section located');
      // expect(studentGradesHeading).toBeTruthy();

      // const assignmentsHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Assignments"]')), 30000);
      // console.log('Assignments section located');
      // expect(assignmentsHeading).toBeTruthy();

      // const studentsHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Students"]')), 30000);
      // console.log('Students section located');
      // expect(studentsHeading).toBeTruthy();

      // const allSubmissionsHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="All Submissions"]')), 30000);
      // console.log('All Submissions section located');
      // expect(allSubmissionsHeading).toBeTruthy();

      // const rubricsHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Rubrics"]')), 30000);
      // console.log('Rubrics section located');
      // expect(rubricsHeading).toBeTruthy();

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
