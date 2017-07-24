import React from 'react'

export default class ButtonIcon extends React.Component {
  constructor(){
    super()
  }

  render(){
    return(
      <a style={this.props.style} href={this.props.href} onClick={this.props.onClick}><i className={this.props.classIcon}/></a>
    )
  }
}
