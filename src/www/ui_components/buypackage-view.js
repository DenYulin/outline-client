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
      .packageHd{display:flex;line-height:50px;background:#f5f5f5;text-align:center;font-size:16px;}
      .packageHd-item,.packageBd-item{flex:1;}
      .packageBd ul{margin:0;padding:0;width:100%;}
      .packageBd li{display:flex;line-height:50px;text-align:center;font-size:14px;color:#888;}
      .buyButton01{display:block;border-radius:20px; width:60px;line-height:26px;height:26px;border:1px solid #c10000;text-align:center;color:#c10000;
      margin-top:10px;}
      .packageBd-price{line-height:28px;font-size:14px;}
 
    </style>
    <paper-card>
      <div class="card-content">
      <iron-ajax id="postAjax" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_handleResponse" debounce-duration="300"></iron-ajax>
      <div class="packageHd">
      <div class="packageHd-item">产品</div>
      <div class="packageHd-item">价格</div>
      <div class="packageHd-item">周期</div>
      <div class="packageHd-item">操作</div>
      </div>
      <div class="packageBd">
      <ul>
      <dom-repeat id="prolist"  items="[[buyList]]"  as="listitem">
      <template>
      <li>
      <div class="packageBd-item">[[listitem.name]]</div>
      <div class="packageBd-item">￥[[listitem.price]]</div>
      <div class="packageBd-item packageBd-price">[[listitem.saleBeginTime]]-[[listitem.saleCloseTime]]</div>
      <div class="packageBd-item"><span class="buyButton01">购买</span></div>
      </li>
      </template>
      </dom-repeat>
      </ul>
      </div>
      </div>
    </paper-card>
`,

  is: 'buypackage-view',

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
    buyList:Array
  },

  ready: function() {
    var appRoot = dom(this).getOwnerRoot().host;
    window.addEventListener('location-changed', function() {
      if (appRoot.page !== 'buypackage') return;
      // Workaround:
      // https://github.com/PolymerElements/paper-dropdown-menu/issues/159#issuecomment-229958448
      appRoot.showLoading();
      var ajax = this.$.postAjax;
      ajax.url = this.apiDomain + "/v1/shop";
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
  getArrWithKey: function(originalArr) {
    let endData = [];
    for (let i = 0; i < originalArr.length; i++) {
          endData.push(originalArr[i]);
    }
    return endData // 最终输出
},

  _handleResponse: function(event, request) {
    console.log(request.response);
    var response = request.response;
    console.log((response));
    
    if(Object.prototype.toString.call(response.data) == "[object String]")
      this.buyList = JSON.parse(response.data);
    else
      this.buyList = response.data;
    
  this.$.prolist.render();


  var appRoot = dom(this).getOwnerRoot().host;
  appRoot.hideLoading();
  console.log(this.buyList);
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
