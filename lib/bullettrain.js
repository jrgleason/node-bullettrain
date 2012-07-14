exports.use = function(name){
  return require(__dirname + '/'+name+'/client')
}
exports.useRest = function(name){
  return require(__dirname + '/'+name+'/rest')
}
