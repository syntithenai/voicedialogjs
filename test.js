var config = require('./config')
var DialogManager = require('./dialogManager')

var d = DialogManager(config)

d.init().then(function() {
    //console.log('dm initied')
    //d.pushIntent()
    //console.log(d.predict())
    //,entities:[{name:'name',value:'Fred'}
    //d.run('give me something by ry cooder').then(function(response) {
    d.run('next track').then(function(response) {
        console.log(['BOT1',response,response])
        //d.run({name:'hello'}).then(function(response) {
            //console.log(['BOT2',response])
            //d.run({name:'greet'}).then(function(response) {
                //console.log(['BOT3',response])
                //d.run({name:'name is',entities:[{name:'name',value:'Jill'}]}).then(function(response) {
                    //console.log(['BOT5',response])
                //})            
            //})
        //})  
        //console.log(d.toJSON())
        
    })

    //d.run({name:'hello'})

    //d.run({name:'greet'})

    //d.run()
}).catch(function(e) {
    console.log(['ERROR',e])  
})
