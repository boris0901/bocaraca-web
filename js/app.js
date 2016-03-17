(function () {
    angular.module('cofasa', [
            'ui.router',
            'ui.bootstrap',
            'ui.map'
        ])
        .run(['$rootScope', function($rootScope) {

            Parse.initialize("QcsvayzZXIOvjqdebxOBsYe7SVNJSiAZFM6PvgAl", "SBe5wQOmBGGHbcs80QP1blU6XSo4ueqtMelCIJAS");
            $rootScope.sessionUser = Parse.User.current();

        }])
})();