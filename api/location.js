const express = require("express");
const gps_parser = require("gps_parser");
const router = express.Router();

const location = (io) => {

  let data = {}

  router.get('/api/location', (req, res) => {
    res.json(data)
  });

  router.post('/', (req, res) => {
    gpsData = new gps_parser(req.body)
    console.log(gpsData)
    data = {
      location: [gpsData.latitude, gpsData.longitude],
      speed: gpsData.speedkmh,
      gpsDate: gpsData.date,
      lastUpdate: Date.now()
    }

    io.emit('LocationUpdate', data)
    res.status(200).end()
  });
  return router;
}
module.exports = location;