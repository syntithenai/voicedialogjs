var config = {
  "id": "5f7f1119c8dda585ea0bd594",
  "invocation": "",
  "title": "music player",
  "entities": {
    "artist": {
      "values": [
        "ry cooder",
        "simply red",
        "van halen"
      ],
      "lists": []
    },
    "genre": {
      "values": [
        "blues",
        "jazz",
        "reggae",
        "relaxing",
        "world"
      ],
      "lists": []
    }
  },
  "intents": {
    "previous track": [
      {
        "example": "previous track"
      }
    ],
    "next track": [
      {
        "example": "skip this song"
      },
      {
        "example": "skip this track"
      },
      {
        "example": "next song please"
      },
      {
        "example": "next track"
      }
    ],
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
  "entitiesData": {},
  "utterances": {
    "previous track": {
      "id": "5f883e269d3050e930c94252",
      "value": "previous track",
      "synonym": "previous track",
      "tags": []
    },
    "stop playing": {
      "id": "5f883e250bb2ec0c8309b95f",
      "value": "stop playing",
      "synonym": "stop playing",
      "tags": []
    },
    "start playing": {
      "id": "5f883e1a9a20dc40722ee056",
      "value": "start playing",
      "synonym": "start playing",
      "tags": [],
      "texts": [
        {
          "label": "",
          "text": "dd dddd"
        }
      ],
      "buttons": [
        {
          "label": "eek too",
          "utterance": "",
          "link": ""
        }
      ]
    },
    "next track": {
      "id": "5f883d66518ed228a1ea90bd",
      "value": "next track",
      "synonym": "next track",
      "tags": [],
      "video": [
        {
          "label": "http://media.w3.org/2010/05/bunny/movie.mp4",
          "href": "http://media.w3.org/2010/05/bunny/movie.mp4"
        }
      ]
    }
  },
  "rules": [
    {
      "rule": "next track",
      "steps": [
        "intent next track",
        "utter next track",
        "action say date"
      ]
    },
    {
      "rule": "previous track",
      "steps": [
        "intent previous track",
        "utter previous track"
      ]
    },
    {
      "rule": "stop playing",
      "steps": [
        "intent stop playing",
        "utter stop playing"
      ]
    },
    {
      "rule": "play music",
      "steps": [
        "intent play music",
        "utter start playing"
      ]
    }
  ],
  "actions": {
    "say date": {
      "value": "say date",
      "synonym": "return [new Date().toString()]\n",
      "id": "5f87737db0ddbc00f7eb244f"
    }
  }
}
module.exports = config
