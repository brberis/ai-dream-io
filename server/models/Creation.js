const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const creationSchema = new Schema(
  {
    creationUrl: {
      type: String,
      minlength: 1,
      maxlength: 280,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: timestamp => dateFormat(timestamp)
    },
    username: {
      type: String,
      required: true
    }
  }
);


const Creation = model('Creation', creationSchema);

module.exports = Creation;
