const express = require('express');
const http = require("http");
const bodyParser = require('body-parser')
const socketIo = require("socket.io");
const path = require('path');
const location = require("./api/location");

const app = express();

const port = process.env.PORT || 6000;
const server = http.createServer(app);
const io = socketIo(server); 

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

app.use(bodyParser.text({type: '*/*'}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.use(location(io));

if(process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});


server.listen(port, () => console.log(`Listening on port ${port}`));
