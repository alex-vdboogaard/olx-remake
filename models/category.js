const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/OLX') //"test" is database name
.then(() => {console.log("Connected")})
.catch(() => {console.log("error")})

const categorySchema = new mongoose.Schema({
   description: {
      type:String,
      required:true
   }
});

const Category = new mongoose.model("Category", categorySchema);

module.exports = Category;