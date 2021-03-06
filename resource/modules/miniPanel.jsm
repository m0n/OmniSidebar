Modules.VERSION = '1.3.2';

this.__defineGetter__('panel', function() { return $(objName+'-panel'); });
this.__defineGetter__('panelToolbar', function() { return $(objName+'-panel-toolbarContainer'); });
this.__defineGetter__('panelMenu', function() { return $(objName+'-panel-menuContainer'); });
this.__defineGetter__('panelToolbarSeparator', function() { return $(objName+'-panel-toolbarSeparator'); });
this.__defineGetter__('panelMenuSeparator', function() { return $(objName+'-panel-menuSeparator'); });

this.__defineGetter__('panelView', function() { return $(objName+'-panelView'); });
this.__defineGetter__('panelViewHeader', function() { return $(objName+'-panelView-header'); });
this.__defineGetter__('panelViewToolbar', function() { return $(objName+'-panelView-toolbarContainer'); });
this.__defineGetter__('panelViewMenu', function() { return $(objName+'-panelView-menuContainer'); });
this.__defineGetter__('panelViewToolbarSeparator', function() { return $(objName+'-panelView-toolbarSeparator'); });
this.__defineGetter__('panelViewMenuSeparator', function() { return $(objName+'-panelView-menuSeparator'); });

this.__defineGetter__('PanelUI', function() { return window.PanelUI; });

this.panelOpenedPanelUI = false;

// Only open the panel if we're doing a right-click or a ctrl+click
this.shouldFollowCommand = function(trigger, twin, e) {
	var metaKey = e && (e.ctrlKey || e.metaKey);
	var panelViewIsOpen = trueAttribute(panelView, 'current') && PanelUI.panel.state == 'open' && panelView._bar.twin == twin;
	
	if(!e || e.button == 2 || (e.button == 0 && metaKey) || panelViewIsOpen) {
		var bar = (twin) ? twinSidebar : mainSidebar;
		if(e) {
			e.preventDefault();
			e.stopPropagation();
		} else {
			trigger = bar.button;
		}
		
		// if the trigger is our button and it's placed in the PanelUI, open its subview panel instead
		var placement = CustomizableUI.getPlacementOfWidget(bar.buttonId);
		if(placement && placement.area == 'PanelUI-contents' && (!trigger || trigger == bar.button)) {
			// I can't get to it before it opens, so I can only close it afterwards
			if(!WINNT) {
				var panelContext = $('customizationPanelItemContextMenu');
				if(panelContext.state != 'closed') {
					panelContext.hidePopup();
				}
			}
			
			if(!trueAttribute(panelView, 'current') || panelView._bar != bar || PanelUI.panel.state == 'closed') {
				panelView._bar = bar;
				setAttribute(panelViewHeader, 'value', bar.label);
				
				// we kind'a need it open for this...
				panelOpenedPanelUI = false;
				if(PanelUI.panel.state == 'closed') {
					PanelUI.toggle();
					Listeners.add(PanelUI.panel, 'popupshown', function() {
						PanelUI.multiView.showSubView(panelView.id, trigger);
					}, true, true);
					panelOpenedPanelUI = true;
				}
				else {
					PanelUI.multiView.showSubView(panelView.id, trigger);
				}
			} else {
				PanelUI.multiView.showMainView();
			}
			return false;
		}
		
		if(panel.state == 'closed' || panel._bar != bar) {
			var position = 'bottomcenter topright';
			if(!trigger) {
				trigger = $('navigator-toolbox');
				var side = (bar == leftSidebar) ? 'left' : 'right';
				position = 'bottom'+side+' top'+side;
				
				// it would conserve the last position attr's always with this kind of anchor
				removeAttribute(panel, 'position');
				removeAttribute(panel, 'flip');
				removeAttribute(panel, 'side');
			} else if(trigger == bar.switcher) {
				position = 'after_pointer';
			}
			openPanel(trigger, bar, e, position);
		} else {
			hidePanel();
		}
		return false;
	}
	return true;
};

this.openPanel = function(trigger, bar, e, position) {
	panel._bar = bar;
	var anchor = null;
	var x = 0;
	var y = 0;
	
	if(position == 'after_pointer') {
		x = e.clientX +1;
		y = e.clientY +1;
	} else if(trigger) {
		anchor = document.getAnonymousElementByAttribute(trigger, "class", "toolbarbutton-icon") || trigger;
	}
	
	panel.openPopup(anchor, position, x, y, false, false, e);
};

this.hidePanel = function() {
	if(panel && panel.state == 'open') { panel.hidePopup(); }
};

this.populatePanel = function(miniPanel) {
	var bar = miniPanel._bar;
	if(miniPanel == panelView) {
		var toolbar = panelViewToolbar
		var menu = panelViewMenu;
		var toolbarSeparator = panelViewToolbarSeparator;
		var menuSeparator = panelViewMenuSeparator;
	} else {
		var toolbar = panelToolbar;
		var menu = panelMenu;
		var toolbarSeparator = panelToolbarSeparator;
		var menuSeparator = panelMenuSeparator;
	}
	
	if(bar.twin) {
		twinTriggers.panel = miniPanel;
	}
	
	if(!bar.toolbar.collapsed && typeof('toolbarHasButtons') != 'undefined' && toolbarHasButtons(bar.toolbar)) {
		// Don't let the sidebar header jump around with this change
		bar.stack.style.height = bar.stack.clientHeight+'px';
		bar.stack.style.width = bar.stack.clientWidth+'px';
		
		if(WINNT && Services.navigator.oscpu.contains('6.')) {
			var color = getComputedStyle(miniPanel).backgroundColor;
			var padding = (Services.navigator.oscpu.contains('6.2')) ? 3 : 5;
			bar.toolbar.style.backgroundColor = color;
			bar.toolbar.style.paddingBottom = padding+'px';
			toolbarSeparator.style.marginTop = '-'+(padding -1)+'px';
		}
		else if(LINUX) {
			var padding = 3;
			toolbarSeparator.style.marginTop = '-'+(padding)+'px';
		}
		toolbar._originalParent = bar.toolbar.parentNode;
		toolbar.appendChild(bar.toolbar);
		toolbarSeparator.hidden = false;
	} else {
		toolbarSeparator.hidden = true;
	}
	
	if(bar.titleButton) {
		populateSidebarMenu(menu, true);
		menuSeparator.hidden = false;
	} else {
		menuSeparator.hidden = true;
	}
};

