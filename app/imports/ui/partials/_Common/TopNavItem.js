import React from 'react'
import Radium from 'radium'

@Radium
export default class TopNavItem extends React.Component{
  
  render(){

    let style = {
      topNavItem : {
        marginLeft : "25px",
        paddingBottom: "30px",
        fontSize: "16px",
        fontWeight: 100
      },
      a : {
        letterSpacing: "0.1em",
        color : "#FFF",
        ':hover': {
          textDecoration: 'none'
        }
      }
    }
    if(this.props.active){
      style.topNavItem.borderBottom = "3px solid #FFF";
      style.topNavItem.fontWeight = "300";
    }

    return(

      <div className="topNavItem" style={style.topNavItem}>
          <a href={this.props.href} style={style.a}>{this.props.children}</a>
      </div>
    )
  }
}
