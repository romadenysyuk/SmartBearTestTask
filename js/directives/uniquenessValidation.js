/**
 * Created by Roman on 30.09.2015.
 */

'use strict';

/**
 *  Directive for checking uniqueness of the record field.
 */
angular.module('uniquenessValidation', [])
    .directive('unique', function() {
        return {
            require: 'ngModel',
            link: function(scope, elem, attr, ngModel) {
                scope.$watch(attr.ngModel, function() {
                    // get the field name for which we need to check a uniqueness
                    var fieldName = attr.unique;

                    // add a validator for the filed we need to check a uniqueness for
                    ngModel.$parsers.unshift(function(value) {
                        var valid = scope.isUnique(fieldName, value, scope.item.id);
                        ngModel.$setValidity('unique', valid);

                        return valid ? value : undefined;
                    });
                });
            }
        }
    });