const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(decodedToken.userId);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentification failed!" });
    }
};

module.exports = isAuth;