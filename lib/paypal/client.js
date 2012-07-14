var USER = 'jackie_1342016336_biz_api1.gmail.com';
var PWD = '1342016360'
var SIGNATURE = 'AVVT6YkIv-vXz5r5dLeizgs39yVOAk.AQwfmSHx0KBfZedsOGO9cgRmd'

var payflow = require('paynode').use('payflowpro');
var app

exports.setApp = function(appIn){
  app = appIn
}

var client = payflow.createClient({level:payflow.levels.sandbox
  , user:USER
  , password:PWD
  , signature: SIGNATURE
})

exports.setExpressCheckout = function(req, res){
  var mainRes = res
  var mainReq = req
  console.log('https:'+app.get('sslport')+'//'+app.get('ipaddr')+'/confirm')
  client.setExpressCheckout({
   amt:req.body.PAYMENTREQUEST_0_AMT
   ,paymentaction:'Sale'
   ,RETURNURL:'https://'+app.get('ipaddr')+':'+app.get('sslport')+'/confirm',
    CANCELURL:'https://'+app.get('ipaddr')+':'+app.get('sslport')+'/end',
  }).on('success', function(result){
    if(mainReq.session == undefined){
      console.log(result)
      mainRes.redirect("/end")
    }
    else{
      mainReq.session.paypaltoken=result.token
      mainRes.redirect("https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token="+result.token);
    }
  }).on('failure', function(result){
    console.log(result)
    mainRes.redirect("/end");
  })
}

exports.getCheckoutDetails = function(req, res, next){
  var mainReq = req
  if(req.session.paypaltoken==undefined){
    res.redirect("/end");
  }
  else{
    client.getExpressCheckoutDetails({
     token:req.session.paypaltoken
    }).on('success', function(result){
      mainReq.session.orderdetails = result
      return next()
    }).on('failure', function(result){
      console.log(result)
      res.redirect("/end");
    })

  }
}

exports.finalizePayment = function(req, res){
  console.log(req.session.orderdetails.paymentrequest[0].amt)
  client.doExpressCheckoutPayment({
    token:req.session.paypaltoken,
    payerid:req.body.payerid,
    METHOD:'DoExpressCheckoutPayment',
    amt:req.session.orderdetails.paymentrequest[0].amt,
    paymentaction:'Sale'
  }).on('failure', function(result){
      console.log(result);
      res.redirect("/end");
  }).on('success', function(result){
      res.redirect("/");
  })

}

