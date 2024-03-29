// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database'
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const isAuth = require('./middleware/isAuth')


const app = express();
app.use(express.json());

// ℹ️ Add this line to include the Cloudinary middleware
const fileUpload = require('./config/cloudinary');

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoute = require("./routes/auth.routes")
app.use("/api/auth", authRoute);

const userRoute = require("./routes/user.routes")
app.use("/api/users", isAuth, userRoute);

const postRoute = require("./routes/posts.routes")
app.use("/api/posts", postRoute);

const categoryRoute = require("./routes/categories.routes")
app.use("/api/categories", categoryRoute);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
