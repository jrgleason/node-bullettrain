//var

var cartProvider = require('./cart').CartProvider
var cartProvider = new CartProvider()
cartProvider.setType('carts')

//

var fileProvider = require('./file').FileProvider,
    fileProvider = new FileProvider()

//SECTION: Catalog Entry

var documentProvider = require('./document').DocumentProvider
var documentProvider = new DocumentProvider()

exports.getCart = function(req, res, next){
  if (req.session.cart == undefined){
    cartProvider.newCart(function(err,cart){
      req.session.cart = cart
      return next()
    });
  }
  else{
    return next()
  }
}

exports.saveCart = function(req, res, next){
  var cart = req.session.cart;
  if (cart == undefined){
    //TODO handle this
    return next();
  }
  else{  
    if(cart.items == undefined){
      cart.items=[]
    }
    cartProvider.save(cart, function(){
      return next();
    })
  }
}

exports.getImage = function(req, res){
  var fileid = req.params.fileid
  fileProvider.streamFile(res, fileid, 'image/jpg')
}

exports.getCatalogEntries= function (req, res, next){
  documentProvider.setType('items')
  documentProvider.findAllMapped(function (err, catalog) {
    if (!err) {
      req.catalog = catalog
      return next();
    } else {
      console.log(err)
      return next();
    }
  })
}

exports.postCatalogEntry = function (req, res, next){
  var catalogEntry;
  catalogEntry = {
    itemName: req.body.itemName,
    itemPrice: req.body.itemPrice,
    itemDescription: req.body.itemDescription,
    imageId : "",
    childEntries : []
  };
  fileProvider.addFile(req.files.itemImage, "image/jpeg", function(error, _id){
    catalogEntry.imageId = _id 
    documentProvider.setType('items')
    documentProvider.save(catalogEntry, function(error, entry){
      if (!error) {
        return next()
      } else {
        return console.log(error)
      }
    })
  })
}

/* Categories */

exports.getCategories= function (req, res, next){
  documentProvider.setType('categories')
  documentProvider.findAll(function (err, categories) {
    if (!err) {
      if(categories == undefined){
        categories = []
      }
      req.categories = categories
      return next();
    } else {
      console.log("There was an issue")
      console.log(err)
      return next();
    }
  })
}

exports.postCategory = function (req, res, next){
  var category;
  category = {
    categoryName: req.body.categoryName,
    items: [],
    categoryDescription: req.body.categoryDescription,
    children : [],
    isTopLevel : req.body.isTopLevel
  };
  documentProvider.setType('categories')
  documentProvider.save(category, function(error, entry){
    return next()
  })
}

exports.deleteCatalogEntry = function(req, res, next){
  documentProvider.setType('items')
  documentProvider.remove(req.params.itemid,function(){
    return next()
  })
}
