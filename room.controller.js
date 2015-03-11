/**
 * Created by tferguson on 04/03/2015.
 */
(function() {

    angular.module('MeetingRoomInterface').controller('RoomCtrl', ['$scope', '$http', function($scope, $http) {

        var self = this;
        var loadedFromLocalStorage = localStorage.length > 0;
        var firstErrorTime;

        $scope.emailAddressesSubmitted = function() {
            return localStorage.length > 0;
        };

        $scope.meetingRooms = [
            {
                email: null,
                name: "Meeting Room 1",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null
            },
            {
                email: null,
                name: "Meeting Room 2",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null
            },
            {
                email: null,
                name: "Meeting Room 3",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null
            },
            {
                email: null,
                name: "Meeting Room 4",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null
            }
        ];

        $scope.submitEmailAddresses = function(){
            $scope.meetingRooms.forEach(function(room, index) {
                if (room.email !== null) {
                    localStorage["room" + (index + 1) + "Email"] = room.email;
                }
            });
        };

        $scope.$watch('emailAddressesSubmitted()', function(value) {
            if (!value) {
                return;
            }
            if (loadedFromLocalStorage) {
                $scope.meetingRooms.forEach(function(room, index) {
                    room.email = localStorage["room" + (index + 1) + "Email"];
                });
            }
            loadApp();
        });

        function loadApp() {
            getTimeNow();
            updateMeetings();
            window.setInterval(function() {
                updateMeetings();
                getTimeNow();
            }, 10000);
        }

        function getTimeNow() {
            $scope.timeNow = moment().format("HH:mm");
        }

        function updateMeetings() {
            $scope.meetingRooms.forEach(function(room) {
                getStatus(room);
            });

            function getStatus(room) {
                var now = moment();
                var start = now.toISOString();
                var end = now.endOf('day');
                $http.get("/office365/users/" + room.email + "/calendarview?startdatetime=" + start + "&enddatetime=" + end.toISOString() + "&$orderby=Start&$filter=IsCancelled eq false")
                    .then(function(response) {
                        var meetings = response.data.value;
                        room.errorCount = 0;

                        if ( meetings[0] && moment(meetings[0].Start).isBefore(moment(start))) {
                            room.organizer = meetings[0].Organizer.EmailAddress.Name;
                            room.status = 'Busy';
                            room.statusMessage = 'Busy until ' + getNextAvailableSlot().format("HH:mm");
                        }
                        else if (meetings[0]) {
                            room.statusMessage = 'Free until ' + moment(meetings[0].Start).format("HH:mm");
                            room.status = null;
                            room.organizer = meetings[0].Organizer.EmailAddress.Name;
                        } else {
                            room.organizer = null;
                            room.statusMessage = 'Free all day';
                            room.status = null;
                        }
                        function getNextAvailableSlot() {
                            var nextSlot = meetings[0].End;
                            var i = 0, j = 1;
                            while (j < meetings.length && meetings[j]) {
                                if (moment(meetings[i].End).isBefore(moment(meetings[j].Start), 'minute')) {
                                    return moment(meetings[i].End);
                                }
                                nextSlot = meetings[j].End;
                                i++;
                                j++;
                            }
                            return moment(nextSlot);
                        }
                    },
                    function(error) {
                        if (room.email === null || !room.email) {
                            room.errorMessage = "You have not supplied an Email address for this room.";
                            return;
                        }
                        room.errorCount++;
                        if(room.errorCount === 5) {
                            firstErrorTime = moment().format("HH:mm");
                        }
                        if (room.errorCount > 5) {
                            room.errorMessage = "There's been a problem. Updates should be back soon. Last update: " + firstErrorTime;
                            room.organizer = null;
                            room.statusMessage = null;
                            room.status = null;
                        }
                    });
            }
        }
    }]);
})();