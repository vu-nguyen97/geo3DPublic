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
import CustomModal from './Modal'
import SearchInput from './SearchLocationInput'
import MapModal from './MapModal'

const entities = [
  {
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
]

const cities = [
  {
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

class App extends PureComponent {
  viewer
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      name: '',
      showMap: false,
      entity: null
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
        console.log('location', location)
        this.viewer.camera.flyTo({
          destination: this.parsePostition(location.coords.latitude, location.coords.longitude, 20000000)
        })
      });
      console.log('go here')
    } else {
      console.log('errr')
    }
    return
  }
  parsePostition = (lat, long, height = 30) => {
    return Cartesian3.fromDegrees(long, lat, height)
  }

  onClickPosition = (entity) => {
    console.log('entity', entity)
    this.viewer.camera.flyTo({
      destination: this.parsePostition(entity.lat, entity.lng, 70000)
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
    return (
      <div>
        <Viewer ref={e => { this.viewer = e && e.cesiumElement; }} full>
          <div className="search-input">
            <SearchInput onRef={ref => { this.searchInput = ref }} callback={this.flyTo} />
          </div>
          <div className="d-flex group-container">
            <ListGroup>
              {cities.map((city, index) =>
                <ListGroup.Item action onClick={() => this.onClickPosition(city)} key={index}>
                  {city.name}
                </ListGroup.Item>
              )}
            </ListGroup>
          </div>
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
