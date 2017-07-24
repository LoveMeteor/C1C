import React from 'react'
import Radium from 'radium'
import cssVars from '/imports/ui/cssVars'

@Radium
export default class CollapsableItem extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      visible : props.visible,
      clickable : props.clickable
    }
  }

  shouldComponentUpdate(nextProps){
    if(nextProps !== this.props){
      return true
    }
    return false
  }

  componentWillReceiveProps(nextProps){
    if(nextProps !== this.props) {
      this.setState({
          visible: nextProps.visible,
          clickable: nextProps.clickable
      })
    }
  }

  static defaultProps = {
    visible: false
  }

  handleClick(){
    if(this.props.clickable && !this.props.visible && this.props.onClick) {
      this.props.onClick()
    }
  }

  render(){
    const styles = {
      wrapper: {
        paddingBottom : '20px',
        paddingTop : '20px',
        active : {
          backgroundColor: cssVars.lightGrey,
          paddingLeft: cssVars.bodySpacing,
          paddingRight: cssVars.bodySpacing,
        },
        inactive : {
          marginLeft: cssVars.bodySpacing,
          marginRight: cssVars.bodySpacing,
          borderBottom: `1px solid ${cssVars.lightGrey}`
        },
        clickable : {
            cursor : 'pointer'
        }
      },
      pos : {
        marginRight : '10px',
        display: 'inline-block'
      },
      title: {
        color: cssVars.brandColor,
        fontSize : '20px',
        active : {
          color : '#000'
        }
      },
      content : {
        padding : '20px 0'
      },
      contextData : {
        marginLeft : '10px',
        display : 'inline-block',
        fontSize : '0.75em',
        color : cssVars.grey
      }
    }

    return(
      <div id={this.props.id}  style={[styles.wrapper,this.state.visible?styles.wrapper['active']:styles.wrapper['inactive'],this.state.clickable&&!this.state.visible&&{cursor:'pointer'}]}>
          <div style={[styles.title,styles.title[this.state.active]]} onClick={() => this.handleClick()}><strong style={styles.pos}>{this.props.pos}</strong>{this.props.title}{!this.props.visible && <span style={styles.contextData}>{this.props.contextData}</span>}</div>
          { this.props.visible &&
            <div style={styles.content}>{this.props.children}</div> }
      </div>
    )
  }
}


@Radium
export  class ReviewItem extends React.Component{
  render(){
    const styles = {
      wrapper : {
        borderBottom: "1px solid #FFF",
        display: "flex",
        marginBottom: '30px',
        paddingBottom: '15px'
      },
      leftArea : {
        width: "160px",
        flex: 'none'
      },
      rightArea : {

      },
      title : {
        fontWeight: "400"
      },
      edit : {
        display:"block",
        cursor: "pointer",
        color:cssVars.brandColor,
        textDecoration:"underline"
      }
    }
    return (
      <div id={this.props.id} className={this.props.className} style={styles.wrapper}>
        <div  style={styles.leftArea}>
          <span style={styles.title}>{this.props.title}</span>
          <span style={styles.edit} onClick={this.props.onClick}>Edit</span>
        </div>
        <div  style={[styles.rightArea,this.props.styleRightArea]}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
