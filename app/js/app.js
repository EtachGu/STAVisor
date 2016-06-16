'use strict';

/* App Module */

var stavrApp = angular.module('stavrApp', [
  'ngRoute',
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
        templateUrl:'../MainView1.html',
        controller:'View1Ctrl'
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
      when('/help', {
        templateUrl: '../help.html',
        controller:'HelpCtrl'
      }).
      otherwise({
        redirectTo: '/overview'
       });
  }]);
