
var express      = require('express');
var app          = express();
var server       = require('http').Server(app);
var io           = require('socket.io')(server);
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var mongo        = require('mongoskin');
var db           = mongo.db('mongodb://localhost:27017/node2', {native_parser : true});  //  Db connection 
var mongoHelper  = { toObjectID : mongo.helper.toObjectID};
var util         = require('./public/javascripts/utility');


var routes       = require('./routes/index');
var users        = require('./routes/users');
var todo         = require('./routes/todo');

server.listen(3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
    req.db = db;
    req.util = util;
    req.mongoHelper = mongoHelper;
    next();
});
app.use('/', routes);
app.use('/users', users);
app.use('/todo', todo);
app.use(function(req, res, next) {  // catch 404 and forward to error handler
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


/**
 *  Socket IO section
 */
io.sockets.on('connection', function(socket){

    //  Add item to all listeners
    socket.on('addItemToList', function(itemObj){
        socket.broadcast.emit('addItemToList', itemObj);
        console.log(itemObj);
    });

});



module.exports = app;
