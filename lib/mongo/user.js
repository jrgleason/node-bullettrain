var documentProvider = require('./document').DocumentProvider

UserProvider = function(){
  this.setType('users')
}

UserProvider.prototype = new DocumentProvider()


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
