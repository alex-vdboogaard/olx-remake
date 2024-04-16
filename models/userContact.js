const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/OLX') //"test" is database name
.then(() => {console.log("Connected")})
.catch(() => {console.log("error")})

const userContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  email: {
    type: String,
    required: [true, "Email is required"]
  },
  date: {
    type: Date,
    default: Date.now
  }
});


const UserContact = new mongoose.model("userContact", userContactSchema);

module.exports = UserContact;