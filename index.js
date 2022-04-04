var express = require('express');
const http = require('http');
var app = express();
const server = http.createServer(app);
const fs = require('fs');

const socketIo = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

var roles = {
    sender: '',
    receiver: ''
}

app.use(express.static(__dirname + '/public'));

socketIo.on('connection', (socket) => {
    console.log('New client connected' + socket.id);

    socket.emit('getId', socket.id)

    socket.on('setRole', function (data) {
        socket.role = data.trim();
        roles[socket.role] = socket.id;
    })

    socket.on('sendImage', function (data) {
        var guess = data.content.base64.match(/^data:image\/(png|jpeg);base64,/)[1];
        var ext = '';
        switch (guess) {
            case 'png':
                ext = '.png'
                break;
            case 'jpeg':
                ext = '.jpg'
                break;

            default:
                ext = '.bin'
                break;
        }
        var savedFilename = '/upload/' + randomString(10) + ext;
        const image = getBase64Image(data.content.base64);
        fs.writeFile(__dirname + '/public' + savedFilename, image, 'base64', function (err) {
            if (err !== null) {
                console.log(err);
            } else {
                socketIo.emit('receivePhoto', {
                    data: {
                        id: Math.random() * 1000,
                        content: `http://localhost:3000${savedFilename}`
                    }
                })
                console.log("send photo ok");
            }

        })
    })

    socket.on('sendDataClient', function (data) {
        socketIo.emit('sendDataServer', { data })
    })

    socket.on("disconnect", () => {
        console.log('Client disconnected');
    })
})

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function getBase64Image(imgData) {
    return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}

server.listen(3000, () => {
    console.log(`Server dang chay tren cong 3000`);
})

