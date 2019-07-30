const express = require("express");
const router = express.Router();

const location = (io) => {

  let data = {}

  router.get('/api/location', (req, res) => {
    res.json(data)
  });

  router.post('/', (req, res) => {
    console.log("Incoming request:")
    console.log(req.headers['content-type']);
    console.log(JSON.stringify(req.body, null, 2))

    data = {
      location: [50, 50],
      lastUpdate: Date.now()
    }

    io.emit('LocationUpdate', data)
    res.status(200).end()
  });
  return router;
}
module.exports = location;