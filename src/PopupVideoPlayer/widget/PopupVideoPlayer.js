define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/xhr",
    "dojo/window",
    "dojo/text!PopupVideoPlayer/widget/template/PopupVideoPlayer.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, domStyle, domConstruct, lang, text, html, xhr, win, widgetTemplate) {
    "use strict";

    return declare("PopupVideoPlayer.widget.PopupVideoPlayer", [_WidgetBase, _TemplatedMixin], {

        templateString : widgetTemplate,

        buttonNode : null,
        thumbnailNode : null,
        textNode : null,
        titleNode : null,
        authorNode : null,
        byNode : null,

        bgNode : null,
        containerNode : null,
        iframeNode : null,
        videoId : "",
        jsonpcb : null,
        buttonClickHandler : null,
        objectId : null,

        _aspectRatio: null,

        log() {
            var args = Array.prototype.slice.call(arguments);
            if (this.id) {
                args.unshift(this.id);
            }
            if (mx && mx.logger && mx.logger.debug) {
                mx.logger.debug.apply(mx.logger, args);
            } else {
                logger.debug.apply(logger, args);
            }
        },

        update : function (obj, callback) {
            this.log(".update");
            if (!obj) {
                domStyle.set(this.buttonNode, "display", "none");
                callback();
                return;
            }

            this.objectId = obj.getGuid();
            this.videoId = obj.get(this.videoIdAttr);

            var url = "";
            var cb = this.id + "oembedcb";

            this.resetJsonp();

            if (this.source === "youtube") {
                this.jsonpcb = window[cb] = lang.hitch(this, function (data) {
                    this.showButton(data);
                });
                // RvH: Youtube doesn"t work with GET because of CORS and does not support jsonp callbacks. Luckily the noembed wrapper does.
                url = "https://noembed.com/embed?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D" + this.videoId + "&callback=" + cb;
            } else if (this.source === "vimeo") {
                url = "https://vimeo.com/api/oembed.json?url=http%3A//vimeo.com/" + this.videoId;
            }

            xhr.get({
                url : url,
                handleAs: "json",
                headers : {
                    // Dojo by default tries to do a preflighted request, this runs into CORS so we disable this.
                    "X-Requested-With": null
                },
                load : lang.hitch(this, function (data) {
                    if (this.source === "vimeo") {
                        this.showButton(data);
                    }
                }),
                error : lang.hitch(this, function () {
                    this.resetJsonp();
                    this.showError();
                })
            });

            callback();
        },

        openPopup : function (evt) {
            this.log(".openPopup");
            this.resetJsonp();

            if (evt.target.nodeName === "A") {
                return;
            }

            var videoUrl = "",
                vs = win.getBox();

            if (this.playerResponsivePercentage < 10) {
                this.playerResponsivePercentage = 10;
            } else if (this.playerResponsivePercentage > 100) {
                this.playerResponsivePercentage = 100;
            }

            if (this.playerResponsive) {
                var percentage = this.playerResponsivePercentage / 100,
                    windowWidth = Math.round(percentage * vs.w),
                    playerHeight = Math.round(windowWidth / this._aspectRatio),
                    windowHeight = Math.round(percentage * vs.h);

                if (playerHeight > windowHeight) {
                    this.playerHeight = windowHeight;
                    this.playerWidth = Math.round(windowHeight * this._aspectRatio);
                } else {
                    this.playerHeight = playerHeight;
                    this.playerWidth = Math.round(playerHeight * this._aspectRatio);
                }
            }

            this.bgNode = domConstruct.create("div", { "class" : "popupVideoPlayer-bg" });
            this.containerNode = domConstruct.create("div", { "class" : "popupVideoPlayer-container"});
            this.iframeNode = domConstruct.create("iframe", {
                 "class" : "popupVideoPlayer-iframe",
                 width : this.playerWidth,
                 height : this.playerHeight,
                 frameBorder: "0",
                 webkitAllowFullscreen : true,
                 allowFullscreen : true,
                 mozAllowFullscreen : true
            });

            // We set the protocol to https by default
            var protocol = "https:";
            if (this.source === "youtube") {
                videoUrl = protocol + "//www.youtube.com/embed/" + this.videoId;
            } else if (this.source === "vimeo") {
                videoUrl = protocol + "//player.vimeo.com/video/" + this.videoId;
            }

            if (this.autoPlay) {
                videoUrl += "?autoplay=1";
            }

            this.iframeNode.src = videoUrl;

            this.centerPopup(this.containerNode);
            this.connect(this.bgNode, "click", lang.hitch(this, this.removePopup));

            domConstruct.place(this.iframeNode, this.containerNode);
            domConstruct.place(this.bgNode, document.body);
            domConstruct.place(this.containerNode, document.body);

            this.executeMf();
        },

        showButton : function (data) {
            this.log(".showButton");
            this.resetClickHandler();

            this._aspectRatio = data.width / data.height;

            html.set(this.titleNode, data.title);
            html.set(this.authorNode, data.author_name);
            this.authorNode.href = data.author_url;
            this.thumbnailNode.src = data.thumbnail_url;

            if (data.author_name !== "") {
                domStyle.set(this.byNode, "display", "block");
            }

            domStyle.set(this.buttonNode, "display", "block");
            domStyle.set(this.errorNode, "display", "none");
            this.buttonClickHandler = this.connect(this.buttonNode, "click", lang.hitch(this, this.openPopup));
        },

        executeMf : function () {
            this.log(".executeMf");
            if (this.mf && this.objectId !== null) {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.mf,
                        guids: [this.objectId]
                    },
                    callback: function () {},
                    error: function (error) {
                        console.warn("Error executing mf: ", error);
                    }
                });
            }
        },

        centerPopup : function (node) {
            this.log(".centerPopup");
            domStyle.set(node, {
                top : (window.innerHeight-this.playerHeight) / 2 + "px",
                left : (window.innerWidth-this.playerWidth) / 2 + "px"
            });
        },

        resetJsonp : function (err) {
            this.log(".resetJsonp");
            if (err) {
                console.error(this.id + ".resetJsonp error:", err);
            }
            if (this.jsonpcb) {
                delete this.jsonpcb;
            }
        },

        showError: function () {
            domStyle.set(this.buttonNode, "display", "none");
            domStyle.set(this.errorNode, "display", "block");
        },

        removePopup : function () {
            this.log(".removePopup");
            domConstruct.destroy(this.iframeNode);
            domConstruct.destroy(this.bgNode);
            domConstruct.destroy(this.containerNode);
        },

        resetClickHandler : function () {
            this.log(".resetClickHandler");
            if (this.buttonClickHandler) {
                this.disconnect(this.buttonClickHandler);
                this.buttonClickHandler = null;
            }
        },

        uninitialize : function () {
            this.log(".uninitialize");
            this.resetJsonp();
            this.removePopup();
            this.resetClickHandler();
        }

    });
});

require(["PopupVideoPlayer/widget/PopupVideoPlayer"]);
