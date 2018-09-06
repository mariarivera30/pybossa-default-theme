<template>
   <div v-if="showPreview" id="snippet" class = "col-md-12 ">
        <div class = "row">
            <div class="panel panel-default">
                <div class="panel-heading">Code Snippet</div>
                <div class="panel-body">{{rawHtml}}</div>
            </div> 
            <div class="panel panel-default">
            <div class="panel-heading">Component Preview</div>
                <div class="panel-body">
                    <form class="form-horizontal"> 
                        <label :for="form.id.stringValue">{{form.label.stringValue}}</label>
                        <ComponentRender :selectedComponent = "selectedComponent.id" :form = "form" :template= "rawHtml"></ComponentRender>
                    </form> 
                </div>
            </div>      
        </div>
    </div>
</template>

<script>
import store from '@dtwebservices/pybossa.vue/src/store/store.js'
import Mustache from 'Mustache'
import ComponentRender from './ComponentRender.vue'
const labelTemplate = require( "!!html-loader!./templates/labelTemplate.html");

export default {
    
    name: 'ComponentBuilderForm',
    props: ['selectedComponent', 'form', 'addLabel'],
    computed: { 
        
        rawHtml : function() {
            // this variable will contain all tokens data to be replace on the template
            let formForTemplate ={};
            Object.keys(this.form).forEach(e => { 
                if(this.form[e].booleanValue != undefined){
                    formForTemplate[e] = this.form[e].booleanValue;
                } else {
                    formForTemplate[e] = this.form[e].stringValue;
                }
                
            });

            let output = Mustache.render(this.selectedComponent.template, formForTemplate);     

            //if addlabel is true a label will wrapper the component       
            if(this.addLabel){
                const label = {for: formForTemplate['id'], component: output, label: formForTemplate['label'] }
                output = Mustache.render(labelTemplate, label);  
            }

            //This piece isresponsible of adding : for those props that are variables
            Object.keys(this.form).forEach(e => { 
                if(this.form[e].isVariable){
                    output = output.replace(e + '=',':'+ e + '=');
                }
            });

            return output;
        },

        showPreview : function(){
            let showPreview = true;
            //if all props are filled then the component will be show
            //we can add better valdation to display on other cases
            Object.keys(this.form).forEach(e => { 
                if((this.form[e].booleanValue === undefined && this.form[e].stringValue === undefined 
                        && e !== 'label' && e !== 'for')
                    || (this.addLabel && !this.form[e].stringValue && e === 'label')){
                    showPreview = false;
                } 
            });
            
            return showPreview;             
        }
    },
    components: {
        ComponentRender
    },
    store
}
</script>
