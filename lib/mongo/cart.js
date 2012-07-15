var Db = require ('mongodb').Db,
    mongo = require('mongodb'),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    BSON = require('mongodb').BSON,
    ObjectID = require('mongodb').ObjectID,
    GridStore = require('mongodb').GridStore,
    Grid = require('gridfs-stream')(require('mongodb')),
    gfs = null,
    dbinfo = require('./dbinfo');

CartProvider = function(){};
CartProvider.prototype.dummyData = [];

CartProvider = function(host, port) {
  if(typeof dbinfo.DBURL() !== 'string') console.log("URL is bad");
  if(typeof dbinfo.DBPORT() !== 'number') console.log("PORT is bad");
  this.db= new Db(dbinfo.DBNAME(), new Server(dbinfo.DBURL(), dbinfo.DBPORT(), {auto_reconnect: true}, {}));
  gfs = Grid(this.db)
  this.db.open(function(err,db){
    db.authenticate(dbinfo.DBUSER(),dbinfo.DBPASSWORD(), function(err, result) {});
  });
};

CartProvider.prototype.getCollection= function(callback) {
  this.db.collection('carts', function(error, items_collection) {
    if( error ) callback(error);
    else callback(null, items_collection);
  })
};

CartProvider.prototype.findByIdentifier = function(id, callback) {
    this.getCollection(function(error, cart_collection) {
      if( error ) callback(error)
      else {
        cart_collection.findOne({_id: cart_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else {
            callback(null, result)
          }
        });
      }
    });
};

CartProvider.prototype.save = function(cart, callback) {
    this.getCollection(function(error, cart_collection) {
      if( error ) callback(error)
      else {
          cart.created_at = new Date();
        cart_collection.insert(cart, function() {
          callback(null, cart);
        });
      }
    });
};


CartProvider.prototype.newCart = function(callback) {
    this.getCollection(function(error, cart_collection) {
      if( error ) callback(error)
      else {
          var cart = {}
          cart.created_at = new Date();
        cart_collection.insert(cart, function() {
          callback(null, cart);
        });
      }
    });
};

