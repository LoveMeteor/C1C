import React from 'react'

import {FastIcon} from '../CustomSvg'
import './CircleButton.css'

const CircleButton = ({children, title, icon, iconScale=60, color='rgb(65, 65, 65)', size=30, style={}, onClick}) => {
    style = Object.assign(style,{borderColor:color, color:color, width:size, height:size})

    const content = () => {

        if(children) {
            return <div>{children}</div>
        } else if(title) {
            return <div>{title}</div>
        } else if(icon) {
            return <FastIcon type={icon} style={{width:`${iconScale}%`,color:color,fill:color}}/>
        } else {
            return <div></div>
        }
    }
    return <div className="circle-button" style={style} onClick={()=>{onClick&&onClick()}}>{content()}</div>
}

export default CircleButton