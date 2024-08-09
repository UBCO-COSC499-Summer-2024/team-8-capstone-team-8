import { Builder, By, until } from 'selenium-webdriver';

describe('Selenium Help Page Test', () => {
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

  test('Help page loads and displays content', async () => {
    try {
      await driver.get('http://localhost:5173/login');

      // Debugging: Log to check if the page loaded
      console.log('Navigated to /login');

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

      // Wait for redirection to the home page
      await driver.wait(until.urlContains('/stu/dashboard'), 20000);
      console.log('Navigated to /home');

      // Navigate to the help page
      await driver.get('http://localhost:5173/stu/help');
      console.log('Navigated to /help');

      // Wait for the help content to load
      const helpSection = await driver.wait(until.elementLocated(By.css('.help-section')), 20000);
      console.log('Help section displayed');

      // Verify that the Dashboard section is displayed
      const dashboardHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Dashboard"]')), 20000);
      expect(dashboardHeading).toBeTruthy();
      console.log('Dashboard section displayed');

      // Verify that the Join a Course section is displayed
      const joinCourseHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Join a Course"]')), 20000);
      expect(joinCourseHeading).toBeTruthy();
      console.log('Join a Course section displayed');

      // Verify that the Grades section is displayed
      const gradesHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Grades"]')), 20000);
      expect(gradesHeading).toBeTruthy();
      console.log('Grades section displayed');

      // Verify that the Assignments section is displayed
      const assignmentsHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Assignments"]')), 20000);
      expect(assignmentsHeading).toBeTruthy();
      console.log('Assignments section displayed');

      // Verify that the People section is displayed
      const peopleHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="People"]')), 20000);
      expect(peopleHeading).toBeTruthy();
      console.log('People section displayed');

      // Verify that the Submissions section is displayed
      const submissionsHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Submissions"]')), 20000);
      expect(submissionsHeading).toBeTruthy();
      console.log('Submissions section displayed');

      // Verify that the Need Further Assistance section is displayed
      const assistanceHeading = await driver.wait(until.elementLocated(By.xpath('//h3[text()="Need Further Assistance?"]')), 20000);
      expect(assistanceHeading).toBeTruthy();
      console.log('Need Further Assistance section displayed');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
