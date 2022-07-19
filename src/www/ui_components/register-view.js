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
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
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
      paper-input,
      paper-textarea,
      paper-dropdown-menu {
        text-align: left;
        --paper-input-container-focus-color: #009688;
      }
      paper-dropdown-menu{display:block;}
      .card-actions {
        text-align: center;
      }
      #submitButton {
        margin: 0;
      }
      .toRegister{border-top:1px solid #e5e5e5;padding:50px 0px; text-align: center;}
      .toRegister span{color:#36c;}
      .card-content{padding:10px;}
      .email-get{display:flex;}
      #email{flex:3;}
      .codebtn{flex:1;height:40px;line-height:40px;background:#e5e5e5;font-size:14px;margin-top:10px;text-align:center;}
    </style>
    <paper-card>
 
 
      <paper-tabs selected="{{selected}}">
        <paper-tab>邮箱注册</paper-tab>
        <paper-tab>私钥注册</paper-tab>
      </paper-tabs>
      <iron-pages class="flex" selected="[[selected]]">
      <!--Changing only the above line to <neon-animated-pages breaks it-->
        <my-page-1>
        <div class="card-content">
        <div class="email-get">
        <paper-input id="email" type="email" name="email" label="[[localize('register-email')]]" ></paper-input>
        <paper-button class="codebtn" id="codebtn" on-click="getcode" disabled\$="[[disabled]]">{{time}}{{text}}</paper-button>
        </div>
        <iron-ajax id="postEmail" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}'   on-response="_handleResponse" debounce-duration="300"></iron-ajax>
        <paper-input id="emailcode" type="text" name="emailcode" label="[[localize('email-code')]]"  onkeydown="this.invalid = false;"></paper-input>
        <paper-input id="password" type="password"  required value="{{pass::input}}"   name="password" label="[[localize('login-pass')]]" ></paper-input>
        <paper-input id="password2" type="password"  required value="{{repass::input}}" name="password2" label="[[localize('register-pass')]]" on-change="passmatch" ></paper-input>

        <paper-dropdown-menu id="dropdownMenu" horizontal-align="left" label="[[localize('country_label')]]"  required="">
          <paper-listbox id="categoryList" selected="{{category}}" attr-for-selected="value" slot="dropdown-content">
          <paper-icon-item value="CN"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/cn.svg"></iron-icon>[[localize('country_cn')]]</paper-icon-item>
          <paper-icon-item value="US"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/us.svg"></iron-icon>[[localize('country_us')]]</paper-icon-item>
          <paper-icon-item value="GB"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/gb.svg"></iron-icon>[[localize('country_gb')]]</paper-icon-item>
          <paper-icon-item value="SG"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/sg.svg"></iron-icon>[[localize('country_sg')]]</paper-icon-item>          <paper-item value="CN">中国</paper-item>
        </paper-listbox>
      </paper-dropdown-menu>
      <paper-input id="refer_by" type="text" name="refer_by" label="[[localize('refer-by')]]" ></paper-input>

        </div>
        <div class="card-actions">
          <paper-button id="submitButton1" on-click="registerbtn"   disabled\$="[[submitting]]">[[submitButtonLabel]]</paper-button>
        </div>
        <div class="toRegister">
        <div>[[localize('login-account-yes')]]
        <span on-click="loginBtn" name="login">   [[localize('login-text')]]</span>
        </div>
        </div>
        <iron-ajax id="postAjax" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}'   on-response="_handleResponse" debounce-duration="300"></iron-ajax>
 
        </my-page-1>
        <my-page-2>
        <div class="card-content">
        <paper-dropdown-menu id="dropdownMenu" horizontal-align="left" label="[[localize('country_label')]]"  required="">
          <paper-listbox id="categoryList" selected="{{category}}" attr-for-selected="value" slot="dropdown-content">
          <paper-icon-item value="CN"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/cn.svg"></iron-icon>[[localize('country_cn')]]</paper-icon-item>
          <paper-icon-item value="US"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/us.svg"></iron-icon>[[localize('country_us')]]</paper-icon-item>
          <paper-icon-item value="GB"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/gb.svg"></iron-icon>[[localize('country_gb')]]</paper-icon-item>
          <paper-icon-item value="SG"><iron-icon  slot="item-icon" src="[[rootPath]]assets/flags/sg.svg"></iron-icon>[[localize('country_sg')]]</paper-icon-item>          <paper-item value="CN">中国</paper-item>
        </paper-listbox>
      </paper-dropdown-menu>

        <iron-ajax id="postAjax2" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}'   on-response="_handleResponse2" debounce-duration="300"></iron-ajax>
        <div class="card-actions">
          <paper-button id="submitButton2" disabled\$="[[submitting]]" on-click="getPrivateKey"  >[[localize('get-private-key')]]</paper-button>
        </div>
        <div class="mask"></div>
        <div class="mask"></div>
        <div class="toRegister">
        <div>[[localize('login-account-yes')]]
        <span on-click="loginBtn" name="login">   [[localize('login-text')]]</span>
        </div>
        </div>
        </my-page-2>
      </iron-pages>
  



    </paper-card>
