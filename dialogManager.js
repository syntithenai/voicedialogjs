const { NeuralNetwork } = require('@nlpjs/neural');

function DialogManager(config) {
    //console.log(['DM CON',config])
    var history=[]
    var slots={}
    var currentForm=null
    var manager = null
    // index rules by intent
    var rules = {}
    var utterancesAll = config.utterances
    var lastUserText = null
    var chatHistory = []
    var intent = {}
        
          
    function setHistory(val) {
        //return
        history=val
    }
  
    const model = new NeuralNetwork();
    var manager = null;
    function init() {
        
        return new Promise (function(resolve,reject) {

            function runWelcomeIntent(shouldRunWelcomeIntent) {
                if (shouldRunWelcomeIntent)  {
                    //setTimeout(function() {
                        runIntent({name:'welcome'},'',[]).then(function(utterances) {
                            //history.push()
                            //console.log(['runintut',utterances,history,chatHistory])
                            //setHistory(history)
                            //chatHistory.push({bot:utterances})
                            //console.log(['chatHIST poush',chatHistory])
                            resolve( utterances)
                        })
                    //} ,1000)
                } else {
                    resolve()
                }
            }

            var shouldRunWelcomeIntent = false
            // index rules and identify welcome intent
            if (Array.isArray(config.rules)) {
            //console.log('addrule is array')
                config.rules.map(function(rule) {
                    //console.log(['ruule',rule, rule.steps,rule.steps[0],Array.isArray(rule.steps),rule.steps.length > 0,rule.steps[0].indexOf('intent '),rule.steps[0].indexOf('intent ') === 0])
                    if (Array.isArray(rule.steps) && rule.steps.length > 0 && rule.steps[0].indexOf('intent ') === 0) {
                        rules[rule.steps[0]] = rule
                        //console.log('addrule')
                        var ruleName = rule.steps[0].slice(7)
                        if (ruleName === "welcome") {
                            shouldRunWelcomeIntent = true
                        }
                    }
                })
            }
            //console.log(['rules',rules,config.rules])
            //return new Promise(function(resolve,reject) {
                // nlu model TODO merge utterances
            var NlpManager = require('./nlpManager')
            NlpManager().then(function(newManager) {
                manager = newManager
                manager.train(config).then(function() {
                        
                    // routing model
                    if (config.json && Object.keys(config.json).length > 0) {
                        model = new NeuralNetwork();
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
            })  
        })
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
        //console.log(['fromstories',JSON.stringify(newCorpus)])
        //console.log(['fromstories raw',JSON.stringify(stories)])
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
    // when we meet an intent, and respond with the utterances collated from loop action/utterances
    function run(intentIn) {
        //console.log(['RUN USER',intentIn,manager])
        var utterances=[]
        return new Promise(function(resolve,reject) {
            //resolve()
            if (typeof intentIn === "string") {
                lastUserText = intentIn
                if (!manager) throw new Error('Cannot handle string intent without a manager configured')
                //console.log(['STRING INTENT',intentIn])
                try {
                    manager.process(intentIn).then(result => {
                       // console.log(['RUN NLU RES',result])
                        intent.name = result.intent
                        intent.entities = result.entities
                        intent.slots = result.slots
                        //console.log(['USER RUN',intent,intentIn,manager,utterances])
                        runIntent(intent,intentIn,utterances).then(function(utterances) {
                            //var allUtterances=[]
                            //console.log(utterances)
                            //if (Array.isArray(utterances)) utterances.map(function(utteranceList) {
                                //if (Array.isArray(utteranceList)) utterances.map(function(utterance) {
                                    //allUtterances.push(utterance)
                                //})
                            //})
                            
                            resolve(utterances)
                        })
                    }).catch(function(e) {
                        console.log(e)
                    });
                } catch (e) {
                    console.log(e)
                }
                //console.log(manager.export())
            } else if (typeof intentIn === "object" && intentIn.name && intentIn.name.trim()) {
               // console.log(['RUN DIR',intentIn,manager,utterances])
                lastUserText = 
                intent = intentIn
                runIntent(intent,'',utterances).then(function(utterances) {
                    resolve(utterances)
                })
            }
            
        })
        
        
        
        
    }
    
    function runAction(action,utterances) {
        return new Promise(function(resolve,reject) {
            var actionFunction = null
            try {
               //console.log(['action utterances',config.actions,action.synonym])
                if (action.synonym) {
                    actionFunction = new Function('history','slots','config', `
                    var apis={}
                    return new Promise(function(resolve,reject) {
                        var dialog_run_action_output = []; 
                        var dialog_run_action_slots = {};
                        function slot(slot,value) {
                            dialog_run_action_slots[slot] = value
                        }
                        function response(utterance) {
                            dialog_run_action_output.push(utterance)
                        }
                        function api(apiKey) {
                            //console.log(['API call',apiKey,config.apis,config.apis[apiKey]])
                            var final = {}
                            if (apiKey && apiKey.trim() && config && config.apis.hasOwnProperty(apiKey) && config.apis[apiKey].synonym && config.apis[apiKey].synonym.trim()) {
                                var apiInstance = null 
                                if (apis[apiKey]) {
                                    apiInstance = apis[apiKey]
                                } else {
                                    try {
                                        apiInstance = new Function('history','slots','config',config.apis[apiKey].synonym.trim())
                                        
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                                final = typeof apiInstance === 'function' ? apiInstance(history,slots,config) : {}
                            }
                            return final
                        }
                        
                         try {
                        `+action.synonym+`
                        } catch (e) {
                            console.log(e)
                        }
                        resolve(dialog_run_action_output,dialog_run_action_slots)
                    })
                `);
                    //'console.log("fredgg"); console.log("fredgg")')
                    //config.apis[apiKey].synonym.trim()
                    //console.log(['action utterances FN',actionFunction])
                    var res = actionFunction(history,slots,config)
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
                                    var nextUtterance ='utter_'+utterance
                                    history.push(nextUtterance) 
                                    //console.log(['UTTALL',utterance,utterancesAll])
                                    if (utterancesAll.hasOwnProperty(utterance)) {
                                        var templates = replaceMarkersInUtterance(utterancesAll[utterance],slots)
                                        //var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                                        //console.log(['TMPL',templates])
                                        //Object.keys(slots).map(function(slot) {
                                            //template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                                            ////template = template.replaceAll('{'+slot+'}',slots[slot])
                                        //})
                                        //// clear remaining markers
                                        //template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                                        utterances.push(templates)
                                    } else {
                                        //console.log('Response '+utterance+' non found')
                                    }
                                })
                            }
                            resolve(utterances)
                        })
                    } else {
                        //console.log('An action function must return a promise')
                        //console.log(action)
                        //// allow for non async 
                        //if (res && typeof res === "array" && res.length === 2) {
                            //utterances.push({utterance:res[].trim()})
                        //})
                        resolve(utterances)
                    }
                } else {
                    resolve(utterances)
                }

            } catch (e) {
                //console.log(e)
                resolve(utterances)
            }
        })
    }
    
        // TODO notintent for all capture types
        function runForm(utterances) {
            var utterances = []
            var complete = true
            if (currentForm && currentForm.name && config.forms && config.forms.hasOwnProperty(currentForm.name) && config.forms[currentForm.name]) {
                var form = config.forms[currentForm.name]
                if (Array.isArray(form.slots)) {
                    form.slots.map(function(slot) {
                        var slotFound = false
                        if (Array.isArray(slot.capturefrom)) {
                            slot.capturefrom.map(function(capture) {
                                // value, intent notintent, entity
                                if (capture.type === "from entity" && capture.entity) {
                                    if (intent.entities) {
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
                        complete = complete && slotFound
                    })
                    
                }
            } 
            if (complete) currentForm = null
            return utterances
        }
        
        function runRuleStep(step,utterances) {
            console.log(['run rule step',step,utterances])
            return new Promise(function(resolve,reject) {
                if (step.indexOf('action ') === 0) {
                    history.push(step)
                    var stepName = step.slice(7)
                    
                    if (config.actions && typeof config.actions[stepName] ) {
                        runAction(config.actions[stepName]).then(function(actionUtterances) {
                            resolve([].concat(utterances,actionUtterances))
                        });
                        //=== 'function') {
                    } else {
                         resolve(utterances)
                    }
                } else if (step.indexOf('utter ') === 0) {
                    var stepName = step.slice(6)
                    if (utterancesAll && utterancesAll[stepName]) {
                        history.push(step)
                        var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        utterances.push(templates)
                    } 
                    resolve(utterances)
                } else if (step.indexOf('form ') === 0) {
                    var stepName = step.slice(5)
                    //console.log(['run rule step form',stepName])
                    if (config.forms && config.forms[stepName]) {
                    //console.log(['run rule step form',config.forms[stepName]])
                        history.push(step)
                        //var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        //utterances.push(templates)
                        currentForm = {name: stepName}
                        resolve(runForm(utterances))
                    } else {
                        currentForm = null
                        resolve(runForm(utterances))
                    }
                    resolve(utterances)
                } else {
                    resolve(utterances)
                }
            })
        }
        
        function replaceMarkersInUtterance(utterance,slots) {
            var newUtterance = utterance
            if (utterance && utterance.synonyms) {
                 Object.keys(slots).map(function(slot) {
                    newUtterance.synonyms = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                })
            }
            if (utterance && utterance.buttons) {
                utterance.buttons.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                         newUtterance.buttons[buttonKey].label = newUtterance.buttons[buttonKey].label ? newUtterance.buttons[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                         newUtterance.buttons[buttonKey].utterance = newUtterance.buttons[buttonKey].utterance ? newUtterance.buttons[buttonKey].utterance.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                         newUtterance.buttons[buttonKey].link = newUtterance.buttons[buttonKey].link ? newUtterance.buttons[buttonKey].link.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                    })
                })
            }
            if (utterance && utterance.texts) {
                utterance.texts.map(function(button,buttonKey) {
                    Object.keys(slots).map(function(slot) {
                         newUtterance.texts[buttonKey].label = newUtterance.texts[buttonKey].label ? newUtterance.texts[buttonKey].label.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                         newUtterance.texts[buttonKey].text = newUtterance.texts[buttonKey].text ? newUtterance.texts[buttonKey].text.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]) : '';
                    })
                })
            }
            
            //  select single utterance from alteratives
            var utterTemplates = newUtterance && newUtterance.synonym ? newUtterance.synonym.split("\n") : []
            if (newUtterance) {
                var template = utterTemplates.length > 0 ? utterTemplates[Math.floor(Math.random()*utterTemplates.length)] : newUtterance.value
                newUtterance.utterance = template
            }
            return newUtterance
        }
        
        function runStoryStep(next,utterances) {
            console.log(['run story step',next,utterances])
            return new Promise(function(resolve,reject) {
                if (next.indexOf('action ') === 0) {
                    //console.log(['ACT',next])
                    if (config.actions && typeof config.actions[next] === 'function') {
                        history.push(next)
                        //console.log(['HIST poush',history])
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
                                    var templates = replaceMarkersInUtterance(utterancesAll[utterance],slots)
                                    //var template = Array.isArray(templates) ? templates[Math.floor(Math.random()*templates.length)] : ''
                                    //console.log(['TMPL',templates,template])
                                    //Object.keys(slots).map(function(slot) {
                                        //template = template.replace(new RegExp('{'+slot+'}', 'g'), slots[slot]);
                                        ////template = template.replaceAll('{'+slot+'}',slots[slot])
                                    //})
                                    //// clear remaining markers
                                    //template = template.replace(new RegExp('\\{.*\\}', 'g'),'')
                                    utterances.push(templates)
                                })
                            }
                            resolve(utterances)
                        })
                    } else {
                         resolve(utterances)
                    }
                    
                } else if (next.indexOf('utter ' === 0)) {
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
                        utterances.push(templates)
                    } 
                    resolve(utterances)
                } else if (next.indexOf('form ') === 0) {
                    var stepName = next.slice(5)
                    if (config.forms && config.forms[stepName]) {
                        history.push(next)
                        //var templates = replaceMarkersInUtterance(utterancesAll[stepName],slots)
                        //utterances.push(templates)
                        currentForm = {name: stepName}
                        resolve(runForm(utterances))
                    } else {
                        currentForm = null
                        resolve(runForm(utterances))
                    }
                        
                    resolve(utterances)
                } else {
                    resolve(utterances)
                }
            })
        }
    
    
        function runIntent(intent,userUtterance='',utterances) { 
            console.log(['RUN INTENT',intent,userUtterance='',utterances])
            return new Promise(function(resolve,reject) {
                //console.log(['INTENT',intent,'RULES',rules,utterances])
                var intentName = intent && intent.name ? 'intent ' + intent.name : ''
                if (intentName === 'intent None') intentName='intent fallback'
                //
                //console.log(['try RUN INTENT',intentName,rules,utterances])
                if (intentName && rules[intentName] && rules[intentName].steps && rules[intentName].steps.length > 0) {
                    //console.log(['RUN INTENT',intentName])
                    history.push(intentName)
                    //console.log(['HIST poush',history])
                    // set slot values
                    if (intent.slots) Object.keys(intent.slots).map(function(slot) {
                        var slotValue = intent.slots[slot]
                        history.push('slot '+slot ) //+"_"+entity.value)
                        slots[slot] = slotValue
                    })
                    //console.log(['slots',intent.entities,slots])
                    // loop through action and utter processing steps
                    function runRuleSteps(steps,utterances) {
                        console.log(['RUN RULE STEPS',steps,utterances])
                        return new Promise(function(iresolve,ireject) {
                            if (Array.isArray(steps) && steps.length > 0) {
                                var step = steps[0]
                                runRuleStep(step,utterances).then(function(utterances) {
                                    //utterances = newUtterances
                                    //console.log(['done  RUN RULEStep',utterances])
                                    if (step && (step.indexOf('action ') === 0 || step.indexOf('utter ' === 0))) {
                                        runRuleSteps(steps.slice(1),utterances).then(function(utterances) {iresolve(utterances)})
                                    } else {
                                        // invalid step (must be utter or action)
                                        iresolve(utterances)
                                    }
                                })
                            } else {
                                // no more steps
                                //console.log(['RUN RULE STEPS DONE',utterances])
                                iresolve(utterances)
                            }
                        })
                    }
                    //console.log(['start RUN RULES',rules[intentName].steps.slice(1)])
                    // skip the first step for a rule which is the triggering intent
                    runRuleSteps(rules[intentName].steps.slice(1),utterances).then(function(utterances) {
                        //utterances = newUtterances
                        //console.log(['done  RUN RULES',utterances])
                        chatHistory.push({user:userUtterance, bot:utterances})
                        //console.log(['chatHIST poush',chatHistory])
                        resolve(utterances)
                    })
                    
                } else if (currentForm) {
                    console.log('FORM ACTIVE')  
                    resolve(runForm(utterances))
                } else {
                    //console.log(['STORY + ', JSON.stringify(intent)])
                    pushIntent(intent)
                    // set slot values
                    if (intent.slots) Object.keys(intent.slots).map(function(slot) {
                        var slotValue = intent.slots[slot]
                        history.push('slot '+slot ) //+"_"+entity.value)
                        slots[slot] = slotValue
                    })
                    //console.log(['slots',intent.entities,slots])
                    var last = null
                    function runStorySteps(utterances) {
                        console.log(['RUN STORY STEPS',utterances])
                        return new Promise(function(iresolve,ireject) {
                            var next = predict()
                            console.log(['STORY predict',next,history])
                            if (next && next !== last && (next.indexOf('action ') === 0 || next.indexOf('utter ') === 0)) {
                                last = next
                                //console.log(['STORY predict action or utter',next])
                                runStoryStep(next,utterances).then(function(utterances) {
                                    console.log(['RAN STORY ',utterances])
                                    next = predict()
                                    console.log(['STORY RAN predict',next,history])
                                    if (next && (next.indexOf('action ') === 0 || next.indexOf('utter ') === 0 || next.indexOf('form ') === 0|| next.indexOf('slot ') === 0)) {
                                        runStorySteps(utterances).then(function(utterances) {iresolve(utterances)})
                                    } else {
                                        // invalid step (must be utter or action)
                                        iresolve(utterances)
                                    }
                                })
                            } else {
                                // no more steps
                                iresolve(utterances)
                            }
                        })
                    }
                    // skip the first step for a rule which is the triggering intent
                    //console.log(['RUN STEPS'])
                    runStorySteps(utterances).then(function(utterances) {
                        console.log(['DONE ALL ',utterances])
                        chatHistory.push({user:userUtterance, bot:utterances})
                        console.log(['chatHIST poush',chatHistory,history])
                        resolve(utterances)
                        
                    })
                    
                }
               // console.log(['DONE ',utterances,history,slots])
            })
        }
    
    return {init, pushIntent, pushEntity, pushAction, pushUtterance, resetHistory, train, predict,arrayToWeights, run, fromStories, chatHistory, history, setHistory, slots, model, toJSON, manager}
}
module.exports = DialogManager
