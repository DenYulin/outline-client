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

import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js'
import {JSEncrypt} from 'jsencrypt';
import { windowsStore } from 'process';

Polymer({
  _template: html`
    <style>
      :host {
        background: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: center;
        width: 100%;
        height: 100vh;
      }

      #main {
        flex: 1;
        height: 100%;
        padding: 0px;
      }
      #qidong-bg{
        width:100%;
        height:100%; 
      }
     .qidong-text{
      position:absolute;
      top:30%;
      width:100%;
      text-align:center;
     }
      #footer {
        flex: 1;
        margin: 48px 0 36px 0;
        text-align: left;
      }

      #logo {
        width: 96px;
      }

      #version {
        color: rgba(0, 0, 0, 0.54);
        font-size: 12px;
        margin: 8px auto;
      }

      #description {
        color: #263238;
        text-align: left;
        font-size: 16px;
        line-height: 22px;
        margin: 32px auto;
      }

      #jigsaw-logo {
        width: 96px;
      }

      @media (min-width: 600px) {
        #description {
          width: 309px;
        }
        #footer {
          text-align: center;
          margin-top: 48px;
        }
        #jigsaw-logo {
          width: 104px;
        }
      }

      @media (max-height: 550px) {
        #main {
          padding: 18px 24px 0 24px;
        }
        #logo {
          width: 76px;
        }
        #description {
          font-size: 14px;
          margin: 18px auto;
        }
        #footer {
          margin: 36px 0 24px 0;
        }
		#tips{
		  text-align:center;
		}
      }

      a {
        color: var(--medium-green);
        text-decoration: none;
      }
 

    </style>

    <div id="main">
    <img id="qidong-bg" src\$="[[rootPath]]assets/bg.jpg" >
    <div class="qidong-text">
	  		<paper-spinner active></paper-spinner>
			<div id="tips">正在启动中...</div>
      </div>
    </div>
	<div id="robot" class="robot"></div>
	<iron-ajax id="postAjax" url="{{apiDomain}}/v1/clientconfig" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_handleResponse" debounce-duration="300"></iron-ajax>
	<iron-ajax id="userAjax" url="{{apiDomain}}/v1/userinfo" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_handleUserResponse" debounce-duration="300"></iron-ajax>
	<iron-ajax id="announcementAjax" url="{{apiDomain}}/v1/announcement" method="POST" handle-as="json" headers$='{"Content-Type":"application/json","platform":"{{client}}","Authorization":"{{accessToken}}"}' on-response="_handleAnnouncementResponse" debounce-duration="300"></iron-ajax>
	
`,

  is: 'splash-view',

  properties: {
    // Need to declare localize function passed in from parent, or else
    // localize() calls within the template won't be updated.
    localize: Function,
    rootPath: String,
	getNonceStr:Function,
	client:String,
	publicKey: String,
	apiDomain: String,
	accessToken: String,
	sffshh: String,
  announcementId:Number,
	bgImage: {
    type:String,
    computed: '_computePlashBg()',
  }
  },
  _computePlashBg:function(){
    return "";
  },

  _handleResponse: function(event,request){
	  console.log(request.response);
    var data = request.response;
    if(data.code == 200)
    {
      var config;
      if(Object.prototype.toString.call(data.data) == "[object String]")
      config = JSON.parse(data.data);
    else
    config = data.data;
      console.log(config.promo_pic_link);
      if (config.promo_pic_link.length > 0)
      {
        window.localStorage.setItem('splash_bg',data.promo_pic_link);
      }
      /*
      if (data.email_verify_enable == 1)
      {}
      */
      if(config.announcement_id>0)//取公告
      {
        this.announcementId = data.announcement_id;
        var ajax1 = this.$.announcementAjax;
        var obj = {};
        obj.timestamp = ""+new Date().getTime();
        obj.nonce = this.getNonceStr(8);
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
        var data = encrypt.encrypt(JSON.stringify(obj));
        ajax1.body = '{"signature":"'+data+'"}';
        ajax1.generateRequest();	  
    
      }else{//取用户

        var ajax2 = this.$.userAjax;
        var obj = {};
        obj.timestamp = ""+new Date().getTime();
        obj.nonce = this.getNonceStr(8);
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
        var data = encrypt.encrypt(JSON.stringify(obj));
        ajax2.body = '{"signature":"'+data+'"}';
        ajax2.generateRequest();	  
      }
    }

  },
  _handleUserResponse: function(event,request){
	  console.log(request.response);
    var appRoot = dom(this).getOwnerRoot().host;
    var data = request.response;
    if (data.code == 200)
    {
      appRoot.changePage("server");
    }else if (data.code == 401)
    {
      appRoot.changePage("login");
    }else{
      appRoot.showAlert(this.localize('alert_title_error'),this.localize('alert_content_error',"error",data.message),this.localize('alert_button_ok'));
    }

  },
  _handleAnnouncementResponse: function(event,request){
	  console.log(request.response);
    var appRoot = dom(this).getOwnerRoot().host;
    var data = request.response;
    if (data.code == 200)
    {
      var _content = "";
      var _title = "";
      for(var i=0;i++;i<data.data.length)
      {
        if(data.data[i].id == announcementId)
        {
          _title = data.data[i].title;
          _content = data.data[i].content;
          break;
        }
      }
      appRoot.showAlert(_title,_content,this.localize('alert_button_ok'),function(){appRoot.changePage('server');});
    }else if (data.code == 401)
    {
      appRoot.changePage("login");
    }else{
      appRoot.showAlert(this.localize('alert_title_error'),this.localize('alert_content_error',"error",data.message),this.localize('alert_button_ok'));
    }

  },
  ready:function(){
    var appRoot = dom(this).getOwnerRoot().host;
    // appRoot.showAlert('This a title','This is a content','OK',function(){},'Cancel',function(){alert('a');});
	  /*
	  var script = document.createElement('script');
	  script.src = "https://www.google.com/recaptcha/api.js";
	  script.async = true;
	  script.defer = true;
	  var that = this;
	  document.head.appendChild(script);
	  script.onload = function(){
		  var d = that.$.robot;
		  alert('ok');
		  console.log(d);
		  console.log(grecaptcha.render);
	  grecaptcha.render(d, {
			'sitekey': '6Le2brwgAAAAAM0ODnnOTFFhDO8pMTNmZFrVpb5M', //公钥
			'theme': 'light', //主题颜色，有light与dark两个值可选
			'size': 'compact',//尺寸规则，有normal与compact两个值可选
			'callback': function(){}, //验证成功回调
			'expired-callback': function(){}, //验证过期回调
			'error-callback': function(){} //验证错误回调
		});
		  
	  };
    */
	  console.log("ready");
	  var ajax = this.$.postAjax;
	  var obj = {};
	  obj.timestamp = ""+new Date().getTime();
	  obj.nonce = this.getNonceStr(8);
	  obj.fingerprint = obj.nonce;
	  var encrypt = new JSEncrypt();
	  encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + this.publicKey + '-----END PUBLIC KEY-----');
	  var data = encrypt.encrypt(JSON.stringify(obj));
	  ajax.body = '{"signature":"'+data+'"}';
	  ajax.generateRequest();	  
  },
  attached: function(){
	  console.log("attached");
  },
  detached: function(){
	  console.log("detached");
	  
  },
  show:function(){
    console.log('show');
  },
  attributeChanged: function(){
	  console.log("attributeChanged");
	  
  }
});
