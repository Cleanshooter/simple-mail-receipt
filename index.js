const { SMTPServer } = require('smtp-server');

const port = process.env.NODE_ENV === 'production' ? 25 : 7025;

const server = new SMTPServer({
  onData(stream, session, callback) {
    stream.pipe(process.stdout); // print message to console
    stream.on('end', callback);
  },
});

server.listen(port);
