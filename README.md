# yata
Yet Another Tesseract(JS) Application

## Contributor
* Tim Niehoff (regexpr)

## Teacher
* Dr. Efer

# Requirements
* Node (npm needed)

# Installing
<pre>
git clone https://github.com/regexpr/yata
cd yata
npm install
</pre>

# Run
1. In Development Mode. Go to localhost:8080 in your favourite browser.
<pre>
npm run dev
firefox localhost:8080
</pre>
or
2. Build it and open index.html with your favourite browser.
<pre>
npm run build
firefox dist/index.html
</pre>

# Used libraries
See package.json for details
* [Tesseract.JS](https://github.com/naptha/tesseract.js) (from 'Development' branch! This will cover the newest emscripten Tesseract version (4.0) with much more satisfiyng results. The master branch of Tesseract JS still uses an a few years old emscripten Tesseract version. You probably do not want to use it)
* [Vue.js](https://github.com/vuejs/vue) (2.5.22)
* [Buefy](https://github.com/buefy/buefy)
* [PDF.js](https://github.com/mozilla/pdf.js/) (2.0.943)
* [Wordcloud2.js](https://github.com/timdream/wordcloud2.js/)
