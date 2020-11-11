import { PureComponent } from 'react'
import {
  ListGroup,
  Card,
  Button,
  Modal
} from "react-bootstrap"

let map, infoWindow
let markerObj ={}
let coordinatesOfMapCenter = {}
let transitLayer = null
let zoom = 16
let markers = []
let activedColor = 'rgb(25, 118, 210)'
let locationUser

class MapModal extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
    }
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
    const { entities, entity } = this.props
    let mapOptions = {
      zoom,
      minZoom: zoom - 12,
      center: entity,
    }
    map = new window.google.maps.Map(document.getElementById("map"), mapOptions)

    entities.map(entity => {
      let marker = new window.google.maps.Marker({
        position: entity,
        map,
        title: entity?.name
      })
      markers.push(marker)
      if (entity.polyline) {
        this.createPolyline(map, entity.polyline)
      }
    })
    
    transitLayer = new window.google.maps.TransitLayer();
    this.listeningMovedMouse(map, entities)
    this.onClickMarker()
    this.getLocationOfUser()
  }

  createPolyline = (map, points) => {
    const lineSymbol = {
      path: "M 0,-1 0,1",
      strokeOpacity: 1,
      scale: 4,
    };
    new window.google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0,
      strokeWeight: 2,
      icons: [
        {
          icon: lineSymbol,
          offset: "0",
          repeat: "20px",
        },
      ],
      map: map
    });
  }

  getLocationOfUser = () => {
    const gmnoprints = document.getElementsByClassName("gm-bundled-control-on-bottom")[0]
    if (!gmnoprints) {
      setTimeout(() => {
        this.getLocationOfUser()
      }, 500);
    } else {
      infoWindow = new window.google.maps.InfoWindow();
      var locationButton = document.createElement("button");
      locationButton.setAttribute('id', 'cur-location-btn')
      var icon = document.createElement("i");
      icon.classList.add('fas', 'fa-location')

      locationButton.appendChild(icon);
      gmnoprints.appendChild(locationButton);

      locationButton.addEventListener("click", () => {
        locationButton.style.color = activedColor
        // fix me: 3d have data ?
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              infoWindow.setPosition(pos);
              infoWindow.setContent("Location found.");
              infoWindow.open(map);
              map.setCenter(pos);
              map.setZoom(zoom)
              locationUser = pos
            },
            () => {
              this.handleLocationError(true, infoWindow, map.getCenter());
            }
          );
        } else {
          // Browser doesn't support Geolocation
          this.handleLocationError(false, infoWindow, map.getCenter());
        }
      });
    }
  }

  handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }

  onClickMarker = () => {
    markers.forEach(marker => {
      marker.addListener("click", () => {
        console.log('click', marker.title)
      });
    })
  }

  listeningMovedMouse = (map, entities) => {
    map.addListener('idle', function(){
      coordinatesOfMapCenter.lat = map.getCenter().lat();
      coordinatesOfMapCenter.lng = map.getCenter().lng();

      const locationBtn = document.getElementById('cur-location-btn')
      if (locationBtn && locationUser && (locationUser.lat !== coordinatesOfMapCenter.lat || locationUser.lng !== coordinatesOfMapCenter.lng)) {
        locationBtn.style.color = 'black'
      }

      setTimeout(() => {
        var bounds = map.getBounds();
        var limitedLng = {
          left: bounds.Sa.i,
          right: bounds.Sa.j
        }
        var limitedLat = {
          bottom: bounds.Ya.i,
          top: bounds.Ya.j
        }
  
        var activedLocations = []
        activedLocations = entities.filter(location => {
          const { lat, lng } = location
          const { left, right } = limitedLng
          const { top, bottom } = limitedLat
          if (
            (lat > bottom && lat < top)
            &&
            (
              (lng > left &&  lng < right) ||
              (left > 0 && right < 0 && lng > left) ||
              (left > 0 && right < 0 && lng < right)
            )
          ) {
            // console.log(location)
            return true
          }
          return false
        })
        if (activedLocations.length == 0) {
          console.log('Notification: Could not find any location!')
        } else {
          console.log("Locations:", activedLocations.length)
        }
      }, 2000);
    });
  } 

  findPropertyInMap = (type) => {
    const typeActived = document.getElementById(`${type}Btn`);
    const isActived = typeActived.style.color == "red" ? true : false;
  
    if (isActived) {
      typeActived.style.color = "black"
      document.getElementById("right-panel").style.display = "none"
  
      if (type == 'transit') {
        transitLayer.setMap(null);
      } else {
        this.clearMarkers(type)
      }
      return
    }
  
    typeActived.style.color = "red"
    if (type == 'transit') {
      transitLayer.setMap(map);
      return
    }
  
    document.getElementById("right-panel").style.display = "flex"
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
      { location: coordinatesOfMapCenter, radius: 2000, type },
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
      li.title = place.name
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
            <button className="panel-btns" onClick={() => this.findPropertyInMap('school')} id="schoolBtn">
              <svg data-testid="icon-school" viewBox="0 0 512 512"
                fill="black" 
                height="20"
                width="20"
              >
                <path d="M491 346V205v-8c0-10-6-19-16-23L262 73c-7-4-16-4-23 0L26 174c-10 4-15 13-16 23 0 11 6 20 15 25l51 27v110l150 73c7 4 16 6 24 6 9 0 18-2 
                  26-6l151-74V248l40-21v119c-6 4-9 11-9 18 0 10 7 19 17 21s20-3 24-13c4-9 0-20-8-26zm-96-9l-133 66c-7 4-15 4-22 0l-131-64v-73l115 60c9 5 18 7 27 7s18-2 
                  26-7l118-61zm-133-38c-7 4-16 4-23 0L50 198l201-95 201 95z">
                </path>
              </svg>
              <div>Schools</div>
            </button>
            <button className="panel-btns" onClick={() => this.findPropertyInMap('noise')} id="noiseBtn">
              <svg
                data-testid="icon-crime"
                viewBox="0 0 512 512"
                fill="black" 
                height="20"
                width="20"
              >
                <path d="M245 48c-39 43-85 55-140 38-9-3-19 4-19 14v49c0 134 58 255 155 316 9 7 21 7 31 0 97-61 155-182 155-316v-49c0-10-10-17-20-14-55 17-101 5-140-38-6-7-16-7-22 0zm11 31l3 3c38 35 82 47 132 39l6-2v39c-2 
                118-53 223-135 278l-6 4-5-4c-84-57-135-165-135-287v-30l6 2c49 8 93-5 131-39z">
                </path>
              </svg>
              <div>Noise</div>
            </button>
            <button className="panel-btns" onClick={() => this.findPropertyInMap('crime')} id="crimeBtn">
              <svg data-testid="icon-ear" viewBox="0 0 512 512"
                fill="black" 
                height="20"
                width="20"
              >
                <path d="M63 194c-2 6-7 9-13 8-6-2-9-8-8-13 24-93 152-117 204-15 31 59 20 94-27 
                  156-1 1-1 1-1 2-25 32-34 48-37 69-15 87-141 78-148-7 0-6 4-11 10-11 6-1 11 4 12 10 4 60 94 66 105 4 4-25 14-43 41-78 0-1 0-1 
                  1-2 43-56 51-84 25-133-43-84-145-64-164 10zm228-33c-4-4-4-11 1-15 4-4 11-3 15 1 42 51 42 103 0 154-4 4-11 5-15 1-5-4-5-10-1-15 
                  35-43 35-83 0-126zm44-42c-4-4-4-11 1-15 4-4 11-3 15 1 62 70 62 150 0 237-3 5-10 6-14 3-5-4-6-11-3-15 56-79 56-148 1-211zm63-29c-3-5-2-12 
                  3-15s12-1 15 4c61 96 61 194 0 290-3 5-10 7-15 4s-6-10-3-15c57-90 57-178 0-268zM198 242c-1 6-7 9-13 7-6-1-9-7-7-13 9-29-22-55-56-34-20 
                  13-23 24-20 52v2c3 22 3 32-2 45-9 20 21 34 34 15 3-4 10-6 14-2 5 3 6 10 3 15-27 38-89 9-71-36 3-8 3-16 1-34v-2c-4-36 1-55 30-73 50-32 102 11 87 58z">
                </path>
              </svg>
              <div>Crime</div>
            </button>
            <button className="panel-btns" onClick={() => this.findPropertyInMap('flood')} id="floodBtn">
              <svg data-testid="icon-flood" viewBox="0 0 512 512" 
                height="20"
                width="20"
              >
                <path d="M176 323c-35 1-78 16-131 57-8 7-20 5-26-3s-5-19 3-26c58-44 107-63 152-65s82 12 115 27c10 5 
                  20 10 29 14 22 11 41 21 62 27 27 8 55 8 89-10 9-5 20-2 25 7s1 20-8 25c-43 24-81 24-116 14-25-7-49-20-72-31-9-5-17-9-25-13-31-14-62-25-97-23zm0 
                  122c-37 1-81 12-134 39-9 5-20 1-25-8s-1-20 8-24c58-30 106-42 149-44 43-1 80 8 113 18 9 3 19 6 28 9 53 18 97 33 156 12 10-4 20 1 24 11 3 9-2 20-11 23-73 26-129 
                  7-183-11-8-3-17-6-25-9-32-10-63-17-100-16zm78-387L125 183h22c9 0 17 8 17 17v104c0 9-8 17-17 17-10 0-18-8-18-17v-87H95c-12 0-22-9-22-22 0-6 2-11 6-15L239 25c8-8 
                  22-8 31 0l161 154c9 9 9 23 1 32-4 4-10 6-16 6h-34v136c0 10-8 17-17 17-10 0-17-7-17-17V200c0-9 7-17 17-17h20z">
                </path>
              </svg>
              <div>Flood</div>
            </button>
            <button className="panel-btns" onClick={() => this.findPropertyInMap('transit')} id="transitBtn">
              <svg data-testid="icon-train" viewBox="0 0 512 512"
                height="20"
                width="20"
              >
                <path d="M102 0h309c27 0 48 16 50 38v309c0 41-32 75-73 77l-4 1H129c-41 0-75-33-77-73V41C52 19 72 2 98 
                  0h313zm309 33H102c-11 0-18 5-18 8v306c0 25 20 45 45 45h255c24 0 44-20 44-45V41c0-3-6-8-17-8zM126 312c14 0 26 11 26 25s-12 
                  26-26 26-25-12-25-26 11-25 25-25zm252 0h2c13 1 23 12 23 25s-10 24-23 25l-2 1c-14 0-26-12-26-26s12-25 26-25zM331 47c5 0 8 4 8 8v9c0 5-3 8-8 
                  8H174c-5 0-8-3-8-8v-9c0-4 3-8 8-8zm142 417c5 9 5 21 0 30-6 10-15 15-26 15-77 0-272 0-382 1-11 0-21-6-26-16-6-9-5-21 0-30l28-45c5 6 12 10 19 
                  13l-27 44c-2 3 0 6 0 7 1 1 2 3 6 3h146v-48h23v48h46v-48h23v48h144c3 0 5-2 6-3 0-2 2-4 0-8l-25-43c7-3 13-8 19-13zM124 89l260 1c15 0 28 14 28 
                  30l-1 129c0 8-3 15-8 21s-12 9-20 9l-260-1c-7 0-14-3-19-9-5-5-9-13-8-22V119c0-17 13-30 28-30zm0 23c-2 0-5 3-5 7v129c0 2 1 4 2 5 0 1 1 1 2 1l260 
                  2c1 0 2-1 3-2s2-3 2-5l1-129c0-4-3-7-5-7z">
                </path>
              </svg>
              <div>Transit</div>
            </button>
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
