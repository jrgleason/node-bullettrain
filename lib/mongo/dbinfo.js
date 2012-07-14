

exports.DBNAME = function(){
  return process.env.OPENSHIFT_APP_NAME || 'bullettrain'
}
exports.DBPASSWORD = function(){ 
  return process.env.OPENSHIFT_NOSQL_DB_PASSWORD || 'password';
}
exports.DBUSER = function(){
  return process.env.OPENSHIFT_NOSQL_DB_USERNAME || 'admin';
}
exports.DBURL = function(){
    return process.env.OPENSHIFT_NOSQL_DB_HOST || 'localhost'
}
exports.DBPORT = function(){
  return parseInt(process.env.OPENSHIFT_NOSQL_DB_PORT || '27017')
}
