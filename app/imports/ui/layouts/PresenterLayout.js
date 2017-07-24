import React from 'react'

import Player from '/imports/ui/partials/Presenter/Player'

const PresenterLayout = ({ topNav, leftNav, content }) => (
  <div>
    <main id="main" style={styles.main}>
      {topNav()}
      <div style={styles.wrapper}>
        {leftNav()}
        {content()}
        <Player />
      </div>
    </main>
  </div>
)

var styles = {
  main: {
    overflow: 'hidden',
    height: '100%',
  },
  wrapper: {
    display: 'flex',
    height: 'calc( 100% - 66px )',
  },
}

export default PresenterLayout
