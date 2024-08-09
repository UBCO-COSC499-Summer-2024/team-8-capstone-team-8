# Cycle 4 Weekly Log

- ## Date range: June 8 - June 12, 2024

- ### Which features were in the project plan cycle?
  - Backend containerization
  - Database containerization
  - AI/llama3 containerization
  - General styling for webpages
  - Frontend for login, logout, assignments, forgot pass, account, join course, etc.
  - Docker compose set up with adminer, digital ocean, frontend, and backend

- ### Which tasks from the project board are associated with these features?
- User authentication and user account management (modify, delete, grant permissions)
- Course management (edit, delete, restore)
- Security and privacy (anonymization of student data for storage and transfer) by using passport.js

### Which tasks are going to be targeted from the next cycle with time estimates and owners (ie planning and who is going to own/work on each task)
- Backend SQL implementations for frontend: Jerry + Colton
- Email API for forgot password: Chinmay
- Continuing frontend design: Aayush + Omar + Colton(For review)
- Start looking into and implementing large file storage with aws S3: Chinmay
- Write tests (using jest) for all backend functionality: Omar + Aayush + Chinmay
- Write command management code for AI API: Colton + Jerry

### Burn-up chart (velocity)

- Generated burn-up chart for the current cycle:
    <img width="1020" alt="Screenshot 2024-06-12 at 6 49 50 AM" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/144177741/f90cb7d1-edab-4d42-8c60-a6320b445904">

### Times for team/individual

- Chinmay: 11 hours
- Colton: 18 hours
- Jerry: 10.5 hours
- Omar: hours
- Aayush: 12 hours


- ### Table view of completed tasks on project board (by which username)
- Containerized/Dockerized Frontend: Colton
- Containerized/Dcokerized Ollama llama3 model: Colton
- Designed General Styling sheet (CSS): Colton
- Built login page (Frontend): Colton
- Built signup page (Frontend): Colton
- Built professor and student dashboard (Frontend): Colton
- Built modular cards, side menu, and nav bar with drop down menu as components (Frontend): Colton
- Built forgot password page: Colton
- Built Account page: Colton
- Built join course page: Colton
- Issue creation for backend: Chinmay
- Built student view for submission: Chinmay
- Built admin/prof login page: Chinmay
- Backend containerization + DB integration: Chinmay
- Verifying AI model (LLama3) for usage based on performance: Chinmay
- Docker testing with all 3 containers for frontend, backend, DB: Chinmay & Jerry
  

- ### Table view of in progress tasks on project board (by which username)
- Implement backend for login/signup: Colton
- Set up reverse proxy with server and frontend container: Colton
- Design change forgettign password page (page that user is sent to from email redirect): Colton

- ### Test report/testing status
- Testing was writting to test the AI API Docker image but was unsuccessful (not much time was put into this and will work hard on this next cycle)
- No other testing has been written yet.
- More testing, and automated testing to be added with DroneCI in the following cycle.
