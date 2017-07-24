import React from 'react'
import { Row, Col } from 'react-bootstrap'

export default class TabItem extends React.Component{
  constructor(){
    super()
  }
  render(){
    return(
      <div id={this.props.id} className={this.props.className}>
        <Row>
          <Col sm={3} xs={4}>
            <img src={this.props.icon} width="50" height="50" />
          </Col>
          <Col sm={9} xs={4}>
            {this.props.text}
          </Col>
        </Row>
      </div>
    )
  }

}
