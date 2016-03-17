(function() {
    'use strict';

    angular
        .module('cofasa')
        .factory('MapService', MapService);

    MapService.$inject = ['$q'];

    function MapService($q) {
        var service = {};

        // Get pharmacies
        service.getPharmacies = function(boundsNorm, keyword) {

            var deferred = $q.defer();

            var allResult = [];

            function getAllRecords(loopCount) {
                var limit = 1000;

                var queryPharmacy = new Parse.Query("Pharmacy");

                queryPharmacy.limit(limit);
                queryPharmacy.skip(limit * loopCount);

                queryPharmacy.greaterThanOrEqualTo("latitude", boundsNorm.southwest.lat);
                queryPharmacy.lessThanOrEqualTo("latitude", boundsNorm.northeast.lat);
                queryPharmacy.greaterThanOrEqualTo("longitude", boundsNorm.southwest.lng);
                queryPharmacy.lessThanOrEqualTo("longitude", boundsNorm.northeast.lng);

                if (keyword != '') {
                    queryPharmacy.contains("name", keyword);
                }

                queryPharmacy.ascending("objectId");

                queryPharmacy.find({
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
            getPharmacies: service.getPharmacies
        }
    }
})();