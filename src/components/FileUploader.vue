<template>
  <!-- STARTING VIEW:
  Contains: Title, little instructions, language selector, page selector and a file upload field -->
  <section class="has-text-centered" >
    <h1 class="title has-text-grey-dark">Enjoy Yata</h1>
    <h2 class="subtitle">Specify Options - Upload Document - Wait - Get the OCR result </h2>
    <p class="question-labels">In which <b>language</b> is the document written?</p>
    <div class="field">
      <div class="field">
        <b-radio v-model="selectedLang"
        size="is-medium"
        native-value="eng">
        English
      </b-radio>
    </div>
    <div class="field">
      <b-radio v-model="selectedLang"
      size="is-medium"
      native-value="deu">
      German
    </b-radio>
  </div>
</b-switch>
</div>  
<p class="question-labels">Currently, Yata supports selecting only one page of a pdf.</p> 
<p class="question-labels">Which <b>page number</b> of the pdf should Yata consider?</p>
<b-input class="input-elements" type="number" size="is-medium" min="1" v-model="pageNumber"></b-input>
<b-upload v-model="inputFiles" v-on:input="$emit('input', [inputFiles, selectedLang, pageNumber])"
multiple
drag-drop>
<section class="section">
  <div class="content has-text-centered has-text-primary">
    <p><b-icon
    icon="upload"
    size="is-large">
  </b-icon></p>
  <p class="subtitle has-text-primary">Drop your files here or click to upload.</p>
</div>
</section>
</b-upload>
</b-field>
</section>
</template>
<script>
  export default {
    data() {
      return {
        inputFiles: [],
        selectedLang: 'eng',
        pageNumber: 1
      }
    },
  }
</script>

<style>
.input-elements {
  width: 100px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  margin-bottom: 10px;
}

.question-labels {
  width: 530px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}
</style>