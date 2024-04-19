const express = require("express");
const router = express.Router();
const User = require('./models/user');
const Category = require('./models/category');
const Listing = require('./models/listing');
const Notification = require('./models/notification');
const Area = require('./models/area');
const UserContact = require("./models/userContact");
const catchAsync = require("./public/js/catchAsync");

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

router.get("/listings", (req,res) => {
    res.render("admin/listings")
})

router.get("/database", (req,res) => {
    res.render("admin/database")
})

router.get("/edit-listing", (req,res) => {
    const {id} = req.query;
    res.render("admin/database", {listing_id:id});
})

router.get("/send-notification", wrapAsync(async(req,res) => {
    const {id} = req.query;
    const user = await User.findById(id);
    res.render("admin/database", {username:user.username});
}));



//api, get
router.get("api/listing", wrapAsync(async (req,res) => {
    const {id} = req.query;
    const listing = await Listing.findById(id);
    res.json(listings);
}));

router.get("api/listings", wrapAsync(async (req,res) => {
    const listings = await Listing.find();
    res.json(listings);
}));

router.get("api/users", wrapAsync(async (req,res) => {
    const users = await User.find();
    res.json(users);
}));

router.get("api/categories", wrapAsync(async (req,res) => {
    const categories = await Category.find();
    res.json(categories);
}));

router.get("api/areas", wrapAsync(async (req,res) => {
    const areas = await Area.find();
    res.json(areas);
}));

router.get("api/usercontacts", wrapAsync(async (req,res) => {
    const usercontacts = await UserContact.find();
    res.json(usercontacts);
}));

//api, delete

router.post("api/delete-category", wrapAsync(async (req, res) => {
    const { id } = req.query;
    const category = await Category.findById(id);
    await Category.findOneAndDelete({ _id: id });
    //find listings with that category and set them to Other
    const listings = await Listing.find({ category: category.description });
    
    for (const listing of listings) {
        await Listing.findByIdAndUpdate(listing._id, { category: "Other" });
    }

    req.flash("success", "Category deleted");
    res.redirect("/admin/database");
}));

router.post("api/delete-area", wrapAsync(async (req,res) => {
    const {id} = req.query;
    const area = await area.findById(id);
    await Area.findOneAndDelete({ _id: id });
    //find listings with that area and set them to Other
    const listings = await Listing.find({ area: area.description });
    
    for (const listing of listings) {
        await Listing.findByIdAndUpdate(listing._id, { area: "Other" });
    }
    req.flash("success", "Area deleted")
    res.redirect("/admin/database");
}));

router.post("api/delete-listing", wrapAsync(async (req,res) => {
    const {id} = req.query;
    listing = await Listing.findById(id);
    await Listing.findOneAndDelete({_id:id});
    const notification = new Notification({username:listing.username, description:`Your listing, ${listing.title}, was deleted by the Admin.`})
    await notification.save();
    req.flash("success", "Listing deleted, the seller has been notified")
    res.redirect("/admin/listings");
}));

router.post("api/delete-usercontact", wrapAsync(async (req,res) => {
    const {id} = req.query;
    await UserContact.findOneAndDelete({_id:id});
    req.flash("success", "Contact form submission deleted")
    res.redirect("/admin/dashboard");
}));

router.post("api/delete-user", wrapAsync(async (req, res) => {
    const { id } = req.query;
    const user = await User.findById(id);
    await User.findOneAndDelete({ _id: id });
    //find listings with that username and delete them
    const listings = await Listing.find({ username: user.username });
    
    for (const listing of listings) {
        await Listing.findByIdAndDelete(listing._id);
    }

    req.flash("success", "User and corresponding listings deleted");
    res.redirect("/admin/dashboard");
}));
//api, create
router.post("api/send-notification", wrapAsync(async (req,res) => {
    const {username, message} = req.body;
    const notification = new Notification({username:username, description:message})
    await Notification.save()
    req.flash("success", "Notification sent")
    res.redirect("/admin/dashboard");
}));

router.post("api/create-category", wrapAsync(async (req,res) => {
    const {description} = req.body;
    const category = new Category({description:description})
    await category.save()
    req.flash("success", "New category created")
    res.redirect("/admin/database");
}));

router.post("api/create-area", wrapAsync(async (req,res) => {
    const {description} = req.body;
    const area = new Area({description:description})
    await area.save()
    req.flash("success", "New area created")
    res.redirect("/admin/database");
}));

//api, edit
router.put("api/edit-listing", wrapAsync(async (req,res) => {
    const {id, title, description} = req.body;
    const listing = await Listing.findById(id);
    await Listing.findByIdAndUpdate(id, {title:title, description:description, image:image}).exec();
    const notification = new Notification({username:listing.username, description:`Your listing, ${listing.title}, was edited by the admin`})
    await Notification.save()
    req.flash("success", "New category created")
    res.redirect("/admin/database");
}));


module.exports = router;