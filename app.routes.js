/**
 * Created by tferguson on 05/03/2015.
 */

(function() {

    'use strict';

    angular.module('MeetingRoomInterface')
        .config(function ($routeProvider) {

            $routeProvider
                .when('/', {
                    templateUrl: 'charts/chart.html',
                    controller: 'MainCtrl'
                })
                .otherwise({
                    redirectTo: '/'
                });
        });
})();
