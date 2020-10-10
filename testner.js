//const { NerManager } = require('node-nlp');

//const manager = new NerManager({ threshold: 0.8 });
//const fromEntity = manager.addNamedEntity('fromEntity', 'trim');
//fromEntity.addBetweenCondition('en', 'from', 'to');
//fromEntity.addAfterLastCondition('en', 'to');
//const toEntity = manager.addNamedEntity('toEntity', 'trim');
//fromEntity.addBetweenCondition('en', 'to', 'from');
//fromEntity.addAfterLastCondition('en', 'from');
//manager.findEntities(
  //'I want to travel from Barcelona to Madrid',
  //'en',
//).then(entities => console.log(entities));

//console.log(manager.export())

const { NlpManager, ConversationContext } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] ,forceNER: true, ner: { threshold: 0.6 }});
const context = new ConversationContext();

//manager.addNamedEntityText('weapon', 'sword', ['en'], ['sword','greatsword','bastard sword','kopis']);
manager.addRegexEntity('name', 'en', /(^|[^@\w])@(\w{1,15})\b/);

// Adds the utterances and intents for the NLP
//manager.addDocument('en', 'bye bye', 'greetings.bye');
//manager.addDocument('en', 'i detect %smell%', 'smell');

// Train also the NLG
//manager.addAnswer('en', 'Weapon', 'Yikes, {{user}}\'s got a {{weapon}}.');
//manager.addAnswer('en', 'greetings.bye', 'see you soon{{user}}!');

// Train and save the model.
(async() => {
    manager.addNamedEntityText('smell', 'eggy', [ 'en' ], [ 'egg' ])

    await manager.train();
    manager.save();
    const response = await manager.process('en', 'i @gtreta detect 5 eggs');
    console.log(response);
		//const response2 = await manager.process('en', 'bye bye sword  @daniel!');
    //console.log(response2.entities);
})();
