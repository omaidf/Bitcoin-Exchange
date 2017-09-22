'use strict';

angular.module('landing')
    .run(Run);

function Run(routerHelper) {
    routerHelper.configureStates(getLandingStates(), '/');
}

function getLandingStates() {
    return [
        {
            state: 'landing',
            config: {
                controller: LandingController,
                templateUrl: 'app/js/landing/landing.html',
                url: '/',
                access: {
                    restricted: false
                }
            }
        },
        {
            state: 'help',
            config: {
                controller: HelpController,
                templateUrl: 'app/js/landing/help.html',
                url: '/help',
                access: {
                    restricted: false
                }
            }
        }
    ];
}