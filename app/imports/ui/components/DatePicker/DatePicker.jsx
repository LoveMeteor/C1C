import React from 'react'
import PropTypes from 'prop-types'
import Radium, { Style } from 'radium'
import onClickOutside from 'react-onclickoutside'
import moment from 'moment'

import { DayPickerRangeController } from 'react-dates';
import { START_DATE, END_DATE } from 'react-dates/constants';
import 'react-dates/lib/css/_datepicker.css';

import { Selector, BoolButton } from '../index.js'

import { FastIcon } from '../CustomSvg'

import cssVars from '../../cssVars'

const styles = {
  datePickerContainer: {
    borderTop: `3px solid ${cssVars.brandColor}`,
    borderLeft: `1px solid ${cssVars.midGrey}`,
    borderRight: `1px solid ${cssVars.midGrey}`,
    borderBottom: `1px solid ${cssVars.midGrey}`,
    flex: 1,
    background: cssVars.bgGrey,
    width: '320px',
    position: 'absolute',
  },
  selectorWrapper: {
    paddingLeft: '23px',
    paddingRight: '23px',
    paddingTop: '20px',
    borderBottom: `1px solid ${cssVars.midGrey}`,
  },
}

const dateRangeSelector = [
  { _id: 1, name: 'All the time', startDate: moment().set({ year: 2017, month: 3 }), endDate: moment().add(1, 'year') },
  { _id: 2, name: 'Last Year', startDate: moment().subtract(1, 'year').startOf('year'), endDate: moment().startOf('year') },
  { _id: 3, name: 'This Year', startDate: moment().startOf('year'), endDate: moment() },
  { _id: 4, name: 'Last Week', startDate: moment().subtract(1, 'week').startOf('week'), endDate: moment().subtract(1, 'week').endOf('week') },
  { _id: 5, name: 'This Week', startDate: moment().startOf('week'), endDate: moment() },
  { _id: 6, name: 'Last 14 Days', startDate: moment().subtract(2, 'week'), endDate: moment() },
  { _id: 7, name: 'Last Month', startDate: moment().subtract(1, 'month'), endDate: moment() },
  { _id: 8, name: 'Custom', startDate: moment(), endDate: moment().add(1, 'day') },
]

@onClickOutside
@Radium
export default class DatePicker extends React.Component {


  static propTypes = {
    onChange: PropTypes.func.isRequired,
  }

  constructor() {
    super()

    this.state = {
      startDate: moment(),
      endDate: moment().add(1, 'days'),
      focusedInput: START_DATE,
      open: false,
      currentSelect: 8,
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (moment.isMoment(nextState.startDate) && moment.isMoment(nextState.endDate)) {
      console.log(nextState.startDate.isSame(this.state.startDate))
      if (!nextState.startDate.isSame(this.state.startDate) || !nextState.endDate.isSame(this.state.endDate)) {
        console.log('trigger change')
        this.props.onChange({ startDate: nextState.startDate, endDate: nextState.endDate })
      }
    }
  }


  onClick = () => {
    this.setState({ open: !this.state.open })
  }

  onSelect = (value) => {
    const { startDate, endDate } = dateRangeSelector.find(({ _id }) => _id === value)
    this.setState({ startDate, endDate, currentSelect: value })
  }

  onDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate, focusedInput: this.state.focusedInput === START_DATE ? END_DATE : START_DATE });
  }

  onFocusChange = (focusedInput) => {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput ? START_DATE : focusedInput,
    });
  }

  handleClickOutside = () => {
    this.setState({ open: false });
  }


  render() {
    return (
      <div>
        <BoolButton active={this.state.open} icon="cal" onClick={this.onClick} />
        {this.state.open &&
        <div>
          <div style={styles.datePickerContainer}>
            <div style={styles.selectorWrapper}>
              <Selector hideReset selected={this.state.currentSelect} placeholder="Select Time Range" data={dateRangeSelector} onChange={this.onSelect} />
            </div>

            <DayPickerRangeController
              hideKeyboardShortcutsPanel
              startDate={this.state.startDate} // momentPropTypes.momentObj or null,
              endDate={this.state.endDate} // momentPropTypes.momentObj or null,
              onDatesChange={this.onDatesChange} // PropTypes.func.isRequired,
              initialVisibleMonth={() => moment()}
              focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={focusedInput => this.setState({ focusedInput })}
            />
          </div>
          <Style
            scopeSelector=".DayPicker"
            rules={{
              'box-shadow': 'none',
              background: cssVars.bgGrey,
              '.CalendarMonthGrid': {
                background: cssVars.bgGrey,
              },
              '.CalendarDay--selected-start, .CalendarDay--selected-end': {
                background: cssVars.brandColor,
                border: `1px double ${cssVars.brandColor}`,
              },
              '.CalendarDay--selected-span': {
                background: cssVars.brandColor,
                border: `1px double ${cssVars.brandColor}`,
              },
              '.CalendarDay--hovered-span': {
                background: cssVars.fadedBrandColor,
                color: cssVars.brandColor,
                border: `1px double ${cssVars.brandColor}`,
              },
              '.CalendarDay--after-hovered-start': {
                background: cssVars.fadedBrandColor,
                color: cssVars.brandColor,
                border: `1px double ${cssVars.brandColor}`,
              },
              '.DayPicker__week-header': {
                textTransform: 'uppercase',
              },
            }}
          />
        </div>
        }


      </div>
    )
  }


}
