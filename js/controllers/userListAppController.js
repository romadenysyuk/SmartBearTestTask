/**
 * Created by Roman on 28.09.2015.
 */

'use strict';

/**
 * User list controller
 */
angular.module('userListController', [])
    .controller('userListController', ['$scope', '$http', '$filter', 'providedValue', 'helper',
        function($scope, $http, $filter, providedValue, helper) {
            var dateFormat = 'MM/dd/yyyy hh:mm:ss a',
                attrsToSearchIn = {
                    // attribute name:  search strategy
                    'lastName':         'string',
                    'firstName':        'string',
                    'age':              'string',
                    'email':            'string',
                    'created':          'date',             // for dates we are searching not in timestamp, but in a date presentation
                    'lastEdited':       'date'
                };

            $scope.sort = {
                sortingOrder : 'lastName',
                reverse : false
            };
            $scope.query = '';                          // filter phrase
            $scope.items = [];                          // all items
            $scope.filteredItems = [];                  // items that meet the filter phrase
            $scope.pageItems = [];                      // items that constitute the current page
            $scope.itemsPerPage = 10;
            $scope.currentPage = 0;
            $scope.editedItem = null;                   // item being edited

            // handler for navigating away/reloading/closing browser tab
            $(window).on('beforeunload', function() {
                if ($scope.editedItem) {
                    return providedValue.beforeUnloadPrompt;
                }
            });

            // get user list from json file
            $http.get('data/userList.json').then(function(res) {
                $scope.items = res.data;

                // process the data for display
                $scope.search();
            });

            /**
             * Filter items by entered phrase
             */
            $scope.search = function() {
                // if search phrase is not empty
                if ($scope.query !== '') {
                    // filter items
                    $scope.filteredItems = $filter('filter')($scope.items, function(item) {
                        for (var attr in attrsToSearchIn) {
                            if (item.hasOwnProperty(attr) && item[attr] !== undefined) {
                                // for dates we are searching not in timestamp, but in a date presentation
                                var haystack = attrsToSearchIn[attr] === 'date' ? $filter('date')(item[attr], dateFormat).toLowerCase() : item[attr].toString().toLowerCase();

                                if (haystack.indexOf($scope.query.toString().toLowerCase()) !== -1) {
                                    return true;
                                }
                            }
                        }

                        return false;
                    });
                } else { // if search phrase is empty
                    $scope.filteredItems = $scope.items;
                }

                $scope.sortItems();
            };

            /**
             * Sort items
             */
            $scope.sortItems = function() {
                if ($scope.sort.sortingOrder !== '') {
                    $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
                }

                resetCurrentPage();
            };

            /**
             * Reset pagination to the first page
             */
            var resetCurrentPage = function() {
                $scope.currentPage = 0;
                calculatePageItems();
            };

            /**
             *  Build a page
             */
            var calculatePageItems = function() {
                $scope.pageItems = $scope.filteredItems.slice($scope.getPageFirstItemIndex() - 1, $scope.getPageLastItemIndex());
            };

            /**
             * Get index of the first item of the page we need to show
             *
             * @returns {number} - index of the first item of the page we need to show
             */
            $scope.getPageFirstItemIndex = function() {
                return Math.min($scope.currentPage * $scope.itemsPerPage + 1, $scope.filteredItems.length);
            };

            /**
             * Get index of the last item of the page we need to show
             *
             * @returns {number} - index of the last item of the page we need to show
             */
            $scope.getPageLastItemIndex = function() {
                return Math.min($scope.getPageFirstItemIndex() + $scope.itemsPerPage - 1, $scope.filteredItems.length)
            };

            /**
             * Get total page count
             *
             * @returns {number} - page count
             */
            $scope.getPageCount = function() {
                return Math.ceil($scope.filteredItems.length / $scope.itemsPerPage);
            };

            /**
             * Go to previous page
             */
            $scope.prevPage = function() {
                if ($scope.currentPage > 0) {
                    checkForEditingMode().done(function() {
                        $scope.currentPage--;
                        calculatePageItems();
                    });
                }
            };

            /**
             * Go to the next page
             */
            $scope.nextPage = function() {
                if ($scope.currentPage < $scope.getPageCount() - 1) {
                    checkForEditingMode().done(function() {
                        $scope.currentPage++;
                        calculatePageItems();
                    });
                }
            };

            /**
             * Check if there is a record currently being edited. If there is ask the user if he wants to cancel
             * the changes before proceed with the requested action.
             *
             * @returns {promise}
             */
            var checkForEditingMode = function() {
                var deferred = $.Deferred();

                if ($scope.editedItem) {
                    // For the sake of simplicity we are asking the user if he wants to cancel the changes first instead of
                    // asking him if he wants to save the changes. Some operations (going to next/previous page, editing
                    // of of another row on the page) cannot be done after saving because we need to re-sort list and rebuild
                    // the pages. Can be improved by determining what options (canceling/saving) we have depending on
                    // the type of operation.
                    if (confirm(providedValue.discardingChangesPrompt)) {
                        revertItem();
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            };

            /**
             * Add new item at the to of the grid
             */
            $scope.addNewItem = function() {
                var newItem = {
                    id: undefined,
                    lastName: '',
                    firstName: '',
                    age: undefined,
                    email: '',
                    created: new Date().getTime(),
                    lastEdited: undefined,
                    active: false
                };

                $scope.pageItems.unshift(newItem);
                $scope.editItem(newItem);
            };

            /**
             * Initiate item editing. Grid record goes into inline edit mode.
             *
             * @param item - item to edit
             */
            $scope.editItem = function(item) {
                checkForEditingMode().done(function() {
                    $scope.editedItem = angular.copy(item);
                });
            };

            /**
             * Show delete item confirmation dialog
             *
             * @param item - item to delete
             */
            $scope.deleteItemDialog = function(item) {
                checkForEditingMode().done(function() {
                    if (confirm(helper.format(providedValue.deleteUserPrompt, item.lastName, item.firstName))) {
                        deleteItem(item.id);
                        $scope.search();
                    }
                });
            };

            /**
             * Delete item
             *
             * @param id - id of an item to delete
             */
            var deleteItem = function(id) {
                var itemIndex = getItemIndexById($scope.items, id);

                if (itemIndex !== -1) {
                    $scope.items.splice(itemIndex, 1);
                }
            };

            /**
             * Show revert item confirmation dialog
             */
            $scope.revertItemDialog = function() {
                if ($scope.editedItem) {
                    if (confirm(providedValue.revertChangedPrompt)) {
                        revertItem();
                    }
                } else {
                    revertItem();
                }
            };

            /**
             * Revert changes made to the item
             */
            var revertItem = function() {
                // if it is reverting of a new item
                if ($scope.editedItem.id === undefined) {
                    // delete first item from the list
                    $scope.pageItems.shift();
                }

                $scope.editedItem = null;
            };

            /**
             * Save item
             */
            $scope.saveItem = function() {
                var editedItem = $scope.editedItem;

                // if fields of record are not valid
                if ($scope.form.$invalid) {
                    return;
                }

                editedItem.lastEdited = new Date().getTime();

                // if it is saving of a new item
                if (editedItem.id === undefined) {
                    // generate new unique id
                    editedItem.id = helper.guid();

                    $scope.items.push(angular.copy(editedItem));
                } else { // if it is saving of existing item (editing)
                    updateItem($scope.items, editedItem);
                }

                $scope.editedItem = null;

                // reset data for display
                $scope.search();
            };

            /**
             * Update item
             *
             * @param array - array to update item in
             * @param item - edited item
             */
            var updateItem = function(array, item) {
                var itemIndex = getItemIndexById(array, item.id);
                array[itemIndex] = angular.copy(item);
            };

            /**
             * Check the uniqueness of the record field
             *
             * @param {string} fieldName - field name for which we need to check a uniqueness
             * @param value - record value which uniqueness we are checking
             * @param id - id of the record we want to exclude from comparing (in order to not compare the record with itself)
             *
             * @returns {boolean} - true if record value is unique, false otherwise
             */
            $scope.isUnique = function(fieldName, value, id) {
                return !$scope.items.some(function(item) {
                    return item[fieldName] === value && item.id !== id;
                });
            };

            /**
             * Localize a string
             *
             * @param value - string to localize
             *
             * @returns {string} - localized string
             */
            $scope.localize = function(value) {
                return providedValue[value];
            };

            /**
             * Get record index by provided record id
             *
             * @param array - array to look in
             * @param id - id of record we are looking for
             *
             * @returns {number} - index of record we are looking for
             */
            var getItemIndexById = function(array, id) {
                for (var i = 0, l = array.length; i < l; i++) {
                    if (array[i].id === id) {
                        return i;
                    }
                }

                return -1;
            };

            /**
             * Get the template of a table row for use in a ng-include directive.
             * There are two templates - one for a normal row and one for the row being edited.
             *
             * @param item - user record
             * @returns {string} - template to use in ng-include
             */
            $scope.getTemplate = function(item) {
                if ($scope.editedItem && item.id === $scope.editedItem.id) {
                    return 'templates/editItem.html';
                } else {
                    return 'templates/displayItem.html';
                }
            };
        }]);