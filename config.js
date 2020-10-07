
var config = {
    // domain
    //slots: {
        //name: {useValue:false}
    //},
    actions: {
        'action_beep': function(history,slots) {
            return new Promise(function(resolve,reject) {
                console.log('BEEP')
                resolve(['utter_beeped'],[{name:'age', value:'random'}])
            })
        }
    },
    utterances: {
        'utter_beeped': ['I Beeped'],
        'utter_hello': ['Hi there {name}'],
        'utter_ask_name': ['What is your name'],
        'utter_have_fun': ['Have a blast','Have fun','Enjoy yourself']
    },
    // nlu
    nlp : { 
         // intents (with %kk% entity markers)
        // entities - list values
        // entities - trim
        // entities - regexps
        "intents": {
             "greet": [
              {
                "example": "Hi there",
              }
            ],
            "movie_runtime": [
              {
                "example": "Get the length of the film The Battle of Algiers",
                "entities": [
                  {
                    "value": "The Battle of Algiers",
                    "start": 27,
                    "end": 49,
                    "type": "movie"
                  }
                ]
              },
            ],
            "timer_status": [
              {
                "example": "how long  left",
                "entities": []
              },
              {
                "example": "how long  remaining",
                "entities": []
              },
              {
                "example": "how long is left",
                "entities": []
              },
              {
                "example": "how long is remaining",
                "entities": []
              },
              {
                "example": "how much time  left",
                "entities": []
              },
              {
                "example": "how much time  remaining",
                "entities": []
              },
              {
                "example": "how much time is left",
                "entities": []
              },
              {
                "example": "how much time is remaining",
                "entities": []
              },
              {
                "example": "how's my name timer",
                "entities": [
                  {
                    "value": "name",
                    "start": 9,
                    "end": 14,
                    "type": "name"
                  }
                ]
              },
              {
                "example": "how's my timer",
                "entities": []
              },
              {
                "example": "how's the name timer",
                "entities": [
                  {
                    "value": "name",
                    "start": 10,
                    "end": 15,
                    "type": "name"
                  }
                ]
              },
              {
                "example": "how's the timer",
                "entities": []
              },
              {
                "example": "when does my timer end",
                "entities": []
              },
              {
                "example": "when does my timer finish",
                "entities": []
              },
              {
                "example": "when does the timer end",
                "entities": []
              },
              {
                "example": "when does the timer finish",
                "entities": []
              },
              {
                "example": "when will my timer end",
                "entities": []
              },
              {
                "example": "when will my timer finish",
                "entities": []
              },
              {
                "example": "when will the timer end",
                "entities": []
              },
              {
                "example": "when will the timer finish",
                "entities": []
              }
            ]
        },
        "entitiesData": {
            "duration": [
                  {
                    "value": "seventeen seconds",
                    "synonym": ""
                  },
                  {
                    "value": "two and half minutes",
                    "synonym": ""
                  },
                  {
                    "value": "three quarters of an hour",
                    "synonym": "forty five minutes"
                  },
            ]
        },
        //"regexps": [
            //{
              //"name": "Proper Noun/Name",
              //"synonym": "/\b(\w[-._\w]*\w@\w[-._\w]*\w\.\w{2,3})\b/gi",
              //"entity": "name"
            //}
        //],
        "utterances": {
            "no_valid_api": {
              "value": "no_valid_api",
              "synonym": "The A P I key that you entered is not valid\n  Refer to the read me file for instructions on how to obtain one\n\n",
              "tags": [
                "movie master"
              ]
            }
        }
    },
    
    // dialog flow data
    rules: [{
        rule:'greet a user',
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
