import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import TimeAgo from 'react-timeago';
import L from 'leaflet';
import './App.css';

class App extends Component {
  // Initialize state
  state = { 
    data: {}
  }

  constructor(){
    super()
    this.renderMap.bind(this);
    this.updateMap.bind(this);
  }

  // Fetch passwords after first mount
  componentDidMount() {
    const socket = socketIOClient();
    socket.on("LocationUpdate", data => this.updateMap(data));

    fetch('/api/location').then(response => {
      if (response.status !== 200) {
        console.log(response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(data => this.updateMap(data));
    }).catch((err) => {
      console.log(err)
    })
    this.renderMap();
  }

  renderMap = () => {
    this.map = L.map('map', {
      center: [50.93333, 6.95],
      zoom: 14,
      layers: [
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
      ]
    });
  }

  updateMap = (data) => {
    this.setState({ data })
    if (data.lat && data.lon) {
      if (this.marker) {
        this.marker.setLatLng(data);
      } else {
        this.marker = L.marker(data).addTo(this.map);
      }
      this.map.panTo(data)
    }
  }

  render() {
    const { lat, lon, alt, satsActive, speed, time } = this.state.data;
    return (
      <div>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
          integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
          crossOrigin=""/>
          <script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"
          integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og=="
          crossOrigin=""></script>
        <div className="App">
          <table>
            <thead>
              <tr>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Altitude</th>
                <th>Speed</th>
                <th>Active Satellites</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{lat ? lat : 'unknown'}</td>
                <td>{lon ? lon : 'unknown'}</td>
                <td>{alt ? alt : 'unknown'}</td>
                <td>{speed != null ? speed : 'unknown'}</td>
                <td>{satsActive ? satsActive.length : 'unknown'}</td>
                <td>{time ? <TimeAgo date={time}/> : 'unknown'}</td>
              </tr>
            </tbody>
          </table>
          <div id="map"></div>
        </div>
      </div>
    );
  }
}

export default App;
