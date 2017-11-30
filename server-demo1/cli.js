var fs = require('fs')

function copy(src, dst){
  fs.createReadStream(src).pipe(fs.createWriteStream(dst))
}
var command = process.argv.slice(2)
var src = command[0] || ''
var dst = command[1] || ''
copy(src, dst)
