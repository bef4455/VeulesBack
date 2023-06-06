const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Post = require("../models/post")
const bcrypt = require("bcrypt");


//UPDATE
router.patch("/:id", async (req, res, next) => {
    try {
        const userId = req.params.id;

        const { username, email, password, profilePic } = req.body;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(password, salt);
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    username,
                    email,
                    password: req.body.password,
                    profilePic,

                },
            },
            { new: true }
        );

        res.status(200).json(updateUser);
    } catch (error) {
        res.status(500).json(error);
    }
});

//DELETE
router.delete("/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (!req.user || user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You can delete only your account!" });
        }

        try {
            await Post.deleteMany({ username: user.username }); // Supprimer tous les posts de l'utilisateur
            await User.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: "User has been deleted!" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Failed to delete user." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete user." });
    }
});

//GET USER
router.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc
        // console.log(userId)
        res.status(200).json(others);
    } catch (error) {
        res.status(500).json(error);

    }
})

module.exports = router