// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database'
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const multer = require("multer");
const path = require("path");
const isAuth = require('./middleware/isAuth')


const app = express();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});


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

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("File has been uploaded =)")
});
// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
