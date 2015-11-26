console.log(typeof window)

var theaterJS = require('../dist/theater')
var theater = theaterJS()

theater.addActor('vader').addScene('vader:Hey there!')
