const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Chandan<${process.env.EMAIL_FROM}>`;
  }
};

createTransport;

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //we cant use gmail coz it has some limit and not good
  //   {
  //   //it can be yahoo,hotmail anything you have
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  //   //we have to activate "less secure app" option in gmail
  // }
  //Mailtrap is email testing we can see how it looks after went to dev

  //define the email options
  const mailOptions = {
    from: 'Chandan <hello@chandan.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  //actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
