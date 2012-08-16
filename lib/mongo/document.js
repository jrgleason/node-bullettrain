var dbhelper = require('./dbhelper'),
    //Could probably be abstracted and removed
    dbinfo = require('./dbinfo')


DocumentProvider = function() {
  var database = dbhelper.database()
  this.TYPE = "Document"
  this.db = database.db
  gfs = database.gfs
  this.db.open(function(err,db){
    db.authenticate(dbinfo.DBUSER(),dbinfo.DBPASSWORD(), 
      function(err, result) {});
  })
}

DocumentProvider.prototype.setType = function(type){
  this.TYPE = type
}

DocumentProvider.prototype.getCollection = function(callback){
  dbhelper.collection(this.db,this.TYPE,callback)
}

DocumentProvider.prototype.findAll = function(callback) {
  if(this.db == undefined){
    callback({"errorMessage":"DB is not setup"}, null)
  }
  else{
    dbhelper.allDocuments(this.db,this.TYPE,callback)
  }
}

DocumentProvider.prototype.findAllMapped = function(callback) {
  if(this.db == undefined){
    callback({"errorMessage":"DB is not setup"}, null)
  }
  else{
    dbhelper.allDocumentsMapped(this.db,this.TYPE,callback)
  }
}

DocumentProvider.prototype.findByJSON = function(json, callback){
  dbhelper.documentsByJSON(json,this.db,this.TYPE,callback)
}

DocumentProvider.prototype.findByJSONMapped = function(jsonString, callback){
  dbhelper.documentsByJSONMapped(jsonString,this.db,this.TYPE,callback)
}


DocumentProvider.prototype.findByIdentifier = function(id, callback) {
  dbhelper.singleDocument(this.db,this.TYPE,id,callback)
};

DocumentProvider.prototype.save = function(item, callback) {
  dbhelper.save(this.db,this.TYPE,item,callback)
};

DocumentProvider.prototype.updateJSON = function(whereJSON, valuesJSON, callback){
  dbhelper.updateByJSON(whereJSON, valuesJSON, this.db, this.TYPE, callback);
}

DocumentProvider.prototype.remove = function(id, callback){
  dbhelper.remove(this.db,this.TYPE,id,callback)
};

