const bcrypt = require("bcrypt");
//encryption and hash functions
const hashPassword = async(userPassword) => {
    const salt = await bcrypt.genSalt(12); //parameter is "difficulty"
    const hash = await bcrypt.hash(userPassword, salt);
    return hash;
}

module.exports = hashPassword;