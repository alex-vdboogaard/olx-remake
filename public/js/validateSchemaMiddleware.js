const {validateSchema} = require("../../schemas")
const {ExpressError} = require("./expressError");

const validateSchemaMiddleware = (schemaName) => (req, res, next) => {
    const { error } = validateSchema(schemaName, req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(",");
      next(new ExpressError(msg, 400));
    } else {
      next();
    }
  };

  module.exports = {validateSchemaMiddleware};