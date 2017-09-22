'use strict';
angular.module('dashboard')
    .factory('bCService', bCService);

function bCService($q, $http) {
    return ({
        getBCExchangeRate: getBCExchangeRate,
        getBCBalance: getBCBalance,
        getTransactions: getTransactions,
        getUserInfo: getUserInfo,
        sendFunds: sendFunds,
        reqFunds: reqFunds,
        getFeed: getFeed
    });

    function getFeed() {
        var deferred = $q.defer();
        $http.get('/user/getfeeds')
            .then(function(successResponse) {
                if (successResponse.status === 200) {
                    console.log(successResponse);
                    deferred.resolve(successResponse.data);
                } else {
                    deferred.reject("Error Fetching");
                }
            }, function(errResponse) {
                deferred.reject("Error Fetching");
            });
        return deferred.promise;
    }
    function getBCExchangeRate() {
        var deferred = $q.defer();
        $http.post('https://blockchain.info/ticker')
            .then(function(successResponse) {
                if (successResponse.status === 200) {
                    console.log(successResponse);
                    deferred.resolve(successResponse.data);
                } else {
                    deferred.reject("Error Fetching");
                }
            }, function(errResponse) {
                deferred.reject("Error Fetching");
            });
        return deferred.promise;
    }
    function getBCBalance() {
        var deferred = $q.defer();
        $http.get('/user/getBCBalance')
            .then(function(successResponse) {
                if (successResponse.status === 200) {
                    console.log(successResponse);
                    deferred.resolve(successResponse.data);
                } else {
                    deferred.reject();
                }
            }, function(errResponse) {
                deferred.reject();
            });
        return deferred.promise;
    }
    function getTransactions() {
        var deferred = $q.defer();
        $http.get('/user/transactions')
            .then(function(successResponse) {
                if (successResponse.status === 200) {
                    console.log(successResponse);
                    deferred.resolve(successResponse.data.data);
                } else {
                    deferred.reject();
                }
            }, function(errResponse) {
                deferred.reject();
            });
        return deferred.promise;
    }
    function getUserInfo() {
        var deferred = $q.defer();
        $http.get('/user/info')
            .then(function(successResponse) {
                if (successResponse.status === 200) {
                    console.log(successResponse);
                    deferred.resolve(successResponse.data.data);
                } else {
                    deferred.reject();
                }
            }, function(errResponse) {
                deferred.reject();
            });
        return deferred.promise;
    }
    function sendFunds(dest, amount) {
        var deferred = $q.defer();
        $http.post('/user/sendfunds', {
            sendAddress: dest,
            sendAmount: amount
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                console.log(successResponse);
                deferred.resolve(successResponse.data.data);
            } else {
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }

    function reqFunds(email, amount) {
        var deferred = $q.defer();
        $http.post('/user/reqfunds', {
            reqAddress: email,
            reqAmount: amount
        }).then(function(successResponse) {
            if (successResponse.status === 200) {
                console.log(successResponse);
                deferred.resolve(successResponse.data.data);
            } else {
                deferred.reject(successResponse);
            }
        }, function(errResponse) {
            deferred.reject(errResponse);
        });
        return deferred.promise;
    }
}