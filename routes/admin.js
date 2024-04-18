const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
    if (!req.session.admin_id) {
        req.flash("danger", "Please login to access your dashboard")
        return res.redirect("/login");
    }
    next();
})

router.get("/dashboard", (req,res) => {
    res.render("admin/dashboard")
})
module.exports = router;