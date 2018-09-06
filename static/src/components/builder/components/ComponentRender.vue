

<script>
import components from '@dtwebservices/pybossa.vue/src/components.js'
import store from '@dtwebservices/pybossa.vue/src/store/store.js'
import * as mutations from '@dtwebservices/pybossa.vue/src/store/mutations.js'

const choices =  ['test1', 'test2' ];
const staticComponentsAttributes = {
	dropdown: { 
		attrs: {
			id: 'static-dropdown',
			choices: ['test1', 'test2' ],
			'pyb-answer': 'staticAnswer',
			'initial-value': 'test2' 
		}
	}
}
const renderFunctions = {
	commonRender: function(createElement){
		return createElement(
			this.selectedComponent,
		  	{
				attrs: this.form
		  	},[]
		);
	},
	dropdownRender: function(createElement ){
		return createElement(
			'dropdown-input',
		  	{
				attrs: staticComponentsAttributes.dropdown.attrs
		  	},[]
		);
	}
}
export default {
    props: ['template', 'form', 'selectedComponent'],
    render: renderFunctions.commonRender,
	components,
	store,
	mounted(){
		// store.commit(mutations.SET_ACTIVE);
	}
}


</script>
