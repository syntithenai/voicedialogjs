var config = require('./config')
var DialogManager = require('./dialogManager')

var d = DialogManager(config)

d.init().then(function() {
    //console.log(config)
    //d.pushIntent()
    //console.log(d.predict())
    //,entities:[{name:'name',value:'Fred'}
    d.run('Hi there').then(function(response) {
        console.log(['BOT1',response])
        d.run({name:'hello'}).then(function(response) {
            console.log(['BOT2',response])
            d.run({name:'greet'}).then(function(response) {
                console.log(['BOT3',response])
                d.run({name:'name is',entities:[{name:'name',value:'Jill'}]}).then(function(response) {
                    console.log(['BOT5',response])
                })            
            })
        })  
    })

    //d.run({name:'hello'})

    //d.run({name:'greet'})

    //d.run()
}).catch(function(e) {
  console.log(['ERROR',e])  
})
