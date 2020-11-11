import { PureComponent } from 'react'
import {
  ListGroup,
  Card,
  Button,
  Modal
} from "react-bootstrap"

let map
let markerObj ={}

class MapModal extends PureComponent {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.props.onRef(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.showMap !== this.props.showMap && this.props.showMap === true) {
      this.initMap()
    }
  }

  initMap = () => {
    const { lat, lng } = this.props.entity
    let zoom = 16
    const myLatlng = { 
      lat: lat,
      lng: lng
    };
    let mapOptions = {
      zoom,
      minZoom: zoom - 12,
      center: myLatlng,
    }
    map = new window.google.maps.Map(document.getElementById("map"), mapOptions)
    let marker = new window.google.maps.Marker({
      position: this.props.entity,
      map,
      title: this.props.entity?.name
    })
  }

  findPropertyInMap = (type) => {
    const typeActived = document.getElementById(`${type}Btn`);
    const isActived = typeActived.style.color == "red" ? true : false;
  
    if (isActived) {
      typeActived.style.color = "black"
      document.getElementById("right-panel").style.display = "none"
      this.clearMarkers(type)
      return
    }
  
    if (type == 'transit') {
      const transitLayer = new window.google.maps.TransitLayer();
      if (transitLayer) {
        
      }
      transitLayer.setMap(map);
      console.log('transit')
      return
    }
  
    typeActived.style.color = "red"
    document.getElementById("right-panel").style.display = "block"
    let getNextPage;
    const moreButton = document.getElementById("more");
  
    moreButton.onclick = function () {
      moreButton.disabled = true;
  
      if (getNextPage) {
        getNextPage();
      }
    };
    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(
      { location: { lat: 20.99, lng: 105.823 }, radius: 600, type },
      (results, status, pagination) => {
        if (status !== "OK") return;
        this.createMarkers(results, map, type);
        moreButton.disabled = !pagination.hasNextPage;
  
        if (pagination.hasNextPage) {
          getNextPage = pagination.nextPage;
        }
      }
    );
  }

  createMarkers = (places, map, type) => {
    const bounds = new window.google.maps.LatLngBounds();
    const placesList = document.getElementById("places");
    let markers = []
  
    for (let i = 0, place; (place = places[i]); i++) {
      const image = {
        url: place.icon,
        size: new window.google.maps.Size(71, 71),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(17, 34),
        scaledSize: new window.google.maps.Size(25, 25),
      };
      const marker = new window.google.maps.Marker({
        map,
        icon: image,
        title: place.name,
        position: place.geometry.location,
      });
      markers.push(marker)
  
      const li = document.createElement("li");
      li.textContent = place.name;
      placesList.appendChild(li);
      bounds.extend(place.geometry.location);
    }
    markerObj[`${type}s`] = markers
    map.fitBounds(bounds);
  }
  
  clearMarkers = (type) => {
    let markers = Object.values(markerObj)[0]
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  render() {
    return (
      <Modal show={this.props.showMap} onHide={this.props.handleCloseMap} dialogClassName="modal-90w">
        <Modal.Body>
          <div id="floating-panel">
            <button onClick={() => this.findPropertyInMap('school')} id="schoolBtn">School</button>
            <button onClick={() => this.findPropertyInMap('noise')} id="noiseBtn">Noise</button>
            <button onClick={() => this.findPropertyInMap('crime')} id="crimeBtn">Crime</button>
            <button onClick={() => this.findPropertyInMap('transit')} id="transitBtn">Transit</button>
          </div>
          <div id="right-panel">
            <h2>Results</h2>
            <ul id="places"></ul>
            <button id="more">More results</button>
          </div>

          <div id="map"></div>
          <div id="infowindow-content">
            <img src="" width="16" height="16" id="place-icon" />
            <span id="place-name" className="title"></span><br />
            <span id="place-address"></span>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default MapModal;
