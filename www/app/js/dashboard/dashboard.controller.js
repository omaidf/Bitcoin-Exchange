'use strict';
angular.module('dashboard')
    .controller('DashboardController', DashboardController);

function DashboardController($scope, authService, bCService, $state, $http, $window) {
    if (authService.isLoggedIn() === false) {
        $state.go('signin');
    } else {
        function getFeed() {
            // Request for getting bitcoin exchange rate
            $scope.feeds = [{
                title: "",
                link: "",
                content: "Fetching feeds",
            }]
            bCService.getFeed()
                // handle success
                .then(function(data) {
                    $scope.feeds = data.data.data;
                    console.log($scope.feeds);
                })
                // handle error
                .catch(function(data) {
                    $scope.feeds = [{
                        title: "",
                        link: "",
                        content: "Error Fetching feeds",
                    }]
                });
        }
        getFeed();

        function getBCExchangeRate() {
            // Request for getting bitcoin exchange rate
            $scope.convText = "Fetching conversion rate ..."
            bCService.getBCExchangeRate()
                // handle success
                .then(function(data) {
                    let conv = data['USD'];
                    $scope.convText = "1 Bitcoin = " + conv.symbol + " " + conv.last;
                })
                // handle error
                .catch(function(data) {
                    $scope.convText = data;
                });
        }
        getBCExchangeRate();

        $scope.logout = function() {
            authService.logout()
                // handle success
                .then(function(data, status) {
                    $state.go('landing');
                })
                // handle error
                .catch(function(data) {
                    $state.go('landing');
                });
        }

        function getBCBalance() {
            $scope.bCBalance = "Fetching"
            // Request for getting wallet balance
            bCService.getBCBalance()
                // handle success
                .then(function(data) {
                    $scope.bCBalance = (data.data / 1e8).toFixed(8) + ' BTC';
                })
                // handle error
                .catch(function() {
                    $scope.bCBalance = "Error";
                });
        }
        getBCBalance();

        $scope.openTx = function(id) {
            let dest = 'https://blockchain.info/tx/' + id;
            $window.open(dest);
        }

        function getTransactions() {
            $scope.txs = [{
                amount: "Fetching data"
            }]
            // Request for getting wallet balance
            bCService.getTransactions()
                // handle success
                .then(function(data) {
                    let txs = [];
                    for (let i = 0; i < data.transactions.length && i < 5; i++) {
                        let date = new Date(data.transactions[i].date);
                        let dateStr = date.getMonth() + '-' + date.getDate();
                        let netAmount = 0;
                        data.transactions[i].entries.forEach(function(el) {
                            if ($scope.bCWalletAdd == el.account) {
                                netAmount += el.value;
                            }
                        });
                        let txStr = netAmount > 0 ? 'Received' : 'Sent';
                        txs.push({
                            id: data.transactions[i].id,
                            amount: ' BTC ' + (Math.abs(netAmount) / 1e8).toFixed(8),
                            date: dateStr,
                            tx: txStr
                        });
                    }
                    $scope.txs = txs;
                })
                // handle error
                .catch(function(e) {
                    $scope.txs = [{
                        amount: "Error Fetching"
                    }]
                    console.log(e);
                // console.log("Error : bCService.getTransactions()");
                });
        }

        function getUserInfo() {
            $scope.userName = "Fetching data";
            $scope.bCWalletAdd = "Fetching data"
            $scope.userEmail = "Fetching data"
            $scope.userPhone = "Fetching data"
            // Request for getting user info
            bCService.getUserInfo()
                // handle success
                .then(function(data) {
                    $scope.userName = data.name;
                    $scope.bCWalletAdd = data.wallet;
                    $scope.userEmail = data.email;
                    $scope.userPhone = data.phone;
                    console.log(data);
                    getTransactions();
                })
                // handle error
                .catch(function(e) {
                    $scope.userName = "Error Fetching";
                    $scope.bCWalletAdd = "Error Fetching"
                    console.log(e);
                });
        }
        getUserInfo();

        let handleSendFundsFlag = true;
        $scope.handleSendFunds = function(dest, amount) {
            if (handleSendFundsFlag) {
                handleSendFundsFlag = false;
                if (dest !== undefined && dest.length > 0 && !isNaN(amount)) {
                    $scope.sendInfoType = "green";
                    $scope.sendError = "Wait, contacting server";
                    bCService.sendFunds(dest, amount)
                        // handle success
                        .then(function(data) {
                            console.log(data);
                            handleSendFundsFlag = true;
                            $scope.sendInfoType = "green";
                            $scope.sendError = 'Successful !'

                            getBCBalance();
                            getTransactions();
                        })
                        // handle error
                        .catch(function(e) {
                            console.log(e);
                            $scope.sendInfoType = "red";
                            $scope.sendError = e.statusText;
                            handleSendFundsFlag = true;
                        });
                } else {
                    $scope.sendInfoType = "red";
                    $scope.sendError = "Invalid parameters , Please correct.";
                    handleSendFundsFlag = true;
                }
            }
        }


        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        let handleReqFundsFlag = true;
        $scope.handleRequestFunds = function(email, amount) {
            if (handleReqFundsFlag) {
                handleReqFundsFlag = false;
                if (validateEmail(email) && !isNaN(amount)) {
                    $scope.reqInfoType = "green";
                    $scope.reqError = "Wait, contacting server";
                    bCService.reqFunds(email, amount)
                        // handle success
                        .then(function(data) {
                            console.log(data);
                            handleReqFundsFlag = true;
                            $scope.reqInfoType = "green";
                            $scope.reqError = 'Successful';
                        })
                        // handle error
                        .catch(function(e) {
                            console.log(e);
                            $scope.reqInfoType = "red";
                            $scope.reqError = "Error Occurred ! Try again later";
                            handleReqFundsFlag = true;
                        });
                } else {
                    $scope.reqInfoType = "red";
                    $scope.reqError = "Invalid parameters , Please correct.";
                    handleReqFundsFlag = true;
                }
            }
        }

        // DashTab - accounts logic
        $scope.showEditNameButton = true;
        $scope.handleEditName = function() {
            if ($scope.showEditNameButton) {
                $scope.showEditNameButton = false;
            }
        }

        var flagHandleNameChange = true;
        $scope.handleNameChange = function(name) {
            if (flagHandleNameChange) {
                flagHandleNameChange = false;
                if (name !== undefined && name.length > 4) {
                    $scope.nameErrType = 'green';
                    $scope.nameErr = 'Sending data to server';
                    authService.changeName(name)
                        // handle success
                        .then(function(data) {
                            flagHandleNameChange = true;
                            $scope.showEditNameButton = true;
                            $scope.nameErr = '';
                        })
                        // handle error
                        .catch(function(e) {
                            $scope.nameErrType = 'green';
                            $scope.nameErr = 'Error Saving Name, Try again later';
                            flagHandleNameChange = true;
                            console.log(e);
                        });
                } else {
                    $scope.nameErrType = 'red';
                    $scope.nameErr = 'Error : Name should be at-least 5 character long';
                    flagHandleNameChange = true;
                }
            }
        }


        $scope.showEditPhoneButton = true;
        $scope.handleEditPhone = function() {
            if ($scope.showEditPhoneButton) {
                $scope.showEditPhoneButton = false;
            }
        }
        var flagHandlePhoneChange = true;
        $scope.handlePhoneChange = function(phone) {
            if (flagHandlePhoneChange) {
                flagHandlePhoneChange = false;
                if (phone !== undefined && phone.length >= 10) {
                    $scope.PhoneErrType = 'green';
                    $scope.PhoneErr = 'Sending data to server';
                    authService.changePhone(phone)
                        // handle success
                        .then(function(data) {
                            flagHandlePhoneChange = true;
                            $scope.showEditPhoneButton = true;
                            $scope.phoneErr = '';
                        })
                        // handle error
                        .catch(function(e) {
                            $scope.phoneErrType = 'green';
                            $scope.phoneErr = 'Error Saving Phone No, Try again later';
                            flagHandlePhoneChange = true;
                            console.log(e);
                        });
                } else {
                    $scope.phoneErrType = 'red';
                    $scope.phoneErr = 'Error : correct your phone number';
                    flagHandlePhoneChange = true;
                }
            }
        }

        // Change Password logic
        $scope.showEditPassButton = true;
        $scope.handleEditPass = function() {
            if ($scope.showEditPassButton) {
                $scope.showEditPassButton = false;
            }
        }

        var flagHandlePassChange = true;
        $scope.handlePassChange = function(new1, new2) {
            if (flagHandlePassChange) {
                flagHandlePassChange = false;
                if (new1 !== undefined && new2 !== undefined && new1 == new2 && new1.length > 7) {
                    $scope.passErrType = 'green';
                    $scope.passErr = 'Sending data to server';
                    authService.changePass(new1)
                        // handle success
                        .then(function(data) {
                            flagHandlePassChange = true;
                            $scope.showEditPassButton = true;
                            $scope.passErr = '';
                        })
                        // handle error
                        .catch(function(e) {
                            $scope.passErrType = 'red';
                            $scope.passErr = 'Error changing password, Try again later'
                            flagHandlePassChange = true;
                            console.log(e);
                        });
                } else {
                    $scope.passErrType = 'red';
                    $scope.passErr = 'Error : New passwords should be same and minimum length required is 8';
                    flagHandlePassChange = true;
                }
            }
        }
    }
}