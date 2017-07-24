import React from 'react';
import PropTypes from 'prop-types'
import Radium, { Style } from 'radium'
import onClickOutside from 'react-onclickoutside'

import cssVars from '../../cssVars'
import { FastIcon } from '../../components/CustomSvg'

import getStyles, { BsStyle, BsSize } from './Selector.style'

@onClickOutside
@Radium
export default class Selector extends React.Component {

  static propTypes = {
    data: PropTypes.array.isRequired,
    multiple: PropTypes.bool,
    selected: PropTypes.any,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onReset: PropTypes.func,
    bsStyle: PropTypes.oneOf(Object.values(BsStyle)),
    bsSize: PropTypes.oneOf(Object.values(BsSize)),
    style: PropTypes.object,
    hideReset: PropTypes.bool,
    notLimitHeight: PropTypes.bool
  }

  static defaultProps = {
    multiple: false,
    selected: [],
    onChange: () => {
    },
    onReset: () => {
    },
    hideReset: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    }
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.onSelect = this.onSelect.bind(this)
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

  dataArray = () => {
    const { data } = this.props
    if (data && data.length) {
      let items = []
      data.forEach((item) => {
        if (item.children && item.children.length) {
          items = items.concat(item.children)
        } else {
          items.push(item)
        }
      })
      return items
    }
  }
  selectedOptions(selected) {
    const dataArray = this.dataArray()
    if (dataArray.length > 0 && selected.length) {
      if (Array.isArray(selected)) {
        const sel = selected.map((item) => {
          const selectedItem = dataArray.find(option => option._id === item)
          return selectedItem && selectedItem.name ? selectedItem.name : ''
        }).join(', ')
        return sel
      }

      const data = dataArray.find(option => option._id === selected)
      return data ? data.name : ''
    }
  }

  render() {
    const { placeholder, data, selected, hideReset } = this.props;

    const tempSelected = (!selected && selected == '') ? [] : (Array.isArray(selected) ? selected : [selected])

    const selectedName = tempSelected.length ? this.selectedOptions(tempSelected) : placeholder;
    const status = tempSelected.length ? 'selected' : 'unselected';

    const styles = getStyles(this.props.bsStyle, this.props.bsSize)
    return (
      <div
        id={this.props.id}
        className={this.props.className}
        style={[styles.selectorWrapper, this.props.style]}
        onClick={this.toggleSelector}
      >
        <div style={styles.top}>
          <div style={styles.topWrapper}>
            <span
              className="display-selected-names"
              style={[styles.selected, styles.selected[status]]}
            >{selectedName}</span>
            <FastIcon style={styles.arrow} type="arrow-down" />
          </div>
        </div>
        {this.state.open &&
        <ul style={[styles.selector,this.props.notLimitHeight && {maxHeight:'none'}]}>
          {(!hideReset && tempSelected.length>0) && <li className="option" style={styles.option} onClick={this.reset}>Reset</li>}
          {data.map((option) => {
            if (option.children && option.children.length) {
              return (<ui key={`cat-${option._id}`}>
                <li
                  className="category"
                  data-id={option._id}
                  style={styles.category}
                  key={option._id}
                >{option.name}</li>
                {
                    option.children.map((opt) => {
                      const selectedItem = tempSelected.find(item => opt._id === item) ? 'selected' : '';
                      return (<li
                        className="option"
                        data-id={opt._id}
                        style={[styles.option, { paddingLeft: 15 }, styles.option[selectedItem]]}
                        onClick={() => this.onSelect(opt._id)}
                        key={opt._id}
                      >{opt.name}</li>)
                    })
                }
              </ui>)
            }
            const selectedItem = tempSelected.find(item => option._id === item) ? 'selected' : '';
            return (<li
              className="option"
              data-id={option._id}
              style={[styles.option, styles.option[selectedItem]]}
              onClick={() => this.onSelect(option._id)}
              key={option._id}
            >{option.name}</li>)
          })}
          <Style rules={{
            '.option:hover': styles.optionHover,
          }}
          />
        </ul>
                }
      </div>
    )
  }
}
