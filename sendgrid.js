// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
const app = require('express').Router();
const axios = require('axios');
const _ = require('lodash');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// console.log('SENDGRID API KEY', process.env.SENDGRID_API_KEY);

const auth = async (req, res, next) => {
  console.log(req.headers);
  let token = _.get(req, 'headers.authorization');
  if (token.startsWith('Bearer ')) {
    token = token.substring(7, token.length);
  } else {
    res.status(401).send({ message: 'Bearer Token: Incorrect Format' });
  }

  if (token) {
    let result = null;
    try {
      result = await axios.post(
        `https://preview.twilio.com/iam/Accounts/${
          process.env.TWILIO_ACCOUNT_SID
        }/Tokens/validate`,
        { token },
        {
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN,
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error attempting to validate user token: ', error);
      res.status(500).send({ message: "Couldn't reach authorization server." });
    }

    if (_.get(result, 'data.valid', false)) {
      next();
    } else {
      _.set(result, 'data.tokenSent', token);
      console.warn('Unauthorized Access to API', result.data);
      res.status(401).send({ message: 'User is unauthorized' });
    }
  } else {
    res.status(401).send({ message: 'No Auth Provided' });
  }
};

app.post('/send', auth, (req, res) => {
  console.log(req.body);
  const {
    to, from, subject, html
  } = req.body;
  const msg = {
    to,
    from,
    subject,
    html,
  };
  sgMail.send(msg);
  res.sendStatus(204);
});

module.exports = app;
