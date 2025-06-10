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
Visual walkthrough of key interfaces including dashboard, course builder, student views, and reports.
![Screenshot (213)](https://github.com/user-attachments/assets/81766bbd-135a-4179-a12a-972215eddfad)
![Screenshot (214)](https://github.com/user-attachments/assets/2e72fc0d-bb28-4aff-834d-1afb5c254299)
![Screenshot (215)](https://github.com/user-attachments/assets/19fb08d7-1598-4c10-b871-f19ae56d519b)
![Screenshot (216)](https://github.com/user-attachments/assets/8eca5f1f-a1f5-468e-9edf-508466246efd)
![Screenshot (217)](https://github.com/user-attachments/assets/c18731fa-559f-40c2-a7cf-ebf98f8ab533)
![Screenshot (218)](https://github.com/user-attachments/assets/94c15654-6a4d-4f45-9542-64fb45084a53)
![Screenshot (219)](https://github.com/user-attachments/assets/37a1138c-f5ec-40e7-82d7-e3387cf9d12e)
![Screenshot (220)](https://github.com/user-attachments/assets/fcae8533-434c-416d-8ad5-0092e12f77ea)
![Screenshot (221)](https://github.com/user-attachments/assets/62d3d263-c6ca-420a-8141-e9b20889b6e6)
![Screenshot (222)](https://github.com/user-attachments/assets/fdc8cf43-553f-4c35-9db1-a7c52e8e0d96)
![Screenshot (223)](https://github.com/user-attachments/assets/e6448e04-b186-430d-862d-2b5cb77f2b60)
![Screenshot (224)](https://github.com/user-attachments/assets/ffb044eb-5cae-4ac5-b20d-9c65be706160)


🎥 Demo Video
A video demonstration covering the platform's capabilities, intended user flows, and design highlights.
https://youtu.be/Rkj7syVg8lg

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
