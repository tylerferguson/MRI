/**
 * Created by tferguson on 04/03/2015.
 */
(function() {

    angular.module('MeetingRoomInterface').controller('RoomCtrl', ['$scope', '$http', 'emailAddresses', function($scope, $http, emailAddresses) {

        var self = this;
        var firstErrorTime;

        $scope.meetingRooms = [
            {
                email: emailAddresses.room1,
                name: "1",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null,
                booked: false
            },
            {
                email: emailAddresses.room2,
                name: "2",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null,
                booked: false
            },
            {
                email: emailAddresses.room3,
                name: "3",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null,
                booked: false
            },
            {
                email: emailAddresses.room4,
                name: "4",
                organizer: null,
                status: null,
                statusMessage: null,
                subject: null,
                errorCount: 0,
                errorMessage: null,
                booked: false
            }
        ];

        $scope.setStatusClass = function(status, index) {
            var className = '';
            if (status === 'Busy') {
                className = 'busy-room ';
            } else if(status === 'Free') {
                className = 'free-room ';
            }

            return className + 'meeting-room-' + (index + 1);
        };

        loadApp();

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
                            room.errorMessage = null;
                            room.booked = true;
                        }
                        else if (meetings[0]) {
                            room.statusMessage = 'Free until ' + moment(meetings[0].Start).format("HH:mm");
                            room.status = 'Free';
                            room.organizer = meetings[0].Organizer.EmailAddress.Name;
                            room.errorMessage = null;
                            room.booked = true;
                        } else {
                            room.organizer = null;
                            room.statusMessage = 'Free all day';
                            room.status = 'Free';
                            room.errorMessage = null;
                            room.booked = false;

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
                        if(room.errorCount === 1) {
                            firstErrorTime = moment();
                        }
                        if (room.errorCount > 1) {
                            room.errorMessage = "There's been a problem. Updates should be back soon. Last updated " + firstErrorTime.from(moment());
                            room.organizer = null;
                            room.statusMessage = null;
                            room.status = null;
                            room.booked = false;

                        }
                    });
            }
        }
    }]);
})();