[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=15118668&assignment_repo_type=AssignmentRepo)
# Project-Starter

## Colton Palfrey, Omar Hemed, Chinmay Arvind, Aayush Chaudhary, Jerry Fan

**To run the app after you pull from development branch:**
- In Terminal #1: (run the docker-compose for frontend and database)
  - cd app
  - docker-compose up
- In Terminal #2: (run the backend server)
  - cd app/aivaluate/backend
  - npm install
  - npm run dev
    
- Frontend running at localhost:5173
- DB manager running at localhost:8080
- Backend server running at localhost:4000

Please use the provided folder structure for your docs (project plan, design documenation, communications log, weekly logs and final documentation), source code, tesing, etc.    You are free to organize any additional internal folder structure as required by the project.  The team **MUST** use a branching workflow and once an item is ready, do remember to issue a PR, review and merge in into the master brach.
```
.
├── docs                    # Documentation files (alternatively `doc`)
│   ├── TOC.md              # Table of contents
│   ├── plan                # Scope and Charter
│   ├── design              # Getting started guide
│   ├── final               # Getting started guide
│   ├── logs                # Team Logs
│   └── ...
├── build                   # Compiled files (alternatively `dist`))    
├── app                     # Source files (alternatively `lib` or `src`)
├── test                    # Automated tests (alternatively `spec` or `tests`)
├── tools                   # Tools and utilities
├── LICENSE                 # The license for this project 
└── README.md
```
You can find additional information on folder structure convetions [here](https://github.com/kriasoft/Folder-Structure-Conventions). 

Also, update your README.md file with the team and client/project information.  You can find details on writing GitHub Markdown [here](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) as well as a [handy cheatsheet](https://enterprise.github.com/downloads/en/markdown-cheatsheet.pdf).   
