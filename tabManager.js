/// <reference path="jquery-1.4.1-vsdoc.js" />
var tabInfo = function (url, title, catalog, noClose) {
	this.url = url;
	this.title = title;
	this.noClose = noClose;
	this.catalog = catalog;
	this.tab = null;
	this.frm = null;
};

tabInfo.prototype = {
	maxTextLength: 8,
	hasRemoved: false,
	_onRemoved: null,
	_onShowing: null,
	create: function (tabContainer, frmContainer) {
		var me = this;
		this.tab = $("<a></a>").click(function () {
			me.show();
		}).appendTo(tabContainer);
		this.frm = $("<iframe></iframe>").attr("frameborder", "0").appendTo(frmContainer).load(function () {
			if (me.tab) me.frmLoaded();
		});
		$("<span class='loading'></span>").hide().appendTo(this.tab);
		$("<span class='txt'></span>").text(this.fmtText()).attr("title", this.title || "").appendTo(this.tab);

		if (!this.noClose) {
			$("<b></b>").hover(function () {
				$(this).addClass("on");
			}, function () {
				$(this).removeClass("on");
			}).click(function (evt) {//删除tab
				evt.stopPropagation();
				me.remove();
			}).appendTo(me.tab);
		}
	},
	onRemoved: function (fn) {
		$(this).bind("removed", fn);
	},
	onShowing: function (fn) {
		$(this).bind("showing", fn);
	},
	frmLoaded: function () {
		this.tab.find("span.loading").fadeOut();
	},
	frmLoading: function () {
		this.tab.find("span.loading").fadeIn();
	},
	show: function () {
		if (this._onShowing) {
			this._onShowing.call(null, this);
		}
		$(this).triggerHandler("showing");
		this.tab.addClass("act");
		if (!this.frm.attr("src")) {
			this.frmLoading();
			this.frm.attr("src", this.url);
		}
		this.frm.height(this.frm.parent().parent().height() - 26).show();
	},
	hide: function () {
		this.tab.removeClass("act");
		this.frm.hide();
	},
	remove: function () {
		this.tab.remove();
		this.frm.remove();
		this.hasRemoved = true;
		if (this._onRemoved) {
			this._onRemoved(this);
		}
		$(this).triggerHandler("removed");
		$(this).unbind("removed,showing");
	},
	refresh: function () {
		this.frmLoading();
		this.frm.attr("src", this.url);
	},
	fmtText: function () {
		var reg = new RegExp("^(.{" + (this.maxTextLength - 1) + "})(.*)$");
		return (this.title || "").replace(reg, "$1...");
	},
	setTitle: function (title) {
		this.title = title;
		this.tab.find("span.txt").text(this.fmtText()).attr("title", this.title || "");
	},
	setUrl: function (url) {
		this.url = url;
		this.refresh();
	},
	update: function (url, title) {
		this.setTitle(title);
		this.setUrl(url);
	},
	isCurrent: function () {
		return this.tab.hasClass("act");
	},
	findWindow: function () {
		var f = this.frm[0];
		return f.contentDocument && f.contentDocument.parentWindow ? f.contentDocument.parentWindow : f.contentWindow;
	}
};

var tabManager = function (tabContainer, frmContainer) {
	this.tabContainer = tabContainer;
	this.frmContainer = frmContainer;
	this.maxTab = 4;
	this.current = -1;
	this.tabs = [];
};

