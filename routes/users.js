//only registered users  
const express = require("express");
const router = express.Router();

router.get("/dashboard", (req,res) => {
    res.render("dashboard", { user_id: req.session.user_id })
})
router.get("/dashboard/notifications", (req,res) => {
    res.render("notifications", { user_id: req.session.user_id })
})
router.get("/dashboard/account", (req,res) => {
    res.render("account", { user_id: req.session.user_id })
})

router.get("/dashboard/create-listing", (req, res) => {
    res.render("newListing", { user_id: req.session.user_id });
  });

router.get("/dashboard/listing", async (req, res) => {
    res.render("editListing", {user_id: req.session.user_id, listing_id:req.query.id});
})
router.use("/user", (req, res, next) => {
    if (!req.session.user_id) {
        req.flash("danger", "Please login to access your dashboard")
        return res.redirect("/login");
    }
    next();
})

module.exports = router;