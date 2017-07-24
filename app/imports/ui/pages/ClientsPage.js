import { Meteor } from 'meteor/meteor'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

import SndTopNav , {SndTopNavAction} from '/imports/ui/components/SndTopNav'
import cssVars from '/imports/ui/cssVars'

import LeftSidebar from '/imports/ui/components/LeftSidebar'
import Sorter from '/imports/ui/components/Sorter'
import ItemClient from '/imports/ui/partials/Clients/ItemClient'
import { SearchInput, Selector , Label} from '/imports/ui/components/FormElements'
import NoResult from '/imports/ui/components/NoResult'

import { Clients } from '/imports/api/clients/clients'
import { Industries } from '/imports/api/industry/industry'
import { removeClient } from '/imports/api/clients/methods'

export default class ClientsPage extends TrackerReact(React.Component){
	constructor(){
    super();
    this.state = {
      subscription: {
        clients: Meteor.subscribe('clients'),
        industries: Meteor.subscribe('industries'),
        logofiles: Meteor.subscribe('logofiles'),
      },
      selectedSort: 'asc',
      industryFilter: '',
      inputFilter : ''
    }
      this.handleOnChangeSorter = this.handleOnChangeSorter.bind(this)
      this.handleIndustryFilter = this.handleIndustryFilter.bind(this)
      this.handleSearchFilter = this.handleSearchFilter.bind(this)
      this.deleteClient = this.deleteClient.bind(this)
  }

	handleOnChangeSorter(code){
		this.setState({selectedSort: code})
	}

  handleSearchFilter(value){
    this.setState({inputFilter : value});
  }

  handleIndustryFilter(value){
    this.setState({industryFilter : value});
  }

  optionsSorter = [
      {code : 'asc', text: 'Title (A–Z)', sorter: {name: 1}},
      {code : 'desc', text: 'Title (Z–A)', sorter:{name: -1}},
      {code : 'newest', text: 'Newest', sorter: {createdAt: -1}},
      {code : 'oldest', text: 'Oldest', sorter: {createdAt: 1}}
	]

  componentWillUnmount() {
    this.state.subscription.clients.stop();
    this.state.subscription.industries.stop();
    this.state.subscription.logofiles.stop();
  }

  listClients(){
    const filter = {}
    // Title, tags , need some more complex filtering
    if(this.state.inputFilter != '') {
      filter.name = { $regex: this.state.inputFilter, $options: 'i' }
    }
    // Filter industry
    if(this.state.industryFilter != ''){
      filter.industryId = this.state.industryFilter
    }

    // Filter by CIC
    filter.cicId = this.getCurrentCic()
    // Sorter
    const sorter = this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter
    return Clients.find(filter, {sort: sorter}).fetch();
  }

  getCurrentCic(){
    return Session.get('cic')
  }

  listIndustries(){
    return Industries.find({},{sort: {name:1}}).fetch();
  }

  deleteClient(clientId){
    removeClient.call({_id:clientId},(error) => {
      if(error){
        console.log(error)
      }
    })
  }

  renderClientsItems(){
    const clients = this.listClients()
    if(!clients.length) return (<NoResult />)
     return clients.map((client) => <ItemClient deleteClient={this.deleteClient} key={client._id} {...client} media={client.logoFile()} industry={client.industry()} dataId={client._id}/>);
  }

  render(){
    return (
      <div style={styles.container}>
        <SndTopNav>
          <SndTopNavAction href="/client/createClient" text="Add client" />
        </SndTopNav>
        <div style={styles.wrapper}>
          <LeftSidebar>
            <Label>Filter</Label>
            <SearchInput placeholder="Client name" onChange={this.handleSearchFilter} />
            <Selector selected={this.state.industryFilter} id="form-select-industry" placeholder="Select industry" data={this.listIndustries()}  onChange={this.handleIndustryFilter} />
          </LeftSidebar>
          <main style={styles.main}>
            <div style={styles.topBar}>
              <div style={styles.topTitle}>
                Clients
              </div>
              <Sorter id="sorter-clients" selected={this.state.selectedSort} options={this.optionsSorter} onChange={this.handleOnChangeSorter}  />
            </div>
            <div id="container-clients">
              {this.renderClientsItems()}
            </div>
          </main>
        </div>
      </div>
    )
  }
}

const styles = {
  container : {
    height: "calc(100% - 180px)",
  },
  wrapper : {
    display : "flex",
    minHeight: "100%"
  },
  main : {
    flex:1,
    width: '100%',
    padding:`0 ${cssVars.bodySpacing} ${cssVars.bodySpacing}`,
  },
  topBar: {
    display: 'flex',
    borderBottom: `1px solid ${cssVars.midGrey}`
  },
  topTitle: {
    color: cssVars.brandColor,
    marginRight : 'auto',
    padding: '20px 0'
  },
}