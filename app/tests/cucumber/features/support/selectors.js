
global.selectors = {};


selectors = {
    home: {
        clsButtonTriggerSideBar: '.burguer-menu',
        idDivSidebar: '#sidebar',
        clsLiMenuItem: '.menu-item'
    },
    playlist: {
        addForm: {
            idBody: '#media-add-form',
            idDropdownSelectIndustry: '#playlist-add-select-industry',
            idDropdownSelectTheme: '#playlist-add-select-theme',
            idInputSearchKeyword: '#playlist-add-input-keyword',
            idDivSearchResultContainer: '#playlist-add-container-search-result',
            clsDivSearchItemPlaylistContainer: '.playlist-add-item-playlist',
            clsDivSearchItemMediaContainer: '.playlist-add-item-media',
            clsButtonPlaylistOverwrite: '.playlist-add-btn-overwrite-playlist',
            clsButtonPlaylistAppend: '.playlist-add-btn-append-playlist',
            clsDisplayPlaylistName: '.display-playlist-name',
            clsDisplayMediaName: '.display-media-name'
        },
        view: {
            idBody: '#react-root',
            idButtonAddMedia: '#playlist-view-btn-add-media',
            idDropdownBulkActions: '#dropdown-bulk-action',
            idButtonResetNowPlaying: '#playlist-view-btn-reset-now-playing',
            idButtonOverlayEditor: '#playlist-view-btn-overlay-editor',
            idDropdownPresentationMachine: '#playlist-view-select-presentation-machine',
            idButtonApplyPlaylist: '#playlist-view-btn-apply-play-list',
            idButtonPause: '#button-pause',
            idButtonPlay: '#button-play',
            idButtonNext: '#button-next',
            idButtonPrevious: '#button-previous',
            idDivListContainer: '#playlist-view-item-list',
            clsDivItemContainer: '.playlist-view-item-container',
            clsCheckboxItemSelection: '.playlist-view-item-checkbox',
            clsButtonItemOrderUp: '.playlist-view-item-order-up-btn',
            clsButtonItemOrderDown: '.playlist-view-item-order-down-btn',
            clsButtonItemPreview: '.playlist-view-item-preview-btn',
            clsImageItemType: '.playlist-view-item-type-image',
            clsDisplayItemName: '.playlist-view-item-name',
            clsDisplayItemDuration: '.playlist-view-item-duration',
            clsButtonItemEdit: '.playlist-view-item-edit-btn',
            clsDisplayItemOverlay: '.playlist-view-item-overlay-display',
            clsSwitchItemOverlayOn: '.playlist-view-item-overlay-toggle-on',
            clsSwitchItemOverlayOff: '.playlist-view-item-overlay-toggle-off',
            clsButtonItemRemove: '.playlist-view-item-remove-btn',
            idDivCurrentIItemContainer: '#playlist-view-current-playing-media-container',
            idImageCurrentItemType: '#playlist-view-current-playing-media-type',
            idDisplayCurrentItemName: '#playlist-view-current-playing-media-name',
            idDisplayCurrentItemPassedTime: '#playlist-view-current-playing-media-passed-time',
            idDisplayCurrentItemTotalTime: '#playlist-view-current-playing-media-total-time',
            idProgressBarPassedTime: '#progressbar-passed-time',
            idButtonPlayingListView: '#playlist-view-current-playing-list-btn',
            idDivMediaPreviewCotainer: '#playlist-view-media-preview-container',
            idButtonThemeLayout: '#playlist-view-button-theme-layout',
            idTextOverlayTitle: '#playlist-view-text-overlay-title',
            idButtonApplyOverlayText: '#playlist-view-button-apply-overlay-text',
            idDisplayOverlayTitle: '#playlist-view-display-overlay-title'
        }
    },
    media: {
        idBody: '#react-root',
        idMediaListContainer: '#media-list-container',
        idMediaSearchSidebar: '#search-media-sidebar',
        idSearchFiles: '#search-title',
        idSearchIndustry: '#search-industry',
        liSearchIndustryOption: '#search-industry ul li',
        idSearchTheme: '#search-theme',
        liSearchThemeOption: '#search-theme ul li',
        idFilterAllMedia: '#filter-all-media',
        idFilterVideo: '#filter-video',
        idFilterImage: '#filter-image',
        idFilterAllArea: '#filter-all-area',
        clsFilterMachine: '#search-media-sidebar .filter-machine',
        clsMediaItemContainer: '.media-item-container',
        clsMediaTypeIcon: '.icon-media-type',
        clsMediaItemName: '.media-item-name',
        clsMediaItemTime: '.media-item-time',
        clsMediaItemMachines: '.media-machine-icon',
        clsMediaItemMachineItem: '.container-presentation-machine-item',
        clsLinkMediaItemDelete: '.link-delete-media',
        clsLinkMediaItemEdit: '.link-edit-media',
        idLinkUploadMedia: '#link-upload-media',
        clsItemDeleteModal: '.media-item-container .modal-boron',
        clsBtnItemDeleteOK: '.link-edit-media',

        detail: {
            idUploadModal: '#upload-media-modal',
            clsEditModal: '.edit-media-modal',
            idBtnSubmit: '#btn-media-upload',
            clsBtnUpdateMedia: '.btn-media-update',
            clsBtnDeleteMedia: '.btn-media-delete',
            clsUploadMedia: '.upload-media-preview',
            clsMediaTitle: '.media-detail-title',
            clsMediaIndustry: '.media-detail-industry .selected',
            clsMediaTheme: '.media-detail-theme .selected',
            clsMachine: '.media-detail-machine .selected',
            clsMediaAddTag: '.media-detail-add-tag',
            clsMediaTagItem: '.media-detail-tag-item',
            clsMediaTagRemove: '.media-detail-tag-remove',
        }
    },
    client: {
        linkAdd: '.link-add-client',
        listClients: '.list-clients',
        itemClient: '.item-client',
        itemClientDelete: '.item-client .delete',
        itemClientName: '.item-client .client-name',
        itemClientNameAdd: '.item-client .client-name:contains("New Client")',
        itemClientNameUpdate: '.item-client .client-name:contains("Update Client")',
        itemClientIndustry: '.item-client .industry',
        itemClientTeam: '.item-client .team',
        searchClient: '#search-client',
        searchIndustry: '#search-industry',
        searchTeam: '#search-team',
        detail: {
            nameSection: '.detail-client .section-name',
            clientName: '.detail-client .section-name [name=client-name]',
            industry: '.detail-client .section-name [name=industry]',
            btnNameContinue: '.detail-client .section-name .btn-continue-name',

            logoSection: '.detail-client .section-logo',
            logoFile: '.detail-client .section-name [name=logo]',
            btnLogoContinue: '.detail-client .section-name .btn-continue-logo',

            connectsSection: '.detail-client .section-connects',
            facebookLink: '.detail-client .section-connects [name=facebook-link]',
            twitterLink: '.detail-client .section-connects [name=twitter-link]',
            instagramLink: '.detail-client .section-connects [name=instagram-link]',
            btnConnectsContinue: '.detail-client .section-name .btn-continue-connects',

            reviewSection: '.detail-client .section-review',

            btnDelete: '#btn-delete-client',
            btnSave: '#btn-save'
        },
        deletePopup: {
            open: '#delete-popup.open',
            btnOk: '#delete-popup .btn-ok',
            btnCancel: '#delete-popup .btn-cancel',
        }
    },
    engagement: {
        btnNewEngagement: '#btn-new-engagement',
        dailyView: {
            engagementItem: '.item-engagement',
            engagementItemTime: '.item-engagement .time',
            searchTitle: '#search-title',
            searchClient: '#search-client',
            searchDate: '#search-date',
            engagementItemNew: ".item-engagement:contains('New Engagement')",
            engagementItemUpdate: ".item-engagement:contains('Update Engagement')",
            engagementItemRemoved: ".item-engagement:contains('May be removed')",
            engagementItemDelete: ".item-engagement:contains('May be removed') .delete",
        },
        weeklyView: {
            linkNextWeek: '.next-week',
            engagementItem: '.item-engagement',
            engagementTime: '.engagement-time',
            engagementItemTime: '.item-engagement .time',
            searchTitle: '#search-title',
            searchClient: '#search-client',
        },
        detail: {
            btnSaveAndFinish: '#btn-save-finish',
            titleSection: {
                engagementTitle: '.title-section .engagement-title',
                engagementDate: '.title-section .engagement-date',
                engagementTime: '.title-section .engagement-time',
                btnContinue: '.title-section .btn-continue'
            },
            clientSection: {
                engagementClient: '.client-section .engagement-client',
                linkNewClient: '.client-section .new-client',
                btnContinue: '.client-section .btn-continue'
            },
            reviewSection: {
            }
        },
        delete: {
            modal: '.engagement-delete-modal.open',
            btnCancel: '.engagement-delete-modal .btn-cancel',
            btnDelete: '.engagement-delete-modal .btn-delete'
        }
        /*
        templates: {
            templateItem: '.item-engagement-template',
            search: 'input[name=search]',
            industryFilter: 'select[name=industry-filter]',
            themeFilter: 'select[name=theme-filter]',
        },
        detail: {
            customerName: 'input[name=customer-name]',
            email: 'input[name=email]',
            phone: 'input[name=phone]',
            btnSave: '#btn-save',
            members: {
                viewLink: '.view-team',
                section: '.members-section',
                memberItem: '.item-member',
                memberItemNew: ".item-member:contains('New Member')",
                add: {
                    memberName: 'input[name=member-name]',
                    email: 'input[name=email]',
                    btnAddMember: '#btn-add-member',
                }
            },
            sendmail: {
                viewLink: '.view-sendmail',
                section: '.sendmail-section',
                memberItem: '.item-member',
                mailBody: '.sendmail-body',
                btnSendMail: '#btn-send-mail',
            },
            playlists: {
                presentationMachine: {
                    area: '.presentation-machine-area',
                    playlistItem: '.presentation-machine-area .playlist-item',
                    btnAddMedia: '.presentation-machine-area .btn-add-media',
                    addArea: {
                        mediaItem: '#media-add-form .media-item.appendable',
                        mediaName: '#media-add-form .media-item.appendable .media-name',
                        linkAppend: '#media-add-form .media-item.appendable .link-append',
                    },
                    overlayEditor: {
                        linkToggle: '.presentation-machine-area .overlay-toggle',
                        overlayTextInput: '.presentation-machine-area .overlay-editor textarea',
                        overlayPreview: '.presentation-machine-area .overlay-editor .preview',
                    },
                    playlistDelete: {
                        item: '.presentation-machine-area .playlist-item:first-child',
                        linkDelete: '.presentation-machine-area .playlist-item:first-child .link-delete',
                    }
                }
            }
        }
        */
    },

    presentation: {
        clsNavItemFavourite: '#leftNav a.presentation-favorites',
        idDivIndustryContainer: '#DivIndustryContainer',
        idDivThemeContainer: '#DivThemeContainer',
        idDivPlaylistConntainer: '#DivPlaylistContainer',
        idDivMediaConntainer: '#DivMediaContainer',
        idDivFavoriteConntainer: '#DivFavoriteContainer',
        idDivSearchConntainer: '#DivSearchContainer',
        idDivSearchResultConntainer: '#DivSearchResultContainer',
        idPlayerContainer: '#player',
        idGroupPlaylists: '#playlist-group',
        idGroupMedias: '#media-group',
        idGroupVideos: '#video-group',
        idGroupImages: '#image-group',
        idGroupTags: '#tag-group',
        clsSearchResultsList: '.search-results-list',
        clsButtonDropdown: '.action-icon-arrow-down',
        clsModalAddPlaylist: '.modal-addToPlayer',
        clsButtonAppend: '.modal-addToPlayer .modal-actions .action-icon-add',
        clsButtonOverwrite: '.modal-addToPlayer .modal-actions .action-icon-remove',
        idSwitchToggle: '.on-off-switch .switch-wrapper',
        idInputSearchKeyword: '#search-keyword',
        clsDivItemContainer: '.DivItemContainer',
        clsDisplayItemName: '.DisplayItemName',
        clsButtonItemAdd: '.action-icon-add',
        clsButtonItemFavourite: '.action-icon-favourite',
        clsButtonItemPlay: '.action-icon-play',
        clsPreviewModal: '.ReactModal__Content.ReactModal__Content--after-open',
        clsPlayerTotalDuration: '.total-time',
        clsPlayerPassedTime: '.current-time'
    },

    playlists: {
        clsDivPlaylists: '.list-playlist',
        clsDivPlaylistContainer: '.DivPlaylistContainer',
        clsDisplayPlaylistName: '.display-playlist-name',
        clsDivPresentationMachines: '.DivPresentationMachines',
        clsDivPresentationMachine: '.DivPresentationMachine',
        idInputSearchKeyword: '#InputSearchKeyword',
        idButtonSearch: '#ButtonSearch',
        idSelectTheme: '#SelectTheme',
        idSelectIndustry: '#SelectIndustry',
        idDivPresentationMachines: '#DivPresentationMachines',
        idSelectAllAreas: '#SelectAllAreas',
        idSelectSorting: '#SelectSorting',
        clsDivPlaylistItemContainer: '.DivPlaylistItemContainer',
        clsDisplayPlaylistItemName: '.DisplayPlaylistItemName',

    }

}