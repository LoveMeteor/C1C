import React from 'react'
import PropTypes from 'prop-types'
import { FastIcon } from '../CustomSvg'
import Radium from 'radium'
import cssVars from '../../cssVars'

const styles = {
  container: {
    border: `1px solid ${cssVars.midGrey}`,
    background: '#FFF',
    display: 'flex',
    marginBottom: '10px',
    marginRight: '20px',
    padding: '0 10px',
  },
  containerActive: {
    border: `1px solid ${cssVars.brandColor}`,
  },
  icon: {
    fill: '#000',
    width: '30px',
    height: '30px',
    marginTop: '5px',
    marginBottom: '5px',
  },
  iconActive: {
    fill: cssVars.brandColor,
  },
}

const BoolButton = (props) => {
  const iconStyle = props.active ? { ...styles.icon, ...styles.iconActive } : styles.icon

  return (
    <button onClick={props.onClick} style={[styles.container, props.active && styles.containerActive]}>
      <FastIcon style={iconStyle} type={props.icon} />
    </button>
  )
}

BoolButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
}

export default Radium(BoolButton)
