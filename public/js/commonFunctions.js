const fs = require("fs");
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/OLX");
const User = require('../../models/user');

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
  };
  async function getUser(id) {
    const user = await User.findById(id);
    return user;
  };
module.exports = {deleteImage, getUser};