//STATICS
var GOOGLE_CLIENT_ID,
    SSL_PORT = "443",
    GOOGLE_CLIENT_SECRET,
    GOOGLE_URLS = {
      USER_INFO: "/oauth2/v1/userinfo",
      GET_TOKEN: "/o/oauth2/token",
      REVOKE_TOKEN: "/o/oauth2/revoke",
      GOOGLE_DRIVE_FILES: "/drive/v2/files"
      //GOOGLE_DRIVE: "/discovery/v1/apis/drive/v1/rest"
    },
    GOOGLE_DOMAINS = {
      APIS:"www.googleapis.com",
      ACCOUNTS:"accounts.google.com"
    },
    GOOGLE_REVOKE_URL = "https://"+GOOGLE_DOMAINS.APIS+GOOGLE_URLS.REVOKE_TOKEN,
    GOOGLE_SCOPES = {
      PROFILE : 'https://www.googleapis.com/auth/userinfo.profile',
      DRIVE_FILE : 'https://www.googleapis.com/auth/drive.file',
      DRIVE : 'https://www.googleapis.com/auth/drive'
    },
    //TODO: This should integrate with the env variable instead of localhost
    REDIRECT_URL = 'http://localhost:3000/auth/google/getToken',
    GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth',
    GOOGLE_RESPONSE_TYPE = 
    {
      CODE:'code'
    },
    GOOGLE_ACCESS_TYPE = 
    {
      ONLINE:'online',
      OFFLINE:'offline'
    },
    GOOGLE_GRANT_TYPE = 
    {
      AUTHORIZATION_CODE:'authorization_code'
    }

//IMPORTS
var https = require('https'),
    querystring = require('querystring')


//CONSTRUCTORS
GoogleProvider = function(){};
GoogleProvider.prototype.dummyData = [];

GoogleProvider = function(){
}

//SCAFFOLD

GoogleProvider.protoype.setRedirectUrl = function(url){
  REDIRECT_URL = url
}

GoogleProvider.prototype.getFileList = function (next, session){
  console.log("!!"+GOOGLE_URLS.GOOGLE_DRIVE_FILES)
  var options = {
    host: GOOGLE_DOMAINS.APIS,
    port: SSL_PORT,
    path: GOOGLE_URLS.GOOGLE_DRIVE_FILES,
    headers: {
      Authorization: 'Bearer '+ session.access_token,
    }
  }
  console.log("Options: " +JSON.stringify(options))
  var post_req = https.request(options, function(res) {
    res.setEncoding('utf8')
    res.body = ''
    res.on('data', function (chunk) {
      res.body += chunk
    })
    res.on('end', function() {
      console.log(res.body)
      session.userinfo = JSON.parse(res.body)
      return next();
    })
  })
  post_req.write("")
  post_req.end()
}

GoogleProvider.prototype.setClientId = function (clientId){
  GOOGLE_CLIENT_ID = clientId
}

GoogleProvider.prototype.setClientSecret = function (clientSecret){
  GOOGLE_CLIENT_SECRET = clientSecret
}

GoogleProvider.prototype.requestCode = function (response){
  var requestParams = {
    scope:GOOGLE_SCOPES.PROFILE+" "+GOOGLE_SCOPES.DRIVE,
    response_type:GOOGLE_RESPONSE_TYPE.CODE,
    access_type:GOOGLE_ACCESS_TYPE.ONLINE,
    redirect_uri:REDIRECT_URL,
    client_id:GOOGLE_CLIENT_ID
  }
  console.log("RequestParams: "+querystring.stringify(requestParams))
  response.redirect(GOOGLE_AUTH_URL+'?'+querystring.stringify(requestParams))
}

GoogleProvider.prototype.revokeToken = function (authToken, response, callback){
  var requestParams = {
    token:authToken
  }
  var post_options = {
      host: GOOGLE_DOMAINS.APIS,
      port: SSL_PORT,
      path: GOOGLE_URLS.REVOKE_TOKEN+'?'+querystring.stringify(requestParams),
  };
  var post_req = https.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.body = '';
    res.on('data', function (chunk) {
      res.body += chunk;
    })
    res.on('end', function() {
      console.log("Log Out is :"+res.body)
      callback();
    })
  })
  post_req.write("");
  post_req.end()
}

GoogleProvider.prototype.getUserInformation = function(accessToken, callback, session){
  var options = {
    host: GOOGLE_DOMAINS.APIS,
    port: SSL_PORT,
    path: GOOGLE_URLS.USER_INFO,
    headers: {
      Authorization: 'Bearer '+accessToken,
    }
  }
  var post_req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.body = '';
    res.on('data', function (chunk) {
      res.body += chunk;
    })
    res.on('end', function() {
      session.userinfo = JSON.parse(res.body);
      callback();
    })
  })
  post_req.write("")
  post_req.end()
}

GoogleProvider.prototype.requestToken = function (code,next,req){
  var postParams = querystring.stringify({
    code:code,
    redirect_uri:REDIRECT_URL,
    client_id:GOOGLE_CLIENT_ID,
    client_secret:GOOGLE_CLIENT_SECRET,
    grant_type:GOOGLE_GRANT_TYPE.AUTHORIZATION_CODE
  })
  console.log("POST_PARAMS = "+postParams)
  var post_options = {
      host: GOOGLE_DOMAINS.ACCOUNTS,
      port: SSL_PORT,
      path: GOOGLE_URLS.GET_TOKEN,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postParams.length
      }
  };
  var post_req = https.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.body = '';
    res.on('data', function (chunk) {
      res.body += chunk;
    })
    res.on('end', function() {
      console.log("Response is :"+res.body)
      var obj = JSON.parse(res.body);
      req.session.access_token = obj.access_token;
      console.log("From Oauth: "+req.session.access_token);
      return next();
    })
  })
  post_req.write(postParams);
  post_req.end()
}
