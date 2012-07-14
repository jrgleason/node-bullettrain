var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var dbpassword = process.env.OPENSHIFT_NOSQL_DB_PASSWORD || 'password';
var dbuser = process.env.OPENSHIFT_NOSQL_DB_USERNAME || 'admin';
var userCounter = 1;

UserProvider = function(){};
UserProvider.prototype.dummyData = [];

UserProvider = function(host, port) {
  this.db= new Db('myRadio', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(err,db){
    db.authenticate(dbuser, dbpassword, function(err, result) {});
  });

};

UserProvider.prototype.getCollection= function(callback) {
  this.db.collection('users', function(error, user_collection) {
    if( error ) callback(error);
    else callback(null, user_collection);
  });
};

UserProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


UserProvider.prototype.findByDisplayName = function(id, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne({displayName: id}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

UserProvider.prototype.findByIdentifier = function(id, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne({identifier: id}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

UserProvider.prototype.save = function(users, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        if( typeof(users.length)=="undefined")
          users = [users];

        for( var i =0;i< users.length;i++ ) {
          user = users[i];
          user.created_at = new Date();
          if( user.comments === undefined ) user.comments = [];
          for(var j =0;j< user.comments.length; j++) {
            user.comments[j].created_at = new Date();
          }
        }

        user_collection.insert(users, function() {
          callback(null, users);
        });
      }
    });
};

exports.UserProvider = UserProvider;
