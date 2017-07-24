
# Setting up BDD Tests on Mac

This document gives the steps required to set up and run BDD tests on a Mac. It assumes that you already have Node and npm installed. See https://nodejs.org for installation instructions

### Install Meteor
Run the following from the terminal:

```
curl https://install.meteor.com/ | sh 
```

### Clone Repository and Install

``` 
git clone https://github.com/gs-telstra/cic-cms.git 
```

then

```
	cd cic-cms/app
	meteor npm install
```

### Run CMS and Start Tests

* In the `cic-cms/app` directory create a file named **Settings-dev.json** with the following contents. 
The path **/Users/path/on/your/system** is used to store uploaded media. 
* Create a folder **uploads** in a place of your chosing and change the value for the **storageAbsolutePath** item below to the absolute path of the **uploads** folder you just created.

```json
{
 "storageAbsolutePath":"/Users/path/on/your/system",
  "fixtures":
  {
    "apply" : true,
    "resetDatabase" : true,
    "applyFixtures" : ["baseData"],
    "exitAfterRun" : false
  }
}
```

In one terminal window, run the following:

```
	meteor npm run full-test
```
Wait for the application to start, this may take a while. Terminal output should look something like the following once the application is running:

```
=> App running at: http://localhost:3000/
I20170222-11:38:09.367(11)? Medias created
I20170222-11:38:11.032(11)? canoncialplaylist created
I20170222-11:38:11.215(11)? Engagements created
I20170222-11:38:13.735(11)? Playlists created
I20170222-11:38:13.735(11)? ========== Tests Fixtures Completed ==========
$
```
Once the application is running, open another teminal window and run: 

```
meteor npm run chrome-test
```

### Test Development

If you're in development add a `@watch` in the feature you want to test and run

```meteor npm run watch-chimp-test```


