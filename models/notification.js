const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/OLX') //"test" is database name
.then(() => {console.log("Connected")})
.catch(() => {console.log("error")})

const notificationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  date: {
    type: Date,
    default: Date.now
  }
});


const Notification = new mongoose.model("Notification", notificationSchema);

module.exports = Notification;