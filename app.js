// 🔁 All the imports (same as your current setup)
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const csrf = require("csurf");
const connectEnsureLogin = require("connect-ensure-login");

const { User, Courses, Chapters, Pages, Enrollments, Completions } = require("./models");
const user = require("./models/user");
const { title } = require("process");

const saltRounds = 10;

// 📦 Middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh, some secret string!"));
app.use(csrf({ cookie: true }));

app.use(
    session({
        secret: "shh, some secret string!",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Remove or comment out this debug logger for production
// app.use((req, res, next) => {
//     console.log(`[${req.method}] ${req.url}`);
//     next();
// });

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        console.error("❌ CSRF validation failed");
        res.status(403).send("Invalid CSRF token");
    } else {
        next(err);
    }
});

// 🔐 Passport strategy
passport.use(
    new LocalStrategy(
        { usernameField: "email" },
        async function (email, password, done) {
            try {
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    return done(null, false, { message: "Incorrect email." });
                }
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: "Incorrect password." });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// 🔐 Middleware to restrict publisher-only access
function requirePublisher(req, res, next) {
    if (req.user && req.user.role === 'educator') {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user.' });
    }
}

// 🔐 Middleware to restrict student-only access
function requireStudent(req, res, next) {
    if (req.user && req.user.role === 'student') {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user.' });
    }
}

// 🛣️ Routes
app.get("/", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    res.render("index");
});

app.get("/signup", (req, res) => {
    res.render("signup", { csrfToken: req.csrfToken() });
});

app.post("/signup", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            role: req.body.role,
            password: hashedPassword,
        });
        res.redirect("/signin");
    } catch (error) {
        console.error("User creation failed:", error);
        req.flash("error", "User creation failed. Check input and try again.");
        res.redirect("/signup");
    }
});

app.get("/signin", (req, res) => {
    res.render("signin", { csrfToken: req.csrfToken(), messages: req.flash(), user: req.user });
});

app.post(
    "/signin",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/signin",
        failureFlash: true,
    })
);

