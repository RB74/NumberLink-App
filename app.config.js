require('dotenv').config();
const { expo } = require('./app.json');

module.exports = {
  expo: {
    ...expo,
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
