'use strict';

angular.module('signup')
    .run(Run);

function Run(routerHelper) {
    routerHelper.configureStates(getSignUpStates());
}

function getSignUpStates() {
    return [
        {
            state: 'signup',
            config: {
                controller: SignUpController,
                templateUrl: 'app/js/signup/signup.html',
                url: '/signup',
                access: {
                    restricted: false
                }
            }
        },
        {
            state: 'signin',
            config: {
                controller: SignInController,
                templateUrl: 'app/js/signup/signin.html',
                url: '/signin',
                access: {
                    restricted: false
                }
            }
        }
    ];
}