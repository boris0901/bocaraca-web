(function() {
    'use strict';

    angular
        .module('cofasa')
        .factory('PromotionService', PromotionService);

    PromotionService.$inject = ['$q'];

    function PromotionService($q) {
        var service = {};

        // Get active promotions
        service.getActivePromotions = function(date) {

            var deferred = $q.defer();

            var allResult = [];

            function getAllRecords(loopCount) {
                var limit = 1000;

                var queryOffersToUsers = new Parse.Query('OffersToUsers');

                queryOffersToUsers.limit(limit);
                queryOffersToUsers.skip(limit * loopCount);

                queryOffersToUsers.lessThan('dateInit', date);
                queryOffersToUsers.greaterThan('dateEnd', date);
                queryOffersToUsers.equalTo('active', true);

                queryOffersToUsers.include('pharmacy');

                queryOffersToUsers.find({
                    success: function(results) {
                        console.log('Query result: ' + results.length);

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
            getActivePromotions: service.getActivePromotions
        }
    }
})();