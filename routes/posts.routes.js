const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Post = require("../models/post")
const isAuth = require("../middleware/isAuth")

//CREATE POST
router.post("/", isAuth, async (req, res, next) => {
    const newPost = new Post(req.body);

    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (error) {
        res.status(500).json(error)
        console.log(error)

    }
});

//UPDATE POST
router.patch("/:id", isAuth, async (req, res, next) => {

    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true }
        );
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json(error)
    }
});

//DELETE POST
router.delete("/:id", isAuth, async (req, res, next) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
});

//GET POST
router.get("/:id", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json(error);

    }
})

//GET ALL POSTS
router.get("/", async (req, res, next) => {
    const username = req.query.user;
    const catName = req.query.cat;
    try {
        let posts;
        if (username) {
            posts = await Post.find({ username })
        } else if (catName) {
            posts = await Post.find({
                categories: {
                    $in: [catName]
                }
            })
        } else {
            posts = await Post.find();
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json(error);

    }
})
module.exports = router