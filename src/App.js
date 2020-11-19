import './App.scss';
import { Viewer, Entity } from "resium";
import { Cartesian3, ScreenSpaceEventType, GeoJsonDataSource } from "cesium";
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
    lng: 105.8548718197642,
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

  // new data of US
  {
    id: 13,
    state_id: 0,
    city_id: 4,
    title: 'Houston, Texas',
    name: 'The Ivy at Clear Creek',
    description: 'Western Wealth Capital và USHome tự hào mang đến cho các nhà đầu tư một cơ hội đầu tư vào một dự án lợi nhuận cao tại một trong những thị trường bất động sản mạnh nhất của Hoa Kỳ – khu vực Houston, Texas. Công ty hợp danh hữu hạn dự định đầu tư vào Khu căn hộ The Ivy at Clear Creek, một cộng đồng với hơn 244 hộ gia đình tọa lạc tại Clear Lake, Houston, Texas.',
    lat: 29.5742714,
    lng: -95.105335,
  },
  {
    id: 132,
    state_id: 0,
    city_id: 4,
    title: 'Houston, Texas',
    name: 'Wimbledon Apartment Homes',
    description: 'Dự án đầu tư khu căn hộ cho thuê Winbledon bao gồm 161 căn hộ với tiềm năng to lớn được bao quanh bởi các khu sân vườn rộng rãi, thoáng mát. Khu căn hộ này được xây dựng vào năm 1979, tòa nhà hạng B có trần nhà dầy từ 8 inch đến 9 inch với một sự cổ kính hiếm có. Khu vực này có kiến trúc mặt tiền rất thu hút cộng với điều kiện rất tốt mà không cần hoặc cần rất ít việc bảo trì.',
    lat: 30.0150066,
    lng: -95.5172264,
  },
  {
    id: 133,
    state_id: 0,
    city_id: 4,
    title: 'Houston, Texas',
    name: 'The Lakes Of 610',
    description: 'Western Wealth Capital và USHome tự hào mang đến cho các nhà đầu tư cơ hội đầu tư vào một dự án lợi nhuận cao tại một trong những thị trường BĐS phát triển mạnh nhất của Hoa Kỳ – Houston, Texas. Công ty hợp danh hữu hạn dự định đầu tư vào Khu căn hộ The Lakes of 610',
    lat: 29.6725322,
    lng: -95.4215628,
  },
  {
    id: 14,
    state_id: 0,
    city_id: 5,
    title: 'Los Angeles, Califorina',
    name: 'EB5: Downtown Los Angeles Marriott Hotel',
    description: 'Los Angeles là thành phố lớn nhất tiểu bang California, lớn nhất miền tây nước Mỹ, là thành phố lớn thứ 2 Hoa Kỳ và là kinh đô ánh sáng với thắng cảnh đẹp, thời tiết mát mẻ, Los Angeles không hổ danh là điểm du lịch nổi tiếng thế giới.',
    lat: 34.0382048,
    lng: -118.2671822,
  },
  {
    id: 142,
    state_id: 0,
    city_id: 5,
    title: 'Los Angeles, Califorina',
    name: 'Hotel RHF1 - Hollywood, Los Angeles',
    description: 'Sự kết hợp của hai “gã khổng lồ” dày dạn kinh nghiệm trong ngành bất động sản Mỹ – Colony Capital Relevant Group. Relevant Group và Colony Capital có đội ngũ cố vấn tốt nhất với lịch sử hoạt động thành công trong lĩnh vực bất động sản, có tầm nhìn và am hiểu thị trường Hoa Kỳ cực kỳ sâu sắc.',
    lat: 34.0509717,
    lng: -118.3130118,
  },
  {
    id: 15,
    state_id: 1,
    city_id: 4,
    title: 'Dallas, Texas',
    name: 'Valley Oaks Apartment Homes',
    description: 'Khu căn hộ Valley Oaks, một khu căn hộ phong cách sân vườn với 322 căn hộ tọa lạc tại thành phố Hurst, Texas. Được xây dựng từ năm 1979, khu căn hộ rất tiềm năng để phát triển, khi mà đa số các căn hộ vẫn còn giữ nguyên nội thất ban đầu.',
    lat: 32.8248857,
    lng: -97.1674656,
  },
  {
    id: 152,
    state_id: 1,
    city_id: 4,
    title: 'Dallas, Texas',
    name: 'Bel Air Las Colinas',
    description: 'Western Wealth Capital và USHome tự hào mang đến cho các nhà đầu tư cơ hội đầu tư vào một dự án lợi nhuận cao tại một trong những thị trường BĐS phát triển mạnh nhất của Hoa Kỳ, khu vực Dallas, Texas. Công ty hợp danh hữu hạn dự định đầu tư vào Khu căn hộ Bel Air Las Colinas, một cộng đồng cư dân với 525 căn hộ cao cấp tọa lạc tại Las Colinas, Irving, Texas.',
    lat: 32.8545644,
    lng: -96.9513246,
  },

  // {
  //   // data fake
  //   id: 16,
  //   state_id: 1,
  //   city_id: 5,
  //   title: 'San Francisco, Califorina',
  //   name: 'Hotel RHF1 - Hollywood, San Francisco, Califorina',
  //   description: 'Sự kết hợp của hai “gã khổng lồ” dày dạn kinh nghiệm trong ngành bất động sản Mỹ – Colony Capital Relevant Group. Relevant Group và Colony Capital có đội ngũ cố vấn tốt nhất với lịch sử hoạt động thành công trong lĩnh vực bất động sản, có tầm nhìn và am hiểu thị trường Hoa Kỳ cực kỳ sâu sắc.',
  //   lat: 37.767658634544645,
  //   lng: -122.39755703551069,
  // },
  {
    id: 17,
    state_id: 2,
    city_id: 6,
    title: 'New York City, New York',
    name: 'EB5: NYC Lightstone Towers',
    description: 'New York là mái nhà chung của nhiều ngành nghề và là điểm đến hàng đầu của bất kỳ người nào đang tìm kiếm việc làm. BĐS khu nhà ở đa gia đình tiếp tục là hạng mục đầu tư tuyệt vời không bị ảnh hưởng bởi suy thoái kinh tế.',
    lat: 40.713050,
    lng: -74.007230,
  },
  {
    id: 172,
    state_id: 2,
    city_id: 6,
    title: 'New York City, New York',
    name: 'EB5: Manhattan Tower New York City, United States',
    description: 'Với diện tích trên 11 hecta, Thành phố Hudson Yard là phần lớn nhất của khu đất chưa được khai thác trên đảo Manhattan. Hơn 1,6 triệu mét vuông của thành phố Hudson Yards được quy hoạch để phát triển các Cao Ốc, Văn Phòng, Khu Mua Sắm, Khu Dân Cư, các Công Viên, Cơ Sở Văn Hóa và Giải Trí. Tọa lạc tại vị trí trung tâm gần các công viên của thành phố, các tuyến giao thông, và khu dân cư lân cận đang phát triển nhanh chóng, Hudson Yards được kỳ vọng sẽ trở thành khu Trung Tâm Mới của New York.',
    lat: 40.7538019,
    lng: -74.0008329,
  },
  {
    id: 173,
    state_id: 2,
    city_id: 6,
    title: 'New York City, New York',
    name: 'EB5: Sister City Hotel, ACE Hotel Group',
    description: 'Sister City Hotel là một khách sạn boutique nằm tại Hạ Manhattan (New York) với thiết kế 14 tầng và 201 phòng. Dự án thuộc sở hữu của ACE Hotel Group, chuỗi khách sạn cao cấp với cách thiết kế tôn vinh nét đặc trưng của từng khu vực và sự sáng tạo trong từng công trình.',
    lat: 40.7218996,
    lng: -73.9929022,
  },
  {
    id: 174,
    state_id: 2,
    city_id: 6,
    title: 'New York City, New York',
    name: 'EB5: Empire State Marriott Hotel - New York',
    description: 'Dự án ESM tọa lạc tại 105-109 West 28th Street, Manhattan, chỉ cách Empire State Building một vài tòa nhà, thu hút rất đa dạng du khách. Từ Empire State Marriott có thể đi bộ đến nhiều điểm du lịch hàng đầu tại thành phố New York.',
    lat: 40.7463104,
    lng: -73.991205,
  },
  {
    id: 18,
    state_id: 3,
    city_id: 7,
    title: 'Phoenix, Arizona',
    name: 'Desert Willow Apartment Homes',
    description: 'Công ty hợp danh hữu hạn Western Wealth Capital và USHome tự hào mang đến cho các nhà đầu tư cơ hội đầu tư vào một dự án lợi nhuận cao tại một trong những thị trường BĐS phát triển mạnh nhất của Hoa Kỳ - Phoenix, Arizona. Công ty dự định đầu tư vào Khu căn hộ Desert Willow, một khu căn hộ phong cách sân vườn với 280 căn hộ tọa lạc ngay trung tâm của Phoenix. Được xây dựng từ năm 1973, khu căn hộ rất tiềm năng để phát triển, khi mà đa số các căn hộ vẫn nguyên bản và giữ nguyên nội thất ban đầu.',
    lat: 33.4946525,
    lng: -112.1035754,
  },
  {
    id: 182,
    state_id: 3,
    city_id: 7,
    title: 'Phoenix, Arizona',
    name: 'Cedar Meadows Apartment Homes',
    description: 'Công ty hợp danh hữu hạn Western Wealth Capital và USHome tự hào mang đến cho các nhà đầu tư cơ hội đầu tư vào một dự án lợi nhuận cao tại một trong những thị trường BĐS phát triển mạnh nhất của Hoa Kỳ - Phoenix, Arizona. Khu căn hộ Cedar Meadows, một khu căn hộ phong cách sân vườn với 145 căn hộ tọa lạc tại Glendale, Arizona. Được xây dựng từ năm 1985, khu căn hộ rất tiềm năng để phát triển.',
    lat: 33.5819476,
    lng: -112.245359,
  },
  {
    id: 183,
    state_id: 3,
    city_id: 7,
    title: 'Phoenix, Arizona',
    name: 'Villa Tree Apartment Homes',
    description: 'Western Wealth Capital và USHome tự hào mang đến cho các nhà đầu tư một cơ hội đầu tư vào một dự án lợi nhuận cao tại một trong những thị trường bất động sản mạnh nhất Bắc Mỹ – Tempe, Arizona. Công ty hợp danh hữu hạn dự định đầu tư vào Khu căn hộ Villa Tree, một cộng đồng với hơn 150 hộ gia đình tọa lạc tại thành phố Tempe, phía Đông thành phố Phoenix, tiểu bang Arizona. Được xây dựng từ năm 1980, khu căn hộ sở hữu tiềm năng phát triển to lớn với các căn hộ vẫn còn đang giữ nguyên trang thiết bị nội thất ban đầu.',
    lat: 33.4093508,
    lng: -111.894547,
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
    states: [
      {
        id: 4,
        name: 'Texas',
        lat: 29.75548920677555,
        lng: -95.37552950274825,
        cities: [
          {
            id: 1000,
            name: 'Houston',
            lat: 29.75548920677555,
            lng: -95.37552950274825,
          },
          {
            id: 1001,
            name: 'Dallas',
            lat: 32.776847367729644,
            lng: -96.77747682036818,
          }
        ]
      },
      {
        id: 5,
        name: 'Califorina',
        lat: 34.052133818696994,
        lng: -118.26664374625872,
        cities: [
          {
            id: 1002,
            name: 'Los Angeles',
            lat: 34.052133818696994,
            lng: -118.26664374625872,
          },
          {
            id: 1003,
            name: 'San Francisco',
            lat: 37.767658634544645,
            lng: -122.39755703551069,
          },
        ]
      },
      {
        id: 6,
        name: 'New York',
        lat: 40.68435860063441,
        lng: -73.96834164426204,
        cities: [
          {
            id: 1004,
            name: 'New York City',
            lat: 40.68435860063441,
            lng: -73.96834164426204,
          },
        ]
      },
      {
        id: 7,
        name: 'Arizona',
        lat: 33.442891424622964,
        lng: -112.07411045441694,
        cities: [
          {
            id: 1005,
            name: 'Phoenix',
            lat: 33.442891424622964,
            lng: -112.07411045441694,
          }
        ]
      }
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



let citiesVN = countries[0].cities
let stateUS = countries[1].states

let area = citiesVN.concat(stateUS)
console.log('area', area)

const maxHeightShowCountry = 0
const maxHeightShowCity = 20000000
const minHeightShowState = 2000000
const maxHeightShowProject = 1750000

const stateViewHeight = 1750000

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
      showCityEntities: true,
      showStateEntities: true,
      showProjectEntities: false,
      showCityOfState: false
    }
  }
  componentDidMount() {
    const API_KEY = 'AIzaSyBgo82RLpZphiLZPf6dma2F82UQWQinzVc'
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

    this.viewer.camera.moveEnd.addEventListener(() => this.onMoveEnd());
    this.viewer.camera.changed.addEventListener(() => this.onViewChanged());
  }

  componentWillUnmount() {
    this.viewer.camera.moveEnd.removeEventListener(() => this.onMoveEnd());
    this.viewer.camera.changed.removeEventListener(() => this.onViewChanged());
  }

  onMoveEnd = () => {
    const zoomHeight = this.viewer.camera.positionCartographic.height
    console.log('zoomHeight', zoomHeight)
    if (zoomHeight <= minHeightShowState) {
      this.addAreaBorder()
    }
  }

  onViewChanged = () => {
    const zoomHeight = this.viewer.camera.positionCartographic.height
    console.log('zoom height view change', zoomHeight)
    if (zoomHeight > minHeightShowState) {
      this.viewer.dataSources.length > 0 && this.viewer.dataSources.removeAll()
      this.setState({
        showCityEntities: true,
        showStateEntities: true,
        showProjectEntities: false
      })
    } else {
      console.log('show project')
      this.setState({
        showProjectEntities: true,
        showCityEntities: false,
        showStateEntities: false
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

  onClickPosition = (area) => {
    let zoomHeight = 90000
    if (area.cities) {
      zoomHeight = 1650000
    }
    this.viewer.camera.flyTo({
      destination: this.parsePostition(area.lat, area.lng, zoomHeight)
    })

    this.setState({
      displayLevel: 'project',
      activedCity: area
    })
  }

  addAreaBorder = () => {
    let cityBorder = null
    if (this.state.activedCity?.name === 'Hanoi') {
      cityBorder = GeoJsonDataSource.load('./hanoi.geojson')
    }
    if (this.state.activedCity?.name === 'Da Nang') {
      cityBorder = GeoJsonDataSource.load('./danang.geojson')
    }
    if (this.state.activedCity?.name === 'Nha Trang') {
      cityBorder = GeoJsonDataSource.load('./nhatrang.geojson')
    }
    if (this.state.activedCity?.name === 'Ho Chi Minh') {
      cityBorder = GeoJsonDataSource.load('./hcm.geojson')
    }
    if (this.state.activedCity?.name === 'Texas') {
      cityBorder = GeoJsonDataSource.load('./texas.geojson')
    }
    if (this.state.activedCity?.name === 'Califorina') {
      console.log('loadddd')
      cityBorder = GeoJsonDataSource.load('./cali.geojson')
    }
    if (this.state.activedCity?.name === 'Los Angeles') {
      cityBorder = GeoJsonDataSource.load('./la.geojson')
    }
    if (this.state.activedCity?.name === 'New York') {
      cityBorder = GeoJsonDataSource.load('./ny.geojson')
    }
    if (this.state.activedCity?.name === 'Arizona') {
      cityBorder = GeoJsonDataSource.load('./az.geojson')
    }

    cityBorder && this.viewer.dataSources.add(cityBorder)
  }

  handleShowCities = (country_id) => {
    this.setState({
      showCities: {
        ...this.state.showCities,
        [country_id]: !this.state.showCities[country_id]
      }
    }
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
      this.onClickPosition(entity)
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
          key={index}
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
      showProjectEntities,
      showStateEntities,
    } = this.state
    let projectsData = []
    if (activedCity) {
      const activedCityId = activedCity.id;
      projectsData = entities.filter(entity => entity.city_id == activedCityId)
    }

    let entitiesRender = null

    if (showStateEntities && !showProjectEntities) {
      console.log('state')
      entitiesRender = this.generateEntities(area, true)
    } else {
      console.log('project')
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
                  const { cities, states } = country
                  console.log(cities, states)
                  const isShowCities = showCities[country.id]
                  return (
                    <ListGroup key={country.id}>
                      <ListGroup.Item className="country-name"
                        onClick={() => this.handleShowCities(country.id)}
                      >
                        <span>{country.name}</span>
                        <span>
                          {
                            isShowCities ? <i className="fas fa-sort-up" /> : <i className="fas fa-sort-down" />
                          }
                        </span>
                      </ListGroup.Item>
                      {
                        isShowCities && cities &&
                        cities.map((city, index) =>
                          <ListGroup.Item action onClick={() => this.onClickPosition(city)} key={index}>
                            {city.name}
                          </ListGroup.Item>
                        )
                      }
                      {
                        isShowCities && states &&
                        states.map((state, index) =>
                          <ListGroup.Item action onClick={() => this.onClickPosition(state)} key={index}>
                            {state.name}
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
                      this.setState({ displayLevel: 'city', activedCity: null })
                    }}
                  />
                </div>
                {activedCity.name}
              </div>
              <div className="wrapper">
                {
                  projectsData.map(project => {
                    let classImg = 'inner '
                    if (project.id >= 13) {
                      classImg += `img-${project.id}`
                    }
                    return (
                      <div className="item-project" key={project.id}>
                        <div className={classImg}
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
                  })
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
          handleShowMap={this.handleShowMap}
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
