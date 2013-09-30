
var 
  application_root = __dirname,
  fs = require('fs'),
  express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  sockets = require('socket.io'),
//  io = sockets.listen(server),
  events = require('events'),
  messages = [];

var emitter = new events.EventEmitter;

app.use(express.bodyParser());
app.use(express.methodOverride());
app.configure(function () {
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var sendResponse = function(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.write(JSON.stringify(messages));
  res.end();
}; 

app.get('/', function(req,res) {
  fs.readFile('index.html', function(err, data) {
    res.set({ 'Content-Type': 'text/html' });
    res.send(data);
  });
});

app.get('/app.js', function(req,res) {
  fs.readFile('app.js', function(err, data) {
    res.set({ 'Content-Type': 'text/javascript' });
    res.send(data);
  });
});

app.get('/items', function(req, res) {
  console.log('poll', req.query);
  if(req.query.longpoll === 'true') {
    emitter.once("event:notify", function() { 
      sendResponse(req, res);
    });
  
    req.on("close", function() {
      emitter.removeListener("event:notify", sendResponse);
    });
  } else {
    res.send(messages);
  }
});

app.put('/items', function(req, res) {
  messages.push({message: req.body.message}); 
  console.log(req.body); 
  emitter.emit('event:notify'); 
  
  res.send('OK');
});


var io = require('socket.io').listen(61616);

io.sockets.on('connection', function (socket) {
  socket.on('add_item', function (data) { 
    console.log('ITEM ADDED');
    messages.push(data);
    socket.emit('items', messages);
  });
  socket.on('disconnect', function () { });
  socket.emit('items', messages);
});


app.listen(61612);

