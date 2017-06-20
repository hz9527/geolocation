var express = require('express')

var app = express()

app.use(express.static('./'))

app.listen(18000, (err) => {
  if (err) return
  console.log('serve run in 18000 static is test.html')
})
