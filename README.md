# location-tracker

location tracker for [teltonika rut955](https://teltonika-networks.com/product/rut955/) that displays the geolocation of the device on a map

## how to use

- add a gps receiver to the gps port of the rut955
- install [node](https://nodejs.org/en/)
- [optional] install [yarn](https://yarnpkg.com/lang/en/)
- install dependencies
  - `yarn` or `npm i`
- start app locally
  - `yarn start` or `npm run start`
- deploy to your favorite hosting provider (heroku works fine)
- in the web ui of the rut955, [enable GPS](https://wiki.teltonika.lt/view/RUT955_GPS) and [enter your public hostname in the HTTP server section](https://wiki.teltonika.lt/view/RUT955_GPS#HTTPS.2FHTTP_Server_Settings)
- [optional] implement authentication and authorization
- [optional] by default, the device sends updates as soon as a new GPS position is received (5-10 secs on my device), which can consume quite a bit of traffic. if you want to change the update interval, you can configure the device to [collect NMEA sentences to an SD card](https://wiki.teltonika.lt/view/RUT955_GPS#NMEA_collecting) and configure a cronjob to send the updates periodically to your public hostname
