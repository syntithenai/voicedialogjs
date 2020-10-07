const { NlpManager } = require('node-nlp');
var lang='en'
const manager = new NlpManager({ languages: [lang] });
manager.importOpenNlu = function(openNluData) {
    //console.log(['openNluData',openNluData])
    // intents

        //"intents": {
            //"movie_runtime": [
              //{
                //"example": "Get the length of the film The Battle of Algiers",
                //"entities": [
                  //{
                    //"value": "The Battle of Algiers",
                    //"start": 27,
                    //"end": 49,
                    //"type": "movie"
                  //}
                //]
              //},
            //]
        //},
        
    // collate intents after removing sample values
    var collatedIntents={}   
    var collatedBeforeIntents={}   
    var collatedBetweenIntents={}   
    var collatedAfterIntents={}    
    if (openNluData.intents) { 
        Object.keys(openNluData.intents).map(function(intentName) {
            var examples = openNluData.intents[intentName]
            if (Array.isArray(examples)) {
                var offset = 0
                examples.map(function(example) {
                    var sentence = example.example
                    if (Array.isArray(example.entities)) {
                        
                        // replace entity values with {entityName}
                        // first sort entities by start key
                        var entities = example.entities.sort(function(a,b) {
                          if (a.start < b.start) return -1
                          else return 1  
                        })
                        var offset = 0
                        entities.map(function(entity) {
                            //console.log(entity)
                            // build trim conditions
                            //console.log([example.example,entity.start,entity.end,example.example.length])
                            if (entity.start === 0) {
                                collatedBeforeIntents[example.example.slice(entity.end)] = entity.type
                            } else if (entity.end === example.example.length+1) {
                                collatedAfterIntents[example.example.slice(0,entity.start)] = entity.type
                            } else {
                                collatedBetweenIntents[JSON.stringify([example.example.slice(0,entity.start),example.example.slice(entity.end-1)])] = entity.type
                            }
                            // replace entity values with markers
                            sentence = sentence.slice(0,entity.start + offset)+"%"+entity.type+"%"+sentence.slice(entity.end-1 + offset)
                            var diff = (entity.end - entity.start) - (entity.type.length + 2)
                            offset -= diff
                            return null
                        })
                    }
                    collatedIntents[sentence] = intentName
                })
            }
        })
        Object.keys(collatedBeforeIntents).map(function(key) {
            var entity = collatedBeforeIntents[key]
            //console.log(['Bef',lang,entity,key,{noSpaces:true}])
            manager.addBeforeCondition(lang,entity,key,{noSpaces:true})
        })
        Object.keys(collatedAfterIntents).map(function(key) {
            var entity = collatedAfterIntents[key]
            //console.log(['Aft',lang,entity,key,{noSpaces:true}])
            manager.addAfterCondition(lang,entity,key,{noSpaces:true})
        })
        Object.keys(collatedBetweenIntents).map(function(key) {
            var keyParts = JSON.parse(key)
            var entity = collatedBetweenIntents[key]
            console.log(['Between',lang,entity,keyParts[0],keyParts[1]])
            manager.addBetweenCondition(lang,entity,keyParts[0],keyParts[1],{noSpaces:true})
        })
        Object.keys(collatedIntents).map(function(key) {
            var intent = collatedIntents[key]
            //console.log(['ADD INTENT',lang,key,intent])
            manager.addDocument(lang,key,intent)
        })
    }
    console.log(['intents',
        JSON.stringify(collatedIntents),
        
        //JSON.stringify(collatedBeforeIntents),
        //JSON.stringify(collatedAfterIntents),
        //JSON.stringify(collatedBetweenIntents),
    ])
    //console.log(['RE',openNluData.regexps])
    if (Array.isArray(openNluData.regexps)) {
        openNluData.regexps.map(function(regexp) {
            if (regexp.entity && regexp.entity.trim()) {
                try {
                    console.log(['ADD RE',regexp.entity, [lang], regexp.synonym])
                    manager.addRegexEntity(regexp.entity, [lang], regexp.synonym.trim())
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }
    //console.log(['ED',JSON.stringify(openNluData.entitiesData)])
    if (openNluData.entitiesData) {
        Object.keys(openNluData.entitiesData).map(function(entityName) {
            var values = openNluData.entitiesData[entityName]
            //console.log(['ED ent',values])
            if (Array.isArray(values)) {
                values.map(function(entity) {
                    var synonyms = entity.synonym ? entity.synonym.trim().split("\n") : []
                
                    //console.log(['ADD NE',entityName,
                    //entity.value,
                    //['en'],
                    //synonyms])
                    manager.addNamedEntityText(
                    entityName,
                    entity.value,
                    ['en'],
                    synonyms,
                    );
                })
            }
        })
    }
    return manager.train()
    //utterancesData
    
   //console.log(['MANAGER',
        //manager.export()
    //]) 
}

module.exports=manager


//manager.addNamedEntityText(
  //'hero',
  //'spiderman',
  //['en'],
  //['Spiderman', 'Spider-man'],
//);
//manager.addNamedEntityText(
  //'hero',
  //'iron man',
  //['en'],
  //['iron man', 'iron-man'],
//);
//manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
//manager.addNamedEntityText(
  //'food',
  //'burguer',
  //['en'],
  //['Burguer', 'Hamburguer'],
//);
//manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
//manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);
//manager.addDocument('en', 'I saw %hero% eating %food%', 'sawhero');
//manager.addDocument(
  //'en',
  //'I have seen %hero%, he was eating %food%',
  //'sawhero',
//);
//manager.addDocument('en', 'I want to eat %food%', 'wanteat');

//manager.addBetweenCondition('en', 'fromEntity', 'from', 'to');
//manager.addAfterLastCondition('en', 'fromEntity', 'to');
//manager.addBetweenCondition('en', 'toEntity', 'to', 'from');
//manager.addAfterLastCondition('en', 'toEntity', 'from');

////manager.slotManager.addSlot('travel', 'fromCity', true, { en: 'From where you are traveling?' });
////manager.slotManager.addSlot('travel', 'toCity', true, { en: 'Where do you want to go?' });
////manager.slotManager.addSlot('travel', 'date', true, { en: 'When do you want to travel?' });
  
  
  


////manager.train().then(function() {
////manager
  ////.process('I saw spiderman eating spaghetti today in the city!')
  ////.then(result => console.log(result));
  //console.log(manager.export())
////})
