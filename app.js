var http = require('http'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        io = require('socket.io'),
        sys = require('sys');


function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}

function ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}

function rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}

String.prototype.endsWith = function(str) {
    return (this.match(str + "$") == str)
}

String.prototype.toHtmlEntities = function() {
	return this.replace(/[^a-z0-9\.\-\_\s\t]/ig, function(c) {
		return '&#'+c.charCodeAt(0)+';';
	});
};


server = http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), uri);

    if(uri=='/') {
        filename = "battle.html";
    }

    path.exists(filename, function(exists) {
        if (!exists) {
            response.writeHeader(404, {'Content-Type':'text/plain'});
            response.end("Can''t find it...");
        }
        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHeader(500, {'Content-Type':'text/plain'});
                response.end(err + "\n");
                return;
            }
            response.writeHeader(200);
            response.write(file, 'binary');
            response.end();

        });
    });
});

server.listen(4444);

var io = require('socket.io').listen(server);


//var listner = io.listen(80);

console.log("created listener")


var delay  =5;

var buffer = [];
io.sockets.on('connection', function(socket){
    //client.send({ buffer: buffer });
    console.log("got connection")
    socket.broadcast.send(socket.sessionId + ' connected');

    socket.on('message', function(message){
        console.log('got message ' + message);
        socket.broadcast.send(message.toHtmlEntities());
    });



    socket.on('code', function(code){
        console.log('got code ' + code);
        socket.broadcast.emit('code-message','Executing in '+delay+' seconds:\n'+code.toHtmlEntities());

        setTimeout(function() {
            socket.broadcast.emit('code',code);
        },delay*1000);
    });

    io.on('disconnect', function(){
        socket.broadcast.send( socket.sessionId + ' disconnected' );
    });
});







