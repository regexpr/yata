<template>
  <!-- Contains the canvas on that the word cloud will be drawn-->
  <canvas id='cloud' width="500" height="500"></canvas>
</template>
<script>
  import { EventBus } from '../constants.js'
  var WordCloud = require('../lib/wordcloud2.js')
  export default {
    methods: {
            // The main method that takes care of the process flow.
            main(text, lang) {
              var countedWords = this.countWords(this.cleanWords(text, lang))
              var canv = document.getElementById('cloud')
              var options = {
                list:countedWords,
                fontWeight: 4,
                minSize: 12,
                weightFactor: 20
              }
              WordCloud(canv, options)
            },
             // Given a text, it outputs an array of words by simple tokenization, noise and stop words removal.
             cleanWords(text, lang) {
              // English stop words from https://www.ranks.nl/stopwords
              var stopwords_eng = ["about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"]
              // German stop words from https://www.ranks.nl/stopwords/german
              var stopwords_de = ["aber", "als", "am", "an", "auch", "auf", "aus", "bei", "bin", "bis", "bist", "da", "dabei", "dadurch", "daher", "darum", "das", "daß", "dass", "dein", "deine", "dem", "den", "der", "des", "dessen", "deshalb", "die", "dies", "dieser", "dieses", "doch", "dort", "du", "durch", "ein", "eine", "einem", "einen", "einer", "eines", "er", "es", "euer", "eure", "für", "hatte", "hatten", "hattest", "hattet", "hier", "hinter", "ich", "ihr", "ihre", "ihrer", "im", "in", "ist", "ja", "jede", "jedem", "jeden", "jeder", "jedes", "jener", "jenes", "jetzt", "kann", "kannst", "können", "könnt", "machen", "mein", "meine", "mit", "muß", "mußt", "musst", "müssen", "müßt", "nach", "nachdem", "nein", "nicht", "nun", "oder", "seid", "sein", "seine", "sich", "sie", "sind", "soll", "sollen", "sollst", "sollt", "sonst", "soweit", "sowie", "und", "unser", "unsere", "unter", "vom", "von", "vor", "vorher", "wann", "warum", "was", "weiter", "weitere", "wenn", "wer", "werde", "werden", "werdet", "weshalb", "wie", "wieder", "wieso", "wir", "wird", "wirst", "wo", "woher", "wohin", "zu", "zum", "zur", "zwischen", "über"]
              var cleanedWords = []
            // Simple tokenization for German and English texts
            var words = text.split(/[^a-zA-ZäÄöÖüÜ'’_\-0-9@\.]+/)
            words.forEach(function (word){
            // Remove fullstops, commas and spaces from word
            word = word.replace(/[.,\s]/g, '')
            // Remove everything that is not a letter or number
            .replace(/[^a-zA-ZäÄöÖüÜ0-9]/g, "");
            // Remove too short strings
            if(word.length <= 1) {
              return
            }
            // Remove stop words
            if (lang === "eng" && stopwords_eng.indexOf(word.toLowerCase()) === -1){
              cleanedWords.push(word)
            } else if (lang === "deu" && stopwords_de.indexOf(word.toLowerCase()) === -1) {
              cleanedWords.push(word)
            }
          })
            return cleanedWords
          },
          /* Given an array of words, it counts for each word the occurence in that array
           * and finally outputs a sorted array with unique words and the number of their occurences.
           */
          countWords(words){
            var wordCounts = { }
            for(var i = 0; i < words.length; i ++){
              wordCounts[words[i]] = (wordCounts[words[i]] || 0) + 1
            }
            var sortedWords = []
            for (var key in wordCounts) {
              sortedWords.push([key, wordCounts[key]])
            }
            sortedWords.sort(function(b, a) {
              return a[1] - b[1]
            })
            return sortedWords
          }
        },
        mounted() {
    /* If a createWordCloud event is triggered in the YataCore component, 
     * the main method will be called with 
     * the array arr consisting of the text (arr[0]) and language (arr[1]) 
     * as functional parameters.
     */
    EventBus.$on('createWordCloud', arr => {
      this.main(arr[0], arr[1])
    })
  }
}
</script>