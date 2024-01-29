const express = require("express");
const router = express.Router();
const cors = require("cors");
const User = require("../models/User.model");
const bcrypt = require('bcrypt');
const isAuth = require("../middleware/isAuth")
const jwt = require("jsonwebtoken")
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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


// FORGOT PASSWORD
router.post("/mot-de-passe-oublie", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_TOKEN_SECRET, { expiresIn: '1h' });

        const resetUrl = `https://samsuphi.netlify.app/reset-password?token=${resetToken}`;

        const msg = {
            to: email,
            from: 'befacool@gmail.com',
            subject: 'Réinitialisation du mot de passe',
            text: `Utilisez ce lien pour réinitialiser votre mot de passe: ${resetUrl}`,
            html: `<p>Utilisez ce lien pour réinitialiser votre mot de passe:</p><a href="${resetUrl}">Réinitialiser le mot de passe</a>`,
        };

        await sgMail.send(msg);
        res.status(200).json({ message: "Jeton de réinitialisation du mot de passe envoyé à l'email." });
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation du mot de passe :", error);
        res.status(500).json({ message: "Erreur lors de la demande de réinitialisation du mot de passe." });
    }
});


// RESET PASSWORD
router.post("/reinitialiser-mot-de-passe", async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken) {
            return res.status(400).json({ message: "Le jeton de réinitialisation du mot de passe est requis." });
        }

        const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);
        user.password = hashedPass;

        await user.save();
        res.status(200).json({ message: "Réinitialisation du mot de passe réussie." });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Le jeton de réinitialisation du mot de passe a expiré." });
        } else {
            return res.status(400).json({ message: "Le jeton de réinitialisation du mot de passe est invalide." });
        }
    }
});

// VERIFY RESET TOKEN
router.post("/verify-reset-token", async (req, res) => {
    try {
        const { resetToken } = req.body;

        if (!resetToken) {
            return res.status(400).json({ message: "Le jeton de réinitialisation du mot de passe est requis." });
        }

        const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        res.status(200).json({ message: "Le jeton de réinitialisation du mot de passe est valide." });
    } catch (error) {
        console.error("Erreur lors de la vérification du jeton de réinitialisation :", error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Le jeton de réinitialisation du mot de passe a expiré." });
        } else {
            return res.status(400).json({ message: "Le jeton de réinitialisation du mot de passe est invalide." });
        }
    }
});

module.exports = router;