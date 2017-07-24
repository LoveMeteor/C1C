import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {FlowRouter} from 'meteor/ostrio:flow-router-extra'

import {ListView} from '/imports/ui/partials/Presenter/ContainerView'
import {SearchInput} from '/imports/ui/components/FormElements'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import ItemGroup from '/imports/ui/components/ItemGroup'
import PlaylistItem from '/imports/ui/components/PlaylistItem'
import Radium from 'radium'
import cssVars from '/imports/ui/cssVars'
import PreviewModal from '/imports/ui/components/PreviewModal'

import { subsManager } from '../../../startup/client/routes'


import {getTagsFromString} from '/imports/ui/helpers'
import {appendToPlaylist, isFavorite, toggleToFavorite} from '/imports/ui/playlistHelpers'
import {CanoncialPlaylists} from '/imports/api/canoncialplaylist/canoncialplaylists'
import {Medias} from '/imports/api/medias/medias'

@Radium
export default class Search extends TrackerReact(React.Component) {
    constructor() {
        super()
        this.state = {
            search: '',
            subscription: {
                tags: subsManager.subscribe('tags'),
                canoncialPlaylists: subsManager.subscribe('canoncialPlaylists'),
                downloadstatus : subsManager.subscribe('downloadstatus')
            }
        }
    }

    handleSearch(value) {
        this.setState({search: value})
    }

    searchItems = [
        {name: 'playlist', collection: CanoncialPlaylists},
        {name: 'image', collection: Medias, filter: 'image'},
        {name: 'video', collection: Medias, filter: 'video'}
    ]

    getFilter(type) {
        const filter = {}

        if (type) {
            filter.type = type
        }

        if (this.state.search != '') {
            const tags = getTagsFromString(this.state.search)
            filter.$or = []
            filter.$or.push({name: {$regex: this.state.search, $options: 'i'}})
            filter.$or.push({tagIds: {$in: tags}})
        }
        return filter
    }

    listItems(item) {
        const {collection, filter} = item;
        const {presentationMachineId} = FlowRouter.current().params
        const search = this.getFilter(filter)
        if (Medias === collection) {
            search.presentationMachineIds = presentationMachineId
        }
        else {
            search.presentationMachineId = presentationMachineId
        }
        return collection.find(search, {sort: {createdAt: -1}}).fetch()
    }

    renderSubAction(item, collection, context) {
        const favorite = isFavorite(item) ? 'favorite' : ''
        const element = collection.findOne({_id: item._id})
        const medias = element.mediaFileId ? [element] : element.itemsInOrder().map(pi => pi.media())
        return (
            <div style={{display: 'flex'}}>
                <FastIcon onClick={() => toggleToFavorite(item, collection, context)}
                          style={[styles.itemAction, styles[favorite]]} type="favourite"/>
                <PreviewModal medias={medias} styleIcon={[styles.itemAction]}/>
            </div>
        )
    }

    renderAction(item, collection) {
        return (<FastIcon onClick={() => appendToPlaylist(item, collection)} style={[styles.itemAction]} type="add"/>)
    }

    render() {
        return (
            <ListView title="Search">
                <SearchInput onChange={(value) => {
                    this.handleSearch(value)
                }} style={styles.search} id="search-keyword" placeholder="Enter your query"/>
                {this.searchItems.map((searchItem) => <ItemGroup key={searchItem.name} type={searchItem.name}
                                                                 id={`${searchItem.name}-group`}>
                    {this.listItems(searchItem).map((item) => <PlaylistItem styleIcon={styles.icon}
                                                                            disabled={!item.isReady(FlowRouter.current().params.presentationMachineId)}
                                                                            type={searchItem.name}
                                                                            action={() => this.renderAction(item, searchItem.collection)}
                                                                            subAction={(context) => this.renderSubAction(item, searchItem.collection, context)}
                                                                            key={item._id} _id={item._id}
                                                                            name={item.name}/>)}
                </ItemGroup>)}

            </ListView>
        )
    }
}

const styles = {
    search: {},
    icon: {
        fill: 'none'
    },
    itemAction: {
        fill: cssVars.darkGrey,
        marginLeft: '10px',
        width: '25px',
        height: '25px',
    },
    favorite: {
        fill: cssVars.brandColor,
    }
}