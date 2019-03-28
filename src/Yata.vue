<template>
	<!-- ROOT VIEW 
	Loads the view of the FileUploader and YataCore component depending on the current state.
	-->
	<div id="yata">
		<fileUploader v-model="inputData" v-show="state === STATES.READY" />	
		<yataCore :inputData="inputData" :state="state" v-show="state === STATES.COMPUTING" />
	</div>
</template>

<script>
	import {STATES} from './constants.js'
	import YataCore from "./components/YataCore.vue"
	import FileUploader from "./components/FileUploader.vue"
	
	export default {
		name: 'Yata',
		components: {
			'yataCore' : YataCore,
			'fileUploader' : FileUploader
		},
		data() {
			return {
				state: 0,
				inputData: [],
				STATES
			}
		},
		watch: {
			inputData: function() {
				this.state++
			}
		}
	}
</script>