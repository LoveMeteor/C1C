import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import CustomModal from '/imports/ui/components/CustomModal'

export default class ButtonModal extends React.Component{
  constructor(){
    super()
    this.openModal = this.openModal.bind(this);
    this.state={
      showModal: false
    }
  }

  openModal(){
    this.setState({showModal: true})
  }

  render(){
    actionableComponent= this.props.icon ? <a href="" onClick={this.openModal}>{this.props.icon}</a> : <Button onClick={this.openModal} className={this.props.buttonClass}>{this.props.buttonText}</Button>
    return(
          <div>
            <CustomModal showModal={this.state.showModal} modalFooter={this.props.modalFooter} modalHeader={this.props.modalHeader} modalBody={this.props.modalBody}/>
            {actionableComponent}
          </div>
    )
  }
}
