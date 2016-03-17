(function() {
    'use strict';

    angular
        .module('cofasa')
        .factory('NewsService', NewsService);

    NewsService.$inject = ['$q'];

    function NewsService($q) {
        var service = {};

        // Get news
        service.getNews = function(date) {

            var deferred = $q.defer();

            var allResult = [];

            function getAllRecords(loopCount) {
                var limit = 1000;

                var queryNews = new Parse.Query('News');

                queryNews.limit(limit);
                queryNews.skip(limit * loopCount);

                queryNews.lessThanOrEqualTo('date', date);
                queryNews.ascending("createdAt");

                queryNews.find({
                    success: function(results) {
                        console.log('getNews result: ' + results.length);

                        if (results.length > 0) {
                            allResult = allResult.concat(results);
                            loopCount++;
                            getAllRecords(loopCount);
                        }
                        else {
                            deferred.resolve(allResult);
                        }
                    },
                    error: function(error) {
                        console.log('Error query : ' + error.message);
                        deferred.reject(error);
                    }
                });
            }

            getAllRecords(0);

            return deferred.promise;
        }



        return {
            getNews: service.getNews
        }
    }
})();