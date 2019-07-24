require('dotenv').config();
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const _ = require('lodash');

const twilio = require('./twilio');
const sendgrid = require('./sendgrid');

console.log(`NODE ENV: ${process.env.NODE_ENV}`);
const port = 25; // process.env.NODE_ENV === 'production' ? 25 : 7025;

const server = new SMTPServer({
  disabledCommands: ['STARTTLS', 'AUTH'],
  logger: true,
  // eslint-disable-next-line no-unused-vars
  onData(stream, session, callback) {
    simpleParser(stream)
      .then((parsed) => {
        console.log('Parsed Email: ', JSON.stringify(parsed, null, 2));
        const attributes = {
          message: _.get(parsed, 'textAsHtml'),
          subject: _.get(parsed, 'subject'),
          date: new Date(_.get(parsed, 'date', '')),
          from: _.get(parsed, 'from.value.0.address'),
          messageId: _.get(parsed, 'messageId'),
        };
        twilio.createTask(attributes);
      })
      .catch(err => console.error(err));
    stream.pipe(process.stdout); // print message to console
    stream.on('end', () => {
      console.log('Data Received');
      callback(null, 'Got it!');
    });
  },
});

server.listen(port, () => console.log(`Mail server listening on port ${port}`));

// A simple express server for testing purposes
const app = express();
app.options('*', cors()); // enable pre-flight across-the-board
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/sendgrid', sendgrid);
app.get('/', (req, res) => {
  res.send('HEY!');
});

if (process.env.NODE_ENV === 'production') {
  const certLocation = `/etc/letsencrypt/live/${process.env.APP_DOMAIN}`;
  if (fs.existsSync(`${certLocation}/privkey.pem`)) {
    https
      .createServer(
        {
          key: fs.readFileSync(`${certLocation}/privkey.pem`),
          cert: fs.readFileSync(`${certLocation}/cert.pem`),
          ca: fs.readFileSync(`${certLocation}/chain.pem`),
        },
        app,
      )
      .listen(443, () => {
        console.log('Server listening on port 443');
      });
  }
} else {
  // Local development only needs port 80
  app.listen(80, () => console.log('Server listening on port 80'));
}
