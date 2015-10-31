'use strict';

/**
 * @ngdoc function
 * @name ngChatbyAbelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ngChatbyAbelApp
 */
angular.module('ngChatbyAbelApp')
.controller('MainCtrl', ['$scope', '$rootScope', '$location', 'PubNub', function ($scope, $rootScope, $location, PubNub) {
    var _ref;
    if (!PubNub.initialized()) {
      $location.path('/join');
    }
    
    // Control channel to collect channel creation messages
    $scope.controlChannel = '__controlchannel';
    
    $scope.channels = [];

    //PUBLISH the CHAT
    $scope.publish = function(){
      //if no selected channel.. return the same as subscribe function
    if(!$scope.selectedChannel){
        return;
      }
      PubNub.ngPublish({
        channel: $scope.selectedChannel,
        message: {
          text:$scope.newMessage,
          user: $scope.data.username
        }
      });
      return $scope.newMessage = '';
    }

    //CREATE CHANNELS function (from main.html <form ng-submit='createChannel()'>)
    $scope.createChannel = function() {
      var channel;
      console.log('Creating New Channel...');
      // <input class="input-sm form-control" ng-model="newChannel" placeholder="Room Name" type="text">
     channel = $scope.newChannel;

      $scope.newChannel = '';

      //grant the channel.. 
      PubNub.ngGrant({
          channel: channel,
          read: true,
          write: true,
          callback: function() {
            return console.log(channel + 'All Set', arguments);

          }
      });

      //grant the channel presence.

        PubNub.ngGrant({
        channel: channel+'-pnpres',
        read: true,
        write: false,
        callback: function(){
          return console.log(channel + 'Presence All Set', arguments);
        }
      });
        
      PubNub.ngPublish({
        channel: $scope.controlChannel,
        message: channel
      });

      return setTimeout(function(){
        $scope.subscribe(channel);
            //takes away that CreateChannel FORM once we actually create a new channel
            return $scope.showCreate = false;

          }, 100); //time we will wait


      }
      
    $scope.subscribe = function(channel){
      var _ref;
      console.log('Subscribing...');
      if(channel === $scope.selectedChannel){
        return;
      }
      if($scope.selectedChannel){
        PubNub.ngUnsubscribe({
          channel: $scope.selectedChannel
        });
      }
      $scope.selectedChannel = channel;
      $scope.messages = ['Welcome to '+channel];
      PubNub.ngSubscribe({
        channel: $scope.selectedChannel,
        state:{
          "city": ((_ref = $rootScope.data) != null ? _ref.city : void 0) || 'unknown'
        },
        error: function(){
          return console.log(arguments);
        }
      });

      /////check for events. presence events - show users of channel
      ////PUBNUB PRESENCE API CODE/////////
      $rootScope.$on(PubNub.ngPrsEv($scope.selectedChannel), function(ngEvent, payload) {
        return $scope.$apply(function() {
          var newData, userData;
          userData = PubNub.ngPresenceData($scope.selectedChannel);
          newData = {};
          $scope.users = PubNub.map(PubNub.ngListPresence($scope.selectedChannel), function(x) {
            var newX;
            newX = x;
            if (x.replace) {
              newX = x.replace(/\w+__/, "");
            }
            if (x.uuid) {
              newX = x.uuid.replace(/\w+__/, "");
            }
            newData[newX] = userData[x] || {};
            return newX;
          });
          return $scope.userData = newData;
        });
      });
      /////retreiving current users
      ////PUBNUB API CODE/////////     
      PubNub.ngHereNow({
        channel: $scope.selectedChannel
      });

      /////messages displayed in the chat Window
      ////PUBNUB API CODE/////////   
      $rootScope.$on(PubNub.ngMsgEv($scope.selectedChannel), function(ngEvent, payload) {
        var msg;
        msg = payload.message.user ? "[" + payload.message.user + "] " + payload.message.text : "[unknown] " + payload.message;
        return $scope.$apply(function() {
          return $scope.messages.unshift(msg);
        });
      });

      /////history of messages per channel
      ////PUBNUB API CODE/////////       
      return PubNub.ngHistory({
        channel: $scope.selectedChannel,
        auth_key: $scope.authKey,
        count: 500
      });
    };

    // Subscribe to retrieve channels from "control channel"
    PubNub.ngSubscribe({
      channel: $scope.controlChannel
    });
    
    
    // Register for channel creation message events
    $rootScope.$on(PubNub.ngMsgEv($scope.controlChannel), function(ngEvent, payload) {
      return $scope.$apply(function() {
        if ($scope.channels.indexOf(payload.message) < 0) {
          return $scope.channels.push(payload.message);
        }
      });
    });
    
    
    // Get a reasonable historical backlog of messages to populate the channels list
    PubNub.ngHistory({
      channel: $scope.controlChannel,
      count: 500
    });

    // Create "Waiting Room" Channel
    $scope.newChannel = 'WaitingRoom';
    return $scope.createChannel();
  }]);

