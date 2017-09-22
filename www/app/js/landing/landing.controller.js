'use strict';
angular.module('landing')
    .controller('LandingController', LandingController);

function LandingController($scope, $state, authService) {
    $scope.email = '';

    $scope.handleSignUp = function() {
        if ($scope.email.length > 1) {
            authService.setUserId($scope.email);
        }
        $state.go('signup');
    }
}