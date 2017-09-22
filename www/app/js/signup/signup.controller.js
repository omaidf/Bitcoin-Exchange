'use strict';
angular.module('signup')
    .controller('SignUpController', SignUpController);

function SignUpController($scope, $state, $timeout, authService) {
    $scope.name = "";
    $scope.email = authService.getUserId();
    $scope.pass = "";
    $scope.infoType = "green";
    $scope.info = "";

    var handleSignUpFlag = true;

    $scope.handleSignUp = function() {
        if (handleSignUpFlag) {
            handleSignUpFlag = false;
            var result = validateInfo();
            if (result) {
                $scope.infoType = 'green';
                $scope.info = "Creating Wallet...";
                var data = {
                    'name': $scope.name,
                    'email': $scope.email,
                    'pass': $scope.pass
                }
                authService.register(data)
                    // handle success
                    .then(function(data, status) {
                        console.log(data);
                        $scope.infoType = 'green';
                        $scope.info = 'Successfully signed up!';
                        authService.setUserId($scope.email);
                        $timeout(function() {
                            handleSignUpFlag = true;
                            $state.go('signin');
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
                        handleSignUpFlag = true;
                    });
            } else {
                handleSignUpFlag = true;
            }
        }
    }

    function validateInfo() {
        var ret = true;
        var err = "Error "
        // validate name
        if ($scope.name.length < 5) {
            err += " - Short Name : min 5 char";
            ret = false;
        }
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