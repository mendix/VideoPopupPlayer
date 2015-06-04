/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, document */
/*mendix */

define([
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text', 'dojo/html', 'dojo/_base/event', 'dojo/_base/xhr',
    'dojo/text!PopupVideoPlayer/widget/template/PopupVideoPlayer.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, html, event, xhr, widgetTemplate) {
    'use strict';

    return declare('PopupVideoPlayer.widget.PopupVideoPlayer', [_WidgetBase, _TemplatedMixin], {
        
        templateString : widgetTemplate,
		
		buttonNode : null,
		thumbnailNode : null,
		textNode : null,
		titleNode : null,
		authorNode : null,
        
        bgNode : null,
        containerNode : null,
        iframeNode : null,
        width : '400',
        height : '400',
        videoId : '',
        
        startup : function () {
            
        },

        update : function (obj, callback) {
            this.videoId = obj.get(this.videoIdAttr);
             
            xhr.get({
                url : 'https://vimeo.com/api/oembed.json?url=http%3A//vimeo.com/'+this.videoId,
                handleAs: 'json',
                load : lang.hitch(this, this.showButton)
            });
            
            callback();
        },
        
        openPopup : function () {
            //'<iframe src="//player.vimeo.com/video/VIDEO_ID" width="WIDTH" height="HEIGHT" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
            this.bgNode = domConstruct.create('div', { 'class' : 'popupVideoPlayer-bg'});
            this.containerNode = domConstruct.create('div', { 'class' : 'popupVideoPlayer-container'});
            this.iframeNode = domConstruct.create('iframe', { 'class' : 'popupVideoPlayer-iframe', width : this.width, height : this.height, frameBorder: '0', webkitAllowFullscreen : true, allowFullscreen : true, mozAllowFullscreen : true });
            this.iframeNode.src = '//player.vimeo.com/video/'+this.videoId;
            //var iframe = domConstruct.create('<iframe class="popupVideoPlayer-iframe" src="//player.vimeo.com/video/'+videoId+'" width="400" height="400" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');

            
            this.centerPopup(this.containerNode);
            this.connect(this.bgNode, 'click', lang.hitch(this, this.removePopup));
            
            domConstruct.place(this.iframeNode, this.containerNode);
            domConstruct.place(this.bgNode, document.body);
            domConstruct.place(this.containerNode, document.body);
        },
        
        showButton : function (data) {
            html.set(this.titleNode, data.title);
			html.set(this.authorNode, "By: "+data.author_name);
			this.authorNode.href = data.author_url;
			this.thumbnailNode.src = data.thumbnail_url;
			this.connect(this.titleNode, 'click', lang.hitch(this, this.openPopup));
			this.connect(this.thumbnailNode, 'click', lang.hitch(this, this.openPopup));
        },
        
        centerPopup : function (node) {
            domStyle.set(node, {
                top : (window.innerHeight-this.height)/2+'px',
                left : (window.innerWidth-this.width)/2+'px'
            });
        },
        
        removePopup : function () {
            domConstruct.destroy(this.iframeNode);
            domConstruct.destroy(this.bgNode);
            domConstruct.destroy(this.containerNode);
        },
        
        uninitialize : function () {
            this.removePopup();
        }

    });
});
require(['PopupVideoPlayer/widget/PopupVideoPlayer'], function () {
    'use strict';
});