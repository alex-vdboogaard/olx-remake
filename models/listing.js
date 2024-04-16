const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/OLX') //"test" is database name
.then(() => {console.log("Connected")})
.catch(() => {console.log("error")})

const listingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  area: {
    type: String,
    required: [true, 'Area is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  date: {
    type: Date,
    default: Date.now // Setting default value to current date
  }
});


const Listing = new mongoose.model("Listing", listingSchema);

module.exports = Listing;