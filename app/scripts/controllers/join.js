'use strict';

/**
 * @ngdoc function
 * @name ngChatbyAbelApp.controller:JoinCtrl
 * @description
 * # JoinCtrl
 * Controller of the ngChatbyAbelApp
 */
angular.module('ngChatbyAbelApp')
  .controller('JoinCtrl',['$scope', '$rootScope', '$location', 'PubNub', function ($scope, $rootScope, $location, PubNub) {
    //username generator
    $scope.data = {
        username: 'Taco_' +Math.floor(Math.random() * 999)
    };

    $scope.join = function() {
      // console.log("joining..");


      var _ref, _ref2;
      $rootScope.data || ($rootScope.data = {});
      //IF the username is NOT null from the form that's submitted we are going to store it in '$rootScope.data.username'
      $rootScope.data.username = (_ref = $scope.data) != null ? _ref.username : void 0;
      //same concept with the city
      $rootScope.data.city = (_ref2 = $scope.data) != null ? _ref2.city : void 0;
      //to give the users and ID 'random id'
      $rootScope.data.uuid = Math.floor(Math.random() * 1000000) + '__'+ $scope.data.username;
      console.log($rootScope);

      PubNub.init({
        subscribe_key: 'sub-c-3773d1c6-7f60-11e5-9e96-02ee2ddab7fe',
        publish_key: 'pub-c-bc40d14e-0e29-426f-ac60-6edae43c1644',
        uuid: $rootScope.data.uuid
      });

      return $location.path('/main');

    }
    // console.log('JoinCtrl Initialized..');
  }]);
