const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });
manager.addNamedEntityText(
  'hero',
  'spiderman',
  ['en'],
  ['Spiderman', 'Spider-man'],
);
manager.addNamedEntityText(
  'hero',
  'iron man',
  ['en'],
  ['iron man', 'iron-man'],
);
manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
manager.addNamedEntityText(
  'food',
  'burguer',
  ['en'],
  ['Burguer', 'Hamburguer'],
);
manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);
manager.addDocument('en', 'I saw %hero% eating %food%', 'sawhero');
manager.addDocument(
  'en',
  'I have seen %hero%, he was eating %food%',
  'sawhero',
);
manager.addDocument('en', 'I want to eat %food%', 'wanteat');

manager.addBetweenCondition('en', 'fromEntity', 'from', 'to');
manager.addAfterLastCondition('en', 'fromEntity', 'to');
manager.addBetweenCondition('en', 'toEntity', 'to', 'from');
manager.addAfterLastCondition('en', 'toEntity', 'from');

//manager.slotManager.addSlot('travel', 'fromCity', true, { en: 'From where you are traveling?' });
  //manager.slotManager.addSlot('travel', 'toCity', true, { en: 'Where do you want to go?' });
  //manager.slotManager.addSlot('travel', 'date', true, { en: 'When do you want to travel?' });
  
  
  


//manager.train().then(function() {
//manager
  //.process('I saw spiderman eating spaghetti today in the city!')
  //.then(result => console.log(result));
  console.log(manager.export())
//})
