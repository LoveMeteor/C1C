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
    selectorWrapper: {
      border: '1px solid #e2e2e2',
      background: '#FFF',
      position: 'relative',
      padding: '10px',
      cursor: 'pointer',
      marginBottom: '10px',
      flex: '1',
    },
    top: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    },
    topWrapper: {
      display: 'flex',
      flex: 1,
    },
    selected: {
      display: 'block',
      width: '100%',
      unselected: {
        color: '#b0b0b0',
      },
    },
    selector: {
      position: 'absolute',
      zIndex: 10,
      background: '#FFF',
      border: '1px solid #f2f2f2',
      left: 0,
      right: 0,
      marginTop: '11px',
      padding: '0 0 20px 0',
      maxHeight: '350px',
      overflow: 'auto',
    },
    option: {
      listStyle: 'none',
      paddingTop: '10px',
      paddingLeft: '10px',
      selected: {
        fontWeight: 'bold',
      },
    },
    optionHover: {
      color: cssVars.brandColor,
    },
    category: {
      listStyle: 'none',
      paddingTop: '10px',
      paddingLeft: '10px',
    },
    arrow: {
      fill: cssVars.brandColor,
      width: '20px',
      height: '20px',
    },
  }

  if (bsStyle === BsStyle.ORANGE) {
    style = Object.assign(style, {
      selectorWrapper: Object.assign(style.selectorWrapper, {
        border: 'none',
        background: 'none',
        marginBottom: 0,
        padding: 0,
        color: '#FFF',
      }),
      selector: Object.assign(style.selector, {
        border: '1px solid #ff5600',
        background: '#ff5600',
      }),
      arrow: Object.assign(style.arrow, {
        fill: '#FFF',
      }),
      option: Object.assign(style.option, {
        paddingBottom: 10,
        paddingRight: 10,
        borderBottom: '0.5px solid rgba(255,255,255,0.2)',
      }),
      optionHover: {
        background: '#ef5202',
      },
      category: Object.assign(style.category, {
        paddingBottom: 10,
        paddingRight: 10,
        borderBottom: '0.5px solid rgba(255,255,255,0.2)',
      }),
    })
  }

  if (bsSize === BsSize.LARGE) {
    style = Object.assign(style, {
      selected: Object.assign(style.selected, {
        fontSize: 18,
      }),
    })
  }
  return style
}
