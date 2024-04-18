//load modules
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const multer = require('multer');
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const catchAsync = require("./public/js/catchAsync");
const fs = require('fs');

//routes folder
const websiteRoutes = require("./routes/website");
const userRoutes = require("./routes/users");
const apiRoutes = require("./routes/api");

//schemas:
const {validateSchema} = require("./schemas")

//database set up
mongoose.connect("mongodb://127.0.0.1:27017/OLX")
    .then(() => { console.log("Connected") })
    .catch(() => { console.log("error") });

//require models
const User = require('./models/user');
const Category = require('./models/category');
const Listing = require('./models/listing');
const Notification = require('./models/notification');
const Area = require('./models/area');
const {ExpressError} = require("./public/js/expressError");
const UserContact = require("./models/userContact");

//middleware
const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
    //session
app.use(session({
    secret: "Anakin Skywalker the fallen Jedi",
    resave: false,
    saveUninitialized: false
  }));
app.use(flash());
const validateSchemaMiddleware = (schemaName) => (req, res, next) => {
    const { error } = validateSchema(schemaName, req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(",");
      next(new ExpressError(msg, 400));
    } else {
      next();
    }
  };

//middleware for messages
app.use((req, res, next) => {
    res.locals.successMessages = req.flash("success");
    res.locals.dangerMessages = req.flash("danger");
    next();
});
app.use("/", websiteRoutes);
app.use("/user", userRoutes);
app.use("/api", apiRoutes);

app.use("/admin", (req, res, next) => {
    if (!req.session.admin_id) {
        req.flash("danger", "Please login to access your dashboard")
        return res.redirect("/login");
    }
    next();
})


//encryption and hash functions
const hashPassword = async(userPassword) => {
    const salt = await bcrypt.genSalt(12); //parameter is "difficulty"
    const hash = await bcrypt.hash(userPassword, salt);
    return hash;
}

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

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
      console.log('File deleted successfully');
    });
  });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//get requests
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//seed data:
async function seedData(model, fileName) {
    const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    await model.insertMany(data);
}

app.get('/seed-data', catchAsync(async (req, res) => {
    //delete data in case already seeded:
    await User.deleteMany();
    await Area.deleteMany();
    await UserContact.deleteMany();
    await Category.deleteMany();
    await Listing.deleteMany();
    await Notification.deleteMany();

    //load seed data
    const seedDataDir = path.join(__dirname, "seedData");
    await seedData(User, path.join(seedDataDir, "OLX.users.json"));
    await seedData(Area, path.join(seedDataDir, "OLX.areas.json"));
    await seedData(Category, path.join(seedDataDir, "OLX.categories.json"));
    await seedData(Listing, path.join(seedDataDir, "OLX.listings.json"));
    await seedData(Notification, path.join(seedDataDir, "OLX.notifications.json"));
    await seedData(UserContact, path.join(seedDataDir, "OLX.usercontacts.json"));
    req.flash("success", "Data seeded successfully");
    res.redirect("/login");
}));

//find and return user object based on id of user
async function getUser(id) {
    const user = await User.findById(id);
    return user;
};


app.get("/filter", catchAsync(async (req,res) => {
    const { category, area, price } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (area) filter.area = area;
    if (price) filter.price = { $lte: parseInt(price) }; 

    const listings = await Listing.find(filter);
    res.json(listings);
}))

app.get("/search", catchAsync(async (req, res) => {
    const { q } = req.query;
    const listings = await Listing.find({$or: [{title: {$regex: new RegExp(q, "i")}},
    {area: {$regex: new RegExp(q, "i")}},
    {category: {$regex: new RegExp(q, "i")}}
]});
    res.json(listings);

}));

app.post("/contact", validateSchemaMiddleware('userContact'), catchAsync( async(req,res) => {
    const { firstName, message, email } = req.body;
    const userContact = new UserContact({firstName, message, email});
    await userContact.save();
    req.flash("success", "Message sent successfully")
    res.redirect("/contact");
}))


//admin
app.get('/admin/create-category', (req, res) => {
    res.send(`
        <form action="/create-category" method="POST">
            <input required type="text" name="description" placeholder="description">
            <button type="submit">Create Category</button>
        </form>
    `);
});

app.get('/admin/create-area', (req, res) => {
    res.send(`
        <form action="/create-area" method="POST">
            <input required type="text" name="description" placeholder="description">
            <button type="submit">Create Area</button>
        </form>
    `);
});

