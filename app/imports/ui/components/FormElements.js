import React from 'react';
import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import itemType from '/imports/ui/itemType'
import Radium, { Style } from 'radium'
import onClickOutside from 'react-onclickoutside'
import MaskedInput from 'react-maskedinput'
import moment from 'moment'

@Radium
export class SimpleInput extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  static defaultProps = {
    onChange: () => {},
    disabled: false,
  }

  componentWillMount() {
    if (this.props.defaultValue) {
      this.setState({ value: this.props.defaultValue });
      this.props.onChange(this.props.defaultValue)
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.defaultValue !== nextProps.defaultValue) {
      this.setState({ value: nextProps.defaultValue });
    }
  }

  value : undefined

  handleChange = (event) => {
    this.props.onChange(event.target.value)
    this.value = event.target.value
    this.setState({ value: event.target.value })
  }

  render() {
    const isDisabled = this.props.disabled ? 'disabled' : 'enabled'
    const inputType = !this.props.password ? 'text' : 'password'
    const { password, defaultValue, error, inputRef, ...inputData } = this.props;
    return (
      <div style={[styles.inputWrapper, this.props.style, styles[isDisabled], error && styles.error]}>
        <input ref={inputRef} {...inputData} value={this.state.value} style={[styles.input, styles.input[isDisabled]]} onChange={this.handleChange} type={inputType} />
      </div>
    )
  }
}

@Radium
export class SearchInput extends SimpleInput {

  handleKeypress = (event) => {
    if (event.key == 'Enter') {
      event.target.blur()
    }
  }

  render() {
    const isDisabled = this.props.disabled ? 'disabled' : 'enabled'
    const { password, ...inputData } = this.props
    return (
      <div style={[styles.inputWrapper, this.props.style, styles[isDisabled]]}>
        <input {...inputData} style={[styles.input, styles.input[isDisabled]]} onKeyPress={this.handleKeypress} onChange={this.handleChange} type="search" />
        <div id="ButtonSearch"><FastIcon type="search_simple" style={styles.searchIcon} /></div>
      </div>
    )
  }
}


@Radium
export class TimeInput extends SimpleInput {
  render() {
    const isDisabled = this.props.disabled ? 'disabled' : 'enabled'
    const mask = '61:61'
    const value = this.props.value ? moment(this.props.value * 1000).format('mmss') : ''
    const formatCharacters = {
      6: {
        validate(number) { return number <= 6 },
      },
    }
    // Little hack to use , we replace the defaultStyle if there is a custom one
    const style = this.props.styleInput || styles.timeInput

    const inputData = { ...this.props, formatCharacters, mask, value, style }
    return (
      <div className="time-input" style={[styles.inputMini, this.props.style, styles[isDisabled]]}>
        <MaskedInput {...inputData} onChange={this.handleChange} />
      </div>
    )
  }
}

@Radium
export class TagInput extends SearchInput {

  constructor() {
    super()
    this.state = {
      open: false,
      tags: [],
    }
  }

  handleChange = (event) => {
    const val = event.target.value.trim()
    const tags = this.getTags(val)
    if (tags.length && val !== '') {
      this.setState({ open: true, tags })
    } else {
      this.setState({ open: false, tags })
    }
  }

  reset() {
    this.setState({ open: false, tags: [] })
    this.refs.tagInput.value = ''
  }

  handleKey = (event) => {
    if (event.key === ',' || event.key === 'Enter') {
      event.stopPropagation()
      const name = event.target.value.trim().replace(',', '')
      this.props.onChange({ name })
      this.reset()
    }
  }

  getTags(value) {
    return this.props.tags(value)
  }

  onSelect(tag) {
    const { _id, name } = tag
    this.props.onChange({ _id, name })
    this.reset()
  }

  render() {
    const { tags, style, ...inputData } = this.props
    delete inputData.password
    return (
      <div style={[styles.selectorWrapper, style]} id={this.props.id}>
        <div style={{ display: 'flex' }}>
          <input ref="tagInput" placeholder={this.props.placeholder} style={[styles.input, styles.inputTag]} onKeyDown={this.handleKey} onChange={this.handleChange} type="search" />
          <div id="ButtonSearch"><FastIcon type="search_simple" style={styles.searchIcon} /></div>
        </div>
        {this.state.open &&
          <ul style={styles.selector}>
            {this.state.tags.map(tag => <li data-id={tag._id} style={[styles.tag]} onClick={() => this.onSelect(tag)} key={tag._id}>{tag.name}</li>)}
          </ul>}
      </div>
    )
  }
}

