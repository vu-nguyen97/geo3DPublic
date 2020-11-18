import './App.scss';
import { Viewer, Entity } from "resium";
import { Cartesian3, ScreenSpaceEventType } from "cesium";
import { PureComponent } from 'react'
import { hot } from "react-hot-loader/root";
import {
  ListGroup,
  Card,
  Button,
  InputGroup,
  FormControl
} from "react-bootstrap"
import { MDBBtn, MDBIcon } from 'mdbreact'

import CustomModal from './Modal'
import SearchInput from './SearchLocationInput'
import MapModal from './MapModal'
import markerIcon from './images/marker.svg'
import specialMarkerIcon from './images/special-marker.svg'

const entities = [
  {
    id: 0,
    city_id: 0,
    name: 'AC building',
    lat: 21.03232780026251,
    lng: 105.78304995678835,
    image: true,
    polyline: [
      { lat: 21.032451724208073, lng: 105.78293864511423 },
      { lat: 21.032415423264997, lng: 105.78318406723909 },
      { lat: 21.032170078728175, lng: 105.78313846968584 },
      { lat: 21.03222515610835, lng: 105.78289304756098 },
      { lat: 21.032451724208073, lng: 105.78293864511423 },
    ],
  },
  {
    id: 1,
    city_id: 0,
    name: 'Ho Hoan Kiem',
    lat: 21.02238734675524,
    lng: 105.8548718197642 ,
  },
  {
    id: 2,
    city_id: 1,
    name: 'Cau Rong',
    lat: 16.062269481950707,
    lng: 108.23130259671314,
  },
  {
    id: 3,
    city_id: 1,
    name: 'Asia Park',
    lat: 16.038561178018778,
    lng: 108.22618447763062,
  },
  {
    id: 4,
    city_id: 2,
    name: 'Nha tho Da',
    lat: 12.246725010295867,
    lng: 109.1881680331193,
  },
  {
    id: 5,
    city_id: 2,
    name: 'Thap Ba',
    lat: 12.265405599627554,
    lng: 109.1944020778975,
  },
  {
    id: 6,
    city_id: 3,
    name: 'Bitexco',
    lat: 10.77296411969166,
    lng: 106.7054425715652,
  },
  {
    id: 7,
    city_id: 0,
    name: 'Văn miếu quốc tử giám',
    lat: 21.02939214531629,
    lng: 105.83624913068846,
  },
  {
    id: 8,
    city_id: 4,
    name: 'Texas building',
    lat: 29.38903807067983,
    lng: -94.91513500165428,
  },
  {
    id: 9,
    city_id: 5,
    name: 'California building',
    lat: 35.12471886317634,
    lng: -117.98415348906342,
  },
  {
    id: 10,
    city_id: 6,
    name: 'Chicago building',
    lat: 41.84879726701267,
    lng: -87.68257361576919,
  },
  {
    id: 11,
    city_id: 7,
    name: 'Los Angeles building',
    lat: 34.051519663913176,
    lng: -118.24312176636627,
  },
  {
    id: 12,
    city_id: 4,
    name: 'Texas building 2',
    lat: 29.384248117725974,
    lng: -94.90069379421364,
  },
]

