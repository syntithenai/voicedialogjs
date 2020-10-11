const {containerBootstrap} = require('@nlpjs/core');
const {Nlp} = require('@nlpjs/nlp');
const {Ner} = require('@nlpjs/ner')
const {LangEn} = require('@nlpjs/lang-en-min');

//window.nlpjs = { ...core, ...nlp, ...langenmin , ...ner};

//const { NlpManager } = require('node-nlp');
var lang='en'


async function NlpManager() {
    
    const ner = new Ner();
    const container = await containerBootstrap();
    container.use(Nlp);
    container.use(LangEn);
    const nlp = container.get('nlp');
    nlp.settings.autoSave = false;
    nlp.settings.autoLoad = false;
    nlp.settings.forceNER = true;
    nlp.addLanguage(lang);
    
    async function train(openNluData) {
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
                                //console.log(sentence)
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
                //console.log(['NLP ADD DOC',key, intent]) //.replaceAll(' ','.')])
                nlp.addDocument(lang, key, intent) //.replaceAll(' ','.'));
                //nlpManager.addDocument(lang,key,intent)
            })
            
            //nlp.addDocument('en', 'goodbye for now', 'greetings.bye');
    //nlp.addDocument('en', 'bye bye take care', 'greetings.bye');
    //nlp.addDocument('en', 'okay see you later', 'greetings.bye');
    //nlp.addDocument('en', 'bye for now', 'greetings.bye');
    //nlp.addDocument('en', 'i must go', 'greetings.bye');
    //nlp.addDocument('en', 'hello', 'greetings.hello');
    //nlp.addDocument('en', 'hi', 'greetings.hello');
    //nlp.addDocument('en', 'howdy', 'greetings.hello');
    //nlp.addDocument('en', 'my %username%', 'greetings.me');
    
           await nlp.train() 
        }
        if (Array.isArray(openNluData.regexps)) {
            openNluData.regexps.map(function(regexp) {
                if (regexp.entity && regexp.entity.trim()) {
                    try {
                        ner.addRegexRule('en',regexp.entity,regexp.synonym) //(^|[^@\w])@(\w{1,15})\b/)
                        //nlpManager.addRegexEntity(regexp.entity, [lang], regexp.synonym)
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
                    ner.addRuleOptionTexts(lang, entityName, synonym, [synonym]);
                    ner.addRuleOptionTexts(lang, entityName, synonym, synonymCollation[synonym]);
                    //nlpManager.addNamedEntityText(
                        //entityName,
                        //synonym,
                        //[lang],
                        //[synonym],
                    //);
                    //nlpManager.addNamedEntityText(
                        //entityName,
                        //synonym,
                        //[lang],
                        //synonymCollation[synonym],
                    //);
                })
                Object.keys(remainder).map(function(entityValue) {
                    //console.log(['NLP ADD ENT',entityName,entityValue])
                    //console.log()
                    ner.addRuleOptionTexts(lang, entityName, entityValue, [entityValue]);
                    //nlpManager.addNamedEntityText(
                        //entityName,
                        //entityValue,
                        //[lang],
                        //[entityValue],
                    //);
                })
                
                
            }
        })
    }
    
    function toJSON() {
        return {nlp: JSON.parse(nlp.export()), core: ner.getRules()}
    }
    
    async function process(utterance) {
        //console.log(['nlp process',utterance])
        var result = await nlp.process(lang, utterance)
        var entities = await ner.process({ locale: lang, text: utterance});
        //console.log(['nlp process',result,entities])
        result.entities = entities.entities
        return result
    }
    
    return {train,process,toJSON}
}
    
    //ner.addRuleOptionTexts('en', 'hero', 'spiderman', ['spiderman', 'spider-man', 'Peter Parker']);
    //ner.addRuleOptionTexts('en', 'hero', 'batman', ['batman', 'dark knight', 'Bruce Wayne']);
    //ner.addRuleOptionTexts('en', 'food', 'pasta', ['pasta', 'spaghetti', 'macaroni', 'raviolli']);
    //ner.addRuleOptionTexts('en', 'food', 'fruit', ['apple', 'banana', 'macaroni', 'strawberry']);
    //ner.addRegexRule('en','username',/(^|[^@\w])@(\w{1,15})\b/)
    //const result = await ner.process({ locale: 'en', text: 'I saw 23 three peter prker eating an aple in New York @steve' });
    //console.log(result);

      
    //////// Adds the utterances and intents for the NLP
    //nlp.addDocument(lang, 'goodbye for now', 'greetings.bye');
    //////await nlp.train();
    
    ////var sent = "my steve"
    
    //////const response = await nlp.process('en', sent);
    //////console.log(response);
    
    //var nlpManager = new NlpManager({ languages: [lang],forceNER: true, autoLoad: false,  autoSave: false, ner: { threshold: 1 } }); //, autoSave: false
     
        ///
        //return nlpManager
 
//}

module.exports=NlpManager
