const { SMTPServer } = require('smtp-server');
const express = require('express');

const app = express();

const port = process.env.NODE_ENV === 'production' ? 25 : 7025;

const server = new SMTPServer({
  onData(stream, session, callback) {
    stream.pipe(process.stdout); // print message to console
    stream.on('end', callback);
  },
});

server.listen(port);

app.get('/', (req, res) => {
  res.send('HEY!');
});
app.listen(80, () => console.log('Server running.'));
