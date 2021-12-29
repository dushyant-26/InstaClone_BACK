const sgMail = require("@sendgrid/mail");
const { SENDGRID_API, SENDGRID_MAIL_ID } = require("./appConstants");

sgMail.setApiKey(SENDGRID_API);

const sendMail = async (email, subject, text, html) => {
  try {
    const msg = {
      to: email,
      from: SENDGRID_MAIL_ID, // Change to your verified sender
      subject,
      text,
      html,
    };
    await sgMail.send(msg);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendMail };
