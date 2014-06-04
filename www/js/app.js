'use strict';

// Declare app level module which depends on filters, and services
var module = angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]);

module.config(function($routeProvider) {
      $routeProvider
      .when('/popup', {
		  templateUrl: 'popup.html',
          controller: 'MainCtrl'
      })
      .when('/main', {
		  templateUrl: 'partials/main.html',
          controller: 'MainCtrl',
          resolve: {
              wishListResolver: function (wishListFactory) {
                  return wishListFactory.get();
              }
          },
          authenticate: true
      })
      .when('/login', {
		  templateUrl: 'partials/login.html',
          controller: 'LoginCtrl'
      })
      .when('/logout', {
		  templateUrl: 'partials/logout.html',
          controller: 'LogoutCtrl'
      })
      .when('/signup', {
		  templateUrl: 'partials/signup.html',
          controller: 'SignupCtrl'
      })
      .when('/profile', {
		  templateUrl: 'partials/profile.html',
          controller: 'ProfileCtrl',
          resolve: {
              profileRouteResolver: function (profileFactory) {
                  return profileFactory.getProfileResolver();
              }
          },
          authenticate: true
      })
      .when('/connect', {
          templateUrl: 'partials/connect.html',
          controller: 'SignupCtrl',
          authenticate: true
      })
      .otherwise({
          redirectTo: '/main'
      });
      
      //$locationProvider.html5Mode(true);
});

module.run(function ($rootScope, $location, $window, tokenFactory, redirectFactory) {
    // check already saved access_token
    var tokenInfoString = window.localStorage.getItem('tokenInfo');
    var tokenInfo = JSON.parse(tokenInfoString) || {};
    if (tokenInfo.access_token) {
        console.log('token for this app exists');
        tokenFactory.setToken(tokenInfo);
    }

    // watch access_token for accessing resources of this app(node server)
    // if it is changed to other value, set it to local storage
    $rootScope.$watch(tokenFactory.getToken, function (newVal, oldVal, scope) {
        if (newVal !== oldVal) {
            console.log('reset access_token into localstorage');
            newVal.created = Date.now();
            window.localStorage.setItem('tokenInfo', JSON.stringify(newVal));
        }
    });

    // handle authorization for routes
    $rootScope.$on('$routeChangeStart', function (event, current, prev) {
        // check authentication
        if (current.authenticate) {
            if (!tokenFactory.isAuthenticated()) {
                console.log($location.path() + ': authentication is needed');
                redirectFactory.setUrl($location.path());
                $location.path('/login');
                // TODO is there any way to stop current routing.
                // As now, we try to stop current route in each route resolver
                return;
            }
            console.log($location.path() + ': authentication is already done');
        } else {
            console.log($location.path() + ': authentication is not needed');
        }

        // check if loading bar is needed
        if (current.$$route && current.$$route.resolve) {
            console.log('loadingView set');
            $rootScope.loadingView = true;
        }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, prev) {
        // At this point, resolver already finished to get data from server 
        $rootScope.loadingView = false;
    });

    $rootScope.$on('$routeChangeError', function (event, current, prev) {
        // TODO error handling
        console.log('failed to change route');
    });
});

module.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

// cordova stub
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		//StatusBar.overlaysWebView(false);
		angular.bootstrap(document, ['myApp']);
    }
};