`,

  is: 'register-view',

  properties: {
    // Need to declare localize function passed in from parent, or else
    // localize() calls within the template won't be updated
    localize: Function,
    category: {
      type: String,
      value: 'general',
    },
    selected: { type: Number, value: 0    },
    hasEnteredEmail: {
      type: Boolean,
      value: false,
    },
    email: {
      type: String,
      value: '',
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
    text: {
      type: String,
      value: '获取验证码',
    },
    disabled:{
      type: Boolean,
      value: false,
    },
    time:String
  },

  ready: function() {
    var appRoot = dom(this).getOwnerRoot().host;
    window.addEventListener('location-changed', function() {
      if (appRoot.page !== 'register') return;
      // Workaround:
      // https://github.com/PolymerElements/paper-dropdown-menu/issues/159#issuecomment-229958448
      if (!this.$.dropdownMenu.value) {
        var tmp = this.$.categoryList.selected;
        this.$.categoryList.selected = undefined;
        this.$.categoryList.selected = tmp;
      }
    }.bind(this));
  },
  passmatch: function(e){ 
    var password = encodeURIComponent(this.pass); 
    var confirmPassword = encodeURIComponent(this.repass); 
    if(password != confirmPassword){ 
    // do something 
    console.log(password,confirmPassword)
    alert("密码不一致")
    } 
   },
  loginBtn: function(){
    var appRoot = dom(this).getOwnerRoot().host;
    appRoot.changePage("login");
   },
   registerbtn:function(){
        alert("1111")
    var ajax = this.$.postAjax;
    ajax.url = this.apiDomain + "/v1/createuser";
    var obj = {};
    obj.type = "normal_reg";
    obj.email = this.$.email.value;
    obj.code =  this.$.emailcode.value;
    obj.password = this.$.password.value;
    obj.country = this.category;
    obj.refer_by = this.$.refer_by.value;
    obj.timestamp = ""+new Date().getTime();
    obj.nonce = this.getNonceStr(8);
    obj.fingerprint = this.getNonceStr(8);
    console.log(obj);
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
    var data = encrypt.encrypt(JSON.stringify(obj));
    console.log(data);
    ajax.body = '{"signature":"'+data+'"}';
    ajax.generateRequest();
    console.log("ok");
   },
   getcode:function(){

    var reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
    var emailVate=this.$.email.value;
    if(emailVate==""){
      alert("邮箱不能为空")
      return
    }else if (reg.test(emailVate)) {
      
    } else {
      alert("邮箱格式不正确")
      return
    };
    this.setInterValFunc();
    this.disabled = true;
    var ajax = this.$.postAjax;
    ajax.url = this.apiDomain + "/v1/email";
    var obj = {};
    obj.email = this.$.email.value;
    obj.timestamp = ""+new Date().getTime();
    obj.nonce = this.getNonceStr(8);
    console.log(this.client);
    console.log(obj);
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
    var data = encrypt.encrypt(JSON.stringify(obj));
    console.log(data);
    ajax.body = '{"signature":"'+data+'"}';
    ajax.generateRequest();
    console.log("ok");
   },
   setInterValFunc:function() {
    this.time = 60;
    this.text = '秒';
    this.setTime = setInterval(() => {
        if (this.time - 1 == 0) {
            this.time = '';
            this.text = '重新获取';
            this.code = '';
            this.disabled = false;
            clearInterval(this.setTime);
        } else {
            this.time--;
        }
    }, 1000);
},

getPrivateKey:function(){
  var appRoot = dom(this).getOwnerRoot().host;
  appRoot.showLoading();
  var ajax = this.$.postAjax2;
  ajax.url = this.apiDomain + "/v1/createuser";
  var obj = {};
  obj.type = "private_key_reg";
  obj.country = this.category;
  obj.timestamp = ""+new Date().getTime();
  obj.nonce = this.getNonceStr(8);
  obj.fingerprint = this.getNonceStr(8);
  console.log(obj);
  var encrypt = new JSEncrypt();
  encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
  var data = encrypt.encrypt(JSON.stringify(obj));
  console.log(data);
  ajax.body = '{"signature":"'+data+'"}';
  ajax.generateRequest();
  console.log("ok");
},

   _handleResponse: function(event, request) {
    var appRoot = dom(this).getOwnerRoot().host;
    var response = request.response;
    var linkCode=response.code;
      appRoot.hideLoading();
    console.log(JSON.stringify(response));
    if(linkCode=="200"){
      appRoot.showAlert('Registered successfully','<div class="message_text">恭喜您注册成功！</div>','OK',function(){appRoot.changePage("login");});
    }else{
      appRoot.showAlert('Error message','<div class="message_text">'+response.msg+'</div>','OK',function(){});
    };
    },
    _handleResponse2: function(event, request) {
      var response = request.response;
      var appRoot = dom(this).getOwnerRoot().host;
      console.log(JSON.stringify(response));
        appRoot.hideLoading();
  appRoot.showAlert('private key','<div class="tishi_text">'+response.data+'</div>' + '<div class="tishi_mar">'+ this.localize("copy-private-key")+'</div>','OK',function(){appRoot.changePage("login");});
    //appRoot.showAlert('This a title',response.data,'OK',function(){},'Cancel',function(){alert('a');});

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
