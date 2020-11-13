import { PureComponent } from 'react'
import {
  ListGroup,
  Card,
  Button,
  Modal
} from "react-bootstrap"
import { MDBBtn, MDBIcon } from 'mdbreact'
import mapInfo from './images/map-info.png'
import $ from 'jquery';

let map, infoWindow
let zoom = 18
let activedColor = 'rgb(25, 118, 210)'
let locationUser

let markers = []
let markerObj = {}
let coordinatesOfMapCenter = {}
let searchedCoordinates = {}

let transitLayer = null
let activedType = null

class MapModal extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isShowSearchAreaBtn: false
    }
    window.seft = this
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
      minZoom: zoom - 14,
      center: entity,
      mapTypeId: "satellite",
      heading: 90,
      tilt: 45,
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
    this.onClickMarker(map)
    this.getLocationOfUser()
    this.onShowControllerOfMap()
    this.showLayerImage()
  }

  onShowControllerOfMap = () => {
    let swithMapTypeBtn = document.getElementsByClassName('gmnoprint')[0]
    let controlButtons = document.getElementsByClassName('gm-bundled-control-on-bottom')[0]
    let fullScreenBtn = document.getElementsByClassName('gm-fullscreen-control')[0]

    if (!swithMapTypeBtn || !controlButtons) {
      setTimeout(() => {
        this.onShowControllerOfMap()
      }, 500);
    } else {
      controlButtons.classList.add('move-below-control-btns')
      swithMapTypeBtn.classList.add('move-switch-map-btns')
      fullScreenBtn.classList.add('move-full-screen-btn')
    }
  }

  showLayerImage = () => {
    $(document).ready( function () {
      $(".slider-thumbnails").css("bottom","0");
      $(".accordion-menu").css("left","0");
      $(".infor-nav").css("right","0");
      $(".top-nav-overlay").css("top","0");
      $('.accordion-menu .item .accordion').click(function(e) {
        e.preventDefault();
      
        var $this = $(this);
        if($this.parent().hasClass("active")){
          $this.parent().removeClass("active");
          $this.parent().find(".panel").slideUp();
        $this.parent().find(".bottom-arrow").removeClass("top-arrow");
    
        }else{
          $this.parent().addClass("active");
          $this.parent().find(".panel").slideDown();
        $this.parent().find(".bottom-arrow").addClass("top-arrow");
        }
      });
    
      $(".slider-thumbnails .item").click(function(){
         $(".overlay-popup-img").css("display","block");
        var img_url = $(this).find(".inner-item").css("background-image");
        console.log(img_url);
        $(".popup-img").attr("style","background-image:"+img_url)
    
      });
      $(".overlay-popup-img").click(function(){
        $(this).css("display","none");
      });
    });
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

  onClickMarker = (map) => {
    markers.forEach(marker => {
      marker.addListener("click", () => {
        let coordinatesMarker = {}
        coordinatesMarker.lat = marker.position.lat()
        coordinatesMarker.lng = marker.position.lng()

        map.setCenter(coordinatesMarker);
        map.setZoom(zoom)
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
      
      const searchAreaBtn = document.getElementById('search-area-btn')
      // console.log('isShowSearchAreaBtn', searchedCoordinates, coordinatesOfMapCenter)
      
      setTimeout(() => {
        // console.log('activedType', activedType)
        if (activedType && searchedCoordinates !== coordinatesOfMapCenter) {
          searchAreaBtn.style.display = 'block'
        } else {
          searchAreaBtn.style.display = 'none'
        }
        
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
        // if (activedLocations.length == 0) {
        //   console.log('Notification: Could not find any location!')
        // } else {
        //   console.log("Locations:", activedLocations.length)
        // }
      }, 2000);
    });
  } 

  findPropertyInMap = (type) => {
    const btnElement = document.getElementById(`${type}Btn`);

    if (type === 'transit') {
      if (activedType === type) {
        transitLayer.setMap(null);
        btnElement.style.color = "black"
        activedType = null
      } else {
        if (activedType) {
          document.getElementById(`${activedType}Btn`).style.color = 'black';
          this.clearMarkers(activedType)
        }
        
        transitLayer.setMap(map);
        btnElement.style.color = 'red'
        activedType = type
      }
      return
    }

    if (activedType) {
      if (activedType === 'transit') {
        transitLayer.setMap(null);
      }

      this.clearMarkers(activedType)
      if (activedType === type) {
        btnElement.style.color = "black"
        activedType = null
      } else {
        document.getElementById(`${activedType}Btn`).style.color = 'black';
        btnElement.style.color = 'red'
        activedType = type
        this.findObj()
      }
      return
    }
    
    // no actived type
    activedType = type
    btnElement.style.color = "red"
    this.findObj()
  }

  findObj = () => {
    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(
      { location: coordinatesOfMapCenter, radius: 2000, type: activedType },
      (results, status, pagination) => {
        if (status !== "OK") return;
        this.createMarkers(results, map, activedType);
      }
    );
    searchedCoordinates = Object.assign({}, coordinatesOfMapCenter)
  }

  createMarkers = (places, map, type) => {
    if (map.mapTypeId == 'satellite') {
      map.mapTypeId = 'roadmap'
    }

    // var hasTypeName = Object.keys(markerObj).find(name => name == type)
    // if (hasTypeName) {
    //   this.clearMarkers(type)
    // }
    
    const bounds = new window.google.maps.LatLngBounds();
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
      bounds.extend(place.geometry.location);
    }
    markerObj[`${type}s`] = markers
    map.fitBounds(bounds);
  }
  
  clearMarkers = (type) => {
    if (Object.keys(markerObj).length > 0) {
      let markers = Object.values(markerObj)[0]
      for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markerObj = {}
    }
  }

  render() {
    return (
      <Modal show={this.props.showMap} onHide={this.props.handleCloseMap} dialogClassName="modal-90w">
        <Modal.Body className="map-modal">
          <div id="floating-panel">
            <div className="panel-nav">
              <div className="nav-btns">
                <a className="left-btn left-arrow-btn" href="/#">
                  <i className="fas fa-chevron-left"></i>
                </a>
                <a className="left-btn heart-btn" href="/#">
                  <i className="fa fa-heart" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            <div className="panel-controls">
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
            <div className="panel-search">
              <MDBBtn id="search-area-btn" rounded outline color="rgba-stylish-strong"
                onClick={this.findObj}
              >
                <MDBIcon fas icon="search" className="mr-2" />
                Tìm kiếm khu vực này
              </MDBBtn>
            </div>
          </div>

          <div id="map"></div>
          <div id="infowindow-content">
            <img src="" width="16" height="16" id="place-icon" alt="" />
            <span id="place-name" className="title"></span><br />
            <span id="place-address"></span>
          </div>

          <div className="accordion-menu">
            <div className="inner">
            
              <div className="item">
                <button className="accordion">
                <svg data-testid="icon-open-house" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M375 47H119c-5 0-10 2-14 6l-2 2c-4 4-7 10-7 16v332c1 9 5 16 13 20 2 2 4 3 7 4l155 40c4 1 8 1 13 1 9 1 18-2 25-8 10-9 15-21 15-34h52c21 0 38-17 38-38V85c0-10-4-20-11-27-8-7-18-11-28-11zm-73 376c0 7-2 14-7 20-6 4-13 5-20 3l-155-41c-3-4-4-9-4-14V72v-2h2l163 43c12 3 21 14 21 27zm82-35c0 4-4 8-8 8h-52V140c-1-22-16-41-37-48l-57-15h145c2 0 5 1 6 3 2 1 3 3 3 5zM272 267c0 11-8 20-19 20s-20-9-20-20 9-20 20-20 19 9 19 20z"></path></svg>
                  &nbsp;Open Houses
                </button>
                <div className="panel">
                <p>Lorem ipsum dolor sit amet</p>
                </div>
                <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>
             
              <div className="item">
                <button className="accordion">
                  <svg data-testid="icon-property-features" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M83 227v250h210v-27H110V200H72L268 35l224 189 17-21L268 0-1 227zm76 166h133v-27H159zm183-36l-13 23 44 27 45-83-24-12-31 58zm0 106l-13 23 44 27 45-83-24-13-31 59zM159 287h133v-27H159zm183-35l-13 22 44 27 45-83-24-12-31 58z"></path></svg>
                    &nbsp;Property Details
                </button>
                <div className="panel">
                  <p>Lorem ipsum dolor sit amet</p>
                </div>
                <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
             </div> 
           
              <div className="item">
                <button className="accordion">
                  <svg data-testid="icon-home-value" className="bottom-arrow-common2" viewBox="0 0 512 512"><path d="M50 253v228c0 10 8 17 17 17h385c9 0 17-7 17-17 0-9-8-16-17-16H83V237c0-10-7-17-16-17L256 56l223 193c7 6 17 5 23-2 6-6 6-17-1-23L267 21c-6-6-16-6-22 0L11 224c-11 10-4 29 11 29zm231 107c7 7 17 7 24 0l92-92c7-7 7-17 0-24-6-6-17-6-23 0l-81 81-47-47c-6-7-17-7-23 0L122 379c-7 6-7 17 0 23 6 7 17 7 23 0l89-89zm100-74c0 9 7 17 17 17 9 0 16-8 16-17v-41c0-9-7-17-16-17h-42c-9 0-17 8-17 17s8 17 17 17h25z"></path></svg>
                  &nbsp;Home Value
                </button>
                <div className="panel">
                 <p>Lorem ipsum dolor sit amet</p>
                </div> 
                 <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>

              <div className="item">
                <button className="accordion">
                  <svg data-testid="icon-calculator" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M325 196H193c-20-4-34-22-34-42 0-21 14-38 34-42h132c20 4 34 21 34 42 0 20-14 38-34 42zm-132-67c-12 1-22 12-22 25s10 24 22 25h132c13-1 22-12 22-25s-9-24-22-25zm3 181c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm80-66c0-10-8-19-19-19s-20 9-20 19c0 11 9 20 20 20s19-9 19-20zm79 0c0-10-8-19-19-19s-20 9-20 19c0 11 9 20 20 20s19-9 19-20zm-79 66c0-11-8-20-19-20s-20 9-20 20 9 20 20 20 19-9 19-20zm79 0c0-11-8-20-19-20s-20 9-20 20 9 20 20 20 19-9 19-20zm-159 65c0-10-9-19-20-19s-20 9-20 19c0 11 9 20 20 20s20-9 20-20zm80 0c0-10-8-19-19-19s-20 9-20 19c0 11 9 20 20 20s19-9 19-20zm-80-131c0-10-9-19-20-19s-20 9-20 19c0 11 9 20 20 20s20-9 20-20zm167 225H149c-31 0-57-25-57-57V100c0-32 26-57 57-57h214c31 0 57 25 57 57v312c0 32-26 57-57 57zM149 73c-15 0-27 12-27 27v312c0 15 12 27 27 27h214c15 0 27-12 27-27V100c0-15-12-27-27-27z"></path></svg>
                  &nbsp;Monthly Payment
                </button>
                <div className="panel">
                 <p>Lorem ipsum dolor sit amet</p>
                </div> 
                 <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>

              <div className="item">
                <button className="accordion">
                 <svg data-testid="icon-property-history" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M513 257L257 37 2 257h76v226h100v-25h-75V232H69L257 70l189 162h-36v226h-76v25h101V257zm-170 57c0-49-39-88-88-88-48 0-87 39-87 88s39 88 87 88c49 0 88-39 88-88zm24 0c0 62-50 113-112 113-61 0-112-51-112-113 0-63 51-113 112-113 62 0 112 50 112 113zm-144-31l-15 20 50 35 70-45-13-21-56 36z"></path></svg>
                 &nbsp;Property History
                </button>
                <div className="panel">
                 <p>Lorem ipsum dolor sit amet</p>
                </div> 
                 <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>

              <div className="item">
                <button className="accordion">
                <svg data-testid="icon-school" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M491 346V205v-8c0-10-6-19-16-23L262 73c-7-4-16-4-23 0L26 174c-10 4-15 13-16 23 0 11 6 20 15 25l51 27v110l150 73c7 4 16 6 24 6 9 0 18-2 26-6l151-74V248l40-21v119c-6 4-9 11-9 18 0 10 7 19 17 21s20-3 24-13c4-9 0-20-8-26zm-96-9l-133 66c-7 4-15 4-22 0l-131-64v-73l115 60c9 5 18 7 27 7s18-2 26-7l118-61zm-133-38c-7 4-16 4-23 0L50 198l201-95 201 95z"></path></svg>
                &nbsp;Nearby Schools
                </button>
                <div className="panel">
                  <p>Lorem ipsum dolor sit amet</p>
                </div> 
                <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>

              <div className="item">
                <button className="accordion">
                <svg data-testid="icon-neighborhood" className="bottom-arrow-common2" viewBox="0 0 512 512"><path d="M24 356c1-19 9-38 22-51 29-31 75-31 103 0 39 40 101 40 139 0l4-5c38-40 38-105 0-145-29-31-29-81 0-112l-17-16c-38 40-38 105 0 145 29 31 29 81 0 112l-5 4c-28 31-74 31-103 0-38-40-100-40-138 0-17 18-27 42-29 67zm307-65l90-93 90 93h-32v66H363l1-66zm57-24v66h67v-66l-34-35zM43 426l90-93 91 93h-33v66H76v-66zm57-24v66h67v-66l-34-35zM44 141l90-94 90 94h-32v66H77v-66zm57-24v66h67v-66l-34-35z"></path></svg>
                &nbsp;Neighborhood
                </button>
                <div className="panel">
                  <p>Lorem ipsum dolor sit amet</p>
                </div> 
                <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>

              <div className="item">
                <button className="accordion">
                <svg data-testid="icon-usd" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M260 43c120 0 218 97 218 217s-98 218-218 218S43 380 43 260 140 43 260 43zm0 30C157 73 73 157 73 260c0 104 84 188 187 188 104 0 188-84 188-188 0-103-84-187-188-187zm0 81c6 0 10 3 11 8v7c20 3 34 13 43 27 6 10 8 20 8 28 0 5-5 10-11 10s-11-5-11-10c0-4-1-11-5-17-4-8-12-14-24-16v59c40 9 58 23 54 56-3 31-24 43-54 46v4c0 6-5 11-11 11-5 0-9-4-10-9v-7c-23-2-39-13-48-29-5-10-7-19-7-27v-3c0-6 5-10 11-10 5 0 9 4 10 9v4c0 5 2 11 5 17 5 9 14 16 29 18v-63c-24-5-34-9-42-20-25-31-3-73 42-78v-5c0-6 4-10 10-10zm11 118v58c20-2 32-9 33-26 2-18-6-25-33-32zm-46-38c3 5 10 8 25 11v-54c-28 4-39 26-25 43z"></path></svg>
                &nbsp;Nearby Home Values
                </button>
                <div className="panel">
                  <p>Lorem ipsum dolor sit amet</p>
                </div> 
                <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>

              <div className="item">
                <button className="accordion">
              <svg data-testid="icon-veterans" className="bottom-arrow-common" viewBox="0 0 512 512"><path d="M227 301l-71-33-70 33 10-77-53-56 76-14 37-69 38 69 76 14-53 56zm-34-84l32-35-46-8-23-42-22 42-47 8 33 35-6 47 42-21 43 21zm33-132h231c7 0 12 6 12 13s-5 13-12 13H226c-7 0-13-6-13-13s6-13 13-13zm85 86h146c7 0 12 5 12 12 0 8-5 13-12 13H311c-7 0-12-5-12-13 0-7 5-12 12-12zm-42 85h188c7 0 12 6 12 13s-5 13-12 13H269c-7 0-13-6-13-13s6-13 13-13zM55 331h401c8 0 13 5 13 12 0 8-5 13-13 13H55c-7 0-12-5-12-13 0-7 5-12 12-12zm0 74h401c8 0 13 6 13 13s-5 13-13 13H55c-7 0-12-6-12-13s5-13 12-13z"></path></svg>
              &nbsp;Veterans & Military Benefits
                </button>
                <div className="panel">
                  <p>Lorem ipsum dolor sit amet</p>
                </div> 
                  <svg className="bottom-arrow" data-testid="chevron-down" viewBox="0 0 512 512"><path d="M70 128l-27 32 215 224 211-224-27-32-184 196z"></path></svg>
              </div>
            </div>
          </div>

          <div className="slider-thumbnails">
            <div className="inner-box">
                <div className="item" >
                  <div className="inner-item inner-item1">
                    <i className="fas fa-search"></i>
                  </div>
                </div>

                <div className="item" >
                  <div className="inner-item inner-item2">
                    <i className="fas fa-search"></i>
                  </div>
                </div>

                <div className="item" >
                  <div className="inner-item inner-item3">
                    <i className="fas fa-search"></i>
                  </div>
                </div>

                <div className="item" >
                  <div className="inner-item inner-item4">
                    <i className="fas fa-search"></i>
                  </div>
                </div>
                <div className="clearfix"></div>
            </div>
          </div>

          <div className="infor-nav">
            <div className="inner">
              <div className="detail-location">
                <p><img src={mapInfo} alt="" /></p>
                <p>
                  <a href="/#" title="">
                    <svg data-testid="icon-car" viewBox="0 0 512 512" className="icon-car margin-right"><path d="M155 0h197c56 0 78 45 82 71v3l31 133c20 10 32 29 34 51v138c0 35-21 52-40 56l-3 1v16c0 22-17 41-38 43h-38c-21 0-39-17-41-40v-18H164v15c0 22-16 41-37 43H89c-21 0-39-17-41-40v-21c-17-7-33-22-35-49V263c0-21 9-38 25-50l4-3L73 72c3-23 22-69 76-72h203zm305 396V263c0-18-21-23-27-25-11-2-22 0-34 2-6 1-12 3-18 3-28 3-57 6-87 7-17 0-22 1-39 0-17 1-20 0-37 0-30-1-59-4-87-7-6 0-12-2-18-3-12-2-23-4-34-2-6 2-27 7-27 25v133c0 4 0 16 12 17h384c12-1 12-13 12-17zm-29 73v-15h-68l1 15c0 9 7 17 16 17h35c9 0 16-8 16-17zm-291 0v-15H72v15c0 9 8 17 17 17h34c9 0 17-8 17-17zM107 78L80 197c14-1 28 1 40 3l15 3c27 3 55 5 85 6 14 0 20 1 35 1s23-1 37-1c30-1 58-3 85-6l15-3c11-2 22-4 35-3L400 80c0-6-6-44-48-44H155c-43 0-48 40-48 42zm6 214c14 0 25 11 25 25 0 15-11 26-25 26-13 0-24-11-24-26 0-14 11-25 24-25zm291 0c13 0 24 11 24 25 0 15-11 26-24 26-14 0-25-11-25-26 0-14 11-25 25-25z"></path></svg>
                    <span>Commute time</span>
                  </a>
                  <a href="/#" title="">
                    <svg data-testid="icon-ear" className="icon-ear" viewBox="0 0 512 512"><path d="M63 194c-2 6-7 9-13 8-6-2-9-8-8-13 24-93 152-117 204-15 31 59 20 94-27 156-1 1-1 1-1 2-25 32-34 48-37 69-15 87-141 78-148-7 0-6 4-11 10-11 6-1 11 4 12 10 4 60 94 66 105 4 4-25 14-43 41-78 0-1 0-1 1-2 43-56 51-84 25-133-43-84-145-64-164 10zm228-33c-4-4-4-11 1-15 4-4 11-3 15 1 42 51 42 103 0 154-4 4-11 5-15 1-5-4-5-10-1-15 35-43 35-83 0-126zm44-42c-4-4-4-11 1-15 4-4 11-3 15 1 62 70 62 150 0 237-3 5-10 6-14 3-5-4-6-11-3-15 56-79 56-148 1-211zm63-29c-3-5-2-12 3-15s12-1 15 4c61 96 61 194 0 290-3 5-10 7-15 4s-6-10-3-15c57-90 57-178 0-268zM198 242c-1 6-7 9-13 7-6-1-9-7-7-13 9-29-22-55-56-34-20 13-23 24-20 52v2c3 22 3 32-2 45-9 20 21 34 34 15 3-4 10-6 14-2 5 3 6 10 3 15-27 38-89 9-71-36 3-8 3-16 1-34v-2c-4-36 1-55 30-73 50-32 102 11 87 58z"></path></svg>

                    <span>Noise: <span className="txt"><strong>Low</strong></span></span>   
                    <svg data-testid="icon-info" className="icon-info" viewBox="0 0 512 512"><path d="M256 434c-64 0-123-34-155-89s-32-125 0-181c16-26 38-48 64-64 28-16 59-24 91-24s63 8 90 24c27 15 49 38 64 64 33 56 33 126 0 182-15 27-37 49-64 64-27 16-58 24-90 24zm0 35c38 0 74-11 107-30 32-18 58-44 76-76 39-67 39-150 0-217-18-31-44-57-76-75-33-19-70-29-107-28-38-1-76 9-109 28-32 18-58 44-76 76-19 33-29 71-28 109 0 38 10 74 29 107 38 65 108 106 184 106zm0-274c12 0 21-9 21-21s-9-21-21-21-21 9-21 21 9 21 21 21zm35 135h-18v-85c0-8-7-15-15-15h-19c-8 0-15 7-15 15s7 15 15 15h4v71h-22c-8 0-14 7-14 15s6 15 14 15h71c8 0 15-7 15-15s-7-15-15-15z"></path></svg>
                  </a>
                </p>
                <div className="detail-location-info">
                  <a href="/#" title="">
                    <svg data-testid="icon-flood" className="icon-flood flood-factor-icon" viewBox="0 0 512 512"><path d="M176 323c-35 1-78 16-131 57-8 7-20 5-26-3s-5-19 3-26c58-44 107-63 152-65s82 12 115 27c10 5 20 10 29 14 22 11 41 21 62 27 27 8 55 8 89-10 9-5 20-2 25 7s1 20-8 25c-43 24-81 24-116 14-25-7-49-20-72-31-9-5-17-9-25-13-31-14-62-25-97-23zm0 122c-37 1-81 12-134 39-9 5-20 1-25-8s-1-20 8-24c58-30 106-42 149-44 43-1 80 8 113 18 9 3 19 6 28 9 53 18 97 33 156 12 10-4 20 1 24 11 3 9-2 20-11 23-73 26-129 7-183-11-8-3-17-6-25-9-32-10-63-17-100-16zm78-387L125 183h22c9 0 17 8 17 17v104c0 9-8 17-17 17-10 0-18-8-18-17v-87H95c-12 0-22-9-22-22 0-6 2-11 6-15L239 25c8-8 22-8 31 0l161 154c9 9 9 23 1 32-4 4-10 6-16 6h-34v136c0 10-8 17-17 17-10 0-17-7-17-17V200c0-9 7-17 17-17h20z"></path></svg>
                    <span>FEMA Zone </span>
                    <strong>N/A </strong>
                    <span>(est.)</span>
                    <span>. Flood Factor </span>
                    <picture>
                      <source type="image/webp" />
                      <img alt="floodfactor" itemProp="image" data-src="https://static.rdc.moveaws.com/images/flood/FF-logo-mark.svg" 
                        src="https://static.rdc.moveaws.com/images/flood/FF-logo-mark.svg"
                        className="flood-factor-logo" data-label="pc-photo" width="10"
                      />
                    </picture>
                    <span><strong> 1/</strong>10 </span> 
                    <span className="new-txt">NEW</span>
                  </a>
                </div>
              </div>
              <div className="price-infor">
                <p>
                  <span className="price">$668,888</span>
                  <a href="/#" title="">
                    <svg data-testid="icon-calculator" viewBox="0 0 512 512" className="icon-calculator"><path d="M325 196H193c-20-4-34-22-34-42 0-21 14-38 34-42h132c20 4 34 21 34 42 0 20-14 38-34 42zm-132-67c-12 1-22 12-22 25s10 24 22 25h132c13-1 22-12 22-25s-9-24-22-25zm3 181c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm80-66c0-10-8-19-19-19s-20 9-20 19c0 11 9 20 20 20s19-9 19-20zm79 0c0-10-8-19-19-19s-20 9-20 19c0 11 9 20 20 20s19-9 19-20zm-79 66c0-11-8-20-19-20s-20 9-20 20 9 20 20 20 19-9 19-20zm79 0c0-11-8-20-19-20s-20 9-20 20 9 20 20 20 19-9 19-20zm-159 65c0-10-9-19-20-19s-20 9-20 19c0 11 9 20 20 20s20-9 20-20zm80 0c0-10-8-19-19-19s-20 9-20 19c0 11 9 20 20 20s19-9 19-20zm-80-131c0-10-9-19-20-19s-20 9-20 19c0 11 9 20 20 20s20-9 20-20zm167 225H149c-31 0-57-25-57-57V100c0-32 26-57 57-57h214c31 0 57 25 57 57v312c0 32-26 57-57 57zM149 73c-15 0-27 12-27 27v312c0 15 12 27 27 27h214c15 0 27-12 27-27V100c0-15-12-27-27-27z"></path></svg>
                    <span className="payment-txt">
                      Est. Payment 
                    </span>
                    <span className="price-per-month">
                      $2,284/mo
                    </span>
                  </a>
                </p>
                <p>
                  <span><strong>3</strong>bed</span>
                  <span><strong>3.5</strong>bath</span>
                    <span><strong>1,900</strong>sqft lot</span>
                </p>
                <p>
                  <span>201 Harrison St Apt 925,</span>
                  <span className="txt">San Francisco, MD, 94105</span>
                </p>
              </div>
              <div className="common-price">
                <p>
                  <span className="lb">Property Type</span>
                  <span className="vl">Condo</span> 
                  <span className="clearfix"></span>
                </p>
                  <p>
                  <span className="lb">Year Built</span>
                  <span className="vl">1991</span>
                  <span className="clearfix"></span> 
                </p>
              </div>

              <div className="common-price">
                <p>
                  <span className="lb">Days on Realtor.com</span>
                  <span className="vl">6 Hours</span> 
                  <span className="clearfix"></span>
                </p>
                  <p>
                  <span className="lb">Garage</span>
                  <span className="vl">1 Car</span> 
                  <span className="clearfix"></span>
                </p>
              </div>
              <div className="common-price">
                <p>
                  <span className="lb">Last Sold</span>
                  <span className="vl">$ 165k in 1994</span>
                  <span className="clearfix"></span> 
                </p>
                  <p>
                  <span className="lb">Price per sqft</span>
                  <span className="vl">$1,169</span> 
                  <span className="clearfix"></span>
                </p>
              </div>

              <div className="qa">
                <a className="question" href="/#">
                  Ask a question
                </a>
                <a className="answer" href="/#">
                  Answer  by <span>GIA</span>
                  <svg data-testid="chevron-down" className="chevron-down" viewBox="0 0 512 512">
                    <path d="M70 128l-27 32 215 224 211-224-27-32-184 196z">
                    </path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="overlay-popup-img">
            <div className="popup-img">
            </div>
          </div>

        </Modal.Body>
      </Modal>
    );
  }
}

export default MapModal;
