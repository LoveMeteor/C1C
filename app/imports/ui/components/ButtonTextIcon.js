import React from 'react'

var defaultStyles = {
  backgroundColor: '#F36F21',
  color: '#FFF',
  height: '40px',
  width: '120px',
  padding: '10px',
  textDecoration: 'none'
}

export default class ButtonTextIcon extends React.Component {

  static propTypes = {
    style: React.PropTypes.object
  }

  static defaultProps = {
    style: defaultStyles
  }

  render(){
    let wrapperStyle= {
      display: 'flex',
      item: {
        margin: 'auto'
      }
    }
    return(
      <a className={this.props.className} style={{...this.props.style, ...wrapperStyle}} href={this.props.href} onClick={this.props.onClick}>
          <div style={wrapperStyle.item}>{this.props.text}</div>
          <div style={wrapperStyle.item}><i className={this.props.classIcon}/></div>
      </a>
    )
  }
}
