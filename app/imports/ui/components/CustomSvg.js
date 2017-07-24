import React from 'react'
import {createMarkupForStyles} from 'react-dom/lib/CSSPropertyOperations'
import Isvg from 'react-inlinesvg'
import Radium from 'radium'

export function getSVGUrl(type){
  return `/images/icons/icon_${type}.svg`
}

export class FastIcon extends React.Component {
  render(){
    const className = `action-icon-${this.props.type}`
    const active = this.props.onClick ? {cursor : 'pointer'} : null
    return <FastSVG className={className} key={this.props.type} onClick={this.props.onClick} style={[active,this.props.style]} src={getSVGUrl(this.props.type)} />
  }
}

export class Icon extends React.Component {
  render(){
    const className = `action-icon-${this.props.type}`
    return <CustomSvg className={className} onClick={this.props.onClick} style={this.props.style} src={getSVGUrl(this.props.type)} />
  }
}

const cachedIcons = new Map();

@Radium
export class FastSVG extends Isvg {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    ...Isvg.defaultProps,
    cacheGetRequests: true,
    uniquifyIDs:false,
    wrapper: React.DOM.svg,
    onClick: () => {}
  }

  static propTypes = {
    ...Isvg.propTypes,
    style : React.PropTypes.object
  }

  load() {
    if(cachedIcons.has(this.props.src)){
      this.render()
    }
    return super.load()
  }

  render() {

    // We cache a cleaned version of the SVG,  really fast now.
    if(cachedIcons.has(this.props.src)){
      var {viewBox,html} = cachedIcons.get(this.props.src)
    }
    else {
      // In case of an error response instead of a proper svg
      if(this.state.loadedText && this.state.loadedText.indexOf('<html') !== -1) {
        return null
      }
      var viewBox = this.state.loadedText ? this.state.loadedText.match(/(?:viewBox=")(.*?)(?:")/)[1] : null
      var html = this.state.loadedText ? this.state.loadedText.replace(/(.|\n)*?<svg(.|\n)*?>|<\/svg>/g,'') : null
      if(this.state.loadedText) {
        cachedIcons.set(this.props.src,{viewBox,html})
      }
    }

    return this.props.wrapper({
        onClick : this.props.onClick,
        className: this.props.className,
        style : [defaultSvg,this.props.style],
        viewBox,
        dangerouslySetInnerHTML: { __html: html }
      }, this.renderContents())

  }
}

const defaultSvg = {
  width: '100%',
}

// Deprecated
export default class CustomSvg extends Isvg {
  constructor(props) {
    super(props);

  }

  static defaultProps = {
    ...Isvg.defaultProps,
    cacheGetRequests: true,
    uniquifyIDs:false,
    onClick: () => {}
  }

  static propTypes = {
    ...Isvg.propTypes,
    style : React.PropTypes.object
  }


  render() {
    console.warn(`CustomSvg is Deprecated , remove it from ${this._reactInternalInstance._currentElement._owner.getName()}`)
    const styles = {
      wrapper : {
        display : 'flex'
      }
    }
    return this.props.wrapper({
      onClick : this.props.onClick,
      className: this.getClassName(),
      style : styles.wrapper,
      dangerouslySetInnerHTML: this.state.loadedText ? {
        __html: this.processSVG(this.state.loadedText)
      } : undefined
    }, this.renderContents());
  }

  processSVG(svgText) {
    if(svgText.indexOf('<html') !== -1){
      return super.processSVG('');
    }
    if(this.props.style) {
      // Find something cleaner
      svgText = svgText.replace('<svg ',`<svg style=${createMarkupForStyles(this.props.style)} `);
    }
    return super.processSVG(svgText);
  }
}

