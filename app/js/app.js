'use strict';

/* App Module */

var stavrApp = angular.module('stavrApp', [
  'ngRoute',
  'angularCSS',
  'ui.bootstrap',
  'phonecatAnimations',
  'stavrControllers',
  'phonecatFilters',
  'stavrServices',
  'stavrDirectives'

]);

stavrApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.

      when('/overview', {
        templateUrl: '../Main.html',
        controller:'ViewCtrl'
      }).
      when('/overview/view1', {
        // templateUrl:'../MainView1.html',
        templateUrl:'../view1.html',
        controller:'View1Ctrl',
        css:'lib/ALTE/datatables/dataTables.bootstrap.css'
      }).
      when('/overview/view2', {
         templateUrl:'../MainView2.html',
         controller:'View2Ctrl'
      }).
      when('/setting', {
         templateUrl: '../setting.html',
        controller:'SettingCtrl'
      }).
      when('/dashboard', {
        templateUrl: '../dashboard.html',
        controller:'InfoTableCtrl'
      }).
      when('/CrossFilter',{
          //templateUrl: '../CrossFilter.html',
          templateUrl: '../WeatherOD.html',
          controller:'CrossFilterCtrl',
          css:'css/crossFilter.css'
      }).
      when('/ClusterAnalysis',{
        templateUrl: '../LinkingtoSlickGrid.html',
        controller: 'ClusterAnalyticsCtrl'
      }).
      when('/ODPattern',{
        templateUrl:'../WeatherOD.html',
        controller: 'CrossFilterCtrl',
        css:'css/crossFilter.css'
      }).
      when('/EventsRelationVA',{
         templateUrl:'../EventsRelation.html',
         controller: 'EventsRelationVACtrl'
      }).
      when('/help', {
        templateUrl: '../help.html',
        controller:'HelpCtrl'
      }).
      otherwise({
        redirectTo: '/overview/view1'
       });
  }]);


// stavrApp.run(function($rootScope, $location, $anchorScroll) {
//   //when the route is changed scroll to the proper element.
//   $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
//     if($location.hash()) $anchorScroll();
//   });
// });