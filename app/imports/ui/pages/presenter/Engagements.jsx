import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { SubsCache } from 'meteor/ccorcos:subs-cache'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import { moment } from 'meteor/momentjs:moment'

import { subsManager } from '../../../startup/client/routes'

import { ListView } from '/imports/ui/partials/Presenter/ContainerView'
import PlaylistItem from '/imports/ui/components/PlaylistItem'

import { runEngagementPlaylist } from '../../../api/playerstatus/methods'
import cssVars from '/imports/ui/cssVars'
import { Engagements } from '/imports/api/engagements/engagements'
import { PopoverButton, CircleButton } from '../../components'

const formatTime = time => moment(time).format('hh:mm')


const EngagementsSub = new SubsCache(10, 5);

class EngagementItem extends PlaylistItem {
  renderIcon() {
    const { startTime, endTime } = this.props
    return <div style={styles.time}>{formatTime(startTime)} - {formatTime(endTime)} </div>
  }
}

export default class EngagementsPage extends TrackerReact(React.Component) {
  constructor() {
    super()
    this.state = {
      subHandler: null,
      subscriptions: {
        downloadstatus: subsManager.subscribe('downloadstatus'),
        medias: subsManager.subscribe('medias'),
      },
    }
  }
  componentWillReceiveProps() {
    EngagementsSub.clear()
    this.state.subHandler.stopNow()
  }

  componentWillUnmount() {
    EngagementsSub.clear()
    this.state.subHandler.stopNow()
  }
  listEngagements() {
    let data = []

    const { presentationMachineId } = FlowRouter.current().params
    this.state.subHandler = EngagementsSub.subscribeFor(10, 'presentationAndEngagements', { presentationMachineId });
    if (this.state.subHandler.ready()) {
      const date = moment()
      data = Engagements.find(
        {
          startTime: {
            $gte: date.startOf('day').toDate(),
            $lt: date.endOf('day').toDate(),
          },
        }, { startTime: 1 }).fetch()
    }
    return data
  }

  runEngagementOnPresentationMachine = (engagement, presentationMachineId = null) => {
    let pmIds
    if (!presentationMachineId) {
      pmIds = engagement.presentationMachines().map(pm => pm._id)
    } else {
      pmIds = [presentationMachineId]
    }
    pmIds.forEach((pmId) => {
      runEngagementPlaylist.call({
        presentationMachineId: pmId,
        engagementId: engagement._id,
      })
    })
  }
  renderAction(engagement) {
    const pms = engagement.presentationMachines()
    return (
      <div style={styles.actionWrapper}>
        <PopoverButton trigger={<CircleButton title={pms.length} />} pullRight popoverStyle={{ width: 250 }}>
          {
                    pms.map(pm => (
                      <div key={`pm-${pm._id}`} className="item">
                        <span className="name">{pm.name}</span>
                        <CircleButton icon="play-simple" color="white" iconScale="100" onClick={() => this.runEngagementOnPresentationMachine(engagement, pm._id)} />
                      </div>
                    )).concat(
                      <div key={'pm-all'} className="item reverse">
                        <span className="name">All Screens</span>
                        <CircleButton icon="play-simple" color="#ff5600" iconScale="100" onClick={() => this.runEngagementOnPresentationMachine(engagement)} />
                      </div>)
                }
        </PopoverButton>
        <div style={{ width: 100 }}>{<CircleButton icon="star-simple" style={{ float: 'right' }} />}</div>
      </div>
    )
  }

  render() {
    const { presentationMachineId } = FlowRouter.current().params
  	return (
    <ListView title="Today's Engagements">
      {this.listEngagements().map(engagement => (<EngagementItem disabled={!engagement.isReady(presentationMachineId)} {...engagement} action={() => this.renderAction(engagement)} key={engagement._id} />))}
    </ListView>
  )
  }
}

const styles = {
  time: {
    marginRight: '5px',
    color: cssVars.darkGrey,
  },
  icon: {
    fill: cssVars.darkGrey,
    width: '30px',
    height: '30px',
    marginRight: '10px',
  },
  actionWrapper: {
    display: 'flex',
  },
}
