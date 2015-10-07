/**
 * Created by Roman on 01.10.2015.
 */

'use strict';

/**
 * Localization module
 */
angular.module('localeEnUs', [], ['$provide', function($provide) {
    $provide.value('providedValue', {
        userList: 'User list',
        discardingChangesPrompt: 'You are editing a user record. Do you want to cancel changes and proceed?',
        deleteUserPrompt: 'Are you sure you want to delete the user {0} {1}?',
        revertChangedPrompt: 'Are you sure you want to cancel changes?',
        beforeUnloadPrompt: 'You have not saved the changes. Do you really want to proceed?'
    });
}]);