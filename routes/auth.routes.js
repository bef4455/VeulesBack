const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require('bcrypt');
const isAuth = require("../middleware/isAuth")
const jwt = require("jsonwebtoken")

//REGISTER
router.post("/register", async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPass,
        })

        const user = await newUser.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
})

//LOGIN
router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            console.log("Utilisateur introuvable");
            return res.status(400).json("Wrong credentials!");
        }
        console.log(user)
        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) {
            console.log("Mauvais mot de passe");
            return res.status(400).json("Wrong credentials!");
        }

        // Créez le JWT 
        const payload = { userId: user._id }
        const token = jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: '6h'
            });
        console.log("Token généré :", token);
        res.status(200).json({ token, user });
    } catch (error) {
        console.log("Erreur lors de l'authentification :", error);
        res.status(500).json(error);
    }
});

router.get('/verify', isAuth, (req, res, next) => {

    res.status(200).json(req.user)
})


module.exports = router