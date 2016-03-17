(function() {
    'use strict';

    angular
        .module('cofasa')
        .controller('PromotionController', PromotionController);

    PromotionController.$inject = ['$scope', '$location', '$rootScope', 'PromotionService'];

    function PromotionController($scope, $location, $rootScope, PromotionService) {

        // Current user's position
        $scope.userLat = 9.9766;
        $scope.userLng = -84.0071;

        $scope.initPromotions = function() {

            // Active promotions
            $scope.activePromotions = [];

            $scope.getPromosions();
        }

        $scope.getPromosions = function() {
            var date = new Date();

            PromotionService.getActivePromotions(date).then(
                function(promotions) {

                    for(var i=0; i<promotions.length; i++) {

                        var pharmacy = promotions[i].get('pharmacy');

                        var pharmacyName = pharmacy.get('name');
                        var pharmacyLat = pharmacy.get('latitude');
                        var pharmacyLng = pharmacy.get('longitude');

                        var title = promotions[i].get('title');
                        var photo = promotions[i].get('photo') ? promotions[i].get('photo').url() : '';
                        var description = promotions[i].get('description');
                        var dateInit = new Date(promotions[i].get('dateInit'));
                        var dateEnd = new Date(promotions[i].get('dateEnd'));

                        $scope.activePromotions.push({
                            pharmacyName: pharmacyName,
                            pharmacyLat: pharmacyLat,
                            pharmacyLng: pharmacyLng,
                            photo: photo,
                            title: title,
                            description: description,
                            dateInit: dateInit,
                            dateEnd: dateEnd
                        });
                    }
                },
                function(error) {

                }
            );
        }

        $scope.goWaze = function(lat, lng) {
            WazeLink.open('waze://?ll='+lat+','+lng);
        }

        $scope.initPromotions();

    }
})();