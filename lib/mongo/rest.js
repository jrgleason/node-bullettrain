var cartProvider = require('./cart').CartProvider
var cartProvider = new CartProvider()
cartProvider.setType('carts')

//

var fileProvider = require('./file').FileProvider,
    fileProvider = new FileProvider()

//SECTION: Catalog Entry

var catalogEntryProvider = require('./document').DocumentProvider
var catalogEntryProvider = new DocumentProvider()
catalogEntryProvider.setType('items')

var categoryProvider = require('./document').DocumentProvider
var categoryProvider = new DocumentProvider()
categoryProvider.setType('categories')

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
  if(cart.items == undefined){
    cart.items=[]
  }
  console.log(JSON.stringify(cart));
  cartProvider.save(cart, function(){
    return next();
  })
}

exports.getImage = function(req, res){
  var fileid = req.params.fileid
  fileProvider.streamFile(res, fileid, 'image/jpg')
}

exports.getCatalogEntries= function (req, res, next){
  catalogEntryProvider.findAll(function (err, catalog) {
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
    catalogEntryProvider.save(catalogEntry, function(error, entry){
      if (!error) {
        return next()
      } else {
        return console.log(error)
      }
    })
  })
}

exports.postCategory = function (req, res, next){
  console.log(req.body.categoryName)
  var category;
  category = {
    categoryName: req.body.categoryName,
    items: [],
    categoryDescription: req.body.categoryDescription,
    children : []
  };
  console.log("Category To add " +JSON.stringify(category));
  categoryProvider.save(category, function(error, entry){
    return next()
  })
}

exports.deleteCatalogEntry = function(req, res, next){
  catalogEntryProvider.remove(req.params.itemid,function(){
    return next()
  })
}
