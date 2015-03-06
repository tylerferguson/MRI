/**
 * Created by tferguson on 04/03/2015.
 */
(function() {

    angular.module('MeetingRoomInterface').controller('RoomCtrl', ['$scope', '$http', function($scope, $http) {

        var self = this;

        $scope.meetingRooms = [
            {
                email: "room-bri-1-meet",
                name: "Meeting Room 1",
                organizer: null,
                status: null,
                subject: null
            },
            {
                email: "room-bri-2-meet",
                name: "Meeting Room 2",
                organizer: null,
                status: null,
                subject: null

            },
            {
                email: "room-bri-3-meet",
                name: "Meeting Room 3",
                organizer: null,
                status: null,
                subject: null

            },
            {
                email: "room-bri-4-meet",
                name: "Meeting Room 4",
                organizer: null,
                status: null,
                subject: null
            }
        ];

        function updateMeetings() {
            function getMeeting(room) {

                var now = moment();
                var start = now.toISOString();
                var end = now.endOf('day');
                $http.get("/office365/users/" + room.email + "@scottlogic.co.uk/calendarview?startdatetime=" + start + "&enddatetime=" + end.toISOString() + "&$orderby=Start&$top=1&$filter=IsCancelled eq false")
                    .success(function(data) {
                        console.log(data.value[0]);

                        if ( data.value[0] && moment(data.value[0].Start).isBefore(moment(start))) {
                            room.organizer = data.value[0].Organizer.EmailAddress.Name;
                            room.status = 'Busy';
                            room.subject = data.value[0].Subject;
                        }
                        else if (data.value[0]) {
                            room.status = data.value[0] ? 'Free until ' + moment(data.value[0].Start).format("h:mma") : 'Free all day';
                        } else {
                            room.organizer = null;
                            room.status = 'Free all day';
                        }
                    });
            }
            $scope.meetingRooms.forEach(function(room) {
                getMeeting(room);
            });
        }

        updateMeetings();
        window.setInterval(updateMeetings, 10000);
    }]);
})();