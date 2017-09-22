'use strict';
angular.module('signup')
    .factory('signup', signup)
    .run(connect);

function connect (signup) {
    signup.set('');
}

function signup() {

    var count = 2;
    var name = "Turnkey Bitcoin Exchange";

    var service = {
        'get': get,
        'set': set,
    };
    return service;

    function get() {
        return name;
    }

    function set(item) {
        name = item;
    }

}