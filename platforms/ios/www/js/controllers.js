'use strict';

var module = angular.module('myApp.controllers', []);
var prefix = 'http://ec2-54-199-141-31.ap-northeast-1.compute.amazonaws.com:3000';

module.controller('MainCtrl', function($scope) {
    // add status 
    console.log('main control');
    $scope.items = [ 
        { content: 'What a beatiful world', created: Date.now() },
        { content: 'What are you doing now?!', created: Date.now() },
        { content: 'I hope to go Hawaii', created: Date.now() }
    ];
    $scope.addItem = function (content) {
        console.log('add new item');
        $scope.items.push({ content: content, created: Date.now() }); 
    };
});

module.controller('LogoutCtrl', function ($scope, $location, oauth2serverFactory, tokenFactory) {
    $scope.logout = function () {
        oauth2serverFactory.destroy(function () {
            tokenFactory.setToken({});
            $location.path('/');
        });
    };
});

module.controller('LoginCtrl', function($scope, $rootScope, $location, $window,$resource, authFactory, tokenFactory, redirectFactory, oauth2serverFactory) {
    $scope.loadingView = true;
    $scope.alertMessage = null;
    $scope.loginLocalAccount = function (credentials) {
        console.log('start login!!!');
        oauth2serverFactory.post({}, {
            grant_type : "password",
            username : $scope.credentials.email,
            password : $scope.credentials.password
        }, function (response) {
            console.log('login success');
            // emit login complete
            $rootScope.$emit('required-login:success');
            // save info with token sent by node server
            console.log('success to get access token');
            tokenFactory.setToken(response);
            if (redirectFactory.getUrl()) {
                $location.path(redirectFactory.getUrl());
            } else {
                $location.path('/');
            }
            redirectFactory.setUrl(null);
        }, function (error) {
            console.log('login failed');
            // show error message on current page
            // e.g) $scope.error = err.message;
            $scope.alertMessage = error.data.reason;
        });
    };

	var emitEvent = function (eventName, data) {
		window.alert('emit Event: ' + eventName);
		$rootscope.$emit(eventName, data); 
	};

    $scope.loginSocialAccount = function (socialName) {
        var url = prefix + '/auth/login/' + socialName;
		var successUrl = url + '/callback/success';
		var failureUrl = url + '/callback/failure';
		$rootScope.ref = $window.open(url, '_blank', 'location=yes,toolbar=yes');

		$rootScope.ref.addEventListener('loadstop', function(event) {
			if (event.url.match(successUrl)) {
				$rootScope.ref.executeScript({
					code: 'getResult();'
				}, function (values) {
					window.alert('success');
					$rootScope.ref.close();
					if (values[0].type == 'login') {
						window.alert(values[0].data.name);
						setTimeout(function () {
							window.alert('set timeout');
							emitEvent('social-login:success', values[0].data);
						}, 0);
					} else if (values[0].type == 'connect') {
						emitEvent('social-connect:success', values[0].data);
					} else {
						console.log('wrong type');
					}
				});
			} else if (event.url.match(failureUrl)) {
				$rootScope.ref.executeScript({
					code: 'getResult();'
				}, function (values) {
					window.alert('failure');
					if (values[0].type == 'login') {
						   $rootscope.$emit('social-login:failure', values[0].data); 
					} else if (values[0].type == 'connect') {
						   $rootScope.$emit('social-connect:failure', values[0].data); 
					} else {
						console.log('wrong type');
					}
					$rootScope.ref.close();
				});
			}
		});
    };

    $rootScope.$on('social-login:success', function (event, data) {
        window.alert('social login success: ' + data.name);
        oauth2serverFactory.post({}, {
            grant_type : "password",
            username : data.name,
            password : data.token
        }, function (response) {
            console.log('login success');
            // emit login complete
            $rootScope.$emit('required-login:success');
            // save info with token sent by node server
            console.log('success to get access token');
            tokenFactory.setToken(response);
            if (redirectFactory.getUrl()) {
                $location.path(redirectFactory.getUrl());
            } else {
                $location.path('/');
            }
            redirectFactory.setUrl(null);
        }, function (error) {
            if (redirectFactory.getUrl()) {
                $location.path(redirectFactory.getUrl());
            } else {
                $location.path('/');
            }
            redirectFactory.setUrl(null);
        });
    });

    $rootScope.$on('social-login:failure', function (event, error) {
        console.log('social login failed');
        $scope.alertMessage = error.message;
    });
});

module.controller('SignupCtrl', function($scope, $location, $resource, authFactory, tokenFactory, redirectFactory) {
    $scope.alertMessage = null;
    $scope.signup = function (credentials) {
        authFactory.save({
            action: 'signup'
        }, {
            email : $scope.credentials.email,
            password : $scope.credentials.password
        }, function (response) {
            console.log('success to sign up local account');
            $location.path('/profile');
        }, function (error) {
            // show error message on current page
            $scope.alertMessage = error.data.reason;
        });
    };

    $scope.signupForConnect = function (credentials) {
        $resource(prefix + '/api/:action/:social').save({
            action: 'connect',
            social: 'local'
        }, {
            email : $scope.credentials.email,
            password : $scope.credentials.password
        }, function (response) {
            // save info with token sent by node server
            console.log('success to connect local account');
            $location.path('/profile');
        }, function (error) {
            // show error message on current page
            // e.g) $scope.error = err.message;
            $scope.alertMessage = error.data.reason;
        });
    };
});

module.controller('ProfileCtrl', function($scope, $rootScope, $route, $window, $location, $resource, authFactory, tokenFactory, profileFactory, oauth2serverFactory, profileRouteResolver) {
    $scope.alertMessage = null;
    $scope.profile = profileRouteResolver;
    $scope.logout = function () {
        oauth2serverFactory.destroy(function () {
            tokenFactory.setToken({});
            $location.path('/');
        });
    };

    $scope.connectLocalAccount = function () {
        $location.path('/connect');
    };

    $scope.connectSocialAccount = function (socialName) {
        $resource(prefix + '/api/session').get(function (data) {
            $window.open(prefix + '/api/connect/' + socialName, 'target=_blank');
        });
    };

    $scope.disconnectAccount = function (socialName) {
        $resource(prefix + '/api/disconnect/:social').get({
            social: socialName
        }, function (data) {
            console.log('success to disconnect to ' + socialName);
            // fetch profile again from node server
            profileFactory.getProfile(function(response) {
                $scope.profile = response;
            });
        });
    };

    $rootScope.$on('social-connect:success', function (event, data) {
        console.log('social connect success: ' + data.name);
        // reload current route for fetching updated profile
        // fetch profile again from node server
        profileFactory.getProfile(function(response) {
            $scope.profile = response;
        });
    });

    $rootScope.$on('social-connect:failure', function (event, error) {
        console.log('social connect failed');
        $scope.alertMessage = error.message;
    });
});
