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
    data: {},
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
    this.setState( { msg: null });
    this.map = L.map('map', {
      center: [this.state.data.lat, this.state.data.lon],
      zoom: 14,
      layers: [
        L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'),
      ]
    });
  }

  updateMap = (data) => {
    this.setState({ data })
    if (data.lat && data.lon) {
      if (!this.map) {
        this.renderMap()
      }
      if (this.marker) {
        this.marker.setLatLng(data);
      } else {
        this.marker = L.marker(data, {icon: homeIcon}).addTo(this.map);
      }
      this.centerMap();
      if (this.state.playSound){
        this.audioTag.play();
      }
    }
  }

  renderDistance = ()=> {
    if (this.state.data.lat && this.state.data.lon){
      if (!this.state.showDistance) {
        this.watchPositionId = navigator.geolocation.watchPosition((position) => {
          let distance = GPS.Distance(this.state.data.lat, this.state.data.lon, position.coords.latitude, position.coords.longitude);
          const userPosition = {lat: position.coords.latitude, lng: position.coords.longitude}
          if (this.userMarker) {
            this.userMarker.setLatLng(userPosition)
          } else {
            this.userMarker = L.marker(userPosition).addTo(this.map);
          }
          if (this.line){
            this.line.remove();
          }
          this.line = L.polyline([this.state.data, userPosition], {color: 'red'}).bindTooltip(`${distance.toFixed(3)} km`, { permanent: true }).addTo(this.map);
          this.centerMap();
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

  centerMap = () => {
    if (this.state.centerMap) {
      let markers = [this.marker];
      if (this.userMarker) {
        markers.push(this.userMarker)
      }
      this.map.fitBounds(new L.featureGroup(markers).getBounds());
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
              <div>Altitude</div>
              <div>{alt ? alt.toFixed(5) : 'unknown'}</div>
            </div>
            <div>
              <div>Speed</div>
              <div>{speed != null ? speed.toFixed(5) : 'unknown'}</div>
            </div>
            <div>
              <div>Active Satellites</div>
              <div>{satsActive ? satsActive.length : 'unknown'}</div>
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
              <div>Follow</div>
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