this.emptyPanel = function(miniPanel) {
	var bar = miniPanel._bar;
	if(miniPanel == panelView) {
		var toolbar = panelViewToolbar
		var menu = panelViewMenu;
		var toolbarSeparator = panelViewToolbarSeparator;
		var menuSeparator = panelViewMenuSeparator;
	} else {
		var toolbar = panelToolbar;
		var menu = panelMenu;
		var toolbarSeparator = panelToolbarSeparator;
		var menuSeparator = panelMenuSeparator;
	}
	
	delete twinTriggers.panel;
	
	if(toolbar._originalParent) {
		bar.stack.style.height = '';
		bar.stack.style.width = '';
		
		if(WINNT && Services.navigator.oscpu.contains('6.')) {
			bar.toolbar.style.backgroundColor = '';
			bar.toolbar.style.paddingBottom = '';
			toolbarSeparator.style.marginTop = '';
		}
		else if(LINUX) {
			toolbarSeparator.style.marginTop = '';
		}
		toolbar._originalParent.appendChild(bar.toolbar);
		toolbar._originalParent = null;
	}
	
	while(menu.firstChild) {
		menu.firstChild.remove();
	}
	
	menuSeparator.hidden = true;
	toolbarSeparator.hidden = true;
};

// Linux still opens the context menu when it should open only our panel
this.panelDontOpenContext = function(e) {
	if(!customizing && e.explicitOriginalTarget
	&& (e.explicitOriginalTarget == mainSidebar.button || e.explicitOriginalTarget == twinSidebar.button)) {
		e.preventDefault();
		e.stopPropagation();
	}
};

this.panelViewShowing = function(e) {
	if(e.target == panelView) {
		populatePanel(panelView);
	}
};

this.panelViewHiding = function(e) {
	if(e.target == panelView) {
		emptyPanel(panelView);
		
		if(panelOpenedPanelUI) {
			panelOpenedPanelUI = false;
			if(PanelUI.panel.state == 'open') {
				PanelUI.toggle();
			}
		}
	}
};

this.panelViewToolbarScrolling = function(e) {
	// there's a madening bug where, if you scroll while it's still scrolling, the box will just scroll back to the start,
	// so I'm just preventing all extra scrolling while it's still scrolling
	if(e.detail > 0 && panelViewToolbar._scrollTarget) {
		e.preventDefault();
		e.stopPropagation();
	}
};

this.panelOwner = function(e) {
	if(isAncestor(panel.anchorNode, panel._bar.button)) {
		e.detail = panel._bar.buttonId;
		e.stopPropagation();
	}
};

this.loadMiniPanel = function() {
	panel.__defineGetter__('_toggleKeyset', function() { return (this._bar && this._bar.keysetPanel && this._bar.keyset.keycode != 'none') ? this._bar.keyset : null; });
	panelView.__defineGetter__('_toggleKeyset', function() { return (this._bar && this._bar.keysetPanel && this._bar.keyset.keycode != 'none') ? this._bar.keyset : null; });
	keydownPanel.setupPanel(panel);
	keydownPanel.setupPanel(panelView);
	barSwitchTriggers.__defineGetter__('miniPanel', function() { return panel; });
	barSwitchTriggers.__defineGetter__('miniPanelView', function() { return panelView; });
	
	// for compatibility with all the add-ons that use my backbone
	Listeners.add(panel, 'AskingForNodeOwner', panelOwner);
	
	Listeners.add(panelView, 'ViewShowing', panelViewShowing);
	Listeners.add(panelView, 'ViewHiding', panelViewHiding);
	Listeners.add(panelViewToolbar, 'DOMMouseScroll', panelViewToolbarScrolling, true);
};

this.unloadMiniPanel = function() {
	Listeners.remove(panelViewToolbar, 'DOMMouseScroll', panelViewToolbarScrolling, true);
	Listeners.remove(panelView, 'ViewShowing', panelViewShowing);
	Listeners.remove(panelView, 'ViewHiding', panelViewHiding);
	Listeners.remove(panel, 'AskingForNodeOwner', panelOwner);
	
	delete barSwitchTriggers.miniPanel;
	delete barSwitchTriggers.miniPanelView;
	keydownPanel.unsetPanel(panel);
	keydownPanel.unsetPanel(panelView);
	delete panel._toggleKeyset;
	delete panelView._toggleKeyset;
};

Modules.LOADMODULE = function() {
	Listeners.add(contextMenu, 'popupshowing', panelDontOpenContext, true);
	Overlays.overlayWindow(window, "miniPanel", null, loadMiniPanel, unloadMiniPanel);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, "miniPanel");
	Listeners.remove(contextMenu, 'popupshowing', panelDontOpenContext, true);
};
