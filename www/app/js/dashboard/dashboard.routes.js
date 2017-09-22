'use strict';

angular.module('dashboard')
    .run(Run);

function Run(routerHelper) {
    routerHelper.configureStates(getDashboardStates(), '');

}

function getDashboardStates() {
    return [
        {
            state: 'dashboard',
            config: {
                controller: DashboardController,
                templateUrl: 'app/js/dashboard/dashboard.html',
                url: '/dashboard',
                access: {
                    restricted: true
                }
            }
        }
    ];
}