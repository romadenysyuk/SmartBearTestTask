/**
 * Created by Roman on 01.10.2015.
 */

'use strict';

/**
 * Directive that implements sorting when clicking on a table header
 */
angular.module('customSort', ['helper'])
    .directive('customSort', function(helper) {
        return {
            restrict: 'A',
            transclude: true,
            // we could implement the directive using an isolated scope but in that case we would need to pass all parameters
            // through attributes which is not so convenient. But template in that case would be a little simpler.
            /*scope: {
                order: '=',
                sort: '=',
                editedItem: '@',
                sortItems: '@'
            },*/
            //template: '<div ng-transclude ng-class="selectedCls(order)" ng-click="sortBy(order)"></div>',
            template: function(tElement, tAttrs) {
                return helper.format('<div ng-transclude ng-class="selectedCls(\'{0}\')" ng-click="sortBy(\'{0}\')"></div>', tAttrs.order);
            },
            link: function(scope, elem, attr, ngModel) {
                /**
                 * Sort by chosen field name
                 *
                 * @param {string} order - chosen field name for sorting
                 */
                scope.sortBy = function(order) {
                    var sort = scope.sort;

                    // if we are already editing some record
                    if (scope.editedItem) {
                        return;
                    }

                    if (sort.sortingOrder == order) {
                        sort.reverse = !sort.reverse;
                    }

                    sort.sortingOrder = order;
                    scope.sortItems();
                };

                /**
                 * Get class name for table header that will indicate the sorting order - direct, reverse or none
                 *
                 * @param {string} order - chosen field name for sorting
                 * @returns {string} - class name
                 */
                scope.selectedCls = function(order) {
                    if (order == scope.sort.sortingOrder) {
                        return ('sort-' + ((scope.sort.reverse) ? 'desc' : 'asc'));
                    } else {
                        return '';
                    }
                };
            }
        }
    });