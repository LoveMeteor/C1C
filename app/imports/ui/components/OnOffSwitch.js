import React from 'react';
import classNames from 'classnames';

export default class OnOffSwitch extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        let switchStatus = classNames({
			'switch-icon' : true,
			'active' : !this.props.active
		});
        return (
            <div style={this.props.style} className="on-off-switch" onClick={this.props.onClick}>
                <span>{this.props.off}</span>
                <span className="switch-wrapper"><span className={switchStatus}></span></span>
                <span>{this.props.on}</span>
            </div>
        )
    }
}