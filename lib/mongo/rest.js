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


/* Catalog Entries */

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


/* CatalogEntry REST */

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

exports.deleteCatalogEntry = function(req, res, next){
  documentProvider.setType('items')
  documentProvider.remove(req.params.itemid,function(){
    return next()
  })
}

exports.putCatalogEntry = function(req, res){
  //TODO: We should check the type to ensure JSON
  res.set({
    'Content-Type': 'application/json',
    'type': 'get',
    'dataType': 'json'
  })
  documentProvider.setType('items')
  getIdFromString(req.body.categoryId, function(err, id){
    if(err != undefined){
      //console.log(err)
      res.json(500, { error: err })
    }
    else{
      documentProvider.findByJSON({_id:id}, function(err,categories){
        if(err != undefined){
           //console.log(err)
           res.json(500, { error: err })
        }
        else if(categories.length <= 0){
          err = "There were no categories found"
          //console.log(err)
          res.json(500, { error: err })
        }
        else{
          documentProvider.updateJSON({_id:id},updateObj.updateValues,function(err){
            if(err==undefined){
              res.json({ message: "Category Updated" })
            }
            else{
              res.json(500, { error: err })
            }
          })
        }
      })
    }
  })
}

/* END */

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

exports.getCategory = function(req,res,next){
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
    checkCategoryFromJSON(categories, err, function(err, category){
      if(err != undefined){
        req.category = category
      }
      else{
        req.err = err
      }
      return next()
    })
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
    checkCategoryFromJSON(categories, err, function(err, category){
      if(err == undefined){
        //console.log("Category: "+category)
        req.category = category
      }
      else{
        console.log(err)
        req.err = err
      }
      //console.log("returning "+JSON.stringify(category))
      return next()
    })
  })
}

exports.getTopCategories= function (req, res, next){
  documentProvider.setType('categories')
  documentProvider.findByJSON({isTopLevel:"on"},function (err, categories) {
    if (!err) {
      if(categories == undefined){
        categories = []
      }
      getExplodedItemsForCategories(categories, function(err){
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

/* REST Category */

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

exports.putCategory = function(req, res){
  //TODO: We should check the type to ensure JSON
  res.set({
    'Content-Type': 'application/json',
    'type': 'get',
    'dataType': 'json'
  })
  documentProvider.setType('categories')
  getIdFromString(req.body.categoryId, function(err, id){
    if(err != undefined){
      //console.log(err)
      res.json(500, { error: err })
    }
    else{
      documentProvider.findByJSON({_id:id}, function(err,categories){
        if(err != undefined){
           //console.log(err)
           res.json(500, { error: err })
        }
        else if(categories.length <= 0){
          err = "There were no categories found"
          //console.log(err)
          res.json(500, { error: err })
        }
        else{
          documentProvider.updateJSON({_id:id},req.body.updateValues,function(err){
            if(err==undefined){
              res.json({ message: "Category Updated" })
            }
            else{
              res.json(500, { error: err })
            }
          })
        }
      })
    }
  })
}

/* END */


getIdFromString = function(id, callback){
  try{
    var objectId=new BSON.ObjectID(id);
    callback(null,objectId)    
  }
  catch(exception){
    callback(exception,null)
  }
}

checkCategoryFromJSON = function(categories, err, callback){
    var category;
    var error;
    if(err != null){
      error = err
      callback(error,category)
    }
    else if(categories == null || categories.length == 0){
      error = "Category Undefined"
      console.log("Error Set")
      callback(error,category)
    }
    else if(categories.length != 1){
      req.error = "Two Categories Share the same ID, Cannot retrieve"
      console.log("Strange things are afoot: Two categories share the same ID")
      callback(error,category)
    }
    else {
      category = categories[0]
      getExplodedItemsForCategory(category,function(err){
        callback(err,category)
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
getExplodedItemsForCategory = function (category,callback){
  var items = category.items
  //console.log(JSON.stringify(items));
  var finalCallback = callback
  if(items == undefined){
    category.explodedItems = []
    callback(null)
  }
  else{
    var itemIds = []
    for (item in items){
      itemIds.push(new BSON.ObjectID(items[item].toString()))
    }
    documentProvider.setType('items')
    documentProvider.findByJSON({_id:{$in:itemIds}},function(err, items){
      if(items == undefined){
        items = []
      }
      category.explodedItems = items
      //console.log("Category should have exploded " + JSON.stringify(category))
      finalCallback(null)
    })
  }
}

