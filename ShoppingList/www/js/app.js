// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.factory('DAFactory', function(LSFactory) {



        return {
            post: function(item) {
                return LSFactory.setItem(item);
                //tempItems = LSFactory.getAll();

            },

            getAll: function() {
                return LSFactory.getAll();
                //return tempItems;

            },

            put: function(item) {
                LSFactory.updateItem(item);
                //tempItems = LSFactory.getAll();
                return;
            },

            delete: function(item) {

                LSFactory.delete(item);
                return;
                //tempItems = LSFactory.getAll();

            }
        };

    })
    .factory('LSFactory', function($window) {

        var tempItems = [];

        
        var getItemIndex = function(item) {
            for (var i = 0; i < tempItems.length; i++) {
                if (tempItems[i].id === item.id) {

                    return i;
                }
            }
        }

        return {
            updateItem: function(item) {
                
                var idx = getItemIndex(item);
                tempItems[idx] = item;
                if((tempItems && tempItems.length > 0) && !tempItems[0].lastId){
                  tempItems.splice(0, 0, {lastId: tempItems[tempItems.length - 1].id});
                }
                                
                return $window.localStorage.setItem("ShoppingList-listItems", JSON.stringify(tempItems));
            },

            setItem: function(item) {
                tempItems.splice(0, 0, {
                    lastId: item.id
                });
                tempItems.push(item);
                return $window.localStorage.setItem("ShoppingList-listItems", JSON.stringify(tempItems));
            },

            getAll: function() {

                tempItems = JSON.parse($window.localStorage.getItem("ShoppingList-listItems"));
                //console.log(tempItems);
                if (tempItems === null) {
                    tempItems = [];
                }
                return tempItems;
            },

            delete: function(item) {

                var idx = getItemIndex(item);
                tempItems.splice(idx, 1);
                if(tempItems && tempItems.length > 0){
                  tempItems.splice(0, 0, {lastId: tempItems[tempItems.length - 1].id});
                } else {
                  tempItems.splice(0, 0, {lastId: 0});
                }
                

                return $window.localStorage.setItem("ShoppingList-listItems", JSON.stringify(tempItems));

            }

        }


    })
    .controller('MyCtrl', function($scope, $ionicPopup, $ionicListDelegate, $cordovaLocalNotification, DAFactory) {
        $scope.data = {
            showDelete: false
        };
        $scope.listCanSwipe = true;
        $scope.items = [];
        $scope.item = {};

        var lastId = 0;
        getAll();

        function getAll() {

            $scope.items = DAFactory.getAll();

            if ($scope.items && $scope.items.length > 0) {
                lastId = $scope.items[0].lastId;
                $scope.items.splice(0, 1);

            }
        }

        $scope.isCompleted = function(item) {

            DAFactory.put(item);
            getAll();
        }

        function addItemToList(placeHolder) {
            return $ionicPopup.show({
                template: '<input type="text" ng-model="item.itemDesc" placeholder="' + placeHolder + '">',
                scope: $scope,
                buttons: [{
                    text: 'Cancel',
                    type: 'button-royal',
                    active: 'button-royal'
                }, {
                    text: 'Save',
                    type: 'button-royal',
                    onTap: function(e) {

                        if (!$scope.item.itemDesc) {
                            //console.log("Enter item description " + e);
                            e.preventDefault();
                        } else {
                            return $scope.item.itemDesc;
                        }
                    }
                }]
            });
        }
        $scope.editItem = function(item) {
            $scope.data.showDelete = false;
            $scope.item = item;
            var popupEditItem = addItemToList("Edit item description");
            popupEditItem.then(function(result) {
                //console.log('Tapped!', res);
                if (result && result.length) {
                    item.itemDesc = result;
                    $scope.item = {};
                    DAFactory.put(item)
                    getAll();
                }
                $ionicListDelegate.closeOptionButtons();
            });

        }
        $scope.addNewItem = function() {
            var popupAddItem = addItemToList("Enter the new item description");
            $scope.data.showDelete = false;
            $ionicListDelegate.closeOptionButtons();
            popupAddItem.then(function(result) {
                if (result && result.length) {
                    var item = {
                        id: ++lastId,
                        itemDesc: result,
                        isCompleted: false
                    };
                    $scope.item = {};
                    //$scope.items.push(item);
                    DAFactory.post(item);
                    getAll();
                }
                $ionicListDelegate.closeOptionButtons();
            });
        }

        $scope.removeItem = function(item) {
            //$scope.items.splice($index, 1)
            DAFactory.delete(item)
            getAll();

        }
    })
