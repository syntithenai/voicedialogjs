const { dockStart } = require('@nlpjs/basic');

(async () => {
    
  const dock = await dockStart({ use: ['Basic','Nlp'], settings: {forceNER: true}});
  const nlp = dock.get('nlp');
  nlp.addLanguage('en');
  nlp.settings.forceNER = true
   nlp.addNerRuleOptionTexts('en', 'smell', 'egg','egg');
   nlp.addNerRuleOptionTexts('en', 'smell', 'egg','eggs');
   nlp.addNerRuleOptionTexts('en', 'smell', 'egg','eggy');
   nlp.addNerRegexRule('en','me', /(^|[^@\w])@(\w{1,15})\b/)
  // Adds the utterances and intents for the NLP
  nlp.addDocument('en', 'goodbye for now', 'greetings.bye');
  nlp.addDocument('en', 'bye bye take care', 'greetings.bye');
  nlp.addDocument('en', 'okay see you later', 'greetings.bye');
  nlp.addDocument('en', 'bye for now', 'greetings.bye');
  nlp.addDocument('en', 'i must go', 'greetings.bye');
  nlp.addDocument('en', 'i should go %smell% now', 'greetings.bye');
  nlp.addDocument('en', 'i should go %smell% now %me%', 'greetings.bye');
  nlp.addDocument('en', 'hello', 'greetings.hello');
  nlp.addDocument('en', 'hi', 'greetings.hello');
  nlp.addDocument('en', 'howdy', 'greetings.hello');
  console.log(nlp)
  console.log(JSON.stringify(nlp))
  
  // Train also the NLG
  nlp.addAnswer('en', 'greetings.bye', 'Till next time');
  nlp.addAnswer('en', 'greetings.bye', 'see you soon!');
  nlp.addAnswer('en', 'greetings.hello', 'Hey there!');
  nlp.addAnswer('en', 'greetings.hello', 'Greetings!');  await nlp.train();
  const response = await nlp.process('en', 'I should go egg now steve');
  console.log(response);
})();
