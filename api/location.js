const express = require("express");
const GPS = require('gps')
const router = express.Router();

const MAX_LOCATION_HISTORY_SIZE = 10;

const location = (io) => {

  var locations = [];

  router.get('/api/location', (req, res) => {
    res.json(locations)
  });

  router.post('/', (req, res) => {
    const lines = req.body.split(/\r?\n/)
    if (lines.length) {
      lines.forEach(line => {
        let gps = new GPS();
        gps.on('data', parsed => {
            locations.push(parsed);
            if (locations.length > MAX_LOCATION_HISTORY_SIZE){
              locations.shift();
            }
        });
        gps.update(line);
      });
    }
    io.emit('LocationUpdate', locations);
    res.status(200).end()
  });
  return router;
}
module.exports = location;