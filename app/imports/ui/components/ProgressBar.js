import React from 'react'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

@Radium
export default class ProgressBar extends React.Component {
  constructor(){
    super()
  }

  static defaultProps =  {
    percentage: 100,
    speed: .4
  }

  render(){

    const {currentTime,totalTime} = this.props

    const timeProgress = `${(100/Math.round(totalTime))*currentTime}%`

    return(
      <div id="media-playing-progress-bar" style={styles.wrapper}>
      	<div id="media-playing-played-bar" style={[styles.progressBar,{width:timeProgress}]}></div>
      </div>
    )
  }
}


const styles = {
  wrapper : {
    border: '1px solid ${cssVars.midGrey}',
    backgroundColor: cssVars.midGrey,
    height: '15px',
    width: '100%',
    marginBottom: '5px'
  },
  progressBar : {
    height: '15px',
    marginBottom: '5px',
    backgroundColor: cssVars.brandColor,
    width : '0%',
    transition: 'width 1s linear'
  }
}