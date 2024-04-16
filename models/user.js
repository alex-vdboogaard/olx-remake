const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/OLX') //"test" is database name
.then(() => {console.log("Connected")})
.catch(() => {console.log("error")})

const userSchema = new mongoose.Schema({
  governmentId: String,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  cell: String,
  role: {
    type: String,
    default: "user"
  }
});


const User = new mongoose.model("User", userSchema);

module.exports = User;