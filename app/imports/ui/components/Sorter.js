import React from 'react'
import cssVar from '/imports/ui/cssVars'
import Radium from 'radium'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import onClickOutside from 'react-onclickoutside'

@onClickOutside
@Radium
export default class Sorter extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      open : false,
    }

    this.onSelect = this.onSelect.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  static defaultProps = {
    selected: 'asc',
    onChange: () => {},
    options: [
      {code : 'asc', text: 'Title (A–Z)'},
      {code : 'newest', text: 'Newest'},
      {code : 'oldest', text: 'Oldest'}
    ]
  }

  toggleSelector = () => {
    this.setState({'open':!this.state.open});
  }

  onSelect = code => {
    this.props.onChange(code)
    this.setState({'open':false});
  }

  handleClickOutside(event){
    this.setState({'open':false});
  }

  render(){
    const styles = {
      wrapper : {
        padding: "15px 20px",
        position : 'relative',
        cursor: 'pointer',
        marginTop: '5px'
      },
      open : {
        background: '#f2f2f2',
      },
      top : {
        display: 'flex',
      },
      sortBy : {
        marginRight: '5px',
        fontWeight: 300
      },
      selected : {
        color : cssVar.brandColor,
        marginRight: '5px',
      },
      selector : {
        position: 'absolute',
        background: '#FFF',
        border : '1px solid #f2f2f2',
        left: 0,
        right: 0,
        marginTop: '15px',
        padding: '0 0 20px 0',
      },
      option : {
        listStyle:'none',
        marginTop: '20px',
        marginLeft: '20px',
      },
      arrow : {
        fill : cssVar.brandColor,
        width : "20px",
        height : "20px"
      }
    }

    const selected = this.props.options.find(option => option.code === this.props.selected)
    const openCss = this.state.open ? styles.open : styles.close
    return (
          <div id={this.props.id} style={[styles.wrapper,this.props.style,openCss]} onClick={this.toggleSelector}>
            <div style={styles.top}>
              <span style={styles.sortBy}>Sort by: </span>
              <span style={styles.selected}>{selected.text}</span>
              <FastIcon style={styles.arrow} type="arrow-down" />
            </div>
            {this.state.open &&
            <ul style={styles.selector}>
              {this.props.options.map((option) => (<li style={styles.option} onClick={() => this.onSelect(option.code)} key={option.code}>{option.text}</li>))}
            </ul>
            }
          </div>
    )
  }
}
