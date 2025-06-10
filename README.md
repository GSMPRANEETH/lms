Praneeth's LMS Portal
Welcome to Praneeth's LMS Portal – a modern and responsive Learning Management System (LMS) built using Node.js, Express, Sequelize, PostgreSQL, and EJS. This platform enables educators to build structured online courses and students to learn interactively at their own pace.

🌐 Live URL: https://praneeths-lms-portal.onrender.com

🚀 Features
🧑‍🏫 For Educators
Create and Manage Courses

Add a course with a name and description.

Organize course content into chapters, similar to textbook structure.

Populate chapters with pages that contain instructional content.

Optionally, include quizzes at the end of each chapter to assess student understanding.

Real-time Reports

View number of students enrolled in each course.

Analyze course popularity using simple enrollment-based statistics.

Account Management

Secure login system.

Ability to change password.

🎓 For Students
Account Access

Sign up, sign in, and sign out securely.

Password updates supported.

Course Discovery and Enrollment

Search and preview courses by chapter list before enrolling.

Enroll in any available course with a single click.

Interactive Learning

Access course content only after enrollment.

Mark individual pages as completed.

Track progress automatically based on page completions and quiz results.

Progress System

Completion percentage shown for each course.

Intelligent chapter-level progress calculated from:

Pages marked as complete.

Quizzes passed (only counted when present).

Course progress = average of all chapters’ progress.

📸 Screenshots
Coming Soon – Visual walkthrough of key interfaces including dashboard, course builder, student views, and reports.

🎥 Demo Video
Coming Soon – A video demonstration covering the platform's capabilities, intended user flows, and design highlights.

🛠️ Tech Stack
Backend: Node.js, Express.js

Database: PostgreSQL, Sequelize ORM

Authentication: Passport.js (Local Strategy), session-based

Security: CSRF protection, hashed passwords using bcrypt

Templating: EJS with TailwindCSS for modern, responsive UI

Testing: Jest + Supertest

Deployment: Render

📂 Project Setup
bash
Copy
Edit

# Install dependencies

npm install

# Setup your environment variables and database config

# Run migrations

npx sequelize-cli db:migrate

# Start the server

npm start
🙌 Acknowledgements
Thanks to the open-source community for the libraries and frameworks used in this project. Special appreciation to educators and learners everywhere who inspire the need for accessible and effective digital learning tools.
