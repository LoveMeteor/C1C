import React from 'react'
import ButtonTextIcon from '/imports/ui/components/ButtonTextIcon'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'
import PMSelectItem from '/imports/ui/partials/Playlist/create/PMSelectItem'

export default class PlaylistArea extends TrackerReact(React.Component){

  constructor(){
    super()

    this.handleOnClick = this.handleOnClick.bind(this)
    this.getSelectedMachine = this.getSelectedMachine.bind(this)

    this.state = {
      PMSelected: '',
      subscription: {
        machines: Meteor.subscribe('presentationmachines')
      }
    }
  }

  static propTypes = {
    onClick: React.PropTypes.func.isRequired
  }

  static defaultProps = {
    visible: true,
    onClickBack: () =>{}
  }

  componentWillUnmount(){
    this.state.subscription.machines.stop()
  }

  listMachine(){
    return PresentationMachines.find({}).fetch()
  }

  getSelectedMachine(machineId){
    if(machineId === this.state.PMSelected){
      return true
    }else{
      false
    }
  }

  handleOnClick(selectedId){
    this.setState({PMSelected: selectedId})
  }

  render(){
    let style = {
      wrapper: {
        backgroundColor: '#E9E9E9'
      },
      item: {
        display: 'flex',
        margin: 'auto'
      },
      goBackBtn: {
        border: '1px solid #F36F21',
        color: '#F36F21',
        marginRight: '50px',
        width: '120px'
      },
      buttons: {
        display: 'flex'
      }
    }

    return(
      <div style={style.wrapper}>
        <div>
          <span style={style.text}>Select area/s</span>
        </div>
        <div>
          <div style={style.item}>
            {
              this.listMachine().map((machine)=>{
                return <PMSelectItem onClick={() => this.handleOnClick(machine._id)} isSelected={this.getSelectedMachine(machine._id)} key={machine._id} type={machine.logo}/>
              })
            }
          </div>
        </div>
        <div style={style.buttons}>
          <ButtonTextIcon className="btn-back" style={style.goBackBtn} onClick={this.props.onClickBack} text="Go Back" classIcon="fa fa-chevron-left"/>
          <ButtonTextIcon className="btn-continue" onClick={this.props.onClick} text="Continue" classIcon="fa fa-chevron-right"/>
        </div>
      </div>
    )
  }
}
