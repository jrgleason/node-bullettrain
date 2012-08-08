var mongo = require('mongodb');
var BSON = mongo.BSONPure;
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

var catalog = undefined

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

exports.getCatalogEntry= function (req, res, next){
  documentProvider.setType('items')
  documentProvider.findByIdentifier(req.params.itemId, function (err, item) {
    if (!err) {
      req.item = item
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



exports.getItemsForCategory = function(req,res,next){
  documentProvider.setType('categories')
  var objectId  
  try{
    objectId=new BSON.ObjectID(req.params.categoryId);
  }
  catch(exception){
    req.err = exception
    return next()
  }
  documentProvider.findByJSON({_id:objectId}, function(err,categories){
    if(err != null){
      req.err = err
      return next()
    }
    else if(categories == null || categories.length == 0){
      req.err = "Category Undefined"
      console.log("Error Set")
      return next()
    }
    else if(categories.length != 1){
      req.err = "Two Categories Share the same ID, Cannot retrieve"
      console.log("Strange things are afoot: Two categories share the same ID")
      return next()
    }
    else {
      var category = categories[0]
      getExplodedItemsForCategory(category,function(err){
        req.category = category
        return next()
      })
    }
  })
}

getExplodedItemsForCategory = function (category,callback){
  var items = category.items
  var finalCallback = callback
  //console.log("items: " +JSON.stringify(items))
  if(items == undefined){
    category.explodedItems = []
    callback(null)
  }
  else{
    var itemIds = []
    for (item in items){
      itemIds.push(new BSON.ObjectID(items[item].toString()))
    }
    //console.log(JSON.stringify(itemIds))
    documentProvider.setType('items')
    documentProvider.findByJSON({_id:{$in:itemIds}},function(err, items){
      //console.log("ITEMS: "+JSON.stringify(items))
      category.explodedItems = items
      finalCallback(null)
    })
  }
}

getExplodedItemsForCategories = function(categories,callback){
  var errArray = null
  var numberLeft = 0
  var currentNumber = 0
  for(categoryIt in categories){
    numberLeft++
    currentNumber++
    getExplodedItemsForCategory(categories[categoryIt],function(err){
      numberLeft--
      if(err != undefined){
        if(errArray == null){
          errArray = []
        }
        errArray.push(err)
      }
      if(currentNumber == categories.length && numberLeft == 0){
         callback(errArray)
      }
    })
  }
}

exports.getTopCategories= function (req, res, next){
  documentProvider.setType('categories')
  documentProvider.findByJSON({isTopLevel:"on"},function (err, categories) {
    if (!err) {
      if(categories == undefined){
        categories = []
      }
      getExplodedItemsForCategories(categories, function(err){
        //console.log(JSON.stringify(categories))
        if(!err){
          req.categories = categories
          return next()
        }
        else{
          req.err = err
          return next()
        }
      })
    } else {
      req.err = err
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
