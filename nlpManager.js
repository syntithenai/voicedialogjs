const { NlpManager } = require('node-nlp');
var lang='en'


function getManager(openNluData) {
    var nlpManager = new NlpManager({ languages: [lang],forceNER: true, autoLoad: false,  autoSave: false, ner: { threshold: 1 } }); //, autoSave: false
     
        // collate intents
        var collatedIntents={}   
        var entitiesList={}    
        if (openNluData.intents) { 
            Object.keys(openNluData.intents).map(function(intentName) {
                var examples = openNluData.intents[intentName]
                if (Array.isArray(examples)) {
                    var offset = 0
                    examples.map(function(example) {
                        var sentence = example.example
                        if (Array.isArray(example.entities)) {
                            var entities = example.entities.sort(function(a,b) {
                              if (a.start < b.start) return -1
                              else return 1  
                            })
                            var offset = 0
                            entities.map(function(entity) {
                                // save entity values from examples
                                entitiesList[entity.type] = entitiesList[intentName] ? entitiesList[intentName] : []
                                entitiesList[entity.type].push({'value':entity.value})
                                // replace entity values with markers
                                sentence = sentence.slice(0,entity.start + offset)+"%"+entity.type+"%"+sentence.slice(entity.end + offset)
                                console.log(sentence)
                                var diff = (entity.end - entity.start) - (entity.type.length + 2)
                                offset -= diff
                                return null
                            })
                        }
                        collatedIntents[sentence] = intentName
                    })
                }
            })
          
            Object.keys(collatedIntents).map(function(key) {
                var intent = collatedIntents[key]
                nlpManager.addDocument(lang,key,intent)
            })
        }
        if (Array.isArray(openNluData.regexps)) {
            openNluData.regexps.map(function(regexp) {
                if (regexp.entity && regexp.entity.trim()) {
                    try {
                        nlpManager.addRegexEntity(regexp.entity, [lang], regexp.synonym)
                    } catch (e) {
                        console.log(e)
                    }
                }
            })
        }
        
        if (openNluData.entities && openNluData.entitiesData) {
             Object.keys(openNluData.entities).map(function(entityName) {
                var entity = openNluData.entities[entityName]
                entitiesList[entityName] = entitiesList[entityName] ? entitiesList[entityName] : []
                if (entity.values) entity.values.map(function(value) {
                    entitiesList[entityName].push({value:value})  
                })
                if (entity.lists) entity.lists.map(function(value) {
                    if (Array.isArray(openNluData.entitiesData[value])) {
                        openNluData.entitiesData[value].map(function(ent) {
                            entitiesList[entityName].push(ent)  
                        })
                    }
                })
             })
        }
        
        Object.keys(entitiesList).map(function(entityName) {
            var values = entitiesList[entityName]
            if (Array.isArray(values)) {
                // first collate by synonym
                var synonymCollation = {}
                var remainder = {}
                values.map(function(entity) {
                    if (entity.synonym && entity.synonym.trim()) {
                        synonymCollation[entity.synonym] = synonymCollation[entity.synonym] ? synonymCollation[entity.synonym] : []
                        synonymCollation[entity.synonym].push(entity.value)
                    } else {
                        // avoid duplicates
                        remainder[entity.value] = 1
                    }
                    return null
                })
                Object.keys(synonymCollation).map(function(synonym) {
                    nlpManager.addNamedEntityText(
                        entityName,
                        synonym,
                        [lang],
                        [synonym],
                    );
                    nlpManager.addNamedEntityText(
                        entityName,
                        synonym,
                        [lang],
                        synonymCollation[synonym],
                    );
                })
                Object.keys(remainder).map(function(entityValue) {
                    console.log(['NLP ADD ENT',entityName,entityValue])
                    console.log()
                    nlpManager.addNamedEntityText(
                        entityName,
                        entityValue,
                        [lang],
                        [entityValue],
                    );
                })
                
                
            }
        })
        return nlpManager
 
}

module.exports=getManager
