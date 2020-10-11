var config = {
    // domain
    //slots: {
        //name: {useValue:false}
    //},
    // nlu
    nlp : { 
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
    actions: {
        'action beep': function(history,slots) {
            return new Promise(function(resolve,reject) {
                console.log('BEEP')
                resolve(['utter_beeped'],[{name:'age', value:'random'}])
            })
        }
    },
    utterances: {
        'utter playback stopped': ['OK. Stopped.'],
        'utter next track': ['Playing the next track'],
        'utter previous track': ['Playing the previous track'],
        'utter playback started': ['Start playing'],
        'utter ask rating': ['What is your rating for this track'],
        'utter playback started artist': ['Found music by {artist}'],
        'utter playback started genre': ['Found music in the genre {genre}'],
        'utter have_fun': ['Have a blast','Have fun','Enjoy yourself']
    },
    
    // dialog flow data
    rules: [
        // first step must be the trigger intent
        {
            rule:'next_track',
            steps:['intent next track','utter next track']
        },
        {
            rule:'previous_track',
            steps:['intent previous track', 'utter previous track']
        },
        {
            rule:'stop playing',
            steps:['intent stop playing', 'utter stop playing']
        },
        {
            rule:'rate track',
            steps:['intent rate track', 'form rate track']
        },
        //{
            //rule:'play music',
            //steps:['intent play music','utter playback started']
        //}
    ],
    forms: [
        {
          form: "rate track", 
          entities: {
              rating: {
                  type: 'number',
                  question: 'What is your rating for this track'
              },
              rating_confirmed: {
                  type: 'enum',
                  values: ['yes','no'],
                  question: 'So you rate this track at {rating}'
              }
          }
          //steps: ['utter ask rating','utter playback started','action beep']
        }
    ],
    stories: [
        {
          story: "play music", 
          steps: ['intent play music','utter playback started','action beep']
        },
        {
          story: "play music genre", 
          steps: ['intent play music','slot genre','utter playback started genre','utter playback started']
        },
        {
          story: "play music artist", 
          steps: ['intent play music','slot artist','utter playback started artist','utter playback started']
        },
        //{
          //story: "user says hello with name", 
          //steps: ['intent_hello','slot_name','action_beep','utter_have_fun','utter_hello']
        //}
    ]
    
}
module.exports = config
