const express = require("express");
const GPS = require('gps')
const router = express.Router();

const location = (io) => {

  var gps = new GPS;

  router.get('/api/location', (req, res) => {
    res.json(gps.state)
  });

  router.post('/', (req, res) => {
    
    const lines = req.body.split(/\r?\n/)
    if (lines.length) {
      lines.forEach(line => gps.update(line));
    }
    console.log(gps.state)
    io.emit('LocationUpdate', gps.state);
    res.status(200).end()
  });
  return router;
}
module.exports = location;