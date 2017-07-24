const moment = require('moment');

global.utils = {};

utils = {
    sleep: function(miliseconds) {
        console.warn('Sleep is deprecated', miliseconds)
        var start = new Date().getTime();
        while(1){
            if(new Date().getTime()-start>miliseconds) break;
        }
    },
    waitForElements: function(selector, length, milliseconds=10000) {
        browser.waitUntil(function () {
            if(length == 0) return !browser.isExisting(selector)

            if(!browser.isExisting(selector)) return false
            //console.log(length, browser.elements(selector).value.length, selector)
            return browser.elements(selector).value.length === length
        }, milliseconds);
    },

    convertedDuration: function(duration) {
        return moment(duration*1000).format('mm:ss');
    },

    convertSecondsToString: function(duration) {
        const str = moment(duration*1000).format('mmss')
        //console.log(str)
        return str
    },

    convertedStartEndTime: function(startTime, endTime) {
        return `${moment(startTime).format('HH:mm')} - ${moment(endTime).format('HH:mm')}`
    },

    convertedStartEndTime1: function(startTime, endTime) {
        return `${moment(startTime).format('h:mm A')} - ${moment(endTime).format('h:mm')}`
    },

    getValueFromStyleStringByKey: function(styleString, key) {
        const styleArray = styleString.split(';')

        let value = null
        styleArray.forEach((token)=>{
            const stylePair = token.split(':')

            if(stylePair.length==2 && stylePair[0].trim()==key) {
                value = stylePair[1].trim()
            }
        })
        return value
    }
}

