
var config = {
    // domain
    //slots: {
        //name: {useValue:false}
    //},
    actions: {
        'action_beep': function(history,slots) {
            return new Promise(function() {
                console.log('BEEP')
                resolve([{name:'age', value:'random'}])
            })
        }
    },
    utterances: {
        'utter_hello': ['Hi there {name}'],
        'utter_ask_name': ['What is your name'],
        'utter_have_fun': ['Have a blast','Have fun','Enjoy yourself']
    },
    //intents:{
        //'intent_hello': {
            
        //}
    //},
    // dialog flow data
    rules: [{
        rule:'greet',
        steps:['intent_greet','utter_hello','utter_have_fun']
    }],
    stories: [
        {
          story: "user says hello", 
          steps: ['intent_hello','utter_have_fun','utter_ask_name','slot_name','action_beep','utter_hello']
        },
        {
          story: "user says hello with name", 
          steps: ['intent_hello','slot_name','action_beep','utter_have_fun','utter_hello']
        }
    ],
    // raw training data 
    //corpus: [
          ////{
            ////"input": {  },
            ////"output": { "utter_ask_name": 1 }
          ////},
          //{
            //"input": { "intent_hello": 1 },
            //"output": { "utter_ask_name": 1 }
          //},
          //{
            //"input": { "intent_hello": 1 ,'utter_ask_name': 1, "slot_name": 1},
            //"output": { "utter_hello": 1 }
          //},
          //{
            //"input": { "intent_hello": 1 ,'utter_ask_name': 1, "slot_name": 1, 'utter_hello': 1},
            //"output": { "action_listen": 1 }
          //},
          //{
            //"input": { "intent_hello": 1, "slot_name": 1 },
            //"output": { "utter_hello": 1 }
          //},
          //{
            //"input": { "intent_hello": 1, "slot_name": 1, "utter_hello": 1 },
            //"output": { "action_listen": 1 }
          //}
    //]
    //,
    // trained model
    json:{}
    
}
module.exports = config