tabManager.prototype = {
	index: function (fnTest) {
		for (var i = 0; i < this.tabs.length; i++) {
			if (fnTest(this.tabs[i], i)) {
				return i;
			}
		}
		return -1;
	},
	indexOf: function (tab) {
		return this.index(function (t) { return t == tab; });
	},
	find: function (fnTest) {
		var i = this.index(fnTest);
		return i == -1 ? null : this.tabs[i];
	},
	findByCatalog: function (catalog) {
		return this.find(function (t, i) { return t.catalog == catalog; });
	},
	findFirstClosable: function () {
		return this.find(function (t, i) { return !t.noClose; });
	},
	getCurrentTab: function () {
		return this.find(function (t, i) { return t.isCurrent(); });
	},
	add: function (url, title, catalog, noClose) {
		var me = this;
		if (me.current >= 0) {
			me.tabs[me.current].hide();
		}
		catalog = catalog || title;
		var tab = me.findByCatalog(catalog);
		if (!tab) {
			tab = new tabInfo(url, title, catalog, noClose);
			tab.create(me.tabContainer, me.frmContainer);
			tab._onRemoved = function (tab) { me.tabRemoved(tab); };
			tab._onShowing = function (tab) { me.tabChanged(tab); };
			me.tabs.push(tab);
			if (me.tabs.length > me.maxTab) {
				var t = me.findFirstClosable();
				if (t) t.remove();
			}
		} else if (me.current == me.indexOf(tab) || tab.url != url) {
			tab.update(url, title);
		}
		tab.show();
		return tab;
	},
	tabRemoved: function (tab) {
		var idx = this.indexOf(tab);
		if (idx != -1) {
			this.remove(idx);
		}
	},
	tabChanged: function (tab) {
		var idx = this.indexOf(tab);
		if (idx != -1) {
			if (this.current >= 0) {
				this.tabs[this.current].hide();
			}
			this.current = idx;
		}
	},
	remove: function (i) {
		if (i >= 0 && i < this.tabs.length) {
			if (this.current == i) {
				if (i > 0) {
					this.tabs[i - 1].show();
				} else if (this.tabs.length > 1) {
					this.tabs[i + 1].show();
				}
			}
			if (i <= this.current) {
				this.current--;
			}
			this.tabs.splice(i, 1);
		}
	},
	clear: function () {
		for (var i = this.tabs.length - 1; i >= 0; i--) {
			this.tabs[i].remove();
		}
		this.current = -1;
	},
	removeByWindow: function (win, fnCallback) {
		var tab = this.find(function (t, i) { return t.findWindow() == win; });
		if (tab) {
			tab.remove();
			if (fnCallback) fnCallback(tab);
		}
	},
	pickArgs: function (arr, idx) {
		var r = [];
		for (var i = idx; i < arr.length; i++) {
			r.push(arr[i]);
		}
		return r;
	},
	tab_show: function (domNode, refWindow, catalog) {
		var href = $(domNode).attr("href");
		var title = $(domNode).attr("title") || $.trim($(domNode).text());
		if (refWindow && !href.match(/(^http)|(^\/)/)) {//路径转换
			var s = refWindow.location.href;
			s = s.substr(s.indexOf("/", s.lastIndexOf("://") + 3));
			s = s.replace(/\/{2,}/g, "/");
			s = s.substr(0, s.lastIndexOf("/") + 1);
			href = s + href;
		}
		if (!href.match(/showInTab=/i)) {
			if (!href.match(/\?/)) {
				href += "?showInTab=true";
			} else {
				href += "&showInTab=true";
			}
		}
		var me = this;
		var t = me.add(href, title, catalog);
		$(t).bind("refreshList", function (evt) {//tab关闭时刷新列表
			if (refWindow && refWindow.refreshDataGrid) {
				var arr = me.pickArgs(arguments, 1);
				refWindow.refreshDataGrid.apply(refWindow, arr);
			}
		});
		return false;
	},
	tab_remove: function (refWindow, refreshList) {
		var arr = this.pickArgs(arguments, 2);
		tabs.removeByWindow(refWindow, refreshList ? function (tab) {
			$(tab).triggerHandler("refreshList", arr);
		} : null);
	},
	refreshByWindow: function (win) {
		var arr = this.pickArgs(arguments, 1);
		var tab = this.find(function (t) { return t.findWindow() == win; });
		if (tab) {
			$(tab).triggerHandler("refreshList", arr);
		}
	}
};