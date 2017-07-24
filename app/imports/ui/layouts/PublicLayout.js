import React from 'react'
import Radium, { Style } from 'radium'
import { FastSVG } from '/imports/ui/components/CustomSvg'

const PublicLayout = ({ content }) => (
  <div style={styles.container}>
    {content()}
    <Style rules={{
      body: {
        overflow: 'hidden',
        background: 'url(/images/login-bg.jpg) center top',
        backgroundSize: 'cover',
      },
    }}
    />
    <div style={styles.bottom}>
      <FastSVG style={styles.logo} src="/images/logo-white.svg" />
    </div>
  </div>

)

export default Radium(PublicLayout)

const styles = {
  container: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'top',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '10%',
  },
  bottom: {
    zIndex: '-1',
    width: '100%',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right bottom',
    backgroundImage: 'url(/images/public-bg.svg)',
    backgroundSize: 'contain',
    height: '30%',
    marginLeft: '1px',
    bottom: 0,
  },
  logo: {
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    height: '45px',
    width: '45px',
  },
}
