const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const isAuth = require("../middleware/isAuth")

// CREATE CATEGORY
router.post("/", isAuth, async (req, res, next) => {
    const newCat = new Category(req.body);
    try {
        const savedCat = await newCat.save();
        res.status(200).json(savedCat);
    } catch (error) {
        res.status(500).json(error);
    }
})

// CATEGORY
router.get("/", async (req, res, next) => {
    try {
        const cats = await Category.find();
        res.status(200).json(cats);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router