{
  "settings": {
    "languages": [
      "en"
    ],
    "tag": "nlp",
    "threshold": 0.5,
    "autoLoad": true,
    "autoSave": true,
    "modelFileName": "model.nlp",
    "calculateSentiment": true
  },
  "nluManager": {
    "settings": {
      "tag": "nlu-manager"
    },
    "locales": [
      "en"
    ],
    "languageNames": {},
    "domainManagers": {
      "en": {
        "settings": {
          "locale": "en",
          "tag": "domain-manager-en",
          "nluByDomain": {
            "default": {
              "className": "NeuralNlu",
              "settings": {}
            }
          },
          "trainByDomain": false,
          "useStemDict": true
        },
        "stemDict": {},
        "intentDict": {},
        "sentences": [
          {
            "domain": "default",
            "utterance": "I saw %hero% eating %food%",
            "intent": "sawhero"
          },
          {
            "domain": "default",
            "utterance": "I have seen %hero%, he was eating %food%",
            "intent": "sawhero"
          },
          {
            "domain": "default",
            "utterance": "I want to eat %food%",
            "intent": "wanteat"
          }
        ],
        "domains": {
          "master_domain": {
            "settings": {
              "locale": "en",
              "tag": "nlu-en",
              "keepStopwords": true,
              "nonefeatureValue": 1,
              "nonedeltaMultiplier": 1.2,
              "spellCheck": false,
              "spellCheckDistance": 1,
              "filterZeros": true,
              "log": true
            }
          }
        }
      }
    },
    "intentDomains": {},
    "extraSentences": [
      [
        "en",
        "I saw %hero% eating %food%"
      ],
      [
        "en",
        "I have seen %hero%, he was eating %food%"
      ],
      [
        "en",
        "I want to eat %food%"
      ]
    ]
  },
  "ner": {
    "settings": {
      "tag": "ner",
      "entityPreffix": "%",
      "entitySuffix": "%"
    },
    "rules": {
      "en": {
        "hero": {
          "name": "hero",
          "type": "enum",
          "rules": [
            {
              "option": "spiderman",
              "texts": [
                "Spiderman",
                "Spider-man"
              ]
            },
            {
              "option": "iron man",
              "texts": [
                "iron man",
                "iron-man"
              ]
            },
            {
              "option": "thor",
              "texts": [
                "Thor"
              ]
            }
          ]
        },
        "food": {
          "name": "food",
          "type": "enum",
          "rules": [
            {
              "option": "burguer",
              "texts": [
                "Burguer",
                "Hamburguer"
              ]
            },
            {
              "option": "pizza",
              "texts": [
                "pizza"
              ]
            },
            {
              "option": "pasta",
              "texts": [
                "Pasta",
                "spaghetti"
              ]
            }
          ]
        },
        "fromEntity": {
          "name": "fromEntity",
          "type": "trim",
          "rules": [
            {
              "type": "between",
              "leftWords": [
                "from"
              ],
              "rightWords": [
                "to"
              ],
              "regex": "/(?<= from )(.*)(?= to )/gi",
              "options": {}
            },
            {
              "type": "afterLast",
              "words": [
                "to"
              ],
              "options": {}
            }
          ]
        },
        "toEntity": {
          "name": "toEntity",
          "type": "trim",
          "rules": [
            {
              "type": "between",
              "leftWords": [
                "to"
              ],
              "rightWords": [
                "from"
              ],
              "regex": "/(?<= to )(.*)(?= from )/gi",
              "options": {}
            },
            {
              "type": "afterLast",
              "words": [
                "from"
              ],
              "options": {}
            }
          ]
        }
      }
    }
  },
  "nlgManager": {
    "settings": {
      "tag": "nlg-manager"
    },
    "responses": {}
  },
  "actionManager": {
    "settings": {
      "tag": "action-manager"
    },
    "actions": {}
  },
  "slotManager": {
    "sawhero": {
      "hero": {
        "intent": "sawhero",
        "entity": "hero",
        "mandatory": false,
        "locales": {}
      },
      "food": {
        "intent": "sawhero",
        "entity": "food",
        "mandatory": false,
        "locales": {}
      }
    },
    "wanteat": {
      "food": {
        "intent": "wanteat",
        "entity": "food",
        "mandatory": false,
        "locales": {}
      }
    }
  }
}
