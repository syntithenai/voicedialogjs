const { NeuralNetwork } = require('@nlpjs/neural');
const corpus = require('./corpus.json');
var config = require('./config')
var d = DialogManager(config)
d.init().then(function() {
    //console.log(config)
    //d.pushIntent()
    //console.log(d.predict())
    //,entities:[{name:'name',value:'Fred'}
    d.run({name:'greet'}).then(function(response) {
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

// { who: 0, developer: 0, birthday: 0.7975805386427789 }

function DialogManager(config) {
    var history=[]
    var slots={}
    // index rules by intent
    var rules = {}
    //console.log(['cRULE',JSON.stringify(config.rules)])
    if (Array.isArray(config.rules)) {
        config.rules.map(function(rule) {
            if (rule.steps && rule.steps.length > 0 && rule.steps[0].startsWith('intent_')) {
                rules[rule.steps[0]] = rule
            }
        })
    }
    
    const model = new NeuralNetwork();
    
    function init() {
        return new Promise(function(resolve,reject) {
            if (config.json && Object.keys(config.json).length > 0) {
                model = new NeuralNetwork();
                model.fromJSON(config.json);
                resolve()
            } else if (config.corpus && Object.keys(config.corpus).length > 0) {
                train(config.corpus).then(function() {resolve()})
            } else if ((config.stories && Object.keys(config.stories).length > 0) || (config.rules && Object.keys(config.rules).length > 0)) {
                train(fromStories(config.stories)).then(function() {resolve()})
            } else  {
                //console.log('no training data')
                reject('no training data')
            }
        })
    }
    
    // HISTORY FUNCTIONS
    function pushIntent(intent) {
        if (intent && intent.name) {
            history.push('intent_'+intent.name) 
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
            history.push('slot_'+entity.name) //+"_"+entity.value)
            slots[entity.name] = entity.value
        }
    }
    
    function pushUtterance(utterance) {
        if (utterance.name)  {
            history.push('utter_'+utterance.name)
        }
    }
    
    function pushAction(action) {
        if (action.name)  {
            history.push('action_'+action.name)
        }
    }
    
    function resetHistory() {
        history=[]
    }
    
    // training
    function train(corpus) {
        return new Promise(function(resolve,reject) {
            //console.log(['TRAIN',JSON.stringify(corpus)])
            model.train(corpus);
            resolve()
        })
    }
    
    // return corpus given stories format
    function fromStories(stories) {
        var newCorpus = []
        if (Array.isArray(stories) && stories.length > 0) {
            stories.map(function(story) {
                if (story.steps) {
                    story.steps.map(function(step,i) {
                         //console.log(['step',story.story,i,step])
                         if (i > 0 && step.startsWith('utter_') || step.startsWith('action_')) {
                             var input = story.steps.slice(0,i)
                             var output = story.steps[i]
                             //console.log(['IN OUT',input,output])
                             newCorpus.push({input: arrayToWeights(input),output: arrayToWeights([output])})
                         }
                    })
                }  
            })
        }
        //console.log(['CORP',JSON.stringify(newCorpus)])
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
        //{ when: 1, birthday: 1 }
        //console.log(['HI',history])
        //console.log(['NOW',now])
        
        var results = model.run(now)
        //console.log(['RES',results])
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
    function run(intent) {
        var utterances=[]
            
        function runRuleStep(step) {
            console.log(['run rule step',step])
            return new Promise(function(resolve,reject) {
                if (step.startsWith('action_')) {
                    history.push(step)
                    if (config.actions && typeof config.actions[step] === 'function') {
                        config.actions[step](history,slots,config).then(function(actionSlots) {
                            if (Array.isArray(actionSlots)) {
                                actionSlots.map(function(slot) { 
                                    history.push('slot_'+slot.name) 
                                    slots[slot.name] = slot.value
                                })
                            }
                            resolve()
                        })
                    } else {
                         resolve()
                    }
                } else if (step.startsWith('utter_')) {
                    if (config.utterances && config.utterances[step]) {
                        history.push(step)
                        var templates = config.utterances[step]
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
            console.log(['run rule step',step])
            return new Promise(function(resolve,reject) {
                if (next.startsWith('action_')) {
                    if (config.actions && typeof config.actions[next] === 'function') {
                        history.push(next)
                        config.actions[step](history,slots,config).then(function(actionSlots) {
                            if (Array.isArray(actionSlots)) {
                                actionSlots.map(function(slot) { 
                                    history.push('slot_'+slot.name) 
                                    slots[slot.name] = slot.value
                                })
                            }
                            resolve()
                        })
                    } else {
                         resolve()
                    }
                    
                } else if (next.startsWith('utter_')) {
                    if (config.utterances && config.utterances[next]) {
                        history.push(next)
                        var templates = config.utterances[next]
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
        
        
        return new Promise(function(resolve,reject) {
            //console.log(['INTENT',intent,'RULES',JSON.stringify(rules)])
            var intentName = intent && intent.name ? 'intent_' + intent.name : ''
            //console.log(['INTNAM',intentName])
            if (intentName && rules[intentName] && rules[intentName].steps && rules[intentName].steps.length > 1) {
                history.push(intentName)
                //console.log(['RULE',intentName])
                //var i = 1;
                //var last = null
                // loop through action and utter processing steps
                function runRuleSteps(steps) {
                    return new Promise(function(iresolve,ireject) {
                        if (Array.isArray(steps) && steps.length > 0) {
                            var step = steps[0]
                            runRuleStep(step).then(function() {
                                if (step && (step.startsWith('action_') || step.startsWith('utter_'))) {
                                    runRuleSteps(steps.slice(1))
                                } else {
                                    // invalid step (must be utter or action)
                                    resolve()
                                }
                            })
                        } else {
                            // no more steps
                            resolve()
                        }
                    })
                }
                // skip the first step for a rule which is the triggering intent
                runRuleSteps(rules[intentName].steps.slice(1)).then(function() {
                    resolve(utterances)
                })
                //while (step !== last && step && (step.startsWith('action_') || step.startsWith('utter_'))) {
                    
                    
                //}
            } else {
                console.log('STORY')
                pushIntent(intent)
                
                function runStorySteps(steps) {
                    var next = predict()
                    return new Promise(function(iresolve,ireject) {
                        if (Array.isArray(steps) && steps.length > 0) {
                            var step = steps[0]
                            runRuleStep(step).then(function() {
                                if (step && (step.startsWith('action_') || step.startsWith('utter_'))) {
                                    runRuleSteps(steps.slice(1))
                                } else {
                                    // invalid step (must be utter or action)
                                    resolve()
                                }
                            })
                        } else {
                            // no more steps
                            resolve()
                        }
                    })
                }
                // skip the first step for a rule which is the triggering intent
                runStorySteps(rules[intentName].steps.slice(1)).then(function() {
                    resolve(utterances)
                })
                
                
                
                
                //var last = null;
                //// while the computer is working through utterances and actions to prepare a response
                //while (next !== last && (next.startsWith('action_') || next.startsWith('utter_'))) {
                    //runStoryStep(next)
                    
                    //last = next
                    //next = predict()
                    ////console.log(['LOOP ',next,history,slots])
                //}
            }
            console.log(['DONE ',utterances,history,slots])
        })
    }
    
    
    
    return {init, pushIntent, pushEntity, pushAction, pushUtterance, resetHistory, train, predict,arrayToWeights, run, fromStories, history, slots, model}
}
