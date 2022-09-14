import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import TimeAgo from 'react-timeago';
import L from 'leaflet';
import GPS from 'gps';
import './App.css';

let homeIcon = L.icon({
  iconUrl: 'home.png',
  iconSize: [41, 41],
});

class App extends Component {
  // Initialize state
  state = {
    msg: "Location not available",
    locations: [],
    markers: [],
    centerMap: true,
    playSound: false,
    showDistance: false,
  }

  constructor(){
    super()
    this.renderMap.bind(this);
    this.updateMap.bind(this);
    this.renderDistance.bind(this);
    this.centerMap.bind(this);
    this.audioTag = React.createRef();
  }

  // Fetch passwords after first mount
  componentDidMount() {
    const socket = socketIOClient();
    socket.on("LocationUpdate", this.updateMap);

    fetch('/api/location').then(response => {
      if (response.status !== 200) {
        this.setState({ 
          msg: `Server returned response status: ${response.status}`
        });
        return;
      }

      response.json().then(this.updateMap);
    }).catch((err) => {
      console.log(err);
      this.setState({ 
        msg: err
      });
    })
  }

  renderMap = () => {
    this.map = L.map('map', {
      zoom: 14,
      layers: [
        L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'),
      ]
    });
    this.setState( { msg: null });
  }

  updateMap = (locations) => {
    if (locations && locations.length > 0 ){
      this.setState({ locations });
      if (!this.map) {
        this.renderMap();
      }
      this.state.markers.forEach((marker) => this.map.removeLayer(marker));
      this.state.markers = [];
      this.state.locations.forEach((l) => {
        if (l.lat && l.lon) {
          let marker = L.marker(l, {icon: homeIcon});
          marker.bindPopup(`<a href="https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lon}" target="blank">${l.time}</a>`);
          marker.addTo(this.map);
          this.state.markers.push(marker);
        }
      });
      this.centerMap();
      if (this.state.playSound){
        this.audioTag.play();
      }
    }
  }

  renderDistance = ()=> {
    if (this.state.locations && this.state.locations.length > 0){
      const location = this.state.locations[this.state.locations.length-1];
      if (location.lat && location.lon) {
        if (!this.state.showDistance) {
          this.watchPositionId = navigator.geolocation.watchPosition((position) => {
            let distance = GPS.Distance(location.lat, location.lon, position.coords.latitude, position.coords.longitude);
            const userPosition = {lat: position.coords.latitude, lng: position.coords.longitude}
            if (this.userMarker) {
              this.userMarker.setLatLng(userPosition)
            } else {
              this.userMarker = L.marker(userPosition).addTo(this.map);
            }
            this.centerMap();
            if (this.line){
              this.line.remove();
            }
            this.line = L.polyline([location, userPosition], {color: 'red'}).bindTooltip(`${distance.toFixed(3)} km`, { permanent: true }).addTo(this.map);
          }, (error) => {
            console.log(error);
          });
        } else { 
          if (this.watchPositionId) {
            navigator.geolocation.clearWatch(this.watchPositionId);
          }
          if (this.userMarker) {
            this.userMarker.remove()
            this.line.remove();
            this.userMarker = undefined;
            this.line = undefined;
            this.centerMap();
          }
        }
        this.setState({showDistance: !this.state.showDistance})
      }
    }
  }

  centerMap = () => {
    if (this.state.centerMap) {
      let markers = Array.from(this.state.markers);
      if (this.userMarker) {
        markers.push(this.userMarker)
      }
      this.map.fitBounds(new L.featureGroup(markers).getBounds(), { animate: false });
    }
  }

  render() {
    const currentLocation = this.state.locations.length > 0 ? this.state.locations[this.state.locations.length-1] : {};
    const { lat, lon, alt, satsActive, speed, time } = currentLocation;
    return (
      <div>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
          integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
          crossOrigin=""/>
          <script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"
          integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og=="
          crossOrigin=""></script>
        <div className="App">
          <div class="Settings">
            <div>
              <div>Latitude</div>
              <div>{lat ? lat.toFixed(5) : 'unknown'}</div>
            </div>
            <div>
              <div>Latitude</div>
              <div>{lon ? lon.toFixed(5) : 'unknown'}</div>
            </div>
            <div>
              <div>Last Update</div>
              <div>{time ? <TimeAgo date={time}/> : 'unknown'}</div>
            </div>
            <div>
              <div>Distance</div>
              <div>
                <input 
                  type="checkbox"
                  checked={this.state.showDistance}
                  onChange={this.renderDistance} />
              </div>
            </div>
            <div>
              <div>Center</div>
              <div>
                <input 
                type="checkbox"
                checked={this.state.centerMap}
                onChange={() => this.setState({centerMap: !this.state.centerMap})} />
              </div>
            </div>
            <div>
              <div>Sound</div>
              <div>
              <input 
                type="checkbox"
                checked={this.state.playSound}
                onChange={() => this.setState({playSound: !this.state.playSound})}/>
              </div>
            </div>
          </div>
          <div class="msg">{this.state.msg}</div>
          <div id="map"></div>
        </div>
        {this.state.playSound &&
          <audio ref={(input) => {this.audioTag = input}} src="./beep.mp3" />
        }
      </div>
    );
  }
}

export default App;
