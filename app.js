var app = angular.module('app', ['ngResource']);

app.controller('pollCtrl', function($scope, $resource) {
  $scope.entries = [];
  
  var socket = io.connect('http://editor.lacerta.uberspace.de:61616');
  
  socket.on('connect', function() {
    console.log('CONNECTED!');
    socket.on('items', function (data) {
      console.log('got data');
      $scope.entries = data;
      $scope.$apply();
    });

    $scope.add = function() {
      console.log('add: ', $scope.value);
      socket.emit('add_item', {message: $scope.value}); 
    };
  });
  
});
