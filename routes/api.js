const express = require("express");
const router = express.Router();

const User = require('../models/user');
const Category = require('../models/category');
const Listing = require('../models/listing');
const Notification = require('../models/notification');
const Area = require('../models/area');
const catchAsync = require("../public/js/catchAsync");
const fs = require('fs');
const bcrypt = require("bcrypt");
const {validateSchema} = require("../schemas")



const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/OLX");
async function getUser(id) {
    const user = await User.findById(id);
    return user;
};
const hashPassword = async(userPassword) => {
    const salt = await bcrypt.genSalt(12); //parameter is "difficulty"
    const hash = await bcrypt.hash(userPassword, salt);
    return hash;
}
const validateSchemaMiddleware = (schemaName) => (req, res, next) => {
    const { error } = validateSchema(schemaName, req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(",");
      next(new ExpressError(msg, 400));
    } else {
      next();
    }
  };
function deleteImage(filePath) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File does not exist');
        return;
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return;
        }
      });
    });
  }
//api for data
//get data
router.get("/all-listings", catchAsync(async(req,res) => {
    const { id } = req.query;
    if (id === "all") {
        // Fetch all listings from the database
        const listings = await Listing.find();
        res.json(listings);
    }
    else {
        const user = await User.findById(id);
        const listings = await Listing.find({ username: user.username });
        res.json(listings);
    }
}))

router.get("/areas", catchAsync(async(req,res) => {
    const areas = await Area.find();
    res.json(areas);
}))

router.get("/categories", catchAsync(async(req,res) => {
    const categories = await Category.find();
    res.json(categories);
}))

router.get("/notifications", catchAsync(async(req,res) => {
    const { id } = req.query;
    const user = await User.findById(id);
    const notifications = await Notification.find({ username: user.username });
    res.json(notifications);

}))

router.get("/listing", catchAsync(async(req,res) => {
    const { id } = req.query;
    const listing = await Listing.findById(id);
    res.json(listing);
}))

router.get("/category-description", catchAsync(async(req,res) => {
    const description = await Category.findOne({_id: req.params.id}).description;
    res.json(description);
}))

router.get("/area-description", catchAsync(async (req, res) => {
    const description = await Area.findOne({ _id: req.query.id }).description;
    res.json(description);
}));
router.get("/notificationcount", catchAsync(async(req,res) => {
    const { id } = req.query;
    if (id) {
        const user = await User.findById(id);
        const notifications = await Notification.find({ username: user.username });
        res.json(notifications.length);
    }      
}))
router.get("/userdetails", catchAsync(async(req,res) => {
    const {id} = req.query;
    const user = await User.findOne({username:id});
    res.json(user);
}))

router.get("/userbyid", catchAsync(async(req,res) => {
    const {id} = req.query;
    const user = await User.findById(id);
    res.json(user);
}))

//delete data
router.get("/deletenotification", catchAsync(async(req,res) => {
const { id } = req.query;
    const notification = await Notification.findOneAndDelete({ _id: id });
    res.redirect("/user/dashboard/notifications");
}))

router.get("/deleteallnotification", catchAsync(async(req,res) => {
    const { id } = req.query;
    const user = await getUser(id);
    const notification = await Notification.deleteMany({ username: user.username });
    res.redirect("/user/dashboard/notifications");
}))

router.get("/delete-listing", catchAsync(async (req, res) => {
    const { id } = req.query;
    const user = await getUser(req.session.user_id);
    const notification = new Notification({ username: user.username, description: "You deleted a listing, hope you sold it!" });
    await notification.save();
    const listing = await Listing.findById(id);
    deleteImage(listing.image);
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.render("dashboard", {user_id:req.session.user_id}); 
}));

router.get("/delete-user", catchAsync(async (req, res) => {
    const { id } = req.query;
    const user = await getUser(id);
    const listings = await Listing.find({username:user.username});
    listings.forEach(listing => {
       deleteImage(listing.image); 
    });
    await Listing.deleteMany({username:user.username});
    await Notification.deleteMany({username: user.username});
    await User.findOneAndDelete({username:user.username});
    req.session.user_id = null;
    req.flash("success", "Account deleted, sad to see you go!");
    res.render("login"); 
}));

router.post("/update-account/:_id", validateSchemaMiddleware('user'), catchAsync(async (req, res) => {
    let { username, governmentId, firstName, lastName, cell, password } = req.body;
    let _id = req.params._id;
    const user = await getUser(_id);

    //user entered a new cellphone number:
    if (user.cell != cell) {
        let dupUser = await User.find({cell:cell});
        if (dupUser.length > 0) {
            throw new ExpressError("Cellphone number already exists.")
        }
    }

    password = await hashPassword(password);
    await User.findByIdAndUpdate(_id, { username, governmentId, firstName, lastName, cell, password }, { new: true });
    const notification = new Notification({description:`You changed your account details`, username:username})
    await notification.save();
    req.flash("success", "Account updated successfully");
    res.redirect("/user/dashboard/account");
}));

module.exports = router;