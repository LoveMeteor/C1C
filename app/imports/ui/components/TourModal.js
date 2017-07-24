import React from 'react'
import CustomModal from '/imports/ui/components/TourModal'
import ButtonModal from '/imports/ui/components/ButtonModal'
import { Button, Row, Col, DropdownButton, MenuItem } from 'react-bootstrap'

export default class TourModal extends React.Component{
  constructor(){
    super()

    this.openModal = this.openModal.bind(this)

    this.state = {
      showModal: false
    }
  }

  openModal(){
    this.setState({showModal: true})
  }

  render(){
    modalHeader = <div className="text-white">{this.props.day}</div>
    modalBody = <div>
                  <Row>
                    <Col sm={3} className="text-gray">
                      Client
                    </Col>
                    <Col sm={3} className="text-gray">
                      Tour name
                    </Col>
                    <Col sm={3} className="text-gray">
                      Start
                    </Col>
                    <Col sm={3} className="text-gray">
                      End
                    </Col>
                  </Row>
                  <hr/>
                  <Row>
                    <Col sm={3} className="text-gray">
                      <DropdownButton id="reception-wall-dropdown" title="Select Client">
                        <MenuItem eventKey="1">Westpac Group</MenuItem>
                      </DropdownButton>
                    </Col>
                    <Col sm={3} className="text-gray">
                      <input className="input" placeholder="Westpac Winter 2016" />
                    </Col>
                    <Col sm={3} className="text-gray">
                      Start
                    </Col>
                    <Col sm={3} className="text-gray">
                      End
                    </Col>
                  </Row>
                </div>
    modalFooter = <div>
                    <Row>
                      <Col sm={10}>
                        <Button className="button-orange-secondary"> Reserve Time slot</Button>
                      </Col>
                      <Col sm={2}>
                        <Button className="button-orange"> Next </Button>
                      </Col>
                    </Row>
                  </div>
    return(
      <div>
          <ButtonModal
            buttonText= "Tour Modal"
            modalHeader={modalHeader} modalBody={modalBody} modalFooter={modalFooter}
          />
      </div>
    )
  }
}
