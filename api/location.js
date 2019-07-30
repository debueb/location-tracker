const express = require("express");
const gps_parser = require("gps_parser");
const router = express.Router();

const location = (io) => {

  let data = {}

  router.get('/api/location', (req, res) => {
    res.json(data)
  });

  router.post('/', (req, res) => {
    const gpsPack = new gps_parser(req.body)
    
    data = {
      location: [gpsPack.latitude, gpsPack.longitude],
      lastUpdate: Date.now()
    }

    io.emit('LocationUpdate', data)
    res.status(200).end()
  });
  return router;
}
module.exports = location;