const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const express = require('express');

const app = express();

console.log(`NODE ENV: ${process.env.NODE_ENV}`);
const port = 25; // process.env.NODE_ENV === 'production' ? 25 : 7025;

const server = new SMTPServer({
  disabledCommands: ['STARTTLS', 'AUTH'],
  logger: true,
  // eslint-disable-next-line no-unused-vars
  onData(stream, session, callback) {
    simpleParser(stream)
      .then((parsed) => {
        console.log('Parsed Email: ', parsed);
      })
      .catch(err => console.error(err));
    stream.pipe(process.stdout); // print message to console
    stream.on('end', () => {
      console.log('Data Received');
    });
  },
});

server.listen(port, () => console.log(`Mail server listening on port ${port}`));

app.get('/', (req, res) => {
  res.send('HEY!');
});
app.listen(80, () => console.log('Server running.'));
