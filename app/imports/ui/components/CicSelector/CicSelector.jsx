import React from 'react'
import PropTypes from 'prop-types'
import Radium from 'radium'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import onClickOutside from 'react-onclickoutside'

import { subsManager } from '../../../startup/client/routes'

import cssVars from '/imports/ui/cssVars'
import { Cics } from '/imports/api/cics/cics';


import getStyles from './CicSelector.style'

@onClickOutside
@Radium
export default class CicSelector extends TrackerReact(React.Component) {
  static propTypes = {
    selected: PropTypes.string, // selected cic _id
    disabled: PropTypes.bool,
    hideIcon: PropTypes.bool,
    bsStyle: PropTypes.oneOf(['default', 'orange']),
    onChange: PropTypes.func,
  }

  constructor() {
    super()
    this.state = {
      open: false,
      subscription: {
        cics: subsManager.subscribe('cics'),
      },
    }
  }


    // Lists
  listCics() {
    return Cics.find({}).fetch();
  }

  handleClickOutside = () => {
    this.setState({ open: false });
  }

  handleClick = () => {
    if (!this.props.disabled) {
      this.setState({ open: !this.state.open });
    }
  }


  getCurrentCic() {
    const _id = this.props.selected

    if (!_id) return null

    return Cics.findOne(_id)
  }

  onSelectCic = (value) => {
    this.setState({ open: false });
    if (this.props.onChange) this.props.onChange(value)
  }

  render() {
    const cic = this.getCurrentCic()
    if (!cic) return <div />

    const { name } = cic
    const { selected, disabled, hideIcon } = this.props

    const styles = getStyles(this.props.bsStyle)
    return (
      <div>
        <div style={styles.current} onClick={this.handleClick}>
          <span>{name.toUpperCase()}</span>{!disabled && !hideIcon &&
            <FastIcon style={styles.icon} type="arrow-down" />}</div>
        {this.state.open && <div style={styles.select}>
            {this.listCics().map(cic => (
              <div
                style={[styles.option, cic._id === selected && styles.optionSelected]}
                onClick={() => this.onSelectCic(cic._id)}
                key={cic._id}
              >{cic.name.toUpperCase()}</div>
                    ))}</div>}
      </div>
    )
  }

}

