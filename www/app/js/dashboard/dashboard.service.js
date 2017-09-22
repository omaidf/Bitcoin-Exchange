'use strict';
angular.module('dashboard')
    .factory('dashboard', dashboard)
    .run(connect);

function connect(dashboard) {
}

function dashboard() {

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