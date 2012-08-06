var documentProvider = require('./document').DocumentProvider

CartProvider = function(){
  
}
CartProvider.prototype = new DocumentProvider() 
CartProvider.prototype.newCart = function(callback) {
    this.getCollection(function(error, cart_collection) {
      if( error ) callback(error)
      else {
          var cart = {}
          cart.items=[]
          cart.created_at = new Date();
        cart_collection.insert(cart, function() {
          callback(null, cart);
        });
      }
    });
};

