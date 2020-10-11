const { NeuralNetwork } = require('@nlpjs/neural');

function DialogManager(config) {
    //console.log(['DM CON',config])
    var history=[]
    var slots={}
    var manager = null
    // index rules by intent
    var rules = {}
    var utterancesAll = config.utterances
    
 
    const model = new NeuralNetwork();
    var manager = null;
    async function init() {
        if (Array.isArray(config.rules)) {
        //console.log('addrule is array')
            config.rules.map(function(rule) {
                //console.log(['ruule',rule, rule.steps,rule.steps[0],Array.isArray(rule.steps),rule.steps.length > 0,rule.steps[0].indexOf('intent '),rule.steps[0].indexOf('intent ') === 0])
                if (Array.isArray(rule.steps) && rule.steps.length > 0 && rule.steps[0].indexOf('intent ') === 0) {
                    rules[rule.steps[0]] = rule
                    //console.log('addrule')
                }
            })
        }
        //console.log(['rules',rules,config.rules])
        //return new Promise(function(resolve,reject) {
            // nlu model TODO merge utterances
            var NlpManager = require('./nlpManager')
            manager = await NlpManager()
            await manager.train(config.nlp)
            //.then(function() {
                //console.log(['MANAGER',JSON.stringify(manager.nlp.ner.rules.en)])

                // routing model
                if (config.json && Object.keys(config.json).length > 0) {
                    model = new NeuralNetwork();
                    model.fromJSON(config.json);
                    
                } else if (config.corpus && Object.keys(config.corpus).length > 0) {
                    await  train(config.corpus)
                } else if ((config.stories && Object.keys(config.stories).length > 0) || (config.rules && Object.keys(config.rules).length > 0)) {
                    await train(fromStories(config.stories))
                } else  {
                    return 'no training data'
                }
            //})
        //})  
    }
    
    function toJSON() {
        return {nlp: manager.toJSON(), core: model.toJSON()}
    }
    
    // HISTORY FUNCTIONS
    function pushIntent(intent) {
        if (intent && intent.name) {
            history.push('intent '+intent.name) 
            if (Array.isArray(intent.entities)) {
                intent.entities.map(function(entity) {
                    if (entity.name)  {
                        history.push('slot_'+entity.name) //+"_"+entity.value)
                        slots[entity.name] = entity.value
                    }
                })
            }
        }
    }
    
    function pushEntity(entity) {
        if (entity.name)  {
            history.push('slot '+entity.name) //+"_"+entity.value)
            slots[entity.name] = entity.value
        }
    }
    
    function pushUtterance(utterance) {
        if (utterance.name)  {
            history.push('utter '+utterance.name)
        }
    }
    
    function pushAction(action) {
        if (action.name)  {
            history.push('action '+action.name)
        }
    }
    
    function resetHistory() {
        history=[]
    }
    
    // training
    function train(corpus) {
        return new Promise(function(resolve,reject) {
            console.log(['TRAIN',JSON.stringify(corpus)])
            model.train(corpus);
            resolve()
        })
    }
    
    // return corpus given stories format
    function fromStories(stories) {
        var newCorpus = []
        if (Array.isArray(stories) && stories.length > 0) {
            stories.map(function(story) {
                console.log(['FROM STORY',JSON.stringify(story)])
                if (story.steps) {
                    story.steps.map(function(step,i) {
                        console.log(['FROM STORY STEP',JSON.stringify(step)])
                         if (i > 0 && step.indexOf('utter ') === 0 || step.indexOf('action ') === 0) {
                             var input = story.steps.slice(0,i)
                             var output = story.steps[i]
                             newCorpus.push({input: arrayToWeights(input),output: arrayToWeights([output])})
                         }
                    })
                }  
            })
        }
        console.log(['fromstories',JSON.stringify(newCorpus)])
        console.log(['fromstories raw',JSON.stringify(stories)])
        return newCorpus
    }
    
    //function fromRules(rules) {
        //var newCorpus = []
        //if (Array.isArray(rules) && rules.length > 0) {
            //rules.map(function(rule) {
                //if (rule.steps) {
                    //rule.steps.map(function(step,i) {
                         ////console.log(['step',story.story,i,step])
                         //if (i > 0 && step.startsWith('utter_') || step.startsWith('action_')) {
                             //var input = story.steps.slice(0,i)
                             //var output = story.steps[i]
                             ////console.log(['IN OUT',input,output])
                             //newCorpus.push({input: arrayToWeights(input),output: arrayToWeights([output])})
                         //}
                    //})
                //}  
            //})
        //}
        ////console.log(['CORP',JSON.stringify(newCorpus)])
        //return newCorpus
    //}
    
    // predict the next action given the current history
    function predict() {
        var now = {}
        history.map(function(log) {
          now[log] = 1
          return null   
        })
        var results = model.run(now)
        if (results && Object.keys(results).length > 0) {
            var resultsArray = Object.keys(results).map(function(option) {
                  return {next:option, score:results[option]}
            })
            var final = resultsArray.sort(function(a,b) {if (a.score > b.score) return -1; else return 1});
            //console.log(['FINAL',final])
            return final.length > 0 ? final[0].next : ''
        }
        return null
    }
    
    function arrayToWeights(input) {
        var final = {}
        if (Array.isArray(input) && input.length > 0) {
            input.map(function(item) {
              final[item] = 1
              return null   
            })
        }
        return final
    }
    
    // log the intent and slots into the history
    // loop, predicting the next action/utterance/intent 
    // each actions can set slots into the history and current slots then return utterances 
    // when we meet an intent, and respond with the text collated from loop action/utterances
    function run(intentIn) {
        var utterances=[]
        //console.log(['USER',intentIn])
        var intent = {}

        return new Promise(function(resolve,reject) {
            if (typeof intentIn == "string") {
                if (!manager) throw new Error('Cannot handle string intent without a manager configured')
                //console.log(['STRING INTENT',intentIn])
                try {
                    manager.process(intentIn).then(result => {
                        //console.log(result)
                        intent.name = result.intent
                        intent.entities = result.entities
                        runIntent(intent).then(function() {
                            resolve(utterances)
                        })
                    }).catch(function(e) {
                        console.log(e)
                    });
                } catch (e) {
                    console.log(e)
                }
                //console.log(manager.export())
            } else if (typeof intentIn == "object" && intentIn.name && intentIn.name.trim()) {
                intent = intentIn
                runIntent(intent).then(function() {
                    resolve(utterances)
                })
            }
            
        })
        
        
        function runRuleStep(step) {
            //console.log(['run rule step',step,step.indexOf('action '),step.indexOf('utter ')])
            return new Promise(function(resolve,reject) {
                if (step.indexOf('action ') === 0) {
                    history.push(step)
                    if (config.actions && typeof config.actions[step] === 'function') {
                        config.actions[step](history,slots,config).then(function(utterances,actionSlots) {
                             // action can return slots
                            if (Array.isArray(actionSlots)) {
                                actionSlots.map(function(slot) { 
                                    history.push('slot '+slot.name) 
                                    slots[slot.name] = slot.value
                                })
                            }
                            // action can return utterances
                            if (Array.isArray(utterances)) {
                                utterances.map(function(utterance) { 
                                    var nextUtterance ='utter_'+utterance
                                    history.push(nextUtterance) 
                                    var templates = utterancesAll[nextUtterance]
                                    var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                                    //console.log(['TMPL',templates,template])
                                    Object.keys(slots).map(function(slot) {
                                        template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                                        //template = template.replaceAll('{'+slot+'}',slots[slot])
                                    })
                                    // clear remaining markers
                                    template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                                    utterances.push(template)
                                })
                            }
                            resolve()
                        })
                    } else {
                         resolve()
                    }
                } else if (step.indexOf('utter ') === 0) {
                    //console.log(['do utter',step,utterancesAll])
                    if (utterancesAll && utterancesAll[step]) {
                        history.push(step)
                        var templates = utterancesAll[step]
                        var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                        //console.log(['TMPL',templates,template])
                        Object.keys(slots).map(function(slot) {
                            template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                            //template = template.replaceAll('{'+slot+'}',slots[slot])
                        })
                        // clear remaining markers
                        template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                        utterances.push(template)
                    } 
                    resolve()
                }
            })
        }
        
        function runStoryStep(next) {
            console.log(['run story step',next])
            return new Promise(function(resolve,reject) {
                if (next.indexOf('action ') === 0) {
                    console.log(['ACT',next])
                    if (config.actions && typeof config.actions[next] === 'function') {
                        history.push(next)
                        config.actions[next](history,slots,config).then(function(utterances,actionSlots) {
                            // action can return slots
                            if (Array.isArray(actionSlots)) {
                                actionSlots.map(function(slot) { 
                                    history.push('slot '+slot.name) 
                                    slots[slot.name] = slot.value
                                })
                            }
                            // action can return utterances
                            if (Array.isArray(utterances)) {
                                utterances.map(function(utterance) { 
                                    var nextUtterance ='utter '+utterance
                                    history.push(nextUtterance) 
                                    var templates = utterancesAll[nextUtterance]
                                    var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                                    console.log(['TMPL',templates,template])
                                    Object.keys(slots).map(function(slot) {
                                        template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                                        //template = template.replaceAll('{'+slot+'}',slots[slot])
                                    })
                                    // clear remaining markers
                                    template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                                    utterances.push(template)
                                })
                            }
                            resolve()
                        })
                    } else {
                         resolve()
                    }
                    
                } else if (next.indexOf('utter ' === 0)) {
                    console.log(['UTT',next])
                    if (utterancesAll && utterancesAll[next]) {
                        history.push(next)
                        var templates = utterancesAll[next]
                        var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                        console.log(['TMPL',templates,template])
                        Object.keys(slots).map(function(slot) {
                            template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                            //template = template.replaceAll('{'+slot+'}',slots[slot])
                        })
                        // clear remaining markers
                        template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                        utterances.push(template)
                    } 
                    resolve()
                }
            })
        }
        
        function runIntent(intent) {
            return new Promise(function(resolve,reject) {
                //console.log(['INTENT',intent,'RULES',rules])
                var intentName = intent && intent.name ? 'intent ' + intent.name : ''
                //
                if (intentName && rules[intentName] && rules[intentName].steps && rules[intentName].steps.length > 1) {
                    console.log(['RUN INTENT',intentName])
                    history.push(intentName)
                    // set slot values
                    if (Array.isArray(intent.entities)) intent.entities.map(function(entity) {
                        history.push('slot '+entity.entity) //+"_"+entity.value)
                        slots[entity.entity] = entity.option
                    })
                    console.log(['slots',intent.entities,slots])
                    // loop through action and utter processing steps
                    function runRuleSteps(steps) {
                        
                        return new Promise(function(iresolve,ireject) {
                            if (Array.isArray(steps) && steps.length > 0) {
                                var step = steps[0]
                                runRuleStep(step).then(function() {
                                    //console.log(['done  RUN RULEStep'])
                                    if (step && (step.indexOf('action ') === 0 || step.indexOf('utter ' === 0))) {
                                        runRuleSteps(steps.slice(1)).then(function() {iresolve()})
                                    } else {
                                        // invalid step (must be utter or action)
                                        iresolve()
                                    }
                                })
                            } else {
                                // no more steps
                                iresolve()
                            }
                        })
                    }
                    //console.log(['start RUN RULES',rules[intentName].steps.slice(1)])
                    // skip the first step for a rule which is the triggering intent
                    runRuleSteps(rules[intentName].steps.slice(1)).then(function() {
                        //console.log(['done  RUN RULES'])
                        resolve(utterances)
                    })
                    
                } else {
                    console.log(['STORY + ', JSON.stringify(intent)])
                    pushIntent(intent)
                    // set slot values
                    if (Array.isArray(intent.entities)) intent.entities.map(function(entity) {
                        history.push('slot '+entity.entity) //+"_"+entity.value)
                        slots[entity.entity] = entity.option
                    })
                    console.log(['slots',intent.entities,slots])
                    var last = null
                    function runStorySteps() {
                        return new Promise(function(iresolve,ireject) {
                            var next = predict()
                            console.log(['STORY predict',next,history])
                            if (next && next !== last && (next.indexOf('action ') === 0 || next.indexOf('utter ') === 0)) {
                                last = next
                                console.log(['STORY predict action or utter',next])
                                runStoryStep(next).then(function() {
                                    next = predict()
                                    if (next && (next.indexOf('action ') === 0 || next.indexOf('utter ') === 0)) {
                                        runStorySteps().then(function() {iresolve()})
                                    } else {
                                        // invalid step (must be utter or action)
                                        iresolve()
                                    }
                                })
                            } else {
                                // no more steps
                                iresolve()
                            }
                        })
                    }
                    // skip the first step for a rule which is the triggering intent
                    runStorySteps().then(function() {
                        resolve(utterances)
                    })
                    
                }
               // console.log(['DONE ',utterances,history,slots])
            })
        }
    }
    
    
    
    return {init, pushIntent, pushEntity, pushAction, pushUtterance, resetHistory, train, predict,arrayToWeights, run, fromStories, history, slots, model, toJSON}
}
module.exports = DialogManager