const countries = [
  {
    id: 0,
    name: 'Viet nam',
    cities: [
      {
        id: 0,
        name: 'Hanoi',
        lat: 21.0245,
        lng: 105.84117,
      },
      {
        id: 1,
        name: 'Da Nang',
        lat: 16.06778,
        lng: 108.22083,
      },
      {
        id: 2,
        name: 'Nha Trang',
        lat: 12.24507,
        lng: 109.19432,
      },
      {
        id: 3,
        name: 'Ho Chi Minh',
        lat: 10.82302,
        lng: 106.62965,
      },
    ]
  },
  {
    id: 1,
    name: 'United State',
    cities: [
      {
        id: 4,
        name: 'Texas',
        lat: 31.961885281142202,
        lng: -99.8951742379726,
      },
      {
        id: 5,
        name: 'California',
        lat: 41.85214488646792,
        lng: -87.95161731336496,
      },
      {
        id: 6,
        name: 'Chicago',
        lat: 41.87620677947113,
        lng: -87.62965377343647,
      },
      {
        id: 7,
        name: 'Los Angeles',
        lat: 34.044400781058066,
        lng: -118.24144442703695,
      },
    ]
  }
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

let citiesArr = countries.map(country => country.cities)
let cities = [].concat.apply([], citiesArr)

const maxHeightShowCountry = 0
const maxHeightShowCity = 20000000
const maxHeightShowProject = 1700000

class App extends PureComponent {
  viewer
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      name: '',
      showMap: false,
      userLocation: null,
      
      entity: null,
      displayLevel: 'city',
      activedCity: null,
      showCities: {
        // fix me
        0: true,
        1: true
      },
      showCityEntities: false,
      showProjectEntities: false,
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
    this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 40000000;
    this.viewer.scene.screenSpaceCameraController._minimumZoomRate = 30000;
    this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    this.viewer.camera.changed.addEventListener(() => this.onZoom());
  }

  componentWillUnmount() {
    this.viewer.camera.changed.removeEventListener(() => this.onZoom());
  }

  onZoom = () => {
    const zoomHeight = this.viewer.camera.positionCartographic.height
    if (zoomHeight <= maxHeightShowCity && zoomHeight > maxHeightShowProject) {
      this.setState({
        showCityEntities: true,
        showProjectEntities: false
      })
    }
    if (zoomHeight <= maxHeightShowProject) {
      this.setState({
        showProjectEntities: true,
        showCityEntities: false
      })
    }
  }

  loadScript = (url) => {
    let script = document.createElement("script");
    script.type = "text/javascript";
  
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          script.onreadystatechange = null;
          this.searchInput.handleScriptLoad()
        }
      };
    } else {
      script.onload = () => {
        this.searchInput.handleScriptLoad()
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
      destination: this.parsePostition(city.lat, city.lng, 90000)
    })
    this.setState({
      displayLevel: 'project',
      activedCity: city
   })
  }

  handleShowCities = (country_id) => {
    this.setState({
      showCities: {
        ...this.state.showCities,
        [country_id]: !this.state.showCities[country_id]
      }}
    )
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

  onClickEntity = (entity, isCityView = false) => {
    if (isCityView) {
      this.flyTo(entity.lat, entity.lng)
      return
    }
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

  generateEntities(data, isCityView = false) {
    return data.map((item, index) => {
      console.log(item)
      let billboard
      if (!item.image) {
        billboard = { image: markerIcon }
      } else {
        billboard = { image: specialMarkerIcon }
      }
      return (
        <Entity
          position={this.parsePostition(item.lat, item.lng)}
          billboard={billboard}
          name={item.name}
          key={item.id}
          onClick={() => this.onClickEntity(item, isCityView)}
        >
        </Entity>
      )
    })
  }

  render() {
    const { 
      displayLevel,
      activedCity,
      userLocation,
      showCities,
      showCityEntities,
      showProjectEntities 
    } = this.state
    let projectsData = []
    if (activedCity) {
      const activedCityId = activedCity.id;
      projectsData = entities.filter(entity => entity.city_id == activedCityId)
    }

    let entitiesRender = null

    if (showCityEntities && !showProjectEntities) {
      entitiesRender = this.generateEntities(cities, true)
    } else {
      entitiesRender = this.generateEntities(entities)
    }

    return (
      <div>
        <Viewer ref={e => { this.viewer = e && e.cesiumElement; }} 
          full
          selectionIndicator={false}
        >
          <div className="control-btns">
            <div className="search-input">
              <SearchInput onRef={ref => { this.searchInput = ref }} callback={this.flyTo} />
            </div>
            <MDBBtn color="amber lighten-1" className="search-btn">
              <span className="text">Search</span>
            </MDBBtn>
            
            {/* 
            <InputGroup className="mb-2">
              <FormControl id="inlineFormInputGroup" placeholder="Username" />
              <InputGroup.Prepend className="search-btn">
                <Button className="search-btn">
                  <span className="text">Search</span>
                </Button>
              </InputGroup.Prepend>
            </InputGroup> */}

            <MDBBtn rounded color="indigo darken-1" className="find-location" size="sm"
              onClick={() => {
                this.viewer.camera.flyTo({
                  destination: this.parsePostition(userLocation.coords.latitude, userLocation.coords.longitude, 75000)
                })
              }}
            >
              <MDBIcon fas icon="map-marker-alt" size="2x" className="mr-2" />
              <span className="text">Set Your Location</span>
            </MDBBtn>
          </div>
          {
            displayLevel == 'city' &&
            <div className="d-flex group-container">
              {
                countries.map(country => {
                  const { cities } = country
                  const isShowCities = showCities[country.id]
                  return (
                    <ListGroup key={country.id}>
                      <ListGroup.Item className="country-name"
                        onClick={() => this.handleShowCities(country.id)}
                      >
                        <span>{country.name}</span>
                        <span>
                          {
                            isShowCities ? <i className="fas fa-sort-up"/> : <i className="fas fa-sort-down"/>
                          }
                        </span>
                      </ListGroup.Item>
                      {
                        isShowCities &&
                        cities.map((city, index) =>
                          <ListGroup.Item action onClick={() => this.onClickPosition(city)} key={index}>
                            {city.name}
                          </ListGroup.Item>
                        )
                      }
                    </ListGroup>
                  )
                })
              }
            </div>
          }
          {
            displayLevel == 'project' &&
            <div className="list-projects">
              <div className="head">
                <div className="back">
                  <i className="fas fa-chevron-left"
                    onClick={() => {
                      this.viewer.camera.flyTo({
                        destination: this.parsePostition(activedCity.lat, activedCity.lng, 10000000)
                      })
                      this.setState({ displayLevel: 'city', activedCity: null})
                    }}
                  />
                </div>
                {activedCity.name}
              </div>
              <div className="wrapper">
                {
                  projectsData.map(project =>
                    <div className="item-project" key={project.id}>
                      <div className="inner"
                        onClick={() => {
                          this.setState({
                            entity: project,
                            showMap: true
                          })
                        }}
                      >
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
          {entitiesRender}
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
