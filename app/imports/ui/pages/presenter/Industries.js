import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import { subsManager } from '../../../startup/client/routes'

import {TileView} from '/imports/ui/partials/Presenter/ContainerView'
import IconItem from '/imports/ui/components/IconItem'
import { Industries } from '/imports/api/industry/industry'

export default class IndustriesPage extends TrackerReact(React.Component){
	constructor(){
    super();
    this.state = {
      subscription: {
        industries: subsManager.subscribe('industries')
      }
    }
  }

  industries(){
    return Industries.find({}).fetch();
  }

  render() {
    const presentationMachineId = FlowRouter.current().params.presentationMachineId;

    return (
			<TileView title="Industry" className="industries-list tiles-list">
        {this.industries().map((industry) => {
          return (<IconItem key={industry._id} data={industry} href={`/presenter/${presentationMachineId}/industry/${industry._id}`}/>);
        })}
			</TileView>
  	)
  }
}