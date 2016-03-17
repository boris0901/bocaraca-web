function clickDetail () {

    angular.element(document.getElementById('map_div')).scope().showDetail();
}

(function() {
    'use strict';

    angular
        .module('cofasa')
        .controller('MapController', MapController);

    MapController.$inject = ['$scope', '$location', '$rootScope', 'MapService', 'PharmacyService'];


    function MapController($scope, $location, $rootScope, MapService, PharmacyService) {

        console.log('MapController start');

        $scope.pharmacyMap = null;
        $scope.info_window = null;
        $scope.showLeftPanel = false;

        $scope.search = {
            keyword: ''
        };

        // Google map marker
        var marker_blue_image = {
            url: 'img/map-pin-blue.png',
            size: new google.maps.Size(41, 44),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 44)
        };

        var marker_yellow_image = {
            url: 'img/map-pin-yellow.png',
            size: new google.maps.Size(41, 44),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 44)
        };

        $scope.markers = [];
        $scope.infos = [];

        $scope.mapOptions = {
            zoom: 14,
            center: new google.maps.LatLng(9.9766, -84.0071),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Pharmacy left panel info
        var pharmacyServices = [
            "Consulta Farmacéutica",
            "Despacho de recetas",
            "Toma de Presión",
            "Inyectables",
            "Servicio Express",
            "Pago de Servicios Públicos",
            "Recargas Télefonicas"
        ];

        $scope.dayOfWeek = [
            "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
        ];

        $scope.activePlans = [];
        $scope.activePromotions = [];
        $scope.schedule = [];
        $scope.services = [];

        $scope.markerExists = function(lat, lng) {
            var exists = false;

            for(var i = 0; i < $scope.markers.length; i++){
                var marker_lat = $scope.markers[i].getPosition().lat();
                var marker_lng = $scope.markers[i].getPosition().lng();

                if(marker_lat === lat && marker_lng === lng){
                    exists = true;
                }
            }

            return exists;
        }

        $scope.idleMap = function() {
            console.log('Map Idle ...');

            google.maps.event.trigger($scope.pharmacyMap, 'resize');
            $scope.loadMarkers();

        }

        $scope.openMarkerInfo = function (event, marker) {
            console.log('openMarkerInfo');

            $scope.$apply();

            $scope.info_photo = '#';
            $scope.info_name = '';
            $scope.info_address = '';

            $scope.currentMarker = marker;
            $scope.currentMarkerLat = marker.getPosition().lat();
            $scope.currentMarkerLng = marker.getPosition().lng();
            $scope.currentMarkerIndex = -1;

            // get pharmacy info
            for(var i=0; i<$scope.markers.length; i++) {
                if ($scope.markers[i] == marker) {
                    console.log('marker match..');

                    $scope.currentMarkerIndex = i;

                    $scope.info_photo = $scope.infos[i].photo;
                    $scope.info_name = $scope.infos[i].name;
                    $scope.info_address = $scope.infos[i].address;

                    $scope.currentPharmacyId = $scope.infos[i].id;
                    break;
                }
            }

            if ($scope.info_window) {
                $scope.info_window.close();
            }

            $scope.info_window.open($scope.pharmacyMap, marker);
        };

        $scope.showDetail = function() {
            console.log('Marker Index: ' + $scope.currentMarkerIndex);
            $scope.showLeftPanel = true;
            $scope.initPharmacy();
        }

        // Load markers
        $scope.loadMarkers = function() {

            var center = $scope.pharmacyMap.getCenter();
            var bounds = $scope.pharmacyMap.getBounds();
            var zoom = $scope.pharmacyMap.getZoom();

            //Convert objects returned by Google to be more readable
            var centerNorm = {
                lat: center.lat(),
                lng: center.lng()
            };

            var boundsNorm = {
                northeast: {
                    lat: bounds.getNorthEast().lat(),
                    lng: bounds.getNorthEast().lng()
                },
                southwest: {
                    lat: bounds.getSouthWest().lat(),
                    lng: bounds.getSouthWest().lng()
                }
            };

            // Get pharmacies
            MapService.getPharmacies(boundsNorm, $scope.search.keyword).then(
                function(pharmacies) {
                    for (var i=0; i<pharmacies.length; i++) {

                        var lat = pharmacies[i].get('latitude');
                        var lng = pharmacies[i].get('longitude');

                        // Check if the marker has already been added
                        if (! $scope.markerExists(lat, lng)) {

                            var markerType = 0;
                            var markerIcon;

                            if (markerType == 0) {
                                markerIcon = marker_blue_image;
                            }
                            else {
                                markerIcon = marker_yellow_image;
                            }

                            // Add the marker to the map
                            var marker = new google.maps.Marker({
                                map: $scope.pharmacyMap,
                                position: new google.maps.LatLng(lat, lng),
                                icon: markerIcon
                            });

                            $scope.markers.push(marker);

                            var info_window_data = {
                                id: pharmacies[i].id,
                                name: pharmacies[i].get('name'),
                                photo: (pharmacies[i].get('photo')) ? pharmacies[i].get('photo').url():'',
                                address: pharmacies[i].get('address') + ', ' + pharmacies[i].get('distrito') + ', ' + pharmacies[i].get('canton')
                            };

                            $scope.infos.push(info_window_data);
                        }
                    }
                },
                function(error) {

                }
            );
        }

        $scope.initPharmacy = function() {
            $scope.activePlans = [];
            $scope.activePromotions = [];
            $scope.schedule = [];
            $scope.services = [];

            PharmacyService.getPharmacy($scope.currentPharmacyId).then(
                function(pharmacy) {
                    $scope.pharmacy = pharmacy;

                    $scope.photo = $scope.pharmacy.get('photo') ? $scope.pharmacy.get('photo').url() : '';
                    $scope.name = $scope.pharmacy.get('name');
                    $scope.distrito = $scope.pharmacy.get('distrito');
                    $scope.canton = $scope.pharmacy.get('canton');
                    $scope.provincia = $scope.pharmacy.get('provincia');
                    $scope.phone = $scope.pharmacy.get('phone');
                    $scope.phone2 = $scope.pharmacy.get('phone2');

                    // Schedule
                    var weekTime = $scope.pharmacy.get('openHours');

                    for(var i=0; i<7; i++) {
                        var startTime = weekTime[i*2];
                        var closeTime = weekTime[i*2 + 1];

                        $scope.schedule.push({
                            startTime: startTime,
                            closeTime: closeTime
                        });
                    }

                    // Service
                    var services = $scope.pharmacy.get('services');

                    for(var i=0; i<7; i++) {
                        if (services[i] == true) {
                            $scope.services.push(pharmacyServices[i]);
                        }
                    }

                    // Get current date
                    var date = new Date();

                    // Get active plans
                    var plans = $scope.pharmacy.get('plans');

                    if (plans !== undefined && plans != null) {

                        for(var i=0; i<plans.length; i++) {
                            var dateInit = new Date(plans[i].get('dateInit'));
                            var dateEnd = new Date(plans[i].get('dateEnd'));
                            var active = plans[i].get('active');

                            if (active == true && dateInit < date && dateEnd > date) {
                                var photo = (plans[i].get('photo')) ? plans[i].get('photo').url() : '';
                                var title = plans[i].get('title');
                                var description = plans[i].get('description');

                                $scope.activePlans.push({
                                    photo: photo,
                                    title: title,
                                    description: description,
                                    dateInit: dateInit,
                                    dateEnd: dateEnd
                                });
                            }
                        }
                    }

                    // Get active promotions for this pharmacy
                    PharmacyService.getActivePromotions($scope.pharmacy, date).then(
                        function(promotions) {
                            for (var i=0; i<promotions.length; i++) {

                                var photo = promotions[i].get('photo') ? promotions[i].get('photo').url() : '';
                                var title = promotions[i].get('title');
                                var description = promotions[i].get('description');
                                var dateInit = new Date(promotions[i].get('dateInit'));
                                var dateEnd = new Date(promotions[i].get('dateEnd'));

                                $scope.activePromotions.push({
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
                },
                function(error) {

                }
            );
        }

        $scope.$on('$viewContentLoaded', function() {
            // Init
        });

    }

})();