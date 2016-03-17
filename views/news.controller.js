(function() {
    'use strict';

    angular
        .module('cofasa')
        .controller('NewsController', NewsController);


    NewsController.$inject = ['$scope', '$location', '$rootScope', '$sce', 'NewsService'];
    angular
        .module('cofasa').filter("sanitize", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }]);
    function NewsController($scope, $location, $rootScope, $sce, NewsService) {

        console.log('NewsController start');

        $scope.news = [];

        var date = new Date();

        NewsService.getNews(date).then(
            function(news) {

                for(var i=0; i<news.length; i++) {

                    var photo = news[i].get('photo') ? news[i].get('photo').url() : '';
                    var title = news[i].get('title');
                    var text = news[i].get('text');
                    var description = news[i].get('description');
                    var date = new Date(news[i].get('date'));

                    $scope.news.push(
                        {
                            type: 'news',
                            title: title,
                            photo: photo,
                            text: text,
                            dateEnd: date
                        }
                    );
                }

                console.log($scope.news);
            },
            function(error) {

            }
        );

    }
})();