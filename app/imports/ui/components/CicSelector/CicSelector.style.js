import cssVars from '../../cssVars'

export const BsStyle = {
  DEFAULT: 'default',
  ORANGE: 'orange',
}
export const BsSize = {
  DEFAULT: 'default',
  LARGE: 'large',
}
export default function getStyles(bsStyle, bsSize = null) {
  let style = {
    current: {
      color: cssVars.sndBrandColor,
      marginLeft: '20px',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    icon: {
      marginLeft: '5px',
      width: '25px',
      fill: cssVars.sndBrandColor,
    },
    select: {
      position: 'absolute',
      background: '#FFF',
      border: `1px solid ${cssVars.lightGrey}`,
      cursor: 'pointer',
      marginLeft: '5px',

    },
    option: {
      padding: '10px 15px',
    },
  }

  if (bsStyle === BsStyle.ORANGE) {
    style = Object.assign(style, {
      icon: Object.assign(style.icon, {
        fill: '#FFF',
      }),
      current: Object.assign(style.current, {
        color: '#FFF',
      }),
        select: Object.assign(style.select, {
            background: '#ff5600',
            color: '#FFF'
        })
    })
  }

  if (bsSize === BsSize.LARGE) {

  }
  return style
}
