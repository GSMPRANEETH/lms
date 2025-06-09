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

const { User, Course, Chapter, Page } = require("./models");
const user = require("./models/user");

const saltRounds = 10;

// Middleware setup
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

// Passport strategy
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

// Middleware to restrict publisher-only access
function requirePublisher(req, res, next) {
    if (req.user && req.user.role === 'publisher') {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user.' });
    }
}

// Routes
app.get("/", (req, res) => {
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

app.get("/dashboard", connectEnsureLogin.ensureLoggedIn("/signin"), (req, res) => {
    res.render("dashboard", { user: req.user });
});


app.get("/new-blog-post", connectEnsureLogin.ensureLoggedIn("/signin"), requirePublisher, (req, res) => {
    res.json({ message: "You can create new blog post." });
});

app.get("/signout", (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = app;
