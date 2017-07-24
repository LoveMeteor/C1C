import React from 'react'
export default class ButtonImage extends React.Component {
  constructor(){
    super()
  }

  render(){
    return(
      <a href={this.props.href} className={this.props.className} onClick={this.props.onClick}><img width={this.props.width} height={this.props.height} src={this.props.icon}/></a>
    )
  }
}