const styles = {
  inputMini: {
    border: `1px solid ${cssVars.midGrey}`,
    background: '#FFF',
    display: 'flex',
    marginLeft: '10px',

  },
  inputWrapper: {
    border: `1px solid ${cssVars.midGrey}`,
    background: '#FFF',
    display: 'flex',
    marginBottom: '10px',
  },
  timeInput: {
    border: '0',
    fontSize: '13px',
    width: '45px',
    textAlign: 'right',
  },
  input: {
    border: '0',
    width: '100%',
    padding: '11px 10px',
    fontSize: '16px',
    fontWeight: 300,
    background: 'transparent',
    disabled: {
      cursor: 'not-allowed',
      background: cssVars.lightGrey,
    },
  },
  inputTag: {
    padding: '10px 10px 11px',
  },
  searchIcon: {
    width: '20px',
    height: '20px',
    marginTop: '10px',
    marginRight: '10px',
  },
  disabled: {
    opacity: '0.8',
    background: cssVars.lightGrey,
  },
  selectorWrapper: {
    border: `1px solid ${cssVars.midGrey}`,
    background: '#FFF',
    position: 'relative',
    cursor: 'pointer',
    marginBottom: '10px',
    flex: '1',
  },
  selector: {
    position: 'absolute',
    zIndex: 10,
    background: '#FFF',
    border: `1px solid ${cssVars.midGrey}`,
    left: 0,
    right: 0,
    marginTop: '1px',
    padding: '0 0 20px 0',
  },
  tag: {
    listStyle: 'none',
    marginTop: '10px',
    marginLeft: '10px',
    ':hover': {
      color: cssVars.brandColor,
    },
  },
  error: {
    border: '1px solid red',
  },
}


@Radium
export class Label extends React.Component {
  render() {
    const styles = {
      label: {
        marginBottom: '10px',
      },
    }
    return (
      <div style={[styles.label, this.props.style]}>
        {this.props.children}
      </div>
    )
  }
}


@onClickOutside
@Radium
export class Selector extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    }
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }

  static propTypes = {
    data: React.PropTypes.array.isRequired,
    multiple: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onReset: React.PropTypes.func,
  }

  static defaultProps = {
    multiple: false,
    selected: [],
    onChange: () => {},
    onReset: () => {},
  }

  toggleSelector = () => {
    this.setState({ open: !this.state.open })
  }

  handleClickOutside() {
    this.setState({ open: false });
  }

  reset = () => {
    this.setState({ open: false })
    this.props.onChange(this.props.multiple ? [] : '')
  }

  onSelect = (code) => {
    this.setState({ open: false })
    if (this.props.multiple) {
      const lastSelectState = new Set(this.props.selected)
      if (lastSelectState.has(code)) {
        lastSelectState.delete(code);
      } else {
        lastSelectState.add(code);
      }
      this.props.onChange([...lastSelectState])
    } else {
      this.props.onChange(code)
    }
  }

  selectedOptions(selected) {
    if (this.props.data.length > 0 && selected.length) {
      if (Array.isArray(selected)) {
        const sel = selected.map((item) => {
          const selectedItem = this.props.data.find(option => option._id === item)
          return selectedItem && selectedItem.name ? selectedItem.name : ''
        }).join(', ')
        return sel
      }

      const data = this.props.data.find(option => option._id === selected)
      return data ? data.name : ''
    }
  }

  render() {
    const styles = {
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
        marginTop: '10px',
        marginLeft: '10px',
        selected: {
          fontWeight: 'bold',
        },
      },
      arrow: {
        fill: cssVars.brandColor,
        width: '20px',
        height: '20px',
      },
    }


    const { placeholder, data, selected } = this.props;

    const tempSelected = (!selected && selected == '') ? [] : (Array.isArray(selected) ? selected : [selected])

    const selectedName = tempSelected.length ? this.selectedOptions(tempSelected) : placeholder;
    const status = tempSelected.length ? 'selected' : 'unselected';
    return (
      <div id={this.props.id} className={this.props.className} style={[styles.selectorWrapper, this.props.style]} onClick={this.toggleSelector}>
        <div style={styles.top}>
          <span className="display-selected-names" style={[styles.selected, styles.selected[status]]}>{selectedName}</span>
          <FastIcon style={styles.arrow} type="arrow-down" />
        </div>
        {this.state.open &&
        <ul style={styles.selector}>
          {tempSelected != '' && <li className="option" style={styles.option} onClick={this.reset}>Reset</li>}
          {data.map((option) => {
            const selectedItem = tempSelected.find(item => option._id === item) ? 'selected' : '';
            return (<li className="option" data-id={option._id} style={[styles.option, styles.option[selectedItem]]} onClick={() => this.onSelect(option._id)} key={option._id}>{option.name}</li>)
          })}
          <Style rules={{
            '.option:hover': {
              color: cssVars.brandColor,
            },
          }}
          />
        </ul>
        }
      </div>
    )
  }
}


