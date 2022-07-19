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
      .myset-item{display:flex;line-height:50px;text-align:center;font-size:16px;
      border-bottom:1px solid #e5e5e5;}
      .myset-item b{display:block;width:180px;font-weight:normal;}
      .myset-item div{text-align:center;flex:1;}
    </style>
    <paper-card>
      <div class="card-content">
    <iron-ajax id="postAjax" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_handleResponse" debounce-duration="300"></iron-ajax>
    <div class="myset-item"><b>[[localize('last-connection-time')]]</b><span>{{stateList.t}}</span></div>
    <div class="myset-item"><b>[[localize('upload-traffic')]]</b><span>{{stateList.u}}</span></div>
    <div class="myset-item"><b>[[localize('downward-flow')]]</b><span>{{stateList.d}}</span></div>
    <div class="myset-item"><b>[[localize('hourly-usage')]]</b><span>{{stateList.hourly_usage}}</span></div>
    <div class="myset-item"><b>[[localize('expire-time')]]</b><span>{{stateList.expire_time}}</span></div>
    <div class="myset-item"><b>[[localize('refer-by')]]</b><span>{{stateList.refer_by}}</span></div>
    <div class="myset-item"><b>[[localize('invite-code')]]</b><span>{{stateList.invite_code}}</span></div>
    <div class="myset-item"><div>
    <iron-ajax id="postAjax2" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_deleteResponse" debounce-duration="300"></iron-ajax>
    <paper-button id="submitButton" on-click="deleteuser"    disabled\$="[[submitting]]">[[localize('exit-account')]]</paper-button>
    </div></div>
      </div>
 
    </paper-card>
`,

  is: 'mystate-view',

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
    stateList:{},
  },
  deleteuser:function(){
    var appRoot = dom(this).getOwnerRoot().host;
    appRoot.showLoading();
    var ajax = this.$.postAjax2;
    ajax.url = this.apiDomain + "/v1/deleteuser";
    var obj = {};
    obj.timestamp = ""+new Date().getTime();
    obj.nonce = this.getNonceStr(8);
    console.log(obj);
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
    var data = encrypt.encrypt(JSON.stringify(obj));
    console.log(data);
    ajax.body = '{"signature":"'+data+'"}';
    ajax.generateRequest();
  },

  ready: function() {
    var appRoot = dom(this).getOwnerRoot().host;
    window.addEventListener('location-changed', function() {
      if (appRoot.page !== 'mystate') return;
      // Workaround:
      // https://github.com/PolymerElements/paper-dropdown-menu/issues/159#issuecomment-229958448
      appRoot.showLoading();
      var ajax = this.$.postAjax;
      ajax.url = this.apiDomain + "/v1/userinfo";
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
  },
  _handleResponse: function(event, request) {
    var response = request.response;
    console.log(JSON.stringify(response));
    this.stateList=response.data;
    
  var appRoot = dom(this).getOwnerRoot().host;
  appRoot.hideLoading();
    },
    _deleteResponse: function(event, request) {
      var response = request.response;
      console.log(JSON.stringify(response));
    var appRoot = dom(this).getOwnerRoot().host;
    appRoot.hideLoading();
    appRoot.changePage("login");
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
