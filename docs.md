# CIC

## Overview

CIC stands for *Customer Insight Center*.

>In simple terms, we have some special sites (media centres) with big screens and interactive exhibits. There will be an
app that plays media (videos, images) on the screens, in a kind of stage-managed way like a theatre production. We need
the process of configuring the presentation to be easy and fast, and the need the presentations to run smoothly with no
problems.

>The multimedia presentations are created by various people and uploaded to our content management system, with the
features needed to configure the presentations (choose media, rearrange etc.) and push the content to the devices in
advance.

Check this [youtube video](https://www.youtube.com/watch?v=bryZJd3W88U) to have a better idea.


### Terminologies

Term| Definition
-----|------
__Presentation Machine__ | It's the big screens which media are working on it.
__Content Management System (CMS)__ |It's a web based application that enable admin to manage all content, check this [invision screens](https://projects.invisionapp.com/share/XA7XV7FGU#/screens/173516504).
__Presenter Application__ | It's a mobile based application that enable admin from controling the presentation machines, check this [invision screens](https://projects.invisionapp.com/share/B38VVK8JV#/screens).
 __Media__  | It's either image or video, it's the files that will play on the presentation machines.
 __Playlist__ | It's the ordered list of media for specific presentation machine.
 __Engagement__ | It's scheduled tour for specific client, It has playlist foreach presentation machine.
 __Clients__ | These are the target clients, they visit CIC according to the scheduled engagement.
 __Themes__ |
 __Industries__ |
 __Tags__ |
 __Assets__ |


### User Roles
1. __Presenter__ `Presenter Application User`
   * Presenter is the user who control what's playing on the presentation machines.
2. __Admin__ `CMS User`
   * Admin is a presenter wtih special priviliges that enables him to manage all content.


## Features

### __1. CMS features by Admin__
*Application*: __CMS__ | *Authorized User*: __Admin__


### 1.1 Manage media files

 This module to enable admin from managing media on each presentation machine.

__Bussiness Rules__
 * Media files could be uploaded by admin only
 * Media files could be uploaded to one or more presentation machines.
 * Media belongs to one industry and zero or more themes.


__Features__
  * Upload media to presentation machine. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/upload-media-file.feature))
  * List media files in specific presentation machine. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/list-machines-media.feature))
  * Search media files. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/search-media-file.feature))
  * Delete media file. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/delete-media-file.feature))
  * View media details. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/view-media-details.feature))
  * Edit media tags. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/list-add-remove-media-tag.feature))
  * Edit media assets. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/list-add-remove-media-assets.feature))
  * Add media to favourite. ([feature file](cic-cms/app/tests/cucumber/features/media-manager/add-media-to-favourites.feature))



### 1.2 Manage playlists

__Bussiness Rules__
 * Playlist may contain images or videos.
 * Image added to playlist must have a duration.
 * Playlist may have overlay, overlay could be either text or image.
 * Overlay could be enabled/disabled for one or more media files in the playlist.
 * Playlist is presentation machine related. :question:
 * Admin can __only__ add media that's uploaded on the related presentation machine. :question:
 * Playlist belongs to one industry and zero or more themes.

__Features__
  * List playlist media ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/list-playlist-media.feature))
  * Preview media ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/preview-media.feature))
  * reorder media in playlist ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/reorder-media-in-playlist.feature))
  * Add media to playlist. ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/add-media-to-playlist.feature))
  * Delete media from playlist. ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/delete-media-from-playlist.feature))
  * Set duration for images ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/set-duration-for-images.feature))
  * Set media overlay ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/set-media-overlay.feature))
  * Reset to now playing ([feature file](cic-cms/app/tests/cucumber/features/manage-playlist/reset-to-now-playing.feature)) :question:

### 1.3 Manage engagements

__Bussiness Rules__
 * Engagments has playlist for each presentation machine.
 * Engagement is scheduled on specific date.
 * At scheduled time presenter will receive a recomendation by playing the scheduled playlist, It won't be played automatically.