app.get('/admin/create-notification', (req, res) => {
    res.send(`
        <form action="/create-notification" method="POST">
            <input required type="text" name="description" placeholder="Description">
            <input required type="text" name="username" placeholder="Username">
            <button type="submit">Create Notification</button>
        </form>
    `);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//post requests
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//users
app.post("/register",validateSchemaMiddleware('user'), catchAsync(async(req, res) => {
    const {governmentId, username, password, firstName, lastName, cell} = req.body;
    const dupUser = await User.findOne({$or:[ {'username':username}, {'cell':cell}, {'governmentId':governmentId} ]});
    if (dupUser) {
        throw new ExpressError("Username or cellphone or goverment ID already exists.");
    }
    const hashedPassword = await hashPassword(password); 
    const user = new User({ 
        governmentId: governmentId,
        username: username,
        firstName: firstName,
        lastName: lastName,
        cell: cell,
        password: hashedPassword
    });
    user.save();
    const notification = new Notification({
        username:username,
        description:'Welcome to OLX, please tell your friends!'
    })
    notification.save();
    req.session.user_id = user._id;
    req.flash("success", "Welcome to OLX!");
    res.redirect("/user/dashboard");
}));

app.post("/login", catchAsync(async (req,res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username});
    if (!user) {
        req.flash("danger", "Login details are incorrect");
        res.redirect("/login");
    }
    else {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            if (user.role === "admin") {
                req.session.admin_id = user._id;
                req.flash("success", "Logged in as admin");
                res.redirect("/admin/dashboard");
            }
            else {
                req.session.user_id = user._id;
                req.flash("success", "Logged in successfully");
                res.redirect("/user/dashboard");
            }
        }
        else {
            req.flash("danger", "Login details are incorrect");
            res.redirect("/login");
        }
    }
    
}));

app.post("/logout", (req,res) => {
    req.session.destroy();
    res.redirect("/login");
})

app.post("/user/dashboard/create-listing", upload.single("image"), validateSchemaMiddleware('listing'),
  catchAsync(async (req, res) => {
    const { title, username, description, price, category, area } = req.body;
    const userListingsCount = await Listing.countDocuments({username:username});
    if (userListingsCount >= 5) {
        throw new ExpressError("You have reached the limit of listings allowed (5)");
    }
    else {
        const imagePath = req.file ? req.file.path : null;
        const listing = new Listing({
          title: title,
          username: username,
          description: description,
          price: price,
          category: category,
          area: area,
          image: imagePath
        });
        
        await listing.save();
        const notification = new Notification({description:`Listing successfully created, please note that the admin may edit or remove your listing should it be inappropriate`, username:username})
        await notification.save();
        req.flash("success", "New listing created");
        res.redirect("/user/dashboard");
    }

}));

app.post("/user/dashboard/edit-listing", upload.single("image"), validateSchemaMiddleware('listing'),
  catchAsync(async (req, res) => {
    const {id, image} = req.query;
    const { title, username, description, price, category, area } = req.body;

    let imagePath = req.file ? req.file.path : image; // Use the new file path if uploaded, otherwise use the original image path
    if (req.file) {
        // If a new file was uploaded, delete the original image
        deleteImage(image);
      }

    const listing = Listing.findByIdAndUpdate(id, {
      title: title,
      description: description,
      price: price,
      category: category,
      area: area,
      image: imagePath
    }).exec();
    const notification = new Notification({description:`Listing successfully updated`, username:username})
    await notification.save();
    req.flash("success", "Listing updated");
    res.redirect(`/user/dashboard/listing?id=${id}`);
}));


//admin
app.post("/admin/create-category", validateSchemaMiddleware('category'), catchAsync(async (req, res) => {
        const { description } = req.body;

        const category = new Category({
          description: description
        });
        
        await category.save();
    
        res.send('Category created successfully');

}));

app.post("/admin/create-notification", validateSchemaMiddleware('notification'), catchAsync(async (req, res) => {
        const { username,description } = req.body;

        const newNotification = new Notification({
          description: description,
          username: username
        });
        
        await newNotification.save();
    
        res.send('Notification created successfully');
}));


app.post("/admin/create-area", validateSchemaMiddleware('area'), catchAsync(async(req, res) => {
        const { description } = req.body;

        const area = new Area({
          description: description
        });
        
        // Save area to database
        await area.save();
    
        res.send('Area created successfully');

}))



app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})

app.use((err,req, res,next) => {
    const {statusCode=500 } = err;
    if (!err.message) err.message = "Something went wrong"
    if (err.statusCode === 404) {
        res.render("404");
    } else {
        res.status(statusCode).render("error", {err}); 
    }
})

app.listen(3000, () => {
    console.log("Listening on 3000");
});