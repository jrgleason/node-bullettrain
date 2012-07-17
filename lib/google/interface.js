var username
var password
var appname = "test"
var querystring = require('querystring'),
    https = require('https'),
    authinfo


exports.addProduct = function(req, res,next){
  var mainRes = res
  var itemData = "<?xml version='1.0'?>"+
    "<entry xmlns='http://www.w3.org/2005/Atom' "+
    "xmlns:app='http://www.w3.org/2007/app' "+
    "xmlns:gd='http://schemas.google.com/g/2005' "+
    "xmlns:sc='http://schemas.google.com/structuredcontent/2009' "+
    "xmlns:scp='http://schemas.google.com/structuredcontent/2009/products' > "+
    "<app:control> "+
    "    <sc:required_destination dest='ProductSearch'/> "+
    "</app:control> "+
    "<title type='text'>"+req.param.title+"</title> "+
    "<link rel='alternate' type='text/html' href='"+req.param.link+"'/> "+
    "<sc:id>"+req.param.sku+"</sc:id> "+
    "<content type='text'> "+
    req.param.desc+
    "</content> "+
    "<sc:content_language>i"+req.param.language+"</sc:content_language> "+
    "<sc:target_country>"+req.param.country+"</sc:target_country> "+
    "<scp:product_type>"+req.param.productType+"</scp:product_type> "+
    "<scp:price unit='usd'>"+req.param.price+"</scp:price> "+
    "<scp:brand>"+req.param.brand+"</scp:brand> "+
    "<scp:color>"+req.param.color+"</scp:color> "+
    "<scp:availability>"+req.param.availability+"</scp:availability> "+
    "<scp:condition>"+req.param.condition+"</scp:condition> "+
    "</entry>"
    if(authinfo != undefined){
      var post_options = {
        host: 'content.googleapis.com',
        port: '443',
        path: '/content/v1/8076653/items/products/generic',
        method: 'POST',
        headers: {
          'Content-Type': 'application/atom+xml',
          'Authorization': 'GoogleLogin Auth='+req.token
        }
      }; 
      var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.body = '';
        res.on('data', function (chunk) {
          res.body += chunk;
        });
        res.on('end', function() {
          var response = querystring.parse(res.body);
          return next();
        });
      });
      post_req.write(itemData)
      post_req.end()
      req.on('error', function(e) {
        console.error(e);
        res.send(e);
        return next();
      });
  }
  else{
    res.send("You are not authorized")
    return next();
  }  
}
exports.getToken = function(req,res, next){
  var post_params = querystring.stringify({
    Passwd:req.password,
    Email:req.username,
    service:"structuredcontent",
    source:req.appname
  })
  var post_options = {
    host: 'www.google.com',
    port: '443',
    path: '/accounts/ClientLogin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': post_params.length
    }
  };
  var post_req = https.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.body = '';
    res.on('data', function (chunk) {
      res.body += chunk;
    });
    res.on('end', function() {
      var response = querystring.parse(res.body);
      if(response.SID){
        var sid = response.SID
        var authLocation = sid.indexOf("Auth=")+5
        var value = sid.substring(authLocation,sid.length-1)
        req.token = value
        return next()
      }
      else{
        return next()
      }
    })
  })
  post_req.write(post_params);
  post_req.end();
}


exports.getProducts = function(req, res, next){
  var mainRes = res
  var post_params = querystring.stringify({})
  var post_options = {
    host: 'content.googleapis.com',
    port: '443',
    path: '/content/v1/8076653/items/products/generic?alt=json',
    method: 'GET',
    headers: {
      'Authorization': 'GoogleLogin Auth='+req.token
    }
  };
  var post_req = https.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.body = '';
    res.on('data', function (chunk) {
      res.body += chunk;
    });
    res.on('end', function() {
      req.feed = JSON.parse(res.body).feed
      return next();
    });
  });
  post_req.end();
}
