import React from 'react'
import { moment } from 'meteor/momentjs:moment'
import BigCalendar from 'react-big-calendar'
import Radium , {Style} from 'radium'
import cssVars from '/imports/ui/cssVars'
import {FastIcon} from '/imports/ui/components/CustomSvg'

import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.updateLocale('en', {
  week : {
    dow : 1
  }
});


BigCalendar.momentLocalizer(moment)

class DayDate extends React.Component{
  render () {
    const date = moment(this.props.date)
    return (
      <div style={styles.dayDate}>
        <div style={styles.dow}>{date.format('dddd')}</div>
        <div style={styles.dom}>{date.format('DD')}</div>
      </div>
    )
  }
}

class Toolbar extends React.Component{

  handleNavigation = (action) => {
    this.props.onNavigate(action)
  }

  render () {
    return (
      <div className="container-calendar-toolbar" style={styles.toolbarWrapper}>
        <FastIcon style={styles.navIcon} type="arrow-left" onClick={() => this.handleNavigation('PREV')} />
        <FastIcon style={styles.navIcon} type="arrow-right" onClick={() => this.handleNavigation('NEXT')} />
      </div>
    )
  }
}

class EventWrapper extends React.Component{
  render () {

    const {children} = this.props
    //children.props.style.width = '100%'
    return children
  }
}


@Radium
export default class Calendar extends React.Component{

  render(){
    const min = moment().startOf('day').toDate()
    const max = moment().endOf('day').toDate()
    const components = {
      eventWrapper : EventWrapper,
      toolbar : Toolbar,
      week : {
        header : DayDate,
      }
    }



    return (
      <div id={this.props.id}>
        <BigCalendar ref="calendar" views={['week']} defaultView="week" defaultDate={new Date()} {...this.props} {...{min,max,components}}  />
        <Style scopeSelector=".rbc-calendar" rules={{
          position : 'relative',
          marginTop: '30px',
          '.rbc-time-header .rbc-row:first-child' : {
            border : 0
          },
          '.rbc-time-header .rbc-row:last-child' : {
            display : 'none'
          },
          '.rbc-time-view' : {
            border : 0
          },
          '.rbc-event-label' : {
            display : 'none'
          },
          '.rbc-current-time-indicator' : {
            backgroundColor : cssVars.sndBrandColor,
          },
          '.rbc-current-time-indicator::before' : {
              backgroundColor : cssVars.sndBrandColor,
          },
          '.rbc-time-content' : {
            borderTop: `1px solid ${cssVars.midGrey}`
          },
          '.rbc-today' : {
            backgroundColor : cssVars.lightGrey
          },
          '.rbc-header.rbc-today' : {
            background : 0
          },
          '.rbc-event' : {
            backgroundColor : cssVars.brandColor,
            border : `1px solid ${cssVars.midGrey}`,
            borderRadius : 0,
            zIndex: '0',
            textAlign: 'left',
          },
          '.rbc-time-header.rbc-overflowing' : {
              borderRight: 0
          },
          '.rbc-time-content > * + * > * ' : {
            borderLeft : `1px solid ${cssVars.midGrey}`
          },
          '.rbc-header-gutter, .rbc-time-column' : {
            width : '12.5%!important',
            textAlign : 'center'
          },
          '.rbc-time-gutter .rbc-timeslot-group' : {
            borderLeft : 0,
            paddingTop : '10px'
          },
          '.rbc-day-slot .rbc-time-slot' : {
            borderTop : 0,
          },
          '.rbc-timeslot-group' : {
            minHeight : '50px',
            borderBottom : `1px solid ${cssVars.midGrey}`
          },
        }} />
      </div>)
  }
}

const styles = {
  dayDate : {
    fontWeight : 300,
    textAlign : 'left',
    color : cssVars.dartGrey,
    padding: '0 0 5px 10px',
  },

  dow : {
    fontSize : '13px',
  },
  dom : {
    fontSize : '32px',
    lineHeight: '31px'
  },
  toolbarWrapper : {
    display : 'flex',
    position : 'absolute',
    left : '4.25%',
    right : 0,
    top: '10px',
    justifyContent : 'space-between'
  },
  navIcon : {
    height : '30px',
    width : '30px',
    fill : cssVars.brandColor,
  }
}