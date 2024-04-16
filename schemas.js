const Joi = require('joi');

const listingSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username is required'
  }),
  category: Joi.string().required().messages({
    'any.required': 'Category is required'
  }),
  area: Joi.string().required().messages({
    'any.required': 'Area is required'
  }),
  title: Joi.string().max(30).required().messages({
    'any.required': 'Title is required',
    'string.max': 'Title cannot exceed 30 characters'
  }),
  description: Joi.string().max(1000).required().messages({
    'any.required': 'Description is required',
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  price: Joi.number().min(0).max(500000).required().messages({
    'any.required': 'Price is required',
    'number.min': 'Price must be at least 0',
    'number.max': 'Price cannot exceed 500000'
  }),
  image: Joi.string(),
  date: Joi.date()
});

const notificationSchema = Joi.object({
    username: Joi.string().required().messages({
      'any.required': 'Username is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    date: Joi.date()
  });

  const userSchema = Joi.object({
    governmentId: Joi.string().length(13).pattern(/^\d+$/).required().messages({
      'any.required': 'Government ID is required',
      'string.length': 'Government ID must be exactly 13 numbers long',
      'string.pattern.base': 'Government ID must contain only numbers'
    }),
    username: Joi.string().min(8).required().messages({
      'any.required': 'Username is required',
      'string.min': 'Username must be at least 8 characters long'
    }),
    password: Joi.string().min(8).max(32).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/).required().messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 32 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    }),
    cell: Joi.string().length(10).required().messages({
      'any.required': 'Cellphone number is required',
      'string.length': 'Cellphone number must be exactly 10 numbers long'
    }),
    role: Joi.string().default('user')
});



  const categorySchema = Joi.object({
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    })
  });

  const areaSchema = Joi.object({
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    })
  });

  const userContactSchema = Joi.object({
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    message: Joi.string().required().messages({
      'any.required': 'Message is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
    date: Joi.date().default(Date.now)
  });

  function validateSchema(schemaName, object) {
    switch (schemaName) {
      case 'listing':
        return listingSchema.validate(object);
      case 'notification':
        return notificationSchema.validate(object);
      case 'user':
        return userSchema.validate(object);
      case 'category':
        return categorySchema.validate(object);
      case 'area':
        return areaSchema.validate(object);
      case 'userContact':
        return userContactSchema.validate(object);
      default:
        throw new Error('Invalid schema name');
    }
  }
  module.exports = {
    validateSchema
  };