__Features__
  * View all engagements ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/view-all-engagements.feature))
  * Delete engagement ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/delete-engagement.feature))
  * Book engagement ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/book-engagment.feature))
  * Manage engagement clients ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/manage-engagement-customers.feature))
  * Manage engagement playlist ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/manage-engagement-playlist.feature))
  * View engagement templates ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/view-engagement-templates.feature))


### 1.4 Manage Clients


 __Bussiness Rules__
 * Client may send multiple teams to CIC, so client may have many engagements. However engagements must have only one client.

__Features__
  * Add/Edit client ([feature file](cic-cms/app/tests/cucumber/features/manage-clients/add-edit-client.feature))
  * List all clients ([feature file](cic-cms/app/tests/cucumber/features/manage-clients/list-clients.feature))
  * Delete client ([feature file](cic-cms/app/tests/cucumber/features/manage-clients/delete-client.feature))

### 1.5 Manage CMS users	:question:

 __Features__
  * Admin Login (feature file)
  * Admin Logout (feature file)


### 1.6 Manage presenter users :question:


### 1.7 Manage themes

### 1.8 Manage industries


### __2. Presentation features by presenter__
*Application*: __Presenter Application__ | *Authorized User*: __presenter__

### 2.1 Browse media in presentation machine

__Bussiness Rules__
 * Presenter can browse media files and playlists by themes and industries.
 * Presenter can browse his favourite list
 * Presenter can add either media or playlist to his favourite lise
 * Presenter can search media files

__Features__
  * Browse by industry ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/browse-content-by-industry.feature))
  * Browse by theme ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/browse-content-by-theme.feature))
  * Browse favourites ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/browse-favourites.feature))
  * Search media ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/browse-favourites.feature))

### 2.2 Manage currently playing playlist

__Bussiness Rules__
 * Presenter is the only one who can control what the presentation machine play
 * Presentation machine will keep repeating the playlist until presenter tell otherwise
 * Presenter can make a file works in a loop
 * When presentation machine starts up, it plays the “ambient playlist” in a loop until a presenter tells it to change to a different playlist
* when a presenter tells the PM to play a different playlist, it plays that in a loop until someone tells it to change
 * Presenter will get notified by the scheduled engagement on time, and he has the ability to either change to this engagement's playlist or not.

__Features__
  * Manage currently playing playlist ([feature file](cic-cms/app/tests/cucumber/features/manage-engagements/manage-currently-playing.feature))

### 2.3 Login/Logout

__Features__
  * Admin Login (feature file)
  * Admin Logout (feature file)


## User Journeys

###### *__Admin__* upload new media file and add it to the currently playing playlist on a specific presentation machine

1. Admin __login__ using valid credentials
2. Admin __browse uploaded media files__ in a specific presentation machine
3. Admin __search by name__ for a specific media file, he couldn't find the file
4. Admin __upload media file__
5. Admin __view curently playing playlist__ in a specific presentation machine
6. Admin __add uploaded media to currently playing playlist__
7. Admin __set overlay__ to the playlist
8. Admin __enable overlay__ to the newly added media
9. Admin __preview__ the media file with overlay enabled

###### *__Admin__* add new client and book a new engagement for him

1. Admin __login__ using valid credentials
2. Admin __browse clients__
3. Admin __search by name__ for a specific user, he couldn't find him
4. Admin __add client__
5. Admin __borwse engagements__ in daily view
6. Admin __book a new engagement__ at an empty time slot
7. Admin __add client data__ to engagement
8. Admin __manage engagement playlist__
9. Admin __save playlist as a template__

###### *__Presenter__* manage presentation machine at a time of scheduled engagement

1. Presenter __login__ using valid credentials
2. Presentation machine will be __playing the “ambient playlist”__ in a loop until someone tells it to change to a different playlist
3. Presenter __browse playlists by theme__
4. Presenter __play a playlist__
5. Presenter __notified__ by a scheduled engagement
6. Presenter select to __play the engagement's playlist__
