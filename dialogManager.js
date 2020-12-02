/* global window */
/* global gapi */
//console.log('API WIN PRE',window)
// ensure window available for nodejs
var window = window ? window : {}
var gapi = gapi ? gapi : null
window.gapi = gapi
//console.log('API WIN DSS',window,gapi)
const { NeuralNetwork } = require('@nlpjs/neural');
var searchYouTube = require('youtube-api-search');
window.searchYouTube = searchYouTube
const axios = require('axios');


                
var balanced = require('balanced-match');

window.balanced = balanced

const jsChess = require('js-chess-engine')
window.jsChess = jsChess

const words2numbers = require('words-to-numbers')
window.words2numbers = words2numbers

const youtubeapisearch = require('youtube-api-search')
window.youtubeapisearch = youtubeapisearch

const compromise = require('compromise')
window.compromise = compromise


function DialogManager(config) {
    //console.log(['DM CON',config])
    var history=[]
    //var chatHistory = []
    
    var slots={}
    var currentForm=null
    // index rules by intent
    var rules = {}
    var utterancesAll = config.utterances
    var lastUserText = null
    
    var currentIntent = {}
        
          
    function setHistory(val) {
        //return
        history=val
    }
  
     
    const model = new NeuralNetwork({log: false});
    // NLU manager
    var manager = null;
    
    /** 
     * Async initialise dialog manager by 
     * - creating NlpManager
     * - training/loading dialog model from stories/rules/corpus/json
     * - running the welcome intent
     */
    function init() {
        var that = this
        console.log(['HAN init ',that.handleBotMessage])
        return new Promise (function(resolve,reject) {
            
            // run if available then resolve
            function runWelcomeIntent(shouldRunWelcomeIntent) {
               // resolve() // TODO RESTORE OR CLEANUP
                //console.log(['HAN run welcome ',shouldRunWelcomeIntent])
                if (shouldRunWelcomeIntent)  {
                    //setTimeout(function() {
                        runIntent({name:'welcome'},'',that.handleBotMessage).then(function(utterances) {
                            //history.push()
                            //console.log(['runintut',utterances,history,chatHistory])
                            //setHistory(history)
                            //chatHistory.push({bot:utterances})
                            //console.log(['RAN WLECOME',utterances])
                            //utterances.map(function(utterance) {
                                //console.log(['handle welcome ',that.handleBotMessage,utterance])
                                //if (that.handleBotMessage) that.handleBotMessage(utterance)
                            //})
                            resolve(utterances)
                        })
                    //} ,1000)
                } else {
                    resolve([])
                }
            }

            var shouldRunWelcomeIntent = false
            // index rules and identify welcome intent
            if (Array.isArray(config.rules)) {
                config.rules.map(function(rule) {
                    if (Array.isArray(rule.steps) && rule.steps.length > 0 && rule.steps[0].indexOf('intent ') === 0) {
                        // unique per trigger intent and conditions (jsonified)
                        rules[rule.steps[0]+(rule.conditions ? JSON.stringify(rule.conditions) : '')] = rule
                        var ruleName = rule.steps[0].slice(7)
                        if (ruleName === "welcome") {
                            // TODO CHECK CONDITIONS
                            shouldRunWelcomeIntent = true
                        }
                    }
                })
            }
            
            // create and train NlpManager and neural dialog model
            var NlpManager = require('./nlpManager')
            NlpManager().then(function(newManager) {
                manager = newManager
                try {
                    manager.train(config).then(function() {
                            
                        // routing model
                        if (config.json && Object.keys(config.json).length > 0) {
                            model = new NeuralNetwork({log: false});
                            model.fromJSON(config.json);
                            runWelcomeIntent(shouldRunWelcomeIntent)
                            
                        } else if (config.corpus && Object.keys(config.corpus).length > 0) {
                            train(config.corpus).then(function() {
                                runWelcomeIntent(shouldRunWelcomeIntent)
                            })
                        } else if ((config.stories && Object.keys(config.stories).length > 0) || (config.rules && Object.keys(config.rules).length > 0)) {
                            train(fromStories(config.stories)).then(function() {
                                runWelcomeIntent(shouldRunWelcomeIntent)
                            })
                        } else  {
                            resolve( 'no training data')
                        }
                        //console.log(['MANAGER trained',manager])
                    })
                } catch (e) {
                    console.log(e)
                    resolve('Error during training '+e.toString())
                }
            })  
        })
    }
    
    /**
     * Export internal state to JSON
     */
    function toJSON() {
        return {nlp: manager.toJSON(), core: model.toJSON()}
    }

    // HISTORY FUNCTIONS
    /**
     * Push an intent into the history of the dialog
     * If the intent has entities, push those as slots
     * TODO fix the above to use slots from entity (restricted mapping)
     */
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
    
    /**
     * Push an entity into the history of the dialog
     */
    function pushEntity(entity) {
        if (entity.name)  {
            history.push('slot '+entity.name) //+"_"+entity.value)
            slots[entity.name] = entity.value
        }
    }
    
    /**
     * Push an utterance into the history of the dialog
     */
    function pushUtterance(utterance) {
        if (utterance.name)  {
            history.push('utter '+utterance.name)
        }
    }
    
    /**
     * Push an action into the history of the dialog
     */
    function pushAction(action) {
        if (action.name)  {
            history.push('action '+action.name)
        }
    }
    
    /**
     * Clear the history
     */
    function resetHistory() {
        //console.log('DM RESET HIST')
        history=[]
    }
    
    /**
     * Async train the dialog model from a corpus
     */
    function train(corpus) {
        return new Promise(function(resolve,reject) {
            //console.log(['TRAIN',JSON.stringify(corpus)])
            model.train(corpus);
            resolve()
        })
    }
    
    /**
     *  Build a corpus of training data for a given stories format
     */
    function fromStories(stories) {
        var newCorpus = []
        if (Array.isArray(stories) && stories.length > 0) {
            stories.map(function(story) {
                //console.log(['FROM STORY',JSON.stringify(story)])
                if (story.steps) {
                    story.steps.map(function(step,i) {
                        //console.log(['FROM STORY STEP',JSON.stringify(step)])
                         if (i > 0 && step.indexOf('utter ') === 0 || step.indexOf('action ') === 0) {
                             var input = story.steps.slice(0,i)
                             var output = story.steps[i]
                             newCorpus.push({input: arrayToWeights(input),output: arrayToWeights([output])})
                         }
                    })
                }  
            })
        }
        return newCorpus
    }
    
    function fromHistory(history) {
        //console.log(['FROM HISTORY',history])
        var now = {}
        history.map(function(log) {
          now[log] = 1
          return null   
        })
        return now
    }
    
    /**
     *  Predict the next action given the current history
     */
    function predict() {
        //console.log(['PREDICT from history',history])
        var now = fromHistory(history)
        var results = model.run(now)
        //console.log(['PREDICT ran',now,results])
        if (results && Object.keys(results).length > 0) {
            var resultsArray = Object.keys(results).map(function(option) {
                  return {next:option, score:results[option]}
            })
            var final = resultsArray.sort(function(a,b) {if (a.score > b.score) return -1; else return 1});
            if ( final.length > 0) {
                //console.log(['PREDICT FINAL',final[0].next])
                return final[0].next
            } else {
                //console.log(['PREDICT FINAL NONE'])
                return ''
            }
        }
        return null
    }
    
    /**
     *  Convert and array of keys into object weights suitable for corpus
     */
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

    /**
     * For template markers that reference _data
     * Exec 'return '+code  with data and slots in context
     */
    function lookupDataWithSlots(data, slots, code) {
        console.log(['LOOKUPDATETAWITHSLOTS',data, slots, code])
        if (data) {
            var f = new Function('_data','slots','var a=""; try { a = '+ code + '} catch (e) {} ;return a')
            var res = f(data,slots, code)
            //console.log(res)
            return res
        }
    }
    
    function replaceData(data) {
        var latestText = data
        
        // replace the remaining {}
        var b = balanced('{','}',latestText)
        var limit = 20
        while (b && limit) {
            if (b.body.trim().indexOf('_data') === 0) {
                latestText = (b.pre ? b.pre : '') + lookupDataWithSlots((config && config.config && config.config.contextData ? config.config.contextData : {}),slots,b.body) + (b.post ? b.post : '')
            } else {
                latestText = (b.pre ? b.pre : '') + (b.post ? b.post : '')
            }
            b = balanced('{','}',latestText)
            limit --
        }
        return latestText
    }
    
    /** 
     * Replace slot values into markers in the synonyms, buttons and texts elements of an utterance
     * Return an utterances with updated values
     */
    function replaceMarkersInUtterance(utterance,slots) {
        if (utterance) {
            console.log(['API REAPLCE MARKERS',utterance,slots,config])
            var contextData = (config && config.config && config.config.contextData ? config.config.contextData : {})
            //try {
                //if (config && config.config  && config.config.contextData) contextData = JSON.parse(config.config.contextData)
            //} catch (e) {}
            console.log(['CD',contextData])
            var newUtterance = JSON.parse(JSON.stringify(utterance))
            //console.log(['API REAPLCE MARKERS',utterance,JSON.parse(JSON.stringify(slots))])
            if (utterance && utterance.synonym) {
                //console.log(['API REAPLCE MARKERS syn',utterance.synonym])
                 Object.keys(slots).map(function(slot) {
                     //console.log(['API REAPLCE MARKERS syn slot',slot,utterance.synonym])
                    newUtterance.synonym = newUtterance.synonym.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                    //console.log(['API REAPLCE MARKERS syn slot done',newUtterance.synonym])
                })
                
                
                var latestText = newUtterance.synonym
        
                // replace the remaining {}
                var b = balanced('{','}',latestText)
                var limit = 20
                while (b && limit) {
                    if (b.body.trim().indexOf('_data') === 0) {
                        latestText = (b.pre ? b.pre : '') + lookupDataWithSlots((config && config.config && config.config.contextData ? config.config.contextData : {}),slots,b.body) + (b.post ? b.post : '')
                    } else {
                        latestText = (b.pre ? b.pre : '') + (b.post ? b.post : '')
                    }
                    b = balanced('{','}',latestText)
                    limit --
                } 
                newUtterance.synonym = replaceData(newUtterance.synonym) //latestText
                
            }
            //console.log(['API REAPLCE MARKERS syn',newUtterance.synonym])
            if (utterance && utterance.buttons) {
                utterance.buttons.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                         newUtterance.buttons[buttonKey].label = newUtterance.buttons[buttonKey].label ? replaceData(newUtterance.buttons[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.buttons[buttonKey].utterance = newUtterance.buttons[buttonKey].utterance ? replaceData(newUtterance.buttons[buttonKey].utterance.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.buttons[buttonKey].link = newUtterance.buttons[buttonKey].link ? replaceData(newUtterance.buttons[buttonKey].link.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                    })
                })
            }
            if (utterance && utterance.texts) {
                utterance.texts.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                        //console.log(['TEXT REPLACE',button,buttonKey,slot])
                         newUtterance.texts[buttonKey].label = newUtterance.texts[buttonKey].label ? replaceData(newUtterance.texts[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.texts[buttonKey].text = newUtterance.texts[buttonKey].text ? replaceData(newUtterance.texts[buttonKey].text.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                    })
                })
            }
            
            if (utterance && utterance.images) {
                utterance.images.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                         newUtterance.images[buttonKey].label = newUtterance.images[buttonKey].label ? replaceData(newUtterance.images[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.images[buttonKey].href = newUtterance.images[buttonKey].href ? replaceData(newUtterance.images[buttonKey].href.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                          //console.log(['API REAPLCE MARKERS image',newUtterance.images,slots])
                    })
                })
            }
            
            if (utterance && utterance.audio) {
                utterance.audio.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                         newUtterance.audio[buttonKey].label = newUtterance.audio[buttonKey].label ? replaceData(newUtterance.audio[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.audio[buttonKey].href = newUtterance.audio[buttonKey].href ? replaceData(newUtterance.audio[buttonKey].href.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.audio[buttonKey].start = newUtterance.audio[buttonKey].start ? newUtterance.audio[buttonKey].start.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                         newUtterance.audio[buttonKey].end = newUtterance.audio[buttonKey].end ? newUtterance.audio[buttonKey].end.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                    })
                })
            }
            
            if (utterance && utterance.video) {
                utterance.video.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                        //console.log(['API REAPLCE MARKERS video syn slot',slot,slots[slot],newUtterance.video[buttonKey]])
                         newUtterance.video[buttonKey].label = newUtterance.video[buttonKey].label ? replaceData(newUtterance.video[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.video[buttonKey].href = newUtterance.video[buttonKey].href ? replaceData(newUtterance.video[buttonKey].href.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.video[buttonKey].start = newUtterance.video[buttonKey].start ? newUtterance.video[buttonKey].start.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                         newUtterance.video[buttonKey].end = newUtterance.video[buttonKey].end ? newUtterance.video[buttonKey].end.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                    })
                })
            }
            
            if (utterance && utterance.frames) {
                utterance.frames.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                         newUtterance.frames[buttonKey].label = newUtterance.frames[buttonKey].label ? replaceData(newUtterance.frames[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                         newUtterance.frames[buttonKey].href = newUtterance.frames[buttonKey].href ? replaceData(newUtterance.frames[buttonKey].href.replace(new RegExp('{'+slot+'}', 'g'), slots[slot])) : '';
                    })
                })
            }
            
            
            
            
            //  select single utterance from alteratives
            var utterTemplates = newUtterance && newUtterance.synonym ? newUtterance.synonym.split("\n") : []
            if (newUtterance) {
                var template = utterTemplates.length > 0 ? utterTemplates[Math.floor(Math.random()*utterTemplates.length)] : ''
                newUtterance.utterance = template
            }
            //console.log(['API REPLACED MARKERS',JSON.parse(JSON.stringify(newUtterance))])
            return newUtterance
        } 
        return {}
    }
    
    
    /**
     * Async Trigger an intent 
     * If the incoming intent is text, use the NLP manager to process it into an intent object first
     */
    function run(intentIn,slots,extras) {
        //console.log(['RUN start',intentIn, slots, extras])
        let that = this
        var utterances=[]
        return new Promise(function(resolve,reject) {
            if (typeof intentIn === "string") {
                lastUserText = intentIn
                if (!manager) throw new Error('Cannot handle string intent without a manager configured')
                try {
                    //console.log(['RUN',intentIn])
                    manager.process(intentIn).then(result => {
                        //console.log(['NLURES',result])
                        currentIntent.name = result.intent
                        currentIntent.entities = result && result.entities ? result.entities : {}
                        currentIntent.slots = result.slots
                        runIntent(currentIntent,intentIn, that.handleBotMessage).then(function(utterances) {
                            resolve(utterances)
                        })
                    }).catch(function(e) {
                        console.log(e)
                    });
                } catch (e) {
                    console.log(e)
                }
            } else if (typeof intentIn === "object" && intentIn.name && intentIn.name.trim()) {
                //console.log(['RUN I',intentIn])
                lastUserText = ''
                currentIntent = intentIn
                runIntent(currentIntent,'', that.handleBotMessage).then(function(utterances) {
                    resolve(utterances)
                })
            }
        })
    }
    
    /**
     *  Async Trigger an intent and recursively run steps (rules or story predictions)
     *  Each step can set slots and utterances
     *  Where available, handleBotMessage is used to send messages back to the client as they become available
     *  Finally when the next step is not an action/utterance/form or there are no more steps, resolve with collated utterances from all steps
     */
    function runIntent(intent,userUtterance='', handleBotMessage) { 
        let that = this
        var utterances=[]
        console.log(['RUNINT ',intent])
        return new Promise(function(resolve,reject) {
            // set slot values
            if (intent && intent.slots) Object.keys(intent.slots).map(function(slot) {
                var slotValue = intent.slots[slot]
                history.push('slot '+slot ) //+"_"+entity.value)
                slots[slot] = slotValue
            })
            
            var intentName = intent && intent.name ? 'intent ' + intent.name : ''
            if (intentName === 'intent None') intentName='intent fallback'
            var conditionsCheck = true
            
            //Object.keys(rules).map(function(ruleKey) {
                //if (ruleKey.indexOf(intentName.slice(7) === 0) {
                    
                //}
            //})
            
            //if (intentName && rules[intentName] && rules[intentName].conditions) {
                //rules[intentName].conditions.map(function(condition) {
                    //console.log(['console.log(condition)',condition])
                //}) 
            //}
            // process rules in array order except rules without conditions
            var foundRule = null
            config.rules.map(function(rule) {
                console.log(['CHECK RULE',rule,rule.name])
                if (!foundRule && Array.isArray(rule.steps) && rule.steps.length > 0 && rule.steps[0].indexOf('intent ') === 0) {
                    var triggerIntent = rule.steps[0].slice(7)
                    
                    var triggerParts = intentName.split("/")
                    var responseSelector = null
                    if (triggerParts.length > 1) {
                        responseSelector = triggerParts[0]
                    }
                    if (rule.steps[0] === intentName || (responseSelector && responseSelector === rule.steps[0])) {
                        console.log(['CHECK RULE match intent',intentName])
                        var allConditionsMet = true
                            
                        if (rule.conditions && rule.conditions.length > 0) {
                            console.log(['CHECK RULE match intent',intentName])
                            rule.conditions.map(function(condition) {
                                if (condition.indexOf('is_conversation_start ') === 0) {
                                    if (history.length > 0) {
                                        allConditionsMet = false
                                    }
                                    //console.log('FAIL CONDITION START CONV') 
                                } else if (condition.indexOf('has_slot ') === 0) {
                                    var slotName = condition.slice(9)
                                    //console.log(['CHECK CONTION SLOT',slotName,slots]) 
                                    if (slots.hasOwnProperty(slotName) && slots[slotName] !== null &&  slots[slotName] !== undefined ) {
                                    } else {
                                        allConditionsMet = false
                                        //console.log('FAIL CONDITION HAS SLOT') 
                                    }
                                    
                                } else if (condition.indexOf('active_form ') === 0) {
                                    var formName = condition.slice(12)
                                    if (currentForm && currentForm.name === formName) {
                                        
                                    } else {
                                        allConditionsMet = false
                                        //console.log('FAIL CONDITION ACTIVE FORM') 
                                    } 
                                    //console.log('FAIL CONDITION ACTIVE FORM') 
                                } 
                            })
                            
                        }
                        if (allConditionsMet) foundRule = rule
                    }
                }    
            })
            console.log(['FOUND MATCHING RULE',foundRule])
            if (foundRule && foundRule.steps && foundRule.steps.length > 0) {
                // TODO CHECK RULE CONDITIONS
                
                history.push(intentName)
                
                // loop through action and utter processing steps
                function runRuleSteps(intent,steps,utterances,handleBotMessage) {
                    console.log(['RUN RULE STEPS',steps,utterances, handleBotMessage])
                    return new Promise(function(iresolve,ireject) {
                        if (Array.isArray(steps) && steps.length > 0) {
                            var step = steps[0]
                            runRuleStep(intent,step, handleBotMessage).then(function(stepUtterances) {
                                if (Array.isArray(stepUtterances)) {
                                    stepUtterances.map(function(utterance) {
                                        utterances.push(utterance)  
                                    })
                                }
                                if (step && (step.indexOf('action ') === 0 || step.indexOf('utter ' === 0)  || step.indexOf('form ' === 0))) {
                                    runRuleSteps(intent,steps.slice(1),utterances,handleBotMessage).then(function(steputterances) {iresolve(utterances)})
                                } else {
                                    iresolve(utterances)
                                }
                            })
                        } else {
                            iresolve(utterances)
                        }
                    })
                }
                
                // skip the first step for a rule which is the triggering intent
                runRuleSteps(intent,foundRule.steps.slice(1),utterances,handleBotMessage).then(function(utterances) {
                    //console.log(['resolve rule steps',utterances])  
                    //chatHistory.push({user:userUtterance, bot:utterances})
                    resolve(utterances)
                })
                
            } else if (currentForm) {
                //console.log('FORM ACTIVE')  
                resolve(runForm(intent,handleBotMessage))
            } else {
                pushIntent(intent)
                
                var last = null
                function runStorySteps(intent,utterances, handleBotMessage) {
                    //console.log(['RUN STORY STEPS',utterances, handleBotMessage])
                    return new Promise(function(iresolve,ireject) {
                        var next = predict()
                        //console.log(['START runstorysteps next',next])
                        if (next && next !== last && (next.indexOf('action ') === 0 || next.indexOf('utter ') === 0|| next.indexOf('form ') === 0 || next.indexOf('slot ') === 0)) {
                            //console.log(['START runstorysteps next ISGOOD',next])
                            last = next
                            runStoryStep(intent, next, handleBotMessage).then(function(utterances) {
                                next = predict()
                                //console.log(['runstorysteps next',next])
                                if (next && (next.indexOf('action ') === 0 || next.indexOf('utter ') === 0 || next.indexOf('form ') === 0|| next.indexOf('slot ') === 0)) {
                                    //console.log(['runstorysteps next YES',intent,utterances])
                                    runStorySteps(intent,utterances, handleBotMessage).then(function(steputterances) {iresolve(steputterances)})
                                } else {
                                    iresolve(utterances)
                                }
                            })
                        } else {
                            iresolve(utterances)
                        }
                    })
                }
                // skip the first step for a rule which is the triggering intent
                //console.log(['RUN STEPS'])
                runStorySteps(intent,utterances, handleBotMessage).then(function(utterances) {
                    //console.log(['DONE ALL stories',utterances,history])
                    //chatHistory.push({user:userUtterance, bot:utterances})
                    //console.log(['chatHIST poush',chatHistory,history])
                    resolve(utterances)
                })
                
            }
        })
    }
    
    function slot(slot,value) {
        //console.log(['SET SLOT',slot,value,JSON.parse(JSON.stringify(slots))])
        slots[slot] = value
        //console.log(['DONE SET SLOT',slot,value,JSON.parse(JSON.stringify(slots))])
    }
    
    function reset() {
        history=[]
        slots=[]
        currentForm=null
    }
    
    function restart(slot,value) {
        history=[]
        currentForm=null
        console.log(['restart'])
    }
    
    function back() {
        history.pop()
        console.log(['back'])
    }
    
    function listen() {
        console.log(['listen'])
        handleBotMessage(null,true)
    }
    
    function nolisten() {
        console.log(['no listen'])
    }

    function form(form) {
        if (form) {
            currentForm={name: form}
            console.log(['form'])
        } else {
            currentForm = null
        }
    }


    /**
     * Async run an action by creating a Function using 
     * - text from the action.synonym field
     * The text is surrounded by template code to provide the data/functions
     * - slot(slotName,slotValue)/response(utteranceKey)/api(apiKey) - helper functions
     * - history/slots/config - dialog data
     * - handleBotMessage(utterance) - used by response to immediately handle generated utterances
     * 
     * !!! The code inside the action text MUST call resolve(output,slots)
     * Resolve with an array of utterance records generated by the action
     */ 
    function runAction(intent,actionKey, handleBotMessage) {
        console.log(['RUN ACTION',actionKey,intent,window])
        let that = this
        return new Promise(function(resolve,reject) {
            var actionFunction = null
            var utterances = []
            try {
                var utils={replaceMarkersInUtterance,axios}
                var action = config && config.actions && config.actions[actionKey] ? config.actions[actionKey] : {}
               //console.log(['action utterances',actionKey,config.actions,action])
                if (action && action.synonym) {
                    //console.log(['RUN ACTION CODE',action.synonym])
                    actionFunction = new Function('intent','history','slots','config','handleBotMessage','utils', 'window','slot','reset','restart','back','listen','nolisten','form',`
                    var apis={}
                    return new Promise(function(resolve,reject) {
                        var output = []; 
                        //var slots = {};
                        //console.log(['RUNACT',window])
                        function response(utterance,forceSlots,appData) {
                        //console.log(['API RESPOSNE',utterance,slots,config.utterances,utterance])
                            return new Promise(function(iresolve,ireject) {
                                if (config.utterances[utterance])  {
                                    var useSlots = {}
                                    if (slots) Object.keys(slots).map(function(slot) {useSlots[slot] = slots[slot]})
                                    if (forceSlots) Object.keys(forceSlots).map(function(slot) {useSlots[slot] = forceSlots[slot]})
                                    //console.log(['API RESPOSNE merge slots',
                                    //slots ? JSON.parse(JSON.stringify(slots)) : null,
                                    //forceSlots ? JSON.parse(JSON.stringify(forceSlots)) : null, 
                                    //useSlots ? JSON.parse(JSON.stringify(useSlots)) : null
                                    //])
                                    
                                    var templates = utils.replaceMarkersInUtterance(config.utterances[utterance],useSlots)
                                    //console.log(['API RESPOSNE have utt',templates,handleBotMessage])
                                    output.push(templates)
                                    if (handleBotMessage) {
                                        //console.log(['API HAN RESPOSNE hbm',JSON.parse(JSON.stringify([utterance,templates,slots])) ])
                                        handleBotMessage(templates,false,appData).then(function() {
                                            //console.log(['API RESPOSNE hbm DONE',slots,output])
                                            iresolve()
                                        })
                                    } else {
                                        iresolve()
                                    }
                                } else {
                                //console.log(['API RESPOSNE NO utt'])
                                    iresolve()
                                }
                            })
                        }
                        
                        function api(apiKey) {
                            //console.log(['CALLAPI',apiKey,window])
                            var final = {}
                            if (apiKey && apiKey.trim() && config && config.apis && config.apis.hasOwnProperty(apiKey) && config.apis[apiKey].synonym && config.apis[apiKey].synonym.trim()) {
                                var apiInstance = null 
                                if (apis[apiKey]) {
                                    apiInstance = apis[apiKey]
                                } else {
                                    try {
                                        apiInstance = new Function('intent','history','slots','config','utils','window','slot','response','api','reset','restart','back','listen','nolisten','form', config.apis[apiKey].synonym.trim())
                                        
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                                var final = {}
                                try {
                                    if (typeof apiInstance === 'function') {
                                        final = apiInstance(intent,history,slots,config,utils, window,slot,response,api,reset,restart,back,listen,nolisten,form) 
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                            return final
                        }
                        
                         try {
                        `+action.synonym+`
                        } catch (e) {
                            console.log(e)
                        }
                       
                    })
                `);
                    //console.log(['action utterances FN',actionFunction])
                    var res = actionFunction(intent,history,slots,config,handleBotMessage, utils, window,slot,reset,restart,back,listen,nolisten,form)
                    //console.log(['action res',res])
                    if (res.then) {
                        res.then(function(utterances,actionSlots) {
                            //console.log(['action res then',utterances,actionSlots])
                             // action can return slots
                            if (Array.isArray(actionSlots)) {
                                actionSlots.map(function(slot) { 
                                    history.push('slot '+slot.name) 
                                    //console.log(['HIST poush',history])
                                    slots[slot.name] = slot.value
                                })
                            }
                            // action can return utterances
                            if (Array.isArray(utterances)) {
                                //console.log(['action utterances', utterances])
                                utterances.map(function(utterance) { 
                                    var nextUtterance ='utter_'+utterance.value
                                    history.push(nextUtterance) 
                                    //console.log(['UTTALL',utterance,utterancesAll])
                                    if (utterancesAll && utterancesAll.hasOwnProperty(utterance.value)) {
                                        var templates = replaceMarkersInUtterance(utterancesAll[utterance.value],slots)
                                        utterances.push(templates)
                                        
                                    } else {
                                        console.log('Response '+utterance.value+' non found')
                                    }
                                })
                            }
                            resolve(utterances)
                        })
                    } else {
                        console.log('An action function must return a promise')
                        resolve(utterances)
                    }
                } else {
                    // default actions (can be overridden by actions above)
                    if (actionKey === "listen") {
                        listen()
                    } else if (actionKey === "nolisten") {
                        nolisten()
                    } else if (actionKey === "reset") {
                        reset()
                    } else if (actionKey === "restart") {
                        restart()
                    } else if (actionKey === "back") {
                        back()
                    } 
                    resolve(utterances)
                }

            } catch (e) {
                console.log(e)
                resolve(utterances)
            }
        })
    }
    
        // TODO notintent for all capture types
        // 
        /** 
         * Async run a form
         * Check all slots of a form for completeness using
         * - all capturefrom options for each slot
         * - saved value from previous step
         * If all slots are filled, set currentForm to null (exit form loop)
         * Resolve with an array including a single utterance record generated by the form
         */
        function runForm(intent, handleBotMessage) {
            //console.log(['CALL RUNFORM',currentForm,slots,handleBotMessage])
            let that = this
            return new Promise(function(resolve,reject) { 
                //console.log(['RUNFORM',currentForm,slots])
                var utterances = []
                var complete = true
                var firstUtterance=null
                var validatePromises = []
                if (currentForm && currentForm.name && config.forms && config.forms.hasOwnProperty(currentForm.name) && config.forms[currentForm.name]) {
                    var form = config.forms[currentForm.name]
                    //console.log(['RUNFORM form',JSON.parse(JSON.stringify(form))])
                    if (Array.isArray(form.slots)) {
                        form.slots.map(function(slot) {
                            //console.log(['RUNFORM slot',JSON.parse(JSON.stringify(slot))])
                            var slotFound = false
                            // don't fill slot if already filled
                            if (slot.value && Array.isArray(slot.capturefrom) ) {
                                if (slots[slot.value]) {
                                    slotFound = true
                                } else {
                                    slot.capturefrom.map(function(capture) {
                                        // value, intent notintent, entity
                                        if (capture.type === "from entity" && capture.entity) {
                                            if (intent && intent.entities) {
                                                intent.entities.map(function(entity) {
                                                     if (entity.entity && entity.entity === capture.entity) {
                                                         currentForm.data = currentForm.data ? currentForm.data : {}
                                                         currentForm.data[entity.entity] = entity.option
                                                         slotFound = true
                                                     }
                                                })
                                            }
                                        } else if (capture.entity && capture.type === "from text" && lastUserText && lastUserText.trim()) {
                                            currentForm.data = currentForm.data ? currentForm.data : {}
                                            currentForm.data[capture.entity] = lastUserText
                                            slotFound = true
                                        } else if (intent.intent && capture.type === "from intent" && capture.value && Array.isArray(capture.intent)) {
                                            if (capture.intent.indexOf(intent.intent) !== -1) {
                                                currentForm.data = currentForm.data ? currentForm.data : {}
                                                currentForm.data[capture.entity] = capture.value
                                                slotFound = true
                                            }
                                        } else if (capture.type === "from trigger intent") {
                                            if (capture.intent.indexOf(intent.intent) !== -1) {
                                                currentForm.data = currentForm.data ? currentForm.data : {}
                                                currentForm.data[capture.entity] = capture.value
                                                slotFound = true
                                            }
                                        } 
                                    })
                                }
                            }
                            
                            
                            if (!slotFound && !firstUtterance) { 
                                //console.log(['RUNFORM FIRST UTT',slot.text])
                                firstUtterance = slot.text
                            }
                            complete = complete && slotFound
                        })
                        
                    }
                    function finishForm(handleBotMessage) {
                        //console.log(['FINISHFORM'])
                        if (complete) {
                            currentForm = null
                            //console.log(['FINISHFORM SLOTS FILLED'])
                            if (form && form.finished) { 
                                //console.log(['RUNFORM complete run action',form.finished])
                                runAction(intent, form.finished,handleBotMessage).then(function(actionUtterances) {
                                    //console.log(['RUNFORM complete ran action',actionUtterances])
                                    resolve(actionUtterances)  
                                })
                            } else {
                                resolve(utterances)
                            }
                        } else {
                            //console.log(['RUNFORM complete utter',firstUtterance,config.utterances])
                            if (config.utterances[firstUtterance]) {  
                                var withSlotsFilled = replaceMarkersInUtterance(config.utterances[firstUtterance],slots)
                                utterances.push(withSlotsFilled)
                                //console.log(['handle form ',handleBotMessage,withSlotsFilled])
                                if (handleBotMessage) {
                                    handleBotMessage(withSlotsFilled,true).then(function() {
                                        resolve(utterances)  
                                    })
                                } else {
                                    resolve(utterances)  
                                }
                            } else {
                                resolve(utterances)  
                            }
                        }
                    }
                    // validate
                    //console.log(['VALIDATE',form.validate,config.actions])
                    if (!firstUtterance && form && form.validate  && config.actions && config.actions.hasOwnProperty(form.validate) && config.actions[form.validate])  {
                        //console.log(['VALIDATE YES',form.validate,config.actions])
                        runAction(intent,form.validate,handleBotMessage).then(function(validateUtterances) {
                            //console.log(['VALIDATED ',validateUtterances])
                            if (Array.isArray(validateUtterances) && validateUtterances.length > 0)  {
                                resolve(validateUtterances)  
                            } else {
                                finishForm(handleBotMessage)
                            }
                        })
                    } else {
                        finishForm(handleBotMessage)
                    }
                      
                }  else {
                    resolve(utterances)  
                }
            })
        }
        
        /** 
         * Async run a single step of a rule
         * - if the step is an action call runAction and collate resolved utterances
         * - if the step is an utterance, replace markers in the utterance 
         * - if the step is a form, call runForm and then collate resolved utterances
         * Each step is pushed to the history
         * Resolve with an array of utterance records generated by the step
         */
        function runRuleStep(intent, step, handleBotMessage) {
            let that = this
        console.log(['HAN init rrs', handleBotMessage])
            var utterances = []
            return new Promise(function(resolve,reject) {
                //console.log(['HAN init rrs', step])
                if (step && step.indexOf('action ') === 0) {
                    history.push(step)
                    var stepName = step.slice(7)
                    
                    if (config.actions && typeof config.actions[stepName] ) {
                        //console.log(['RUNFORM STEP complete run action',slots])
                        runAction(intent, stepName, handleBotMessage).then(function(actionUtterances) {
                            //console.log(['RUNFORM STEP complete ran action',slots,actionUtterances])
                                
                            resolve(actionUtterances) //[].concat(utterances,actionUtterances))
                        });
                        //=== 'function') {
                    } else {
                         resolve(utterances)
                    }
                } else if (step && step.indexOf('utter ') === 0) {
                    var stepName = step.slice(6)
                    var intentParts = intent && intent.name ? intent.name.split("/") : []
                    if (intentParts.length > 1) {
                        stepName = stepName + "/" + intentParts[1]
                    }
                    console.log(['HAN run rule step UTT',intent,step,stepName,utterancesAll,utterances,utterances[stepName],handleBotMessage,slots])
                    if (utterancesAll && utterancesAll[stepName]) {
                        history.push(step)
                        var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        utterances.push(templates)
                        //console.log(['HAN run rule step utter bot TRY',handleBotMessage,templates])
                        if (handleBotMessage) {
                            //console.log(['HAN run rule step utter bot',step,utterances])
                            handleBotMessage(templates).then(function() {resolve(utterances)})
                        } else {
                            resolve(utterances)
                        }
                    } else {
                        resolve(utterances)
                    }
                } else if (step && step.indexOf('form ') === 0) {
                    var stepName = step.slice(5)
                    //console.log(['run rule step form',stepName])
                    if (config.forms && config.forms[stepName]) {
                    //console.log(['run rule step form',config.forms[stepName]])
                        history.push(step)
                        //var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        //utterances.push(templates)
                        currentForm = {name: stepName}
                        var newUtts = [].concat(utterances,runForm(intent, handleBotMessage))
                        //console.log(['RAN FORM',newUtts])
                        resolve(newUtts)
                    } else {
                        currentForm = null
                        resolve(utterances)
                        //resolve([].concat(utterances,runForm(handleBotMessage)))
                    }
                    //resolve(utterances)
                } else {
                    resolve(utterances)
                }
                //resolve(utterances)
            })
        }
        
        /** 
         * Async run a single step of a story
         * - if the step is an action call runAction and collate resolved utterances
         * - if the step is an utterance, replace markers in the utterance 
         * - if the step is a form, call runForm and then collate resolved utterances
         * Each step is pushed to the history
         * Resolve with an array of utterance records generated by the step
         */
        function runStoryStep(intent, next, handleBotMessage) {
            var that = this
            var utterances = []
            //console.log(['run story step',intent,next,utterances, handleBotMessage])
            return new Promise(function(resolve,reject) {
                //console.log(['stroy step started',next])
                if (next && next.indexOf('action ') === 0) {
                    //console.log(['ACT',next, next.slice(7), config.actions, config.actions[next.slice(7)]  ])
                    if (config.actions && config.actions[next.slice(7)]) {
                        history.push(next)
                        //console.log(['HIST poush',history])
                        runAction(intent,next.slice(7), handleBotMessage).then(function(utterances,actionSlots) {
                            //console.log(['ACT callbac',next])
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
                                    var templates = replaceMarkersInUtterance(utterancesAll[utterance],slots)
                                    utterances.push(templates)
                                    resolve(utterances)
                                })
                            } else {
                                resolve(utterances)
                            }
                        })
                    } else {
                         resolve(utterances)
                    }
                    
                } else if (next && next.indexOf('utter ' === 0)) {
                    var stepName = next.slice(6)
                    //console.log(['UTT',stepName])
                    if (utterancesAll && utterancesAll[stepName]) {
                        history.push(next)
                        //console.log(['HIST poush',history])
                        var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                        //console.log(['TMPL',templates,template])
                        Object.keys(slots).map(function(slot) {
                            template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                            //template = template.replaceAll('{'+slot+'}',slots[slot])
                        })
                        // clear remaining markers
                        template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                        //console.log(['UTT poush',templates,utterances])
                        if (handleBotMessage) {
                            //console.log(['HAN run story step utter bot',step,utterances])
                            handleBotMessage(templates).then(function() {resolve(utterances)})
                        } else {
                            resolve(utterances)
                        }
                    } else {
                        resolve(utterances)
                    }
                    
                } else if (next && next.indexOf('form ') === 0) {
                    var stepName = next.slice(5)
                    if (config.forms && config.forms[stepName]) {
                        history.push(next)
                        //var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        //utterances.push(templates)
                        currentForm = {name: stepName}
                        resolve(runForm(intent, handleBotMessage))
                    } else {
                        currentForm = null
                        resolve(runForm(intent, handleBotMessage))
                    }
                        
                    //resolve(utterances)
                } else {
                    resolve(utterances)
                }
            })
        }
    
    
        
    
    return {init, pushIntent, pushEntity, pushAction, pushUtterance, resetHistory, train, predict,arrayToWeights, run, fromStories,  history, setHistory, slots, model, toJSON, manager, currentForm, slot}
}
//chatHistory,
module.exports = DialogManager