@Radium
export class Button extends React.Component {

  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
  }

  displayName: 'Button'

  static propTypes = {
    classIcon: React.PropTypes.string,
    kind: React.PropTypes.oneOf(['default', 'warning', 'danger', 'faded']),
    icon: React.PropTypes.oneOf(['add', 'continue', 'return', 'delete']),
    disabled: React.PropTypes.bool,
  }

  static defaultProps = {
    icon: 'continue',
    kind: 'default',
    disabled: false,
  }

  icons = {
    add: 'add-simple',
    continue: 'arrow-right',
    return: 'arrow-left',
    delete: 'close',
  }

  styles = {
    base: {
      display: 'inline-flex',
      padding: '10px 10px 10px 15px',
      cursor: 'pointer',
      svg: {
        width: '20px',
        height: '20px',
      },
      ':hover': {
        textDecoration: 'none',
      },
    },
    content: {
      marginRight: 'auto',
      paddingRight: '20px',
    },
    default: {
      color: cssVars.brandColor,
      border: `1px solid ${cssVars.brandColor}`,
      svg: {
        fill: cssVars.brandColor,
      },
    },
    warning: {
      background: cssVars.FadedbrandColor,
      color: cssVars.brandColor,
      border: `1px solid ${cssVars.FadedbrandColor}`,
      svg: {
        fill: cssVars.brandColor,
      },
    },
    faded: {
      background: cssVars.fadedBrandColor,
      color: cssVars.brandColor,
      border: `1px solid ${cssVars.fadedBrandColor}`,
      svg: {
        fill: cssVars.brandColor,
      },
    },
    danger: {
      color: '#FFF',
      background: cssVars.brandColor,
      border: `1px solid ${cssVars.brandColor}`,
      svg: {
        fill: '#FFF',
      },
    },
    disabled: {
      opacity: '0.5',
    },

  }

  handleClick() {
    if (!this.props.disabled) {
      this.props.onClick()
    }
  }

  render() {
    // Cannot use radium with SVG , has to be done manually , we support only the fill color
    const svgStyles = this.styles.base.svg;
    svgStyles.fill = this.styles[this.props.kind].svg.fill;
    const isDisabled = this.props.disabled ? 'disabled' : 'enabled'
    const classNames = `${this.props.className} ${isDisabled}`
    return (
      <a className={classNames} style={[this.styles.base, this.styles[this.props.kind], this.props.style, this.styles[isDisabled]]} href={this.props.href} onClick={this.handleClick}>
        <div style={this.styles.content}>{this.props.children}</div><FastIcon style={svgStyles} type={this.icons[this.props.icon]} />
      </a>
    )
  }
}

