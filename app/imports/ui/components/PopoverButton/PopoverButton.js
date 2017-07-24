import React from 'react'
import PropTypes from 'prop-types'
import Radium from 'radium'
import classNames from 'classnames'
import onClickOutside from 'react-onclickoutside'
import './PopoverButton.css'

@onClickOutside
@Radium
export default class PopoverButton extends React.Component {
  static propTypes = {
    trigger: PropTypes.element.isRequired,
    pullRight: PropTypes.bool,
    popoverStyle: PropTypes.object,
  }
  static defaultProps = {
    pullRight: false,
    popoverStyle: {},
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      showPopover: false,
    }
  }
  handleClickOutside = () => {
      this.setState({showPopover:false})
  }
  togglePopover = () => {
    const { showPopover } = this.state
    this.setState({ showPopover: !showPopover })
  }
  render() {
    const { showPopover } = this.state
    const { children, pullRight, popoverStyle, trigger } = this.props
    const listCls = classNames({
      list: true,
      right: pullRight,
    })
    return (
      <div className="popover-button" onClick={this.togglePopover}>
        <div className="trigger">{trigger}</div>
        {showPopover && children && <div style={{ top: 10, position: 'relative' }}><div className="arrow" /><div className={listCls} style={popoverStyle}>{children}</div></div>}
      </div>
    );
  }
}