app.get("/dashboard", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
    try {
        // 1. Get all enrolled course IDs for this user
        const enrolledRows = await Enrollments.findAll({
            where: { userId: req.user.id },
            attributes: ['courseId']
        });
        const enrolledCourseIds = enrolledRows.map(row => row.courseId);

        // 2. Get enrolled courses
        const enrolledCourses = await Courses.findAll({
            where: { id: enrolledCourseIds }
        });

        // 3. Get available (not enrolled) courses
        const availableCourses = await Courses.findAll({
            where: {
                id: { [require('sequelize').Op.notIn]: enrolledCourseIds }
            }
        });

        res.render("dashboard", {
            user: req.user,
            csrfToken: req.csrfToken(),
            enrolledCourses,
            availableCourses,
            messages: req.flash()
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        req.flash("error", "Could not load courses.");
        res.redirect("/");
    }
});

app.get("/signout", (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

app.get("/createnewcourse", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, (req, res) => {
    res.render("addcourse", { user: req.user, csrfToken: req.csrfToken() });
});

app.post("/createnewcourse", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, async (req, res) => {
    try {
        const course = await Courses.create({
            name: req.body.name,
            creatorId: req.user.id,
        });

        req.flash("success", "Course created successfully.");
        res.redirect("/addchapters");
    } catch (error) {
        console.error("Course creation failed:", error);
        req.flash("error", "Course creation failed. Check input and try again.");
        res.redirect("/createnewcourse");
    }
});

app.get("/addchapters", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, async (req, res) => {
    let myCourses = await getCourse(req);
    res.render("addchapters", { myCourses: myCourses, user: req.user, csrfToken: req.csrfToken(), messages: req.flash(), });
});

app.post("/addchapters", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, async (req, res) => {
    try {
        const course = await Courses.findOne({ where: { name: req.body.courseName } });
        if (!course) throw new Error("Course not found");

        await Chapters.create({
            name: req.body.chapterName,
            description: req.body.description,
            courseId: course.id,
        });

        req.flash("success", "Chapter created successfully.");
        // ✅ Pass courseId in query string to /addpages
        res.redirect(`/addpages?courseId=${course.id}`);
    } catch (error) {
        console.error("❌ Chapter creation failed:", error);
        req.flash("error", "Chapter creation failed.");
        res.redirect("/addchapters");
    }
});

app.get("/addpages", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, async (req, res) => {
    try {
        const courseId = req.query.courseId;
        const myChapters = await Chapters.findAll({
            where: { courseId },
            include: [{ model: Pages }]
        });

        res.render("addpages", {
            user: req.user,
            csrfToken: req.csrfToken(),
            myChapters: myChapters,
            courseId: courseId,
            messages: req.flash(),
        });
    } catch (error) {
        console.error("❌ Error loading /addpages:", error);
        req.flash("error", "Missing or invalid course.");
        res.redirect("/dashboard");
    }
});

app.post("/addpages", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, async (req, res) => {
    try {
        const courseId = req.body.courseId;
        const chapterId = req.body.chapterId;
        const title = req.body.title;
        const content = req.body.content;

        if (!courseId || !chapterId || !title || !content) {
            throw new Error("Missing required fields");
        }

        await Pages.create({
            title: title,
            content: content,
            chapterId: chapterId,
        });

        req.flash("success", "Page created successfully.");
        return res.redirect(`/mycourses`);
    } catch (error) {
        console.error("❌ Fatal error in POST /addpages:", error);
        req.flash("error", "Page creation failed.");
        return res.redirect(`/addpages?courseId=${req.body.courseId || ''}`);
    }
});

// Show update password form
app.get('/update-password', connectEnsureLogin.ensureLoggedIn('/signin'), (req, res) => {
    res.render('update-password', { csrfToken: req.csrfToken(), user: req.user, messages: req.flash() });
});

// Handle update password form submission
app.post('/update-password', connectEnsureLogin.ensureLoggedIn('/signin'), async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
        req.flash('error', 'Old password incorrect');
        return res.redirect('/update-password');
    }
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();
    req.flash('success', 'Password updated');
    res.redirect('/dashboard');
});

// Enroll in a course
app.post('/enroll/:courseId', connectEnsureLogin.ensureLoggedIn('/signin'), requireStudent, async (req, res) => {
    try {
        // Prevent duplicate enrollments
        const [enrollment, created] = await Enrollments.findOrCreate({
            where: { userId: req.user.id, courseId: req.params.courseId }
        });
        if (created) {
            req.flash('success', 'Enrolled successfully!');
        } else {
            req.flash('info', 'You are already enrolled in this course.');
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Enrollment error:", error);
        req.flash('error', 'Could not enroll in course.');
        res.redirect('/dashboard');
    }
});

// Show a specific page
app.get('/pages/:pageId', connectEnsureLogin.ensureLoggedIn('/signin'), async (req, res) => {
    try {
        const page = await Pages.findByPk(req.params.pageId, {
            include: [{ model: Chapters }]
        });
        if (!page) {
            req.flash('error', 'Page not found');
            return res.redirect('back');
        }
        const chapter = page.Chapter;
        const course = await Courses.findByPk(chapter.courseId);

        // Only allow educator (creator) or enrolled student
        let allowed = false;
        if (req.user.role === 'educator' && course.creatorId === req.user.id) {
            allowed = true;
        } else if (req.user.role === 'student') {
            const enrollment = await Enrollments.findOne({
                where: { userId: req.user.id, courseId: course.id }
            });
            allowed = !!enrollment;
        }
        if (!allowed) {
            req.flash('error', 'You are not authorized to view this course.');
            return res.redirect('/dashboard');
        }

        res.render('page', {
            user: req.user,
            csrfToken: req.csrfToken(),
            page,
            chapter,
            course,
            messages: req.flash()
        });
    } catch (error) {
        console.error("Error loading page:", error);
        req.flash('error', 'Could not load page.');
        res.redirect('back');
    }
});

// Mark a page as complete
app.post('/pages/:pageId/complete', connectEnsureLogin.ensureLoggedIn('/signin'), requireStudent, async (req, res) => {
    try {
        const pageId = req.params.pageId;
        const userId = req.user.id;
        await Completions.findOrCreate({ where: { userId, pageId } });
        req.flash('success', 'Page marked as complete!');
        res.redirect(`/pages/${pageId}`);
    } catch (error) {
        console.error("Completion error:", error);
        req.flash('error', 'Could not mark as complete.');
        res.redirect(`/pages/${req.params.pageId}`);
    }
});

// 📦 Helper functions
async function getCourse(req) {
    return await Courses.findAll({ where: { creatorId: req.user.id } });
}

async function getChapters(req, cId) {
    const courseId = cId || req.query.courseId;
    if (!courseId) throw new Error("Missing courseId in query");

    return await Chapters.findAll({ where: { courseId } });
}

// Remove or comment out this debug middleware for production
// app.use("/addpages", (req, res, next) => {
//     console.log("🛡️ Middleware saw request:", req.method, req.path);
//     next();
// });

app.get("/mycourses", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
    let myCourses = await getCourse(req);
    res.render("mycourses", { user: req.user, csrfToken: req.csrfToken(), myCourses: myCourses, messages: req.flash() });
});

// Route to view a specific course and its chapters
app.get("/courses/:courseId", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
    const courseId = req.params.courseId;
    const course = await Courses.findByPk(courseId);
    if (!course) return res.status(404).send("Course not found");

    const myChapters = await Chapters.findAll({
        where: { courseId },
        include: [{ model: Pages }]
    });

    // Check if user is educator (creator)
    const isEducator = req.user.role === 'educator' && course.creatorId === req.user.id;

    // Check if user is enrolled
    let isEnrolled = false;
    let completedPageIds = [];
    let progress = 0;

    if (req.user.role === 'student') {
        const enrollment = await Enrollments.findOne({
            where: { userId: req.user.id, courseId }
        });
        isEnrolled = !!enrollment;

        // Progress calculation
        if (isEnrolled) {
            // Get all page IDs for this course
            const allPages = await Pages.findAll({
                include: [{ model: Chapters, where: { courseId } }],
                attributes: ['id']
            });
            const allPageIds = allPages.map(p => p.id);

            // Get completed page IDs for this user
            const completions = await Completions.findAll({
                where: { userId: req.user.id, pageId: allPageIds },
                attributes: ['pageId']
            });
            completedPageIds = completions.map(c => c.pageId);

            progress = allPageIds.length > 0
                ? Math.round((completedPageIds.length / allPageIds.length) * 100)
                : 0;
        }
    }

    res.render("course", {
        user: req.user,
        csrfToken: req.csrfToken(),
        myChapters,
        course,
        isEducator,
        isEnrolled,
        progress,
        completedPageIds
    });
});

app.get('/reports', connectEnsureLogin.ensureLoggedIn('/signin'), requirePublisher, async (req, res) => {
    try {
        // Get all courses created by this educator
        const courses = await Courses.findAll({ where: { creatorId: req.user.id } });

        // For each course, count enrollments
        const reports = await Promise.all(
            courses.map(async course => {
                const count = await Enrollments.count({ where: { courseId: course.id } });
                return { course, count };
            })
        );

        res.render('reports', { user: req.user, reports, csrfToken: req.csrfToken(), messages: req.flash() });
    } catch (error) {
        console.error("Error loading reports:", error);
        req.flash("error", "Could not load reports.");
        res.redirect('/dashboard');
    }
});


module.exports = app;
