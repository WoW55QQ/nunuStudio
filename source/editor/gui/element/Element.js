"use strict";

/**
 * Element is the base object for all GUI elements.
 * 
 * All GUI elements are based on the Element class, components can be inserted into other componens or into DOM elements.
 * 
 * @class Element
 * @param {Element} parent Parent element.
 * @param {string} type Type of the based DOM element.
 */
function Element(parent, type)
{
	/** 
	 * Base DOM element for this component.
	 *
	 * Different components may use diferent base element types.
	 * 
	 * @attribute element
	 * @type {Element}
	 */
	this.element = document.createElement(type !== undefined ? type : "div");
	this.element.style.position = "absolute";
	this.element.style.overflow = "hidden";

	/** 
	 * The parent element that contains this Element.
	 *
	 * Can be a DOM element or another Element.
	 * 
	 * @attribute parent
	 * @type {Element}
	 */
	this.parent = null;
	if(parent !== undefined)
	{
		this.attachTo(parent);
	}
	
	/** 
	 * True if the element is visible.
	 *
	 * @attribute visible
	 * @type {boolean}
	 */
	this.visible = true;
	
	/**
	 * Size of this component in px.
	 *
	 * @attribute size
	 * @type {THREE.Vector2}
	 */
	this.size = new THREE.Vector2(0, 0);
	
	/**
	 * Position of this component relatively to its parent in px.
	 *
	 * @attribute position
	 * @type {THREE.Vector2}
	 */
	this.position = new THREE.Vector2(0, 0);

	/**
	 * Positioning mode, indicates how to anchor the component.
	 *
	 * @attribute mode
	 * @type {number}
	 */
	this._mode = Element.TOP_LEFT;
}

Element.prototype.constructor = Element;

Element.prototype.isElement = true;

/**
 * Top-left positioning.
 *
 * @static
 * @attribute TOP_LEFT
 * @type {number}
 */
Element.TOP_LEFT = 0;

/**
 * Top-right positioning.
 *
 * @static
 * @attribute TOP_RIGHT
 * @type {number}
 */
Element.TOP_RIGHT = 1;

/**
 * Bottom-left positioning.
 *
 * @static
 * @attribute BOTTOM_LEFT
 * @type {number}
 */
Element.BOTTOM_LEFT = 2;

/**
 * Bottom-right positioning.
 *
 * @static
 * @attribute BOTTOM_RIGHT
 * @type {number}
 */
Element.BOTTOM_RIGHT = 3;


Element.preventDefault = function(event)
{
	event.preventDefault();
};

/** 
 * Add a CSS class to the base DOM element of this Element.
 * 
 * @method addClass
 * @param {string} name Name of the class to be added.
 */
Element.prototype.addClass = function(name)
{
	this.element.classList.add(name);
};

/** 
 * Remove a CSS class from the base DOM element of this Element.
 * 
 * @method removeClass
 * @param {string} name Name of the class to be removed.
 */
Element.prototype.removeClass = function(name)
{
	if(this.element.classList.contains(name))
	{
		this.element.classList.remove(name);
	}
};

/**
 * Change style of the base DOM element.
 *
 * @method setStyle
 * @param {string} attribute Name of the style attribute.
 * @param {string} value Value of the style.
 */
Element.prototype.setStyle = function(attribute, value)
{
	this.element.style[attribute] = value;
};

/**
 * Add and drag and drop default event prevention to this component.
 *
 * Usefull to avoid unwanted actions on draggable components. 
 *
 * @method preventDragEvents
 */
Element.prototype.preventDragEvents = function()
{
	this.element.ondrop = Element.preventDefault;
	this.element.ondragover = Element.preventDefault;
};

/**
 * Set alt text, that is displayed when the mouse is over the element. Returns the element created that is attached to the document body.
 *
 * @method setAltText
 * @param {string} altText Alt text.
 */
Element.prototype.setAltText = function(altText)
{
	var element = document.createElement("div");
	element.style.position = "absolute";
	element.style.display = "none";
	element.style.alignItems = "center";
	element.style.zIndex = "10000";
	element.style.border = "3px solid";
	element.style.borderRadius = "5px";
	element.style.color = Editor.theme.textColor;
	element.style.backgroundColor = Editor.theme.barColor;
	element.style.borderColor = Editor.theme.barColor;
	element.style.height = "fit-content";
	document.body.appendChild(element);

	//Text
	var text = document.createTextNode(altText);
	element.appendChild(text);

	//Destroy
	var destroyFunction = this.destroy;
	this.destroy = function()
	{	
		destroyFunction.call(this);

		if(document.body.contains(element))
		{
			document.body.removeChild(element);
		}
	};
	
	this.element.style.pointerEvents = "auto"; 

	//Mouse mouse move event
	this.element.onmousemove = function(event)
	{
		element.style.display = "flex";
		element.style.left = (event.clientX + 8) + "px";
		element.style.top = (event.clientY - 20) + "px";
	};

	//Mouse out event
	this.element.onmouseout = function()
	{
		element.style.display = "none";
	};

	return element;
};

/**
 * Set method to be called on component click.
 * 
 * @method setOnClick
 * @param {Function} callback Function called when the component is clicked.
 */
Element.prototype.setOnClick = function(callback)
{
	this.element.onclick = callback;
};

/**
 * Remove all DOM children from the element.
 * 
 * @method removeAllChildren
 */
Element.prototype.removeAllChildren = function()
{
	while(this.element.firstChild)
	{
		this.element.removeChild(this.element.firstChild);
	}
};

/**
 * Attach this component to a new parent component.
 * 
 * Destroys the object and reataches the base DOM element to the new parent element.
 * 
 * @method attachTo
 * @param {Container} parent Parent container.
 */
Element.prototype.attachTo = function(parent)
{
	if(this.parent === parent || parent === undefined)
	{
		return;
	}

	if(this.parent !== null)
	{
		Element.prototype.destroy.call(this);
	}

	this.parent = parent;

	if(parent.isElement === true)
	{
		parent.element.appendChild(this.element);
	}
	else
	{
		console.warn("nunuStudio: Parent is not a Element." , this);
		this.parent.appendChild(this.element);
	}
};

/**
 * Called to destroy a component.
 *
 * Destroy the element and removes it from its DOM parent.
 * 
 * @method destroy
 */
Element.prototype.destroy = function()
{
	if(this.parent !== null)
	{
		if(this.parent.isElement === true)
		{
			if(this.parent.element.contains(this.element))
			{
				this.parent.element.removeChild(this.element);
				this.parent = null;
			}
		}
		else
		{
			console.warn("nunuStudio: Parent is not a Element.", this);
			if(this.parent.contains(this.element))
			{
				this.parent.removeChild(this.element);
				this.parent = null;
			}
		}
	}
};

/**
 * Set positioning mode.
 * 
 * @method setMode
 * @param {number} setMode
 */
Element.prototype.setMode = function(mode)
{
	this._mode = mode;
	this.element.style.bottom = null;
	this.element.style.top = null;
	this.element.style.right = null;
	this.element.style.left = null;
};

/**
 * Set the multiple styles to the DOM element.
 *
 * Style are described in a object that uses the same attribute names as the normal DOM access.
 *
 * Here is an exaple of a style object:
 * {
 * backgroundColor: "#FF0000",
 * color: "#FFFFFF"
 * }
 *
 * @method setStyleList
 * @param {Object} styleList Object describing the style to be applied to the object.
 */
Element.prototype.setStyleList = function(styleList)
{
	for(var i in styleList)
	{
		this.element.style[i] = styleList[i];
	}
};

/**
 * Calculate the position of the container to make it centered.
 *
 * Calculated relatively to its parent size.
 * 
 * @method center
 */
Element.prototype.center = function()
{
	this.position.set((this.parent.size.x - this.size.x) / 2, (this.parent.size.y - this.size.y) / 2);
};

/**
 * Update visibility of this element.
 *
 * @method setVisibility
 */
Element.prototype.setVisibility = function(visible)
{
	this.visible = visible;
	this.updateVisibility();
};

/**
 * Update the visibility of this element.
 *
 * @method updateVisibility
 */
Element.prototype.updateVisibility = function()
{
	this.element.style.display = this.visible ? "block" : "none";
};

/**
 * Update the position of this element.
 * 
 * @method updatePosition
 */
Element.prototype.updatePosition = function(mode)
{
	if(mode !== undefined)
	{
		this._mode = mode;
	}

	if(this._mode === Element.TOP_LEFT || this._mode === Element.TOP_RIGHT)
	{
		this.element.style.top = this.position.y + "px";
	}
	else
	{
		this.element.style.bottom = this.position.y + "px";
	}

	if(this._mode === Element.TOP_LEFT || this._mode === Element.BOTTOM_LEFT)
	{
		this.element.style.left = this.position.x + "px";
	}
	else
	{
		this.element.style.right = this.position.x + "px";
	}
};

/**
 * Update the size of this element.
 * 
 * @method updateSize
 */
Element.prototype.updateSize = function()
{
	this.element.style.width = this.size.x + "px";
	this.element.style.height = this.size.y + "px";
};

/**
 * Update component appearance.
 * 
 * Should be called after changing size or position.
 *
 * Uses the updateVisibility and if the element is visible calls the updateSize and updatePosition (in this order) methods to update the interface.
 * 
 * @method update
 */
Element.prototype.updateInterface = function()
{
	this.updateVisibility();

	if(this.visible)
	{
		this.updateSize();
		this.updatePosition();
	}
};
