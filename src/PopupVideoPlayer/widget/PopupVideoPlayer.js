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
			
			var url = "";
			
			if (this.source == "youtube") {
				url = "http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v%3"+this.videoId+"&format=json";
			} else if (this.source == "vimeo") {
				url = "https://vimeo.com/api/oembed.json?url=http%3A//vimeo.com/"+this.videoId;
			}
            xhr.get({
                url : url,
                handleAs: 'json',
                load : lang.hitch(this, this.showButton)
            });
            
            callback();
        },
        
        openPopup : function () {
			var videoUrl = "";
            this.bgNode = domConstruct.create('div', { 'class' : 'popupVideoPlayer-bg'});
            this.containerNode = domConstruct.create('div', { 'class' : 'popupVideoPlayer-container'});
            this.iframeNode = domConstruct.create('iframe', {
				 'class' : 'popupVideoPlayer-iframe',
				 width : this.playerWidth,
				 height : this.playerHeight,
				 frameBorder: '0',
				 webkitAllowFullscreen : true,
				 allowFullscreen : true,
				 mozAllowFullscreen : true
			});
            
			if (this.source == "youtube") {
				videoUrl = "//www.youtube.com/embed/"+this.videoId;
			} else if (this.source == "vimeo") {
				videoUrl = '//player.vimeo.com/video/'+this.videoId;
			}
			
			if (this.autoPlay) {
				videoUrl += "?autoplay=1";
			}
			
			this.iframeNode.src = videoUrl;
            
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
                top : (window.innerHeight-this.playerHeight)/2+'px',
                left : (window.innerWidth-this.playerWidth)/2+'px'
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