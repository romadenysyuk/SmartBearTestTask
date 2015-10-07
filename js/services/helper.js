/**
 * Created by Roman on 01-Oct-15.
 */

'use strict';

/**
 * Service that provides various helper methods
 */
angular.module('helper', [])
    .factory('helper', function() {
        return {
            /**
             * Generate unique GUID
             *
             * @returns {string}
             */
            guid: function() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            },
            /**
             * Formatting parameterized string
             *
             * @returns {string}
             */
            format: function() {
                var s = arguments[0];

                for (var i = 0; i < arguments.length - 1; i++) {
                    var reg = new RegExp("\\{" + i + "\\}", "gm");
                    s = s.replace(reg, arguments[i + 1]);
                }

                return s;
            }
        };
    });