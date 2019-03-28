import Vue from 'vue'

// Tesseract.js helper variables
var Tesseract = require('tesseract.js')
const { TesseractWorker, utils: { loadLang } } = Tesseract

  const loadLangOptions = {
    corePath: '../node_modules/tesseract.js-core/tesseract-core.js',
    workerPath: '../node_modules/tesseract.js/dist/worker.min.js',
  }  
  const getTesseractWorker = options => (
    new TesseractWorker({
      cacheMethod: 'readOnly',
      ...loadLangOptions,
      ...options,
    })
    )

// States to handle views
const STATES = Object.freeze({
  READY: 0,
  COMPUTING: 1,
  DONE: 2,
  FAILED: 3
  })

/* Confidence borders to draw either green (if CONFIDENCE>=HIGH), 
 yellow (if CONFIDENCE>=MID) or red (CONFIDENCE<MID) rectangles on the original document canvas
*/
const DRAW_CONFIDENCE = Object.freeze({
	HIGH: 90,
	MID: 80
})

// Initializes a Vuejs Eventbus to enable two-side communication between Vue.js components
export const EventBus = new Vue()

// Exports everything else
export {getTesseractWorker}
export {STATES}
export {DRAW_CONFIDENCE}