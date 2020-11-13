import './App.scss';
import { Viewer, Entity, EntityDescription, EntityStaticDescription, Camera, CameraFlyTo } from "resium";
import { Cartesian3, Rectangle } from "cesium";
import { PureComponent } from 'react'
import { hot } from "react-hot-loader/root";
import {
  ListGroup,
  Card,
  Button
} from "react-bootstrap"
import { MDBBtn, MDBIcon } from 'mdbreact'

import CustomModal from './Modal'
import SearchInput from './SearchLocationInput'
import MapModal from './MapModal'

const entities = [
  {
    id: 0,
    city_id: 0,
    name: 'AC building',
    lat: 21.0324413,
    lng: 105.7830461,
    polyline: [
      { lat: 21.032268423406876, lng: 105.78332182269813 },
      { lat: 21.032673992461593, lng: 105.78328427177192 },
      { lat: 21.032788971942587, lng: 105.7821631084037 },
      { lat: 21.032388410229043, lng: 105.78206654887916 },
      { lat: 21.032268423406876, lng: 105.78332182269813 },
    ],
    point: {
      color: {
        alpha: 1,
        blue: 1,
        green: 1,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 1,
    city_id: 0,
    name: 'Ho Hoan Kiem',
    lat: 21.0287797,
    lng: 105.850176,
    point: {
      color: {
        alpha: 1,
        blue: 1,
        green: 1,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 2,
    city_id: 1,
    name: 'Cau Rong',
    lat: 16.0610497,
    lng: 108.2252116,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 1,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 3,
    city_id: 1,
    name: 'Cau Vang',
    lat: 15.9949857,
    lng: 107.9943842,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 1,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 4,
    city_id: 2,
    name: 'Nha tho Da',
    lat: 12.2468,
    lng: 109.1858796,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 0.6470588235294118,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 5,
    city_id: 2,
    name: 'Thap Ba',
    lat: 12.2653933,
    lng: 109.1932058,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 0.6470588235294118,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 6,
    city_id: 3,
    name: 'Bitexco',
    lat: 10.7719937,
    lng: 106.7057951,
    point: {
      color: {
        alpha: 1,
        blue: 1,
        green: 0,
        red: 0
      },
      pixelSize: 20
    }
  },
  {
    id: 7,
    city_id: 0,
    name: 'Văn miếu quốc tử giám',
    lat: 21.02939214531629,
    lng: 105.83624913068846,
    point: {
      color: {
        alpha: 1,
        blue: 1,
        green: 1,
        red: 1
      },
      pixelSize: 20
    }
  },
]

const cities = [
  {
    id: 0,
    name: 'Hanoi',
    lat: 21.0245,
    lng: 105.84117,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 1,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 1,
    name: 'Da Nang',
    lat: 16.06778,
    lng: 108.22083,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 0,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 2,
    name: 'Nha Trang',
    lat: 12.24507,
    lng: 109.19432,
    point: {
      color: {
        alpha: 1,
        blue: 0,
        green: 0.6470588235294118,
        red: 1
      },
      pixelSize: 20
    }
  },
  {
    id: 3,
    name: 'Ho Chi Minh',
    lat: 10.82302,
    lng: 106.62965,
    point: {
      color: {
        alpha: 1,
        blue: 1,
        green: 0,
        red: 0
      },
      pixelSize: 20
    }
  },
]

const levels = [
  {
    id: 1,
    name: 'country'
  },
  {
    id: 2,
    name: 'state'
  },
  {
    id: 3,
    name: 'city'
  },
  {
    id: 4,
    name: 'project'
  },
]

class App extends PureComponent {
  viewer
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      name: '',
      showMap: false,
      
      entity: null,
      displayLevel: 'city',
      activedCity: null,
      userLocation: null
    }
  }
  componentDidMount() {
    const API_KEY='AIzaSyBgo82RLpZphiLZPf6dma2F82UQWQinzVc'
    this.loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    )
    this.getUserLocation()
    this.viewer.animation.container.style.visibility = 'hidden';
    this.viewer.timeline.container.style.visibility = 'hidden';
    this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 70000;
    this.viewer.scene.screenSpaceCameraController._minimumZoomRate = 300;
  }

  loadScript = (url) => {
    let script = document.createElement("script");
    script.type = "text/javascript";
  
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          console.log('script loaded')
          script.onreadystatechange = null;
          this.searchInput.handleScriptLoad()
          // this.mapModal.initMap()
        }
      };
    } else {
      script.onload = () => {
        console.log('script loaded 1')
        this.searchInput.handleScriptLoad()
        // this.mapModal.initMap()
      }
    }
  
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((location) => {
        this.setState({
          userLocation: location
        })
        this.viewer.camera.flyTo({
          destination: this.parsePostition(location.coords.latitude, location.coords.longitude, 20000000)
        })
      });
    } else {
      console.log('errr')
    }
    return
  }
  parsePostition = (lat, long, height = 30) => {
    return Cartesian3.fromDegrees(long, lat, height)
  }

  onClickPosition = (city) => {
    this.viewer.camera.flyTo({
      destination: this.parsePostition(city.lat, city.lng, 70000)
    })
    this.setState({
      displayLevel: 'project',
      activedCity: city
   })
  }

  handleClose = () => {
    this.setState({
      show: false
    })
  }

  handleShowMap = () => {
    this.setState({
      showMap: true
    })
  }

  handleCloseMap = () => {
    this.setState({
      showMap: false
    })
  }

  handleShow = (entity) => {
    this.setState({
      show: true,
      entity
    })
  }

  onClickEntity = (entity) => {
    console.log('entity', entity)
    this.handleShow(entity)
  }

  onInputChange = () => {
    console.log('Test')
  }

  flyTo = (lat, long) => {
    console.log('lat', lat)
    console.log('lng', long)
    this.viewer.camera.flyTo({
      destination: this.parsePostition(lat, long, 70000)
    })
  }

  render() {
    const { displayLevel, activedCity, userLocation } = this.state
    let projectsData = []
    if (activedCity) {
      const activedCityId = activedCity.id;
      projectsData = entities.filter(entity => entity.city_id == activedCityId)
    }

    return (
      <div>
        <Viewer ref={e => { this.viewer = e && e.cesiumElement; }} full>
          <div className="control-btns">
            <div className="search-input">
              <SearchInput onRef={ref => { this.searchInput = ref }} callback={this.flyTo} />
            </div>

            <MDBBtn rounded color="indigo darken-1" className="find-location"
              onClick={() => {
                this.viewer.camera.flyTo({
                  destination: this.parsePostition(userLocation.coords.latitude, userLocation.coords.longitude, 70000)
                })
              }}
            >
              <MDBIcon fas icon="map-marker-alt" size="2x" className="mr-2" />
              <span className="text">Find my location</span>
            </MDBBtn>
          </div>
          {
            displayLevel == 'city' &&
            <div className="d-flex group-container">
              <ListGroup>
                {cities.map((city, index) =>
                  <ListGroup.Item action onClick={() => this.onClickPosition(city)} key={index}>
                    {city.name}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
          }
          {
            displayLevel == 'project' &&
            <div className="list-projects">
              <div className="head">
                <div className="back">
                  <i className="fas fa-chevron-left"
                    onClick={() => {
                      this.setState({ displayLevel: 'city', activedCity: null})
                      this.viewer.camera.flyTo({
                        destination: this.parsePostition(userLocation.coords.latitude, userLocation.coords.longitude, 10000000)
                      })
                    }}
                  />
                </div>
                {activedCity.name}
              </div>
              <div className="wrapper">
                {
                  projectsData.map(project =>
                    <div className="item-project" key={project.id}>
                      <div className="inner">
                        <div className="new">new</div>
                        <div className="txt">Home for Sale</div>
                        <div className="price">$105,000</div>
                        <a href="#" className="favo-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" data-testid="complex-svg-heart" width="40" height="40" aria-label="heart" tabIndex="-1" 
                          className="sc-prOVx nbRcd"><path fill="rgba(0,0,0,0.4)" stroke="#fff" strokeWidth="3" data-testid="complex-svg-heart-path" d="M20 8.3c4.9-8 18.5-5.9 18.5 5l-.1 1.9c-.8 4.6-4 9.3-8.9 14a66.6 66.6 0 0 1-8.7 7l-.7.6-.8-.5a27.6 27.6 0 0 1-2.8-1.7c-2-1.4-4-3-6-4.7-5.6-5-9-10.3-9-15.8A10 10 0 0 1 20 8.3z"></path></svg>
                        </a>
                      </div>
                      <div className="desc">
                        <div>
                          <span><strong>3</strong>bed</span>
                          <span><strong>3.5</strong>bath</span>
                          <span><strong>1,900</strong>sqft lot</span>
                        </div>
                        <p>
                        <span><strong>{project.name}</strong></span>
                        </p>
                      </div>
                    </div>
                  )
                }
              </div>
            </div> 
          }
          {entities.map((entity, index) =>
            <Entity
              position={this.parsePostition(entity.lat, entity.lng)}
              point={entity.point}
              name={entity.name}
              key={index}
              onClick={() => this.onClickEntity(entity)}
            >
            </Entity>
          )}
        </Viewer>

        <CustomModal
          onRef={ref => { this.answerlist = ref }}
          show={this.state.show}
          handleClose={this.handleClose}
          entity={this.state.entity}
          handleShowMap = {this.handleShowMap}
        >
        </CustomModal>
        <MapModal 
          onRef={ref => { this.mapModal = ref }}
          showMap={this.state.showMap}
          handleCloseMap={this.handleCloseMap}
          entity={this.state.entity}
          entities={entities}
        >
        </MapModal>
      </div>
    );
  }
}

export default hot(App);
