import { PureComponent } from 'react'
import {
  ListGroup,
  Card,
  Button,
  Modal
} from "react-bootstrap"
import house1 from './images/example-house1.jpg'
import house2 from './images/example-house2.jpg'
import house3 from './images/example-house3.jpg'


class CustomModal extends PureComponent {
  viewer
  constructor(props) {
    super(props)
  }
  componentDidMount() {

  }

  random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  render() {
    const random = this.random(1, 3)
    let img
    if (random == 1) {
      img = house1
    } else if (random == 2) {
      img = house2
    } else {
      img = house3
    }
    return (
      <Modal show={this.props.show} onHide={this.props.handleClose}>
        <Modal.Body>
        <Card style={{ width: '100%' }}>
            <Card.Img variant="top" src={img} />
            <Card.Body>
              <Card.Title>{this.props.entity?.name}</Card.Title>
              <Card.Text>
                Great apartments that are fully rented!! Great rental location. This is a perfect investment opportunity. This is a large lot with space to build 3 more 4plex's! Owner financing is available.
              </Card.Text>
              <Button variant="primary" onClick={() => this.props.handleShowMap()}>Detail</Button>
            </Card.Body>
        </Card>
        </Modal.Body>
      </Modal>
    );
  }
}

export default CustomModal;
