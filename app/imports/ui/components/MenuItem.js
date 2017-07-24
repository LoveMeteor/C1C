import React from 'react'

export default class MenuItem extends React.Component{

    constructor(){
      super()
      this.state = {
        visible: false
      }
    }
    
    render(){
      return(
        <li className="menu-item">
          <a href={this.props.href}>{this.props.text}</a>
        </li>
      )
    }
}
