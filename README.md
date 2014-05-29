cordova-anguar-frontend-sample
==============================

This is hybrid app based on angular.js and is packaged by cordova.
This app can be tested with [oauth2-restapi-server](https://github.com/vinebrancho/oauth2-restapi-server)

Used cordova plugin
- InAppBrowser
- Device
- Console

TODO
 - (DONE) Fix the problem that $rootScope.$emit doesn't work in executeScript callback of `InAppBrowser`
   - this has been solved as wrapping $rootScope.$emit with $rootScope.$apply()
   
 - (DONE) Install self signed certificate generated by `oautho2-restapi-server`
   - this has been solved as ignoring only self signed certifcate of `oauth2-restapi-server` for test 
