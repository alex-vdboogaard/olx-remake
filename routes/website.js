const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    res.render("../public/website/home");
})
router.get("/login", async (req, res) => {
    res.render("login");
})
router.get("/logout", (req,res) => {
    req.session.destroy();
    res.redirect("/login");
})

router.get("/contact", async(req,res) => {
    res.render("../public/website/contact");
})
router.get("/create-account", async (req, res) => {
    res.render("create-account");
})
router.get("/listings", async (req, res) => {
    res.render("../public/website/listings");
})
router.get("/listing", async (req, res) => {
    res.render("../public/website/listing", {id:req.query.id});
})


module.exports = router;