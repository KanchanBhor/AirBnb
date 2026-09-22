require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/reviews.js");
const userRouter = require("./Routes/user.js");


// ================= DATABASE =================

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl, {
    dbName: "wonderlust"
  });

  console.log("connected to DB");
}

main()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server is listening to port 8080");
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:");
    console.log(err);
  });


// ================= EJS =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));


// ================= SESSION =================

const store = MongoStore.create({
  mongoUrl: dbUrl,
  dbName: "wonderlust",

  crypto: {
    secret: process.env.SECRET
  },

  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,

  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: true,

  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,

    maxAge: 7 * 24 * 60 * 60 * 1000,

    httpOnly: true
  }
};

app.use(session(sessionOptions));

app.use(flash());


// ================= PASSPORT =================

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());

app.use(passport.session());


// ================= LOCALS =================

app.use((req, res, next) => {

  res.locals.currUser = req.user;

  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  next();

});


// ================= ROUTES =================

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);


// ================= 404 ERROR =================

app.all("*splat", (req, res, next) => {

  next(new ExpressError(404, "Page Not Found"));

});


// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

  let {
    statusCode = 500,
    message = "Something went wrong"
  } = err;

  res.status(statusCode).render("error.ejs", { err });

});