import React from 'react';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { TileView } from '/imports/ui/partials/Presenter/ContainerView'
import { Themes } from '/imports/api/themes/themes'
import IconItem from '/imports/ui/components/IconItem'


export default class ThemesPage extends TrackerReact(React.Component){
	constructor(){
    super()

    this.state = {
      subscription: {
        themes: Meteor.subscribe('themes')
      }
    }
  }

  componentWillUnmount() {
    this.state.subscription.themes.stop()
  }

  themes(){
    return Themes.find({}).fetch()
  }

  render() {
    const presentationMachineId = FlowRouter.current().params.presentationMachineId;

  	return (
  		<TileView title="Themes" className="themes-list tiles-list">
  			{this.themes().map((theme) => {
          return (<IconItem size="x2" key={theme._id} data={theme} href={`/presenter/${presentationMachineId}/theme/${theme._id}`}/>);
        })}
  		</TileView>
  	)
  }
}

