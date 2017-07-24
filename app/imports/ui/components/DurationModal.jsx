import React from 'react'
import Radium from 'radium'
import InputRange from 'react-input-range';
import Modal from 'boron/FadeModal';

import cssVars from '/imports/ui/cssVars'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import { Button , TimeInput , Range } from '/imports/ui/components/FormElements'

@Radium
export default class DurationModal extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      isValid : true,
      duration : props.duration
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.duration !== nextProps.duration) {
      this.state.duration = nextProps.duration
    }
  }

  closeModal(){
    this.refs.durationModal.hide()
  }

  setSliderDuration = (value) => {
    this.setState({duration:value})
  }

  setDuration(value){
    this.setState({duration:moment.duration(`00:${value}`).asSeconds()})
  }

  onSubmit(){
    this.props.onSubmit(this.state.duration,this.refs.overwrite.checked)
    this.closeModal()
  }

  render(){
    return (
      <Modal modalStyle={styles.modal} backdropStyle={styles.backdrop} ref="durationModal" className="modal-boron modal-addToPlayer">
          <div style={styles.top} className="modal-top"><FastIcon onClick={() => this.closeModal()} style={styles.icon} type="close" /></div>
          <div style={[styles.header,styles.durationLine]}>
            Set image duration <TimeInput style={styles.duration} onChange={(value) => this.setDuration(value)} styleInput={styles.durationInput} value={this.state.duration} />
          </div>
          <Range style={styles.slider} min={0} max={600} minText="0 min" maxText="10 mins" value={this.state.duration} onChange={this.setSliderDuration} />
          <div style={styles.setButton}>
            <input ref="overwrite" type="checkbox" id='all' /><label htmlFor='all'>Set as default duration for all images</label>
          </div>
          <div style={styles.setButton}><Button className="btn-set-duration" disabled={!this.state.duration} onClick={() => this.onSubmit()} kind="danger">Set duration</Button></div>
      </Modal>
    )
  }
}


const styles = {
  modal : {
    width : '370px',
    color : cssVars.darkGrey
  },
  backdrop : {
    background : '#000'
  },

  top : {
    background : cssVars.brandColor,
    textAlign: 'right',
    padding: '10px'
  },
  header : {
    display:'flex',
    margin: '20px'
  },
  durationLine : {
    justifyContent: 'space-between',
    alignItems : 'center',
    fontSize: '18px',
    fontWeight: 400,
  },
  duration : {
    padding: '5px'
  },
  durationInput : {
    border: '0px',
    fontSize: '16px',
    width: '50px',
    color : cssVars.sndBrandColor
  },
  setButton : {
    alignItems : 'center',
    padding: '10px 0 30px',
    textAlign: 'center'
  },
  icon : {
    width : '30px',
    fill : '#FFF'
  },
  slider : {
    margin: '0 5%'
  }
}