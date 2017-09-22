'use strict';
angular.module('signup')
    .controller('SignInController', SignInController);

function SignInController($scope, $state, $timeout, authService) {
    $scope.email = authService.getUserId();
    $scope.pass = "";
    $scope.infoType = "green";
    $scope.info = "";

    var handleSignInFlag = true;

    $scope.handleSignIn = function() {
        if (handleSignInFlag) {
            handleSignInFlag = false;
            var result = validateInfo();
            if (result) {
                $scope.infoType = 'green';
                $scope.info = "Signing in...";
                var data = {
                    'email': $scope.email,
                    'pass': $scope.pass
                }
                authService.login(data)
                    // handle success
                    .then(function(data, status) {
                        console.log(data);
                        $scope.infoType = 'green';
                        $scope.info = 'Successful!';
                        $timeout(function() {
                            handleSignInFlag = true;
                            $state.go('dashboard');
                        }, 1500);
                    })
                    // handle error
                    .catch(function(data) {
                        console.log(data);
                        $scope.infoType = 'red';
                        $scope.info = data.statusText;
                        if (data.data.err && data.data.err.message) {
                            $scope.info += data.data.err.message;
                        }
                        handleSignInFlag = true;
                    });
            } else {
                handleSignInFlag = true;
            }
        }
    }

    function validateInfo() {
        var ret = true;
        var err = "Error "
        if ($scope.pass.length < 8) {
            err += " - Short Pass : min 8 char";
            ret = false;
        }
        if (!validateEmail($scope.email)) {
            err += " - Invalid Email";
            ret = false;
        }
        $scope.infoType = 'red';
        $scope.info = err;
        return ret;
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}