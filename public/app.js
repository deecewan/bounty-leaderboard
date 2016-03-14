angular.module('bountyBoard', ['ngRoute', 'firebase'])
  .constant('FirebaseUrl', 'https://blistering-torch-5670.firebaseio.com')
  .service('rootRef', ['FirebaseUrl', Firebase])
  .service('users', Users)
  .controller('MainCtrl', ['$scope', 'users', MainController])
  .config(ApplicationConfig);

function ApplicationConfig($routeProvider) {
  $routeProvider.when('/', {
    controller: 'MainCtrl as ctrl',
    templateUrl: 'views/mainctrl.html'
  });
}

function Users(rootRef, $firebaseObject, $firebaseArray) {
  var usersRef = rootRef.child('users');
  this.get = function (id) {
    return $firebaseObject(usersRef.child(id));
  };

  this.all = function () {
    return $firebaseArray(usersRef);
  }
}

function MainController($scope, users) {
  $scope.users = users.all();
  $scope.predicate = 'bountyScore';
  $scope.highLow = true;
  $scope.order = function(predicate){
    $scope.highLow = ($scope.predicate === predicate) ? !$scope.highLow : true;
    $scope.predicate = predicate;
  };
  $scope.updateScore = function(){
    var user = users.get('1234');
    user.$loaded().then(function(data){
      data.bountyScore += 100;
      data.bountyCount ++;
      data.$save();
    }).catch(function(err){
      console.error("Error: ", err);
    })
  }
}

// todo: add express B/E to handle the posts.
function ScoreUpdater() {

}