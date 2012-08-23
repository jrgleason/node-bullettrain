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
        cart.created_at = new Date()
        cart.orderTotal = 0
        //console.log(JSON.stringify(cart));
        cart_collection.insert(cart, function() {
          callback(null, cart);
        });
      }
    });
};

getOrderTotal = function(){
  var orderTotal = 0
  for(item in items){
    orderTotal = orderTotal + item.itemPrice
  }
  return orderTotal
}

