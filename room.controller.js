/**
 * Created by tferguson on 04/03/2015.
 */
(function() {

    angular.module('MeetingRoomInterface').controller('RoomCtrl', ['$scope', '$http', function($scope, $http) {

        var self = this;

        $scope.getEmailAddresses = function(){
            $scope.meetingRooms = [
                {
                    email: "room-bri-1-meet@scottlogic.co.uk",
                    name: "Meeting Room 1",
                    organizer: null,
                    status: null,
                    statusMessage: null,
                    subject: null
                },
                {
                    email: "room-bri-2-meet@scottlogic.co.uk",
                    name: "Meeting Room 2",
                    organizer: null,
                    status: null,
                    statusMessage: null,
                    subject: null

                },
                {
                    email: "room-bri-3-meet@scottlogic.co.uk",
                    name: "Meeting Room 3",
                    organizer: null,
                    status: null,
                    statusMessage: null,
                    subject: null

                },
                {
                    email: "room-bri-4-meet@scottlogic.co.uk",
                    name: "Meeting Room 4",
                    organizer: null,
                    status: null,
                    statusMessage: null,
                    subject: null
                }
            ];

            getTimeNow();
            updateMeetings();
            window.setInterval(function() {
                    updateMeetings();
                    getTimeNow();
                }, 10000
            );
        };

        function getTimeNow() {
            $scope.timeNow = moment().format("HH:mm");
        }

        function updateMeetings() {
            function getStatus(room) {
                var now = moment();
                var start = now.toISOString();
                var end = now.endOf('day');
                $http.get("/office365/users/" + room.email + "/calendarview?startdatetime=" + start + "&enddatetime=" + end.toISOString() + "&$orderby=Start&$filter=IsCancelled eq false")
                    .success(function(data) {
                        var meetings = data.value;

                        function getNextAvailableSlot() {
                            console.log(meetings);
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

                        if ( meetings[0] && moment(meetings[0].Start).isBefore(moment(start))) {
                            room.organizer = meetings[0].Organizer.EmailAddress.Name;
                            room.status = 'Busy';
                            room.statusMessage = 'Busy until ' + getNextAvailableSlot().format("HH:mm");
                            room.subject = meetings[0].Subject;
                        }
                        else if (meetings[0]) {
                            room.statusMessage = 'Free until ' + moment(meetings[0].Start).format("HH:mm");
                            room.status = null;
                            room.subject = null;
                            room.organizer = meetings[0].Organizer.EmailAddress.Name;
                        } else {
                            room.organizer = null;
                            room.statusMessage = 'Free all day';
                            room.status = null;
                            room.subject = null;

                        }
                    });
            }
            $scope.meetingRooms.forEach(function(room) {
                getStatus(room);
            });
        }
    }]);
})();