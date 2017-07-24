import React from 'react'
import Radium from 'radium'

import cssVars from '/imports/ui/cssVars'

@Radium
export default class Page404 extends React.Component{

  render(){
    return (
    <div>
      <div style={styles.h1}><b style={styles.error}>404</b> Page Not Found</div>
      <p style={styles.lines}>The page you are looking for could not be found.</p>
    </div>)
  }
}

const styles = {
  h1 : {
    fontSize : '48px',
    color: '#FFF',
    marginBottom: '30px'
  },
  error : {
    color: cssVars.brandColor
  },
  lines : {
    color: '#FFF',
    fontSize: '32px'
  }
}