import React from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'

export default class CustomModal extends React.Component{
  constructor() {
    super();
    this.close = this.close.bind(this)
  
    this.state = {
      showModal: false
    }
  }

  close(){
    this.setState({showModal: false})
  }
  componentWillReceiveProps(nextProps){
    this.setState({showModal: nextProps.showModal})
  }

  render(){

    renderModalFooter = this.props.modalFooter ? <div>{this.props.modalFooter}</div> : <Button onClick={this.close}>Close</Button>

    return(
        <Modal show={this.state.showModal} onHide={this.close}>
            <Modal.Header closeButton>
              <Modal.Title >{this.props.modalHeader}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.props.modalBody}
            </Modal.Body>
            <Modal.Footer>
                {renderModalFooter}
            </Modal.Footer>
        </Modal>
    )
  }
}