@Radium
export class Radio extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: false,
    }
  }

  componentWillMount() {
    this.updateStatus(this.props.current, this.props.value)
  }

  updateStatus(current = '', value) {
    const isMultiple = typeof current !== 'string'
    const cleanCurrent = isMultiple ? current : [current]
    this.setState({ selected: !!cleanCurrent.find(item => value === item) })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.current !== nextProps.current) {
      this.updateStatus(nextProps.current, nextProps.value)
    }
  }

  handleClick = () => {
    if (!this.props.disabled) {
      this.props.onClick(this.props.value)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.selected == this.state.selected) {
      return false
    }
    return true
  }

  static propTypes = {
    size: React.PropTypes.string,
  }

  static defaultProps = {
    size: 'sm',
    selectedColor: cssVars.sndBrandColor,
  }
  render() {
    const { className, dataId, id, value, icon, size, selectedColor, disabled } = this.props

    // Svg are dynamically loaded and are not proper react components, so CSS changes need to be done here
    const iconStyle = this.state.selected ? { fill: selectedColor } : this.styles.icon
    return (
      <div id={id} data-id={dataId} className={className} style={[this.styles.wrapper, this.styles.wrapper[size], disabled && this.styles.wrapperDisabled]} onClick={this.handleClick}>
        { icon &&
          <span style={[this.styles.iconWrapper, this.styles.iconWrapper[size]]}>
            <FastIcon style={[iconStyle, disabled && this.styles.disabled]} type={icon} />
          </span>
        }
        { !icon &&
          <span style={this.styles.radio}>
            { this.state.selected && <span style={this.styles.selected} />}
          </span>
        }
        {this.props.children}
      </div>
    )
  }
  styles = {

    wrapper: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      cursor: 'pointer',
      xl: {
        fontSize: '0.8em',
        lineHeight: '1em',
        flexDirection: 'column',
        textAlign: 'center',
        marginRight: '10px',
      },
    },
    iconWrapper: {
      background: '#FFF',
      width: '25px',
      height: '25px',
      borderRadius: '12.5px',
      marginRight: '15px',
      xl: {
        background: 0,
        width: '40px',
        height: '50px',
        marginRight: '0',
        display: 'block',
      },
    },
    icon: {
      fill: cssVars.grey,
    },
    radio: {
      position: 'relative',
      border: `1px solid ${cssVars.grey}`,
      background: '#FFF',
      width: '25px',
      height: '25px',
      borderRadius: '12.5px',
      marginRight: '15px',
    },
    selected: {
      position: 'absolute',
      background: cssVars.sndBrandColor,
      top: '5px',
      left: '5px',
      width: '13px',
      height: '13px',
      borderRadius: '12.5px',
    },
    wrapperDisabled: {
      cursor: 'not-allowed',
    },
    disabled: {
      opacity: 0.5,
    },
  }
}

@Radium
export class Range extends React.Component {

  handleChange = (event) => {
    this.props.onChange(event.target.value)
  }

  render() {
    const styles = {
      slider: {
        width: '100%',
        WebkitAppearance: 'none',
        height: '8.4px',
        margin: '10px 0',
        background: cssVars.brandColor,
        borderRadius: '3px',
        cursor: 'pointer',

      },
      rangeLabels: {
        color: cssVars.brandColor,
        fontSize: '0.8em',
        display: 'flex',
      },
      maxLabel: {
        marginLeft: 'auto',
      },
    }

    const { value, min, max, style, minText, maxText } = this.props
    return (
      <div className="react-range" style={style}>
        <input type="range" style={styles.slider} onChange={this.handleChange} {...{ value, min, max }} />
        <div style={styles.rangeLabels}>
          <span>{minText}</span>
          <span style={styles.maxLabel}>{maxText}</span>
        </div>
        <Style
          scopeSelector=".react-range"
          rules={{
            'input::-webkit-slider-thumb': {
              height: '25px',
              width: '25px',
              borderRadius: '12px',
              background: cssVars.brandColor,
              cursor: 'pointer',
              WebkitAppearance: 'none',
              marginTop: '0px',
            },
          }}
        />
      </div>)
  }
}

@Radium
export class ErrorLine extends React.Component {

  render() {
    const styles = {
      error: {
        color: cssVars.sndBrandColor,
      },
    }
    return (<div style={styles.error}>{this.props.children}</div>)
  }
}

@Radium
export class InputInline extends React.Component {
  render() {
    const styles = {
      wrapper: {
        display: 'flex',
        alignItems: 'center',
        //marginRight : "-20px"
      },
      elememt: {
        marginRight: '20px',
        width: '100%',
      },
      button: {
        marginBottom: '10px',
        marginRight: '20px',
      },
      icon: {
        marginTop: '-10px',
        height: '42px',
        width: '42px',
        marginRight: '20px',
      },
    }

    // Overwrite some styles , easier here than directly on the form
    const childrenWithProps = React.Children.map(this.props.children, (child) => {
      if (child.type == FastIcon) {
        return React.cloneElement(child, {
          style: styles.icon,
        })
      }
      if (child.type == Button) {
        return React.cloneElement(child, {
          style: [styles.button, child.props.style],
        })
      }
      return React.cloneElement(child, {
        style: [styles.elememt, child.props.style],
      })
    });

    return (
      <div style={[styles.wrapper, this.props.style]}>{childrenWithProps}</div>
    )
  }

}
