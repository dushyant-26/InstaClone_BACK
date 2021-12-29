require("dotenv").config();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const SENDGRID_API = process.env.SENDGRID_API;
const SENDGRID_MAIL_ID = process.env.SENDGRID_MAIL_ID;
const FRONT_END_DOMAIN = process.env.FRONT_END_DOMAIN;
module.exports = {
  PORT,
  MONGO_URL,
  JWT_SECRET,
  SENDGRID_API,
  SENDGRID_MAIL_ID,
  FRONT_END_DOMAIN,
};
