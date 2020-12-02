const nlp = require('compromise')
nlp.extend(require('compromise-numbers'))
nlp.extend(require('compromise-dates'))

var extractor = nlp('In Sydney on the 25th of December at 2pm what is the first name of two John Jones  on (80) 555-0000 #remember ;)')
console.log(JSON.stringify([
        'COMP',
        //extractor.numbers().json(),
        //extractor.phoneNumbers().out('array')
        //extractor.dates().json(),
        extractor.people().json({offset: true}),
        //extractor.places().out('array'),
        //extractor.tokenize()
]))
console.log(JSON.stringify([
        'COMP2',
        extractor.people().out('offset'),
        //extractor.places().out('array'),
        //extractor.tokenize()
]))

        //console.log(
        //JSON.stringify([
        //'COMP',
        //extractor.numbers().map(function(number) {
            //return number.toNumber()
        //}),
        //extractor.phoneNumbers(),
        //extractor.hashTags(),
        //extractor.emails(),
        //extractor.emoticons(),
        //extractor.emojis(),
        //extractor.people(),
        //extractor.places(),
        //extractor.organizations(),
        //]
        //))


//var config = require('./config')
//var DialogManager = require('./dialogManager')

//var d = DialogManager(config)

//d.init().then(function() {
    ////console.log('dm initied')
    ////d.pushIntent()
    ////console.log(d.predict())
    ////,entities:[{name:'name',value:'Fred'}
    ////d.run('give me something by ry cooder').then(function(response) {
    //d.run('next track').then(function(response) {
        //console.log(['BOT1',response,response])
        ////d.run({name:'hello'}).then(function(response) {
            ////console.log(['BOT2',response])
            ////d.run({name:'greet'}).then(function(response) {
                ////console.log(['BOT3',response])
                ////d.run({name:'name is',entities:[{name:'name',value:'Jill'}]}).then(function(response) {
                    ////console.log(['BOT5',response])
                ////})            
            ////})
        ////})  
        ////console.log(d.toJSON())
        
    //})

    ////d.run({name:'hello'})

    ////d.run({name:'greet'})

    ////d.run()
//}).catch(function(e) {
    //console.log(['ERROR',e])  
//})
