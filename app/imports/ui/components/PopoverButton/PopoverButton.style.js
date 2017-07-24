import React from 'react'
import { Style } from 'radium'

export default function getStyles() {
  return (<Style
    scopeSelector=".arrow-box"
    rules={{
      position: 'relative',
      background: '#d55737',
      ':after': {
        bottom: '100%',
        left: '50%',
        border: 'solid transparent',
        content: ' ',
        height: 0,
        width: 0,
        position: 'absolute',
        'pointer-events': 'none',
        'border-color': 'rgba(213, 87, 55, 0)',
        'border-bottom-color': '#d55737',
        'border-width': '6px',
        'margin-left': '-6px',
      },
    }}
  />)
}
