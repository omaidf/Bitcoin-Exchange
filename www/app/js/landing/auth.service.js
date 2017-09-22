'use strict';
angular.module('landing')
    .factory('authService', authService);

function authService($q, $timeout, $http) {
    var user = null;
    var userId = null;

    return ({
        setUserId: setUserId,
        getUserId: getUserId,
        isLoggedIn: isLoggedIn,
        getUserStatus: getUserStatus,
        login: login,
        logout: logout,
        register: register,
        changeName: changeName,
        changePhone: changePhone,
        changePass: changePass
    });

    function setUserId(id) {
        userId = id;
    }

    function getUserId() {
        return userId;
    }

    function isLoggedIn() {
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    function getUserStatus() {
        return $http.get('/user/status')
            // handle success
            .success(function(data) {
                if (data.status) {
                    user = true;
                } else {
                    user = false;
                }
            })
            // handle error
            .error(function(data) {
                user = false;
            });
    }

    function login(data) {
        // create a new instance of deferred
        var deferred = $q.defer();
        $http.post('/user/login', {
            username: data.email,
            password: data.pass
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                user = true;
                deferred.resolve(successResponse);
            } else {
                user = false;
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            user = false;
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();
        $http.get('/user/logout')
            .then(function(successResponse) {
                user = false;
                deferred.resolve(successResponse);
            }, function(errResponse) {
                user = false;
                deferred.reject(errResponse);
            });
        return deferred.promise;
    }

    function register(data) {
        var deferred = $q.defer();
        $http.post('/user/register', {
            name: data.name,
            username: data.email,
            password: data.pass
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                deferred.resolve(successResponse);
            } else {
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }
    function changeName(name) {
        var deferred = $q.defer();
        $http.post('/user/changename', {
            name: name
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                deferred.resolve(successResponse);
            } else {
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }
    function changePhone(phone) {
        var deferred = $q.defer();
        $http.post('/user/changephone', {
            phone: phone
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                deferred.resolve(successResponse);
            } else {
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }
    function changePass(newPass) {
        var deferred = $q.defer();
        $http.post('/user/changepass', {
            newPass: newPass
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                deferred.resolve(successResponse);
            } else {
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }
}