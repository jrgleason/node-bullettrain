var Db = require('mongodb').Db,
    mongo = require('mongodb'),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    BSON = require('mongodb').BSON,
    ObjectID = require('mongodb').ObjectID,
    GridStore = require('mongodb').GridStore,
    Grid = require('gridfs-stream')(require('mongodb')),
    gfs = null,
    dbinfo = require('./dbinfo');


ItemProvider = function(){};
ItemProvider.prototype.dummyData = [];


ItemProvider = function(host, port) {
  if(typeof dbinfo.DBURL() !== 'string') console.log("URL is bad");
  if(typeof dbinfo.DBPORT() !== 'number') console.log("PORT is bad");
  this.db= new Db(dbinfo.DBNAME(), new Server(dbinfo.DBURL(), dbinfo.DBPORT(), {auto_reconnect: true}, {}));
  gfs = Grid(this.db)
  this.db.open(function(err,db){
    db.authenticate(dbinfo.DBUSER(),dbinfo.DBPASSWORD(), function(err, result) {});
  });
};

ItemProvider.prototype.getCollection= function(callback) {
  this.db.collection('items', function(error, items_collection) {
    if( error ) callback(error);
    else callback(null, items_collection);
  })
};

ItemProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, item_collection) {
      if( error ) callback(error)
      else {
        item_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else
            callback(null, results)
        });
      }
    });
}

ItemProvider.prototype.findByIdentifier = function(id, callback) {
    this.getCollection(function(error, item_collection) {
      if( error ) callback(error)
      else {
        item_collection.findOne({_id: item_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else {
            callback(null, result)
          }
        });
      }
    });
};

ItemProvider.prototype.save = function(item, callback) {
    this.getCollection(function(error, item_collection) {
      if( error ) callback(error)
      else {
          item.created_at = new Date();
          if( item.attributes == undefined) item.attributes = [];

        item_collection.insert(item, function() {
          callback(null, item);
        });
      }
    });
};

ItemProvider.prototype.remove = function(id, callback){
    var id = this.db.bson_serializer.ObjectID.createFromHexString(id);
    this.getCollection(function(error, item_collection) {
      if( error ) callback(error)
      else {
         item_collection.remove({_id: id},
         function(){
           callback(null, id);
         });
      }
    })
};

