<template>
  <!-- MAIN VIEW:
  on the left: original document
  on the right: ocr output in a text area, as well as word cloud and save buttons
  below: a notifaction component consisting of a progress bar and a stop watch
  on the bottom: (optional) the canvas with the word cloud if the button is pressed
-->
<div>
  <div class="tile is-ancestor">
    <div class="tile is-vertical">
      <div class="tile is-parent">
        <div class="tile is-child box is-6">
          <div>
            <canvas id='input-overlay'></canvas>
            <img id="input"/>
            <canvas v-show=false id='pdf-canvas'></canvas>
          </div>
        </div>
        <div class="tile is-child box is-6">
          <div id='display-text'>
            <div class="field">
              <div :class="textAreaClass">
                <textarea spellcheck="true" readonly class="textarea" rows="10" placeholder="Loading Text ..." v-model="tesseractData.text"></textarea>
              </div>
            </div>
            <div id="processingButtons" class="buttons are-medium" v-if="state == STATES.DONE">
              <a class="button is-info" @click="EventBus.$emit('createWordCloud', [tesseractData.text, selectedLang])">Word cloud</a>
              <a class="button is-success" @click="saveToFile">Save</a>
            </div>
          </div>
        </div>
      </div>
      <div class="tile is-parent">
        <div class="tile is-child box">
          <b-notification type="is-info" has-icon v-if="state == STATES.COMPUTING">
            <progress v-bind:value="progress" max="100">{{progress}}%</progress>
            {{progress}}%
            <p>Duration: {{elapsedTime}} seconds</p>
          </b-notification>
          <b-notification type="is-success" has-icon v-if="state == STATES.DONE">
            OCR completed with a total confidence of {{tesseractData.confidence}}%.
            <p>It took about {{stopTime}} seconds.</p>
          </b-notification>
        </div>
      </div>
      <div class="tile is-parent">
        <div class="tile is-child box">
          <textVisualisation/>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
  // import constants and libraries
  import { EventBus } from '../constants.js'
  import { STATES } from '../constants.js'
  import { DRAW_CONFIDENCE } from '../constants.js'
  import { getTesseractWorker } from '../constants.js'
  import TextVisualisation from './TextVisualisation.vue'
  export default {
    components: {
      'textVisualisation': TextVisualisation
    },
    data () {
      return {
        EventBus,
        // Tesseractjs output object with attribtues like progress, text, words
        tesseractData: {},
        STATES,
        // Current state
        state: STATES.COMPUTING,
        textAreaClass: 'control is-loading',
        // Stop watch attributes
        startTime: 0,
        elapsedTime: 0,
        stopTime: 0
      }
    },
    computed: {
      // Converts Tesseract.js' progress percentage from [0,1] to [0,100]% for a clearer output.
      progress () {
        if (this.tesseractData.progress) {
          return Math.floor(this.tesseractData.progress * 100)
        } else
        return 0
      },
    },
    methods: {
     // Reads an image file and appends its content on the canvas with the id 'input'.
     handleImage() {
      var reader = new FileReader()
      var imgtag = document.getElementById("input")
      imgtag.title = this.inputFiles[0].name
      reader.onload = function(event) {
        imgtag.src = event.target.result
      }
      reader.readAsDataURL(this.inputFiles[0])
    },
    /* 
     * Draws rectangles around words on the canvas of the input document after the OCR process.
     * Inspired by Tesseract.js demo: https://github.com/naptha/tesseract.js/tree/gh-pages .
     * Additional features: 
     * * the rectangles are now scaled regarding the flexible height and width of the canvas
     * * use of three different colors representing certainty levels defined in the constants.js:
     *   green (if CONFIDENCE>=HIGH), yellow (if CONFIDENCE>=MID) or red (CONFIDENCE<MID)
     */
    drawRectangles() {
      var input = document.getElementById('input')
      var input_overlay = document.getElementById('input-overlay')
      var ioctx = input_overlay.getContext('2d')
      var scaleWidth = input.width/input.naturalWidth
      var scaleHeight = input.height/input.naturalHeight
      input_overlay.width = input.width
      input_overlay.height = input.height
      this.tesseractData.words.forEach(function(w){
        var b = w.bbox
        ioctx.strokeWidth = 2
        if(w.confidence>=DRAW_CONFIDENCE.HIGH)
          ioctx.strokeStyle = 'green'
        else if (w.confidence>=DRAW_CONFIDENCE.MID)
          ioctx.strokeStyle = 'yellow'
        else
          ioctx.strokeStyle = 'red'
        ioctx.strokeRect(b.x0*scaleWidth, b.y0*scaleHeight, (b.x1-b.x0)*scaleWidth, (b.y1-b.y0)*scaleHeight)
        ioctx.stroke()
      })
    },
    /* Reads a PDF file and appends its content of a certain page on the input canvas.
     * The page number has been attached on an attribute "pageNumber" of the canvas node "input" before
     * when the user uploads the document file. Uses PDF.JS with promises.
    */
    handlePDF() {
      return new Promise((resolve) => {
        var file = this.inputFiles[0]
        var fileReader = new FileReader()  
        fileReader.onload = function() {
          var typedarray = new Uint8Array(this.result)
          import('pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(typedarray))
          .then(pdf => {
            var pdfCanvas = document.getElementById('pdf-canvas')
            var pageNumber = parseInt(pdfCanvas.pageNumber)
            return pdf.getPage(pageNumber)
          })
          .then(page => {
            console.log('Page loaded')
            var scale = 3
            var viewport = page.getViewport(scale)
            var canvas = document.getElementById('pdf-canvas')
            var context = canvas.getContext('2d')
            canvas.height = viewport.height
            canvas.width = viewport.width
            var renderContext = {
              canvasContext: context,
              viewport: viewport
            }
            page.render(renderContext).then(function(){
              var canvas = document.getElementById('pdf-canvas')
              console.log("Page rendered")
              var img2 = canvas.toDataURL('img.png')
              var imgtag = document.getElementById("input")
              imgtag.src = img2
              resolve(img2)
            })
          }).catch(response => {
            console.log('Failed to retrieve PDF', response)
          })
        }
        var arrayBuffer = fileReader.readAsArrayBuffer(this.inputFiles[0])
      })
    },
      // Saves the Tesseract.js output text to a file.
      // Snippet from https://mycodestock.com/public/snippet/13913 .
      saveToFile() {
        var filename = "yata_output.txt"
        let blob = new Blob([this.tesseractData.text], { type: 'text/plain;charset=utf-8;' })
      // IE10+ support
      if (navigator.msSaveBlob) { 
        navigator.msSaveBlob(blob, filename)
      } else {
        let link = document.createElement('a')
        if (link.download !== undefined) { 
          // Browsers that support HTML5 download attribute
          let url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', filename)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    },
    /* 
     * Checks the file type of user's input file.
     * Calls handlePDF or handleImage to append the files content on the input canvas.
     * Afterwards, the runOCR method is called in both cases.
     */
    handleFileType () {
      if (this.inputFiles.length) {
        if(this.inputFiles[0].type === "application/pdf"){
          this.handlePDF().then(pdfObject => {
            this.runOCR(pdfObject)
            this.state = STATES.COMPUTING 
          })
        } else if(['image/gif', 'image/jpeg', 'image/png'].includes(this.inputFiles[0].type)){
          this.handleImage()
          this.runOCR(this.inputFiles[0])
          this.state = STATES.COMPUTING
        }
      }
    },
    /* OCR main method. It uses Tesseract.js to predict optical characters of the given file.
     * Additionally, it manages the stop watch and provides information about the current state
     * (computing, done or failed), to updates elements of the view like the progress bar.
     */
    runOCR(file) {
      this.startTime = new Date().getTime()
      this.interval = setInterval(this.time, 1000)
      const worker = getTesseractWorker()
      var options = {
        'lang' : this.selectedLang,
        'tessedit_parallelize' : 1
      }
      worker.recognize(file, this.selectedLang)
      .progress((tesseractData) => {
        this.tesseractData = tesseractData
      })
      .then((result) => {
        this.state = STATES.DONE
        this.tesseractData = result
        this.textAreaClass = "control"
        this.drawRectangles()
        this.stopTime = this.elapsedTime
      }).catch((error) => {
        this.state = STATES.FAILED
        this.tesseractData = error
      })
    },
    // Given two time objects it computes the elapsed time in seconds.
    time() {
      this.elapsedTime = Math.floor(((new Date().getTime()) - this.startTime)/1000)
    }

  },
  watch: {
    /*
     * Triggered when the inputData (below) has been changed by user's interaction with the
     * upload button. Makes the data available in the whole Vue component. Appends the page
     * number on a new attribute of the canvas node.
    */
    inputData: function() {
      this.inputFiles = this.inputData[0]
      this.selectedLang = this.inputData[1]
      var pdfCanvas = document.getElementById('pdf-canvas')
      pdfCanvas.pageNumber = this.inputData[2]
      this.handleFileType()
    },
  },
  // Input data array consisting of the input file array (0), the selected language and the
  // selected page number.
  props: {
    inputData: {
      type: Array,
      required: true
    }
  }
}
</script>

<style>

#input, #input-overlay, #display-text {
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  margin-top: 30px;
  text-align: center;
}
#input {
  border: 1px solid #ddd;
}

#input-overlay {
  position: absolute;
}

</style>