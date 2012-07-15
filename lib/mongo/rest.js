var cartProvider = require('./cart').CartProvider
var cartProvider = new CartProvider();
//

var fileProvider = require('./file').FileProvider
var fileProvider = new FileProvider();

//SECTION: Catalog Entry

var catalogEntryProvider = require('./item').ItemProvider;
var catalogEntryProvider = new ItemProvider();

exports.getCart = function(req, res, next){
  if req.session.cart == undefined
    cartProvider.newCart(function(err,cart){
      req.session.cart = cart
    });
}

exports.getImage = function(req, res){
  var fileid = req.params.fileid
  fileProvider.streamFile(res, fileid, 'image/jpg')
}

exports.getCatalogEntries= function (req, res, next){
  return catalogEntryProvider.findAll(function (err, catalog) {
    if (!err) {
      req.catalog = catalog
      return next();
    } else {
      return console.log(err)
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

exports.deleteCatalogEntry = function(req, res, next){
  catalogEntryProvider.remove(req.params.itemid,function(){
    return next()
  })
}
