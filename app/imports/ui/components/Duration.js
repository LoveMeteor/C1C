import React from 'react'
import Radium from 'radium'
import { moment } from 'meteor/momentjs:moment'

// Convert seconds duration to a readable format for the user
@Radium
export default class Duration extends React.Component {
  convertDuration(){
    return this.props.duration ? moment(this.props.duration*1000).format('mm:ss') : ''
  }
  render(){
    return <div onClick={this.props.onClick} className={this.props.className} style={this.props.style}>{this.convertDuration()}</div>
  }
}
