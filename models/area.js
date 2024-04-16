const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/OLX') //"test" is database name
.then(() => {console.log("Connected")})
.catch(() => {console.log("error")})

const areaSchema = new mongoose.Schema({
   description: {
      type:String,
      required:true
   }
});

const Area = new mongoose.model("Area", areaSchema);

module.exports = Area;