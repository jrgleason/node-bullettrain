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

exports.database = function (){
  return getDatabase()
}

exports.collection = function(db,docType,callback){
  getCollection(db,docType,callback)
}

exports.allDocuments = function(db,docType,callback){
  findDocuments(db,docType,callback)
}

exports.allDocumentsMapped = function(db,docType,callback){
  findDocumentsMapped(db,docType,callback)
}

exports.save = function(db, docType, doc, callback){
  console.log(JSON.stringify(doc))
  save(db, docType, doc, callback)
}

exports.singleDocument = function(db,docType,id, callback){
  findByIdentifier(db,docType,id, callback)
}

exports.remove = function(db,docType,id, callback){
  remove(db,docType,id, callback)
}

getDatabase = function(){
  if(typeof dbinfo.DBURL() !== 'string') console.log("URL is bad");
  if(typeof dbinfo.DBPORT() !== 'number') console.log("PORT is bad");
  var db = new Db(dbinfo.DBNAME(), new Server(dbinfo.DBURL(), dbinfo.DBPORT(), {auto_reconnect: true}, {}))
  return {db:db,gfs:Grid(db)}
}

getCollection = function(db, docType, callback) {
  db.collection(docType, function(error, collection) {
    if( error ) callback(error);
    else callback(null, collection);
  })
};

findDocuments = function(db,docType,callback) {
    this.getCollection(db,docType,function(error, collection) {
      if( error ) callback(error)
      else {
        collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else
            callback(null, results)
        });
      }
    });
}

findDocumentsMapped = function(db,docType,callback) {
    this.getCollection(db,docType,function(error, collection) {
      if( error ) callback(error)
      else {
        collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else
            var mappedResults = {}
            for(result in results){
              var resObj = results[result]
              var id = resObj._id
              mappedResults[id] = resObj
            }
            callback(null, mappedResults)
        });
      }
    });
}


findByIdentifier = function(db,docType,id, callback) {
    this.getCollection(db,docType,function(error, collection) {
      if( error ) callback(error,null)
      else {
        collection.findOne({_id: item_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else {
            callback(null, result)
          }
        })
      }
    })
}

save = function(db, docType, doc, callback) {
    getCollection(db, docType, function(error, collection) {
      if( error ) callback(error)
      else {
          doc.created_at = new Date();
          if( doc.attributes == undefined) doc.attributes = [];
        collection.insert(doc, function() {
          callback(null, doc);
        });
      }
    });
};

remove = function(db,docType,id, callback){
    var id = db.bson_serializer.ObjectID.createFromHexString(id);
    this.getCollection(db,docType,function(error, collection) {
      if( error ) callback(error)
      else {
         collection.remove({_id: id},
         function(){
           callback(null, id);
         });
      }
    })
};
