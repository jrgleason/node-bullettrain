var Db = require('mongodb').Db,
    mongo = require('mongodb'),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    BSON = require('mongodb').BSON,
    ObjectID = require('mongodb').ObjectID,
    GridStore = require('mongodb').GridStore,
    Grid = require('gridfs-stream')(require('mongodb')),
    gfs = null,
    dbinfo = require('./dbinfo'),
    uuid = require('node-uuid');

FileProvider = function(){};
FileProvider.prototype.dummyData = [];

FileProvider = function() {
  if(typeof dbinfo.DBURL() !== 'string') console.log("URL is bad");
  if(typeof dbinfo.DBPORT() !== 'number') console.log("PORT is bad");
  this.db= new Db(dbinfo.DBNAME(), new Server(dbinfo.DBURL(), dbinfo.DBPORT(), {auto_reconnect: true}, {}));
  gfs = Grid(this.db)
  this.db.open(function(err,db){
    db.authenticate(dbinfo.DBUSER(),dbinfo.DBPASSWORD(), function(err, result) {});
  });
};


FileProvider.prototype.addFile = function(file,  contentType, callback){
  var test = uuid.v4();
  console.log(JSON.stringify(test))
  var gridStore = new GridStore(this.db, uuid.v4(), 'w', {
      "content_type": contentType,
      "metadata":{
        "author": "Jackie"
      },
      "chunk_size": 1024*4 })
  gridStore.open(function(err,store) {
    gridStore.writeFile(file.path, function(err, file) {
      callback(err,file._id)
      gridStore.close(function() {});
    });
  });
}


FileProvider.prototype.streamFile = function(res, _id, contenttype){
  var properId = this.db.bson_serializer.ObjectID.createFromHexString(_id)
  console.log(properId);
  res.contentType(contenttype);
  var readstream = gfs.createReadStream(properId, {
      "content_type": contenttype,
      "id":true,
      "metadata":{
        "author": "Jackie"
      },
      "chunk_size": 1024*4 });
  readstream.pipe(res);
}

