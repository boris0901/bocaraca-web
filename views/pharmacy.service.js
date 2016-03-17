(function() {
    'use strict';

    angular
        .module('cofasa')
        .factory('PharmacyService', PharmacyService);

    PharmacyService.$inject = ['$q'];

    function PharmacyService($q) {
        var service = {};

        // Get pharmacy
        service.getPharmacy = function(id) {

            var deferred = $q.defer();

            var queryPharmacy = new Parse.Query('Pharmacy');
            queryPharmacy.include('plans');

            queryPharmacy.get(id, {
                success: function(pharmacy) {
                    console.log('Got pharmacy');
                    deferred.resolve(pharmacy);
                },
                error: function(object, error) {
                    console.log('Error query: ' + error.message);
                    deferred.reject(error);
                }
            });

            return deferred.promise;
        }

        // Add a row to PharmacyVisited
        service.savePharmacyVisited = function(user, pharmacy) {

            var deferred = $q.defer();

            var PharmacyVisited = Parse.Object.extend('PharmacyVisited');
            var pharmacyVisited = new PharmacyVisited();

            pharmacyVisited.set('user', user);
            pharmacyVisited.set('pharmacy', pharmacy);

            pharmacyVisited.save(null, {
                success: function(pharmacyVisited) {
                    console.log('New record added into PharmacyVisited');
                    deferred.resolve(pharmacyVisited);
                },
                error: function(pharmacyVisited, error) {
                    console.log('Failed to create new object, with error: ' + error.message);
                    deferred.reject(error);
                }
            });

            return deferred.promise;
        }

        // Get all active plans
        service.getActivePlans = function(date) {

            var deferred = $q.defer();

            var allResult = [];

            function getAllRecords(loopCount) {
                var limit = 1000;

                var queryPlan = new Parse.Query('Plan');

                queryPlan.limit(limit);
                queryPlan.skip(limit * loopCount);

                queryPlan.lessThan('dateInit', date);
                queryPlan.greaterThan('dateEnd', date);
                queryPlan.equalTo('active', true);

                queryPlan.find({
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

        // Get active promotions
        service.getActivePromotions = function(pharmacy, date) {

            var deferred = $q.defer();

            var allResult = [];

            function getAllRecords(loopCount) {
                var limit = 1000;

                var queryOffersToUsers = new Parse.Query('OffersToUsers');

                queryOffersToUsers.limit(limit);
                queryOffersToUsers.skip(limit * loopCount);

                queryOffersToUsers.equalTo('pharmacy', pharmacy);
                queryOffersToUsers.lessThan('dateInit', date);
                queryOffersToUsers.greaterThan('dateEnd', date);
                queryOffersToUsers.equalTo('active', true);

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
            getPharmacy: service.getPharmacy,
            savePharmacyVisited: service.savePharmacyVisited,
            getActivePlans: service.getActivePlans,
            getActivePromotions: service.getActivePromotions
        }
    }
})();