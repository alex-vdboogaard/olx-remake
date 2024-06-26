const express = require("express");
const router = express.Router();
const User = require('../models/user');
const Category = require('../models/category');
const Listing = require('../models/listing');
const Notification = require('../models/notification');
const Area = require('../models/area');
const UserContact = require("../models/userContact");
const catchAsync = require("../public/js/catchAsync");
const {ExpressError} = require("../public/js/expressError");
const {validateSchemaMiddleware} = require("../public/js/validateSchemaMiddleware");
const functions = require("../public/js/commonFunctions");
const multer = require("multer");
const {formatDate} = require("../public/js/transformDate");

//image upload via multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Generate unique filename
    }
  });
const upload = multer({ storage: storage });

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

router.get("/create-category", (req,res) => {
    res.render("admin/create-category")
})

router.get("/create-area", (req,res) => {
    res.render("admin/create-area")
})

router.get("/send-notification", (req,res) => {
    res.render("admin/send-notification")
})

router.get("/database", (req,res) => {
    res.render("admin/database")
})

router.get("/edit-listing", catchAsync(async(req,res) => {
    const {id} = req.query;
    const listing = await Listing.findOne({_id:id});
    res.render("admin/edit-listing", {listing:listing});
}));

router.get("/send-notification", catchAsync(async(req,res) => {
    const {id} = req.query;
    const user = await User.findById(id);
    res.render("admin/send-notification", {username:user.username});
}));



//api, get
router.get("/api/listing", catchAsync(async (req,res) => {
    const {id} = req.query;
    const listing = await Listing.findById(id);
    res.json(listings);
}));

router.get("/api/listings", catchAsync(async (req,res) => {
    const listings = await Listing.find();
    res.json(listings);
}));

router.get("/api/users", catchAsync(async (req,res) => {
    const users = await User.find({role:"user"});
    res.json(users);
}));

router.get("/api/categories", catchAsync(async (req,res) => {
    const categories = await Category.find();
    res.json(categories);
}));

router.get("/api/areas", catchAsync(async (req,res) => {
    const areas = await Area.find();
    res.json(areas);
}));

router.get("/api/contacts", catchAsync(async (req,res) => {
    const usercontacts = await UserContact.find();
    res.json(usercontacts);
}));

router.get("/api/getdates", catchAsync(async (req, res) => {
    const { dates } = req.query;
    const parsedDates = JSON.parse(dates);
    const listings = await Listing.find();
    const dateCountMap = {};

    parsedDates.forEach(date => {
        dateCountMap[date] = 0;
    });

    listings.forEach(listing => {
        const listingDate = formatDate(listing.date);
        if (dateCountMap.hasOwnProperty(listingDate)) {
            dateCountMap[listingDate]++;
        }
    });

    const data = parsedDates.map(date => dateCountMap[date]);

    res.json(data);
}));


//api, count
router.get("/api/count-area", catchAsync(async (req,res) => {
    const {description} = req.query;
    const listings = await Listing.find({area:description});
    const count = listings.length;
    res.json(count);
}));

router.get("/api/count-category", catchAsync(async (req,res) => {
    const {description} = req.query;
    const listings = await Listing.find({category:description});
    const count = listings.length;
    res.json(count);
}));

router.get("/api/count-listings", catchAsync(async (req,res) => {
    const {username} = req.query;
    const listings = await Listing.find({username:username});
    const count = listings.length;
    res.json(count);
}));

//api, delete

router.delete("/api/delete-category", catchAsync(async (req,res) => {
    const { description } = req.query;
    const category = await Category.findOneAndDelete({ description: description });
    const listings = await Listing.find({ category: description });
    for (const listing of listings) {
        await Listing.findByIdAndUpdate(listing._id, { category: "Other" });
    }
    req.flash("success", "Category deleted");
    res.render("/admin/database");
}));

router.delete("/api/delete-area", catchAsync(async (req,res) => {
    const { description } = req.query;
    const area = await Area.findOneAndDelete({ description: description });
    const listings = await Listing.find({ area: description });
    for (const listing of listings) {
        await Listing.findByIdAndUpdate(listing._id, { area: "Other" });
    }
    req.flash("success", "Area deleted");
    res.render("/admin/database");
}));


router.delete("/api/delete-listing", catchAsync(async (req,res) => {
    const {id} = req.query;
    listing = await Listing.findById(id);
    await Listing.findOneAndDelete({_id:id});
    const notification = new Notification({username:listing.username, description:`Your listing, ${listing.title}, was deleted by the Admin.`})
    await notification.save();
    req.flash("success", "Listing deleted, the seller has been notified")
    res.redirect("/admin/listings");
}));

router.delete("/api/delete-contact", catchAsync(async (req,res) => {
    const {id} = req.query;
    await UserContact.findOneAndDelete({_id:id});
    req.flash("success", "Contact form submission deleted")
    res.redirect("/admin/dashboard");
}));

router.delete("/api/delete-user", catchAsync(async (req, res) => {
    const { id } = req.query;
    const user = await User.findById(id);
    await User.findOneAndDelete({ _id: id });
    //find listings with that username and delete them
    const listings = await Listing.find({ username: user.username });
    for (const listing of listings) {
        await Listing.findByIdAndDelete(listing._id);
    }

    req.flash("success", "User and corresponding listings deleted");
    res.redirect("/admin/database");
}));
//api, create
router.post("/api/send-notification", validateSchemaMiddleware("notification"), catchAsync(async (req,res) => {
    let {username, description} = req.body;
    description = "You have a message from the admin: " + description;
    const notification = new Notification({username:username, description:description})
    await notification.save()
    req.flash("success", "Notification sent")
    res.redirect("/admin/send-notification");
}));

router.post("/api/create-category", catchAsync(async (req,res) => {
    const {description} = req.body;
    //find duplicate
    const dupCategory = await Category.findOne({description:description});
    if (dupCategory) {
        throw new ExpressError("Category already exists")
    };
    const category = new Category({description:description})
    await category.save()
    req.flash("success", "New category created")
    res.redirect("/admin/database");
}));

router.post("/api/create-area", catchAsync(async (req,res) => {
    const {description} = req.body;
    //find duplicate
    const dupArea = await Area.findOne({description:description});
    if (dupArea) {
        throw new ExpressError("Area already exists")
    };
    const area = new Area({description:description})
    await area.save()
    req.flash("success", "New area created")
    res.redirect("/admin/database");
}));

//api, edit
router.post("/api/edit-listing", upload.single("image"), validateSchemaMiddleware('listing'),
  catchAsync(async (req, res) => {
    const {id, image} = req.query;
    const { title, username, description, price, category, area } = req.body;

    let imagePath = req.file ? req.file.path : image; // Use the new file path if uploaded, otherwise use the original image path
    if (req.file) {
        // If a new file was uploaded, delete the original image
        functions.deleteImage(image);
      }

    const listing = Listing.findByIdAndUpdate(id, {
      title: title,
      description: description,
      price: price,
      category: category,
      area: area,
      image: imagePath,
      username:username
    }).exec();
    const notification = new Notification({username:username, description:`Your listing, ${listing.title}, was edited by the admin`})
    await notification.save()
    req.flash("success", "Listing updated")
    res.redirect("/admin/listings");
}));


module.exports = router;