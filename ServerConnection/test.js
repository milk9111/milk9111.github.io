
var socket = io.connect("http://24.16.255.56:8888");

window.onload = function () {
    console.log("starting up da sheild");

    socket.on('load', function (data) {
        console.log("Received a load emit from the server");
        console.log(data);
        console.log(data.studentname + ", " + data.statename + ", " + data.message);
        console.log("Finished displaying the data");
    });

    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });

    socket.emit('save', {studentname: "Connor Lundberg", statename: "My Test State", message: "Here I am!"});
    socket.emit('load', {studentname: "Connor Lundberg", statename: "My Test State"});
    console.log("Called save emit");
};
