
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
        //"intents": {
             //"greet": [
              //{
                //"example": "Hi there",
              //}
            //],
            //"i smell": [
              //{
                //"example": "I smell perfume",
                //"entities": [
                  //{
                    //"value": "perfume",
                    //"start": 8,
                    //"end": 17,
                    //"type": "smell"
                  //}
                //]
              //},
              //{
                //"example": "I joe smell perfume egg",
                //"entities": [
                  //{
                    //"value": "perfume",
                    //"start": 13,
                    //"end": 21,
                    //"type": "smell"
                  //},
                  //{
                    //"value": "egg",
                    //"start": 21,
                    //"end": 25,
                    //"type": "smell"
                  //}
                //]
              //}
            //],
            
            ////"movie_runtime": [
              ////{
                ////"example": "Get the length of the film The Battle of Algiers",
                ////"entities": [
                  ////{
                    ////"value": "The Battle of Algiers",
                    ////"start": 27,
                    ////"end": 49,
                    ////"type": "movie"
                  ////}
                ////]
              ////},
            ////],
            //"timer_status": [
              //{
                //"example": "how long  left",
                //"entities": []
              //},
              //{
                //"example": "how long  remaining",
                //"entities": []
              //},
              //{
                //"example": "how long is left",
                //"entities": []
              //},
              //{
                //"example": "how long is remaining",
                //"entities": []
              //},
              //{
                //"example": "how much time  left",
                //"entities": []
              //},
              //{
                //"example": "how much time  remaining",
                //"entities": []
              //},
              //{
                //"example": "how much time is left",
                //"entities": []
              //},
              //{
                //"example": "how much time is remaining",
                //"entities": []
              //},
              //{
                //"example": "how's my fred timer",
                //"entities": [
                  //{
                    //"value": "fred",
                    //"start": 9,
                    //"end": 14,
                    //"type": "timername"
                  //}
                //]
              //},
              //{
                //"example": "how's my timer",
                //"entities": []
              //},
              //{
                //"example": "how's the fred timer",
                //"entities": [
                  //{
                    //"value": "fred",
                    //"start": 10,
                    //"end": 15,
                    //"type": "timername"
                  //}
                //]
              //},
              //{
                //"example": "how's the timer",
                //"entities": []
              //},
              //{
                //"example": "when does my timer end",
                //"entities": []
              //},
              //{
                //"example": "when does my timer finish",
                //"entities": []
              //},
              //{
                //"example": "when does the timer end",
                //"entities": []
              //},
              //{
                //"example": "when does the timer finish",
                //"entities": []
              //},
              //{
                //"example": "when will my timer end",
                //"entities": []
              //},
              //{
                //"example": "when will my timer finish",
                //"entities": []
              //},
              //{
                //"example": "when will the timer end",
                //"entities": []
              //},
              //{
                //"example": "when will the timer finish",
                //"entities": []
              //}
            //]
        //},
        //"entitiesData": {
            //"duration": [
                  //{
                    //"value": "seventeen seconds",
                    //"synonym": ""
                  //},
                  //{
                    //"value": "two and half minutes",
                    //"synonym": ""
                  //},
                  //{
                    //"value": "three quarters of an hour",
                    //"synonym": "forty five minutes"
                  //},
            //],
            //"smell": [
                //{
                    //"value": "perfume",
                    //"synonym": ""
                //},
                //{
                    //"value": "eggy",
                    //"synonym": "egg"
                //},
                //{
                    //"value": "egg pong",
                    //"synonym": "egg"
                //},

            //]
        //},
        "entities": {
            "artist": {
              "values": [
                "ry cooder",
                "simply red",
                "van halen"
              ],
              "lists": [
                "music artists 20c"
              ]
            },
            "genre": {
              "values": [
                "blues",
                "jazz",
                "reggae",
                "relaxing",
                "world"
              ],
              "lists": [
                "music genres"
              ]
            }
          },
        
        "intents": {
            "play music": [
              {
                "example": "give me something by van halen",
                "entities": [
                  {
                    "type": "artist",
                    "value": "van halen",
                    "start": 21,
                    "end": 30
                  }
                ]
              },
              {
                "example": "i want to hear some jazz music",
                "entities": [
                  {
                    "type": "genre",
                    "value": "jazz",
                    "start": 20,
                    "end": 24
                  }
                ]
              },
              {
                "example": "i want to hear some jazz",
                "entities": [
                  {
                    "type": "genre",
                    "value": "jazz",
                    "start": 20,
                    "end": 24
                  }
                ]
              },
              {
                "example": "i want to listen to reggae",
                "entities": [
                  {
                    "type": "genre",
                    "value": "reggae",
                    "start": 20,
                    "end": 26
                  }
                ]
              },
              {
                "example": "i want to listen to tracks by simply red",
                "entities": [
                  {
                    "type": "artist",
                    "value": "simply red",
                    "start": 30,
                    "end": 40
                  }
                ]
              },
              {
                "example": "play some blues music",
                "entities": [
                  {
                    "type": "genre",
                    "value": "blues",
                    "start": 10,
                    "end": 15
                  }
                ]
              },
              {
                "example": "play some relaxing music",
                "entities": [
                  {
                    "type": "genre",
                    "value": "relaxing",
                    "start": 10,
                    "end": 18
                  }
                ]
              },
              {
                "example": "play some world music by ry cooder",
                "entities": [
                  {
                    "type": "genre",
                    "value": "world",
                    "start": 10,
                    "end": 15
                  },
                  {
                    "type": "artist",
                    "value": "ry cooder",
                    "start": 25,
                    "end": 34
                  }
                ]
              }
            ],
            "stop playing": [
              {
                "example": "pause",
                "entities": []
              },
              {
                "example": "stop playing",
                "entities": []
              }
            ]
      },
      "tags": [],
      "entitiesData": {
                "music artists 20c": [
                  {
                    "value": "Wu-Tang Clan",
                    "synonym": ""
                  },
                  {
                    "value": "Amy Winehouse",
                    "synonym": ""
                  },
                  {
                    "value": "Daft Punk",
                    "synonym": ""
                  },
                  {
                    "value": "Elvis",
                    "synonym": "Elvis Presley"
                  }
                  ,
                  {
                    "value": "The King",
                    "synonym": "Elvis Presley"
                  }
                ],
                "music genres": [
               
                  {
                    "value": "zulu music",
                    "synonym": ""
                  },
                  {
                    "value": "zydeco",
                    "synonym": ""
                  }
                ]
              },
                
                
        
        "regexps": [
            {
              "name": "@name",
              "synonym": /(^|[^@\w])@(\w{1,15})\b/,
              "entity": "username"
            }
        ],
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
