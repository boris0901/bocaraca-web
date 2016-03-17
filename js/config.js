function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/map");
    $stateProvider
        .state('map', {
            url: "/map",
            templateUrl: "views/map.template.html",
            controller: "MapController",
            data: { pageTitle: 'Map' }
        })

        .state('promotion', {
            url: "/promotion",
            templateUrl: "views/promotion.template.html",
            controller: "PromotionController",
            data: { pageTitle: 'Promotion' }
        })

        .state('news', {
            url: "/news",
            templateUrl: "views/news.template.html",
            controller: "NewsController",
            data: { pageTitle: 'News' }
        })
}
angular
    .module('cofasa')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });