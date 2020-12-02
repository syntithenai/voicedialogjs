//const yaml = require('js-yaml');
// FUNCTIONS 
var balanced = require('balanced-match');

function toSnakeCase(str) {
    return str.toLowerCase().replace(/[^a-z]/g, '_').replace('__','_')
}

const snakeToCamelCase = (str) => str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
                    .replace('-', '')
                    .replace('_', '')
);

const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);



function generateObjectId() {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}
   
function parentUrl(url) {
    return url.split("/").slice(0,-1).join("/") 
}

function concatText(text,words) {
   let parts = text.split(' ')
   let shorter = parts.slice(0,20).join(' ')
   return (shorter.length < text.length) ? shorter + '...' : shorter;
}



    
    function findFirstDiffPos(a, b) {
      if (a === b) return -1;
      for (var i=0; a[i] === b[i]; i++) {}
      return i;
    }
    
    function multiplyArrays(a,b) {
        var results=[]
        a.map(function(aval) {
              b.map(function(bval) {
                  results.push(aval + bval)
              })
        })
        return results
    }

    function uniquifyArray(a) {
        ////console.log(['UNIQARRAY',a])
        if (Array.isArray(a)) {
            var index = {}
            a.map(function(value) {
                index[value] = true 
                return null
            })
            return Object.keys(index)
        } else {
            return []
        }
    }

    function uniquifyArrayOfObjects(a,field) {
         if (Array.isArray(a)) {
             var index = {}
            var emptyIndex = null
            a.map(function(value) {
                if (value) {
                    if (value[field]) {
                        index[value[field]] = value 
                    } else {
                        emptyIndex = value
                    }
                }
                return null
            })
            if (emptyIndex) return [emptyIndex].concat(Object.values(index))
            else return Object.values(index)
        } else {
            return []
        }
    }
    
    // recursively expand sentence containing options eg (the|an(y|)|my) into an array of expanded sentences
    function expandOptions(text) {
        var options = []
        var b = balanced('(',')',text)
        if (b && b.body) {
            var innerOptions = null
            var ib = balanced('(',')',b.body)
            if (ib) {
                innerOptions = expandOptions(b.body)
            } else {
                innerOptions = b.body.split("|")
            }
            innerOptions = uniquifyArray(innerOptions)
            var sentences = uniquifyArray(multiplyArrays(multiplyArrays([b.pre],innerOptions),[b.post]))
            sentences.map(function(sentence) {
               options=[].concat(options,expandOptions(sentence))  
            })
        } else {
            options = text.split("|")
        }
        return uniquifyArray(options)
    }
    
    function replaceEntities(example,entities) {
        // replace entity values with {entityName}
        // first sort entities by start key
        entities = entities.sort(function(a,b) {
          if (a.start < b.start) return -1
          else return 1  
        })
        var offset = 0
        var newExample = example
        entities.map(function(entity) {
            newExample = newExample.slice(0,entity.start + offset)+"{"+entity.type+"}"+newExample.slice(entity.end + offset)
            var diff = (entity.end - entity.start) - (entity.type.length + 2)
            offset -= diff
            return null
        })
        return newExample
    }
    
    function replaceEntitiesWithValues(example,entities) {
        // replace entity values with {entityName}
        // first sort entities by start key
        if (example && Array.isArray(entities)) {
                entities = entities.sort(function(a,b) {
              if (a.start < b.start) return -1
              else return 1  
            })
            var offset = 0
            var newExample = example
            entities.map(function(entity) {
                var replacement = "["+entity.value+"]("+entity.type+")"
                newExample = newExample.slice(0,entity.start + offset)+replacement+newExample.slice(entity.end + offset)
                var diff = (entity.end - entity.start) - (replacement.length)
                offset -= diff
                return null
            })
            return newExample
        } else {
            return example
        }
    }
    
    
    
    /**
     *  create array by splitting on newline and fullstop
     */
    function splitSentences(text) {
      var final = []
      if (text) {
          // split by newline and full stop
         var splits = text.split('\n').join('::::').split('.').join('::::').split('::::') //.map(function(value) { return value.trim()})
        // trim all splits
        for (var splitText in splits) {
            if(splitText.trim().length > 0) final.push(splits[splitText])
        }
     }
     return final;
    }
    
    
    function cleanText(intent) {
        return intent.replaceAll('.','_').replaceAll(',','_').replaceAll(' ','_').trim()
    }
    
    function cleanIntent(intent) {
        return cleanText(intent)
    }
    
    function cleanEntity(entity) {
        return cleanText(entity)
    }
    
    function cleanUtterance(utterance) {
        return cleanText(utterance)
    }

    function cleanRegexp(regexp) {
        return cleanText(regexp)
    }
  


export {cleanUtterance, cleanIntent, cleanEntity, cleanRegexp,  generateObjectId, parentUrl, concatText , findFirstDiffPos,uniquifyArray, multiplyArrays, expandOptions, splitSentences, uniquifyArrayOfObjects, replaceEntities,replaceEntitiesWithValues, snakeToCamelCase, camelToSnakeCase, toSnakeCase }
