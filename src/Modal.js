import { PureComponent } from 'react'
import {
  ListGroup,
  Card,
  Button,
  Modal
} from "react-bootstrap"


class CustomModal extends PureComponent {
  viewer
  constructor(props) {
    super(props)
  }
  componentDidMount() {

  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.handleClose}>
        <Modal.Body>
        <Card style={{ width: '100%' }}>
            <Card.Img variant="top" src="https://via.placeholder.com/286x180" />
            <Card.Body>
              <Card.Title>{this.props.entity?.name}</Card.Title>
              <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
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
