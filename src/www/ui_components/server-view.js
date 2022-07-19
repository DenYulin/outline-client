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
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js'
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../views/servers_view/server_connection_indicator';


import {ServerConnectionState} from '../views/servers_view/server_connection_indicator';

Polymer({
  _template: html`
    <style>
	/* TODO(daniellacosse): reset via postcss */
  h2,
  span,
  footer,
  button,
  div {
    all: initial;
  }

  :host {
    --server-name-size: 1rem;
    --server-address-size: 0.875rem;

    display: inline-block;
    height: 400px;
    position: relative;
    padding:30px;
    width: 100%;
  }
  .cardall{ width: 100%; }

  .card {
    align-items: center;
    background: var(--outline-card-background);
    border-radius: var(--outline-corner);
    box-shadow: var(--outline-elevation);
    display: grid;
    grid-gap: var(--outline-slim-gutter);
    height: 100%;
    min-width: var(--min-supported-device-width);
    overflow: hidden;
    user-select: none;
    width: 100%;
    position: relative;
  }

  .card-metadata {
    font-family: var(--outline-font-family);
    color: var(--outline-text-color);
    grid-area: metadata;
    height: 100%;
    display: flex;
    align-items: center;
  }

  server-connection-indicator {
    min-height: var(--min-indicator-size);
    max-height: var(--max-indicator-size);
  }

  .card-metadata-text {
    user-select: text;
    padding: var(--outline-slim-gutter);
    height:50px;
  }

  .card-metadata-server-name {
    -webkit-box-orient: vertical;
    /* https://caniuse.com/?search=line-clamp */
    -webkit-line-clamp: 3;
    color: var(--outline-text-color);
    display: -webkit-box;
    font-family: var(--outline-font-family);
    font-size: var(--server-name-size);
    margin-bottom: var(--outline-mini-gutter);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-metadata-server-address {
    color: var(--outline-label-color);
    font-family: var(--outline-font-family);
    font-size: var(--server-address-size);
  }

  .card-menu-button {
    align-self: start;
    grid-area: menu;
    position: relative;
  }

  .card-footer {
    background: var(--outline-card-footer);
    border-top: var(--outline-hairline);
    box-sizing: border-box;
    grid-area: footer;
    padding: var(--outline-mini-gutter) var(--outline-gutter);
    text-align: end;
  }

  .card-error {
    color: var(--outline-error);
    margin: 0 var(--outline-slim-gutter);
  }
  .changeNode{
    font-family: var(--outline-font-family);
    color: var(--outline-text-color);
    width: 100%;
    height: 60px;
    text-align: center;
    position: absolute;
    top: 15%;
  }
  .changeNode span{display:inline-block;padding:3px 10px;border:1px solid #888;border-radius:20px;font-size:14px;}

      .card {
        --min-indicator-size: 192px;
        --max-indicator-size: calc(
          var(--min-supported-device-width) - var(--outline-slim-gutter) - var(--outline-slim-gutter)
        );

        grid-template-columns: 0 1fr auto 0;
        grid-template-rows: 0 auto minmax(0, 1fr) auto;
        grid-template-areas:
          '. . . .'
          '. metadata menu .'
          '. button button .'
          'footer footer footer footer';
      }

      .card-connection-button-container {
        grid-area: button;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        height: 100%;
        gap: var(--outline-slim-gutter);
        box-sizing: border-box;
        padding: var(--outline-large-gutter) 0;
      }

      server-connection-indicator {
        cursor: pointer;
      }

      .card-connection-label {
        color: var(--outline-label-color);
        font-size: var(--server-address-size);
        font-family: var(--outline-font-family);
        padding-top: 0.5rem;
      }
      :host .server-notice{
        height:200px;overflow:hidden;display:grid;margin-top:20px;
      }
      .ranklist li{height:26px;line-height:26px;margin-bottom:10px; overflow:hidden;}
    </style>
    <div class="cardall">
    <div class="card">
        <div class="card-metadata" aria-labelledby="server-name">
        <div class="card-metadata-text">
        <h2 class="card-metadata-server-name" id="server-name">
        [[currentNode.name]]
        </h2>
        <label class="card-metadata-server-address">[[currentNode.node_ip]]</label>
      </div>
        </div>
        <div class="changeNode"> <span on-click="getNodes">[[localize("select-node-label")]]</span></div>
        <div class="card-connection-button-container">

          <server-connection-indicator
            on-click="toggleConnect"
            connection-state="{{state}}"
            id="serverNode"
            role="button"
            tabindex="0"
            title="ss"
          ></server-connection-indicator>
			<label class="card-connection-label" >[[localize(stateLabel)]]</label>
        </div>
        <footer class="card-footer">
        <span class="card-error"> </span>
        <mwc-button
          label="[[connectButtonLabel]]"
          on-click="toggleConnect" 
        >
        </mwc-button>
      </footer>
      </div>
      </div>
      <div class="server-notice">
      <ul style="margin-top:0px;" id="ranklistul">
          <li class="top">
             js图片左右无缝滚动用鼠标控制图片滚动<span class="num">32万下载</span>
          </li>
          <li class="top">
              js无缝滚动制作js文字无缝滚动和js图片无缝滚动<span class="num">32万下载</span>
          </li>
          <li class="top">
              jquery 滚动 kxbdSuperMarquee插件支持图片与文字无缝滚动 图片翻滚 焦点图左右切换 banner广告制作<span class="num">32万下载</span>
          </li>
          <li>
              javascript滚动图片插件支持单排图片上下滚动、图片无缝滚动<span class="num">32万下载</span>
          </li>
          <li>
              javascript滚动图片带按钮控制上下左右自动无缝滚动<span class="num">32万下载</span>
          </li>
          <li>
              jquery hover图片插件制作鼠标滑过标题单个展开图片效果<span class="num">32万下载</span>
          </li>
          <li>
              flash图片特效3D立体动画焦点图片切换带左右按钮控制滚动<span class="num">32万下载</span>
          </li>
          <li>
             js lazyload实现网页图片延迟加载特效<span class="num">32万下载</span>
          </li>
          <li>
              FlippingBook电子杂志书去版权,翻页图片全部外调 站长珍藏版<span class="num">32万下载</span>
          </li>
          <li>
              门户网站jquery广告控制flash或图片顶部广告显示隐藏<span class="num">32万下载</span>
          </li>
      </ul>
      </div>

`,

  is: 'server-view',

  properties: {
    // Need to declare localize function passed in from parent, or else
    // localize() calls within the template won't be updated.
    localize: Function,
	state: {
		type: String,
		computed: '_computeNodeState(currentNode)'
	},
	stateLabel: {
		type: String,
		computed: '_computeNodeStateLabel(currentNode)'
	},
	isConnectedState:{
		type:Boolean,
        computed: '_computeConnectedState(currentNode)'
	},
	connectButtonLabel:{
		type:String,
		computed: '_computeConnectButtonLabel(currentNode)'
	},
    scrtime:Object,//
	currentNode:Object,//当前节点
    rootPath: String
  },
  test:function(){
	  console.log(this.currentNode);
	  var s = this._computeNodeState();
	  console.log(s);
  },
  _computeNodeState:function(currentNode){
	  if(currentNode)
		  return this.currentNode.connectionState;
	  else
		  return ServerConnectionState.DISCONNECTED;
  },
  _computeNodeStateLabel:function(currentNode){
	  if(currentNode)
		  return this.currentNode.connectionState+'-server-state';
	  else
		  return ServerConnectionState.DISCONNECTED+'-server-state';
  },
  _computeConnectedState:function(currentNode){
	  if (currentNode){
		return [
				ServerConnectionState.CONNECTING,
				ServerConnectionState.CONNECTED,
				ServerConnectionState.RECONNECTING,
			  ].includes(currentNode.connectionState);
	  }
	  return false;
  },
  _computeConnectButtonLabel:function(currentNode){
	  if (currentNode){
		if( [
				ServerConnectionState.CONNECTING,
				ServerConnectionState.CONNECTED,
				ServerConnectionState.RECONNECTING,
			  ].includes(currentNode.connectionState))
			  {
				  return this.localize('disconnect-button-label');
			  }else{
				  return this.localize('connect-button-label');
			  }
	  }
	  return this.localize('connect-button-label');
  },
  toggleConnect:function(){
	  this.dispatchEvent(
	new CustomEvent(this.isConnectedState ? "DisconnectPressed" : "ConnectPressed", {
	  detail: {serverId: 1},
	  bubbles: true,
	  composed: true,
	}));
	  
  },
    _handleResponse: function(event, request) {
		var response = request.response;
		alert(JSON.stringify(response));
  },
  getNodes:function(){
    var appRoot = dom(this).getOwnerRoot().host;
    appRoot.changePage("changenode");
  },
  animate:function(dom, json, time, callback) {
  // 定义定时器的间隔
  var interval = 20;
  // 定义总次数
  var allCount = time / interval;
  // 获取初始值
  // 因为不确定json中有多少条css样式 所以不能写具体的代码条数
  // 使用对应的思想 所以 我们也定义一个json
  var nowJSON = {};
  // 使用for循环获取初始值
  for(var i in json) {
      // 强制性的给nowJSON添加属性 并赋值
      if(window.getComputedStyle) {
          nowJSON[i] = parseInt(getComputedStyle(dom)[i]);
      } else {
          nowJSON[i] = parseInt(dom.currentStyle[i]);
      }
  }
  // 定义步长json
  var stepJSON = {};
  for(var i in json) {
      stepJSON[i] = (json[i] - nowJSON[i]) / allCount;
  }
  // 定义计数器
  var count = 0;
  var timer = setInterval(function() {
      count++;
      // 改变dom元素的css样式
      for(var i in json) {
          dom.style[i] = nowJSON[i] + stepJSON[i] * count + "px";
      }
      // 判断是否执行完毕
      if(count >= allCount) {
          // 停表
          clearInterval(timer);
          // 拉终
          for(var i in json) {
              dom.style[i] = json[i] + "px";
          }
          // 回调函数执行
          callback && callback();
      }
  }, interval);
},

  scrollTextList:function(){
    var ranklist =this.$.ranklistul
    this.scrtime = window.setInterval(function () {
      console.log(ranklist.firstElementChild);
      var liHeight = ranklist.firstElementChild.clientHeight;
      // this.animate(ranklist,{ marginTop: -liHeight + "px" },500,function(){
      //   alert('a')
      // });
      console.log(ranklist.style.marginTop)
  }, 2000);
  },
ready:function(){



},
  show:function(){

   var appRoot = dom(this).getOwnerRoot().host;
  if (appRoot.page == 'server'){
    console.log(this.currentNode)
    this.scrollTextList();
  };
  }
});
