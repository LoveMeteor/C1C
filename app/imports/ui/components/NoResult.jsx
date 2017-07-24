import React from 'react'


export default class NoResult extends React.Component {
  render(){
    return(
      <div style={styles.wrapper}>No results found</div>
    )
  }
}

const styles = {
  wrapper : {
    marginTop : '20px'
  }
}