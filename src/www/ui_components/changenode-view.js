/*
  Copyright 2020 The Outline Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
/* begin: dropdown menu dependencies */
/* Ensure Web Animations polyfill is loaded since neon-animation 2.0 doesn't import it */
/* ref: https://github.com/PolymerElements/paper-dropdown-menu/#changes-in-20 */
/* end: dropdown menu dependencies */

import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js'
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {JSEncrypt} from 'jsencrypt';

Polymer({
  _template: html`
    <style>
      :host {
        background: #efefef;
        text-align: center;
        width: 100%;
        padding: 0 8px;
      }
      :host a {
        color: #009688;
      }
      paper-card {
        display: block;
        text-align: left;
        margin: 8px auto;
        max-width: 550px;
      }
      .node-item{margin-bottom:20px;clear:both;padding-bottom:20px;border-bottom:1px solid #e5e5e5;overflow:hidden; }
      .node-area{font-weight:bold;font-size:16px;margin-left:30px;display:flex;}
      .node-area b{flex:3;}
      .node-area span{flex:1;text-align:right;}
      .node-area .add{display:block;}
      .node-area .reduce{display:none;}
      .active .add{display:none;}
      .active .reduce{display:block;}
      .node-item-list{max-height:0px;transition:max-height 0.2s ease-out;overflow: hidden;clear:both;}
      .node-item-list li{list-style:none;line-height:30px;color:#555;display:flex;margin:5px 0px;}
      .node-item-list .node-speed{flex:1;}
      .node-item-list .node-name{flex:2;}
    </style>
    <paper-card>
      <div class="card-content">
      <iron-ajax id="postAjax" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_handleResponse" debounce-duration="300"></iron-ajax>
<dom-repeat items="[[nodeList]]" as="a"   >
<template>
<div class="node-item" >
<div class="node-area"   on-click="zhankai2">
<b >[[a.country]]</b>
<span class="add">+</span><span class="reduce">-</span>
</div>
    <ul class="node-item-list">
    <dom-repeat items="[[a.data]]"  as="b">
        <template>
        <li id="[[b.nodeid]]" on-click="checkNode" ><span class="node-name">[[b.name]]</span><span class="node-speed">延时[[b.ping]]ms</span></li>
         </template>
     </dom-repeat>
     </ul>
     </div>
</template>
</dom-repeat>

      </div>
    </paper-card>
`,

  is: 'changenode-view',

  properties: {
    // Need to declare localize function passed in from parent, or else
    // localize() calls within the template won't be updated
    localize: Function,
    category: {
      type: String,
      value: 'general',
    },
    hasEnteredEmail: {
      type: Boolean,
      value: false,
    },
    shouldShowLanguageDisclaimer: {
      type: Boolean,
      computed: '_computeShouldShowLanguageDisclaimer(hasEnteredEmail)',
    },
    servers: Array,
    current:String,
    submitting: {
      type: Boolean,
      value: false,
    },
    submitButtonLabel: {
      type: String,
      computed: '_computeSubmitButtonLabel(submitting, localize)',
    },
    getNonceStr:Function,
    client:String,
    publicKey: String,
    apiDomain: String,
    accessToken: String,
    currentNode: Object,
    nodeList:[]
  },
  

  ready: function() {
    /*
    var appRoot = dom(this).getOwnerRoot().host;
    window.addEventListener('location-changed', function() {
      if (appRoot.page !== 'changenode') return;
      // Workaround:
      // https://github.com/PolymerElements/paper-dropdown-menu/issues/159#issuecomment-229958448
      appRoot.showLoading();
      var ajax = this.$.postAjax;
      ajax.url = this.apiDomain + "/v1/node";
      var obj = {};
      obj.timestamp = ""+new Date().getTime();
      obj.nonce = this.getNonceStr(8);
      var encrypt = new JSEncrypt();
      encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
      var data = encrypt.encrypt(JSON.stringify(obj));
      console.log(data);
      ajax.body = '{"signature":"'+data+'"}';
      ajax.generateRequest();
    }.bind(this));
    */
  },
  show:function(){
    var appRoot = dom(this).getOwnerRoot().host;
    appRoot.showLoading();
      var ajax = this.$.postAjax;
      ajax.url = this.apiDomain + "/v1/node";
      var obj = {};
      obj.timestamp = ""+new Date().getTime();
      obj.nonce = this.getNonceStr(8);
      var encrypt = new JSEncrypt();
      encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
      var data = encrypt.encrypt(JSON.stringify(obj));
      console.log(data);
      ajax.body = '{"signature":"'+data+'"}';
      ajax.generateRequest();
  },
getArrWithKey: function(originalArr, field) {
    let tempArr = [];
    let endData = [];
    for (let i = 0; i < originalArr.length; i++) {
        if (tempArr.indexOf(originalArr[i][field]) === -1) {
            endData.push({
                [field]: originalArr[i][field],
                data: [originalArr[i]]
            });
            tempArr.push(originalArr[i][field]);
        } else {
            for (let j = 0; j < endData.length; j++) {
                if (endData[j][field] == originalArr[i][field]) {
                    endData[j].data.push(originalArr[i]);
                    break;
                }
            }
        }
    }
    return endData // 最终输出
},
checkNode:function(e){
  console.log(e.model.b);
  var appRoot = dom(this).getOwnerRoot().host;
  appRoot.currentNode=e.model.b
  appRoot.changePage("server");
},
zhankai2:function(sender,e){
  //console.log(sender.path[1]);
  sender.path[1].classList.toggle("active");
  var panel = sender.path[2].querySelector(".node-item-list");
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  } 
},
_zhankai:function(){
var acc = dom(this.root).querySelectorAll('.node-area');
  var i;
  alert(acc.length);
  for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } 
    });
  }
},
  _handleResponse: function(event, request) {
    var response = request.response;
    console.log(JSON.stringify(response));
    var arr = response.data;
    console.log(arr);
  let a = this.getArrWithKey(arr, 'country');
  this.nodeList=a;
  console.log(this.nodeList);
  var appRoot = dom(this).getOwnerRoot().host;
  appRoot.hideLoading();
    },

  goNodeDetail: function(){
    var appRoot = dom(this).getOwnerRoot().host;
    this.current = "sffshh";
    appRoot.currentServer = "sffshh";
    appRoot.changePage("servers");
   },

  _emailValueChanged: function() {
    this.hasEnteredEmail = !!this.$.email.value;
  },

  _computeSubmitButtonLabel: function(submitting, localize) {
    // If localize hasn't been defined yet, just return '' for now - Polymer will call this
    // again once localize has been defined at which point we will return the right value.
    if (!localize) return '';
    var label = submitting ? 'submitting' : 'submit';
    return this.localize(label);
  },

  // Returns whether the window's locale is English (i.e. EN, en-US) and the user has
  // entered their email address.
  _computeShouldShowLanguageDisclaimer: function(hasEnteredEmail) {
    return !window.navigator.language.match(/^en/i) && hasEnteredEmail;
  },

  getValidatedFormData: function() {
    var inputs = [this.$.categoryList, this.$.feedback, this.$.email];
    for (var i = 0, input = inputs[i]; input; input = inputs[++i]) {
      if (input.validate && !input.validate()) {
        // The input.validate() call gives the input "invalid" styles if it's invalid,
        // so the user can see they have to fix it.
        console.debug('input invalid:', input);
        return;
      }
    }
    return {
      category: this.category,
      feedback: this.$.feedback.value,
      email: this.$.email.value,
    };
  },

  resetForm: function() {
    this.$.categoryList.category = 'general';
    this.$.feedback.value = '';
    this.$.email.value = '';
  }
});
