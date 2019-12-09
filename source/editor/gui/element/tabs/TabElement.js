"use strict";

/**
 * Tab element is used to create tabbed elements.
 *
 * These are used to implement the main components of the interface (editors, menus, etc).
 *
 * @class TabElement
 * @extends {Element}
 * @param {Element} parent Parent element.
 * @param {boolean} closeable If false the tab cannot be closed.
 * @param {TabContainer} container Container for this tab.
 * @param {number} index Index of the tab.
 * @param {string} title Title of the tab.
 * @param {string} icon Icon of the tab.
 */
function TabElement(parent, closeable, container, index, title, icon)
{
	Element.call(this, parent, "div");

	var self = this;

	this.element.style.overflow = "visible";
	this.element.style.backgroundColor = Editor.theme.panelColor;
	this.preventDragEvents();

	/**
	 * Pointer to the group where this tab is.
	 *
	 * @property container
	 * @type {TabGroup}
	 */
	this.container = container;

	/**
	 * UUID of this tab.
	 *
	 * @property uuid
	 * @type {string}
	 */
	this.uuid = THREE.Math.generateUUID();

	/**
	 * Index of the tab inside of the container
	 *
	 * @property index
	 * @type {number}
	 */
	this.index = index;

	/**
	 * Pointer to the button associated with this tab.
	 *
	 * @property container
	 * @type {TabButton}
	 */
	this.button = null;

	//Meta
	this.closeable = closeable;
	this.title = title;
	this.icon = icon;

	/**
	 * Indicates if the tab is currently active (on display).
	 *
	 * @property active
	 * @type {boolean}
	 */
	this.active = false;
}

TabElement.prototype = Object.create(Element.prototype);

/**
 * Update tab metadata (name, icon, ...)
 * 
 * Called after applying changes to object.
 * 
 * Called for every tab.
 *
 * @method updateMetadata
 */
TabElement.prototype.updateMetadata = function(){};

/**
 * Update tab settings.
 * 
 * Called after settings of the editor are changed.
 * 
 * Called for every tab.
 *
 * @method updateSettings
 */
TabElement.prototype.updateSettings = function(){};

/**
 * Update tab values of the gui for the object attached.
 * 
 * Called when properties of objects are changed.
 * 
 * Called only for active tabs.
 *
 * @method updateValues
 */
TabElement.prototype.updateValues = function(){};

/**
 * Update tab object view.
 * 
 * Called when objects are added, removed, etc.
 * 
 * Called only for active tabs.
 *
 * @method updateObjectsView
 */
TabElement.prototype.updateObjectsView = function(){};

/**
 * Update tab after object selection changed.
 * 
 * Called after a new object was selected.
 * 
 * Called only for active tabs.
 *
 * @method updateSelection
 */
TabElement.prototype.updateSelection = function(){};

/**
 * Activate tab.
 * 
 * Called when a tab becomes active (visible).
 *
 * @method activate
 */
TabElement.prototype.activate = function()
{
	if(this.active === true)
	{
		this.deactivate();
	}
	
	//TODO <IF TAB NEEDS UPDATE IT SHOULD TAKE CARE OF IT>
	if(this.update !== undefined)
	{
		var self = this;

		var update = function()
		{
			self.update();

			if(self.active === true)
			{
				requestAnimationFrame(update);
			}
		};

		requestAnimationFrame(update);
	}

	this.active = true;
};

/**
 * Deactivate tab.
 * 
 * Called when a tab is deactivated or closed.
 *
 * @method deactivate
 */
TabElement.prototype.deactivate = function()
{
	this.active = false;
};

/**
 * Generic method to attach object to a tab.
 *
 * Attached object can be edited using the tab.
 *
 * @method attach
 * @param {Object} object
 */
TabElement.prototype.attach = function(object){};

/**
 * Check if an object or resource is attached to the tab.
 * 
 * Called to check if a tab needs to be closed after changes to objects.
 *
 * @method isAttached
 */
TabElement.prototype.isAttached = function(object)
{
	return false;
};

/**
 * Close the tab element and remove is from the container.
 * 
 * @method close
 */
TabElement.prototype.close = function()
{
	this.container.removeTab(this);
};

/**
 * Select this tab.
 * 
 * @method select
 */
TabElement.prototype.select = function()
{
	this.container.selectTab(this);
};

/**
 * Check if tab is selected
 *
 * @method isSelected
 * @return {boolean} True if the tab is selected in the container.
 */
TabElement.prototype.isSelected = function()
{
	return this === this.container.selected;
};

/**
 * Set icon of the button attached to this tab.
 *
 * The button should have a .setIcon(url) method.
 *
 * @method setIcon
 * @param {string} icon URL of the icon.
 */
TabElement.prototype.setIcon = function(icon)
{
	this.icon = icon;
	this.button.setIcon(icon);
};

/**
 * Set text in the button.
 *
 * The button should have a .setName(text) method.
 *
 * @method setName
 * @param {string} text
 */
TabElement.prototype.setName = function(text)
{
	this.title = text;
	this.button.setName(text);
};

TabElement.prototype.destroy = function()
{
	Element.prototype.destroy.call(this);
	
	if(this.button !== null)
	{
		this.button.destroy();
	}
};
