"use strict";

/**
 * Tab button is used to navigate trough tabs.
 *
 * @class TabButton
 * @extends {Element}
 * @param {Element} parent
 * @param {TabElement} tab
 */
function TabButton(parent, tab)
{
	Element.call(this, parent, "div");

	var self = this;

	this.element.draggable = true;
	this.element.style.cursor = "pointer";
	this.element.style.boxSizing = "border-box";
	this.element.style.backgroundColor = Editor.theme.buttonColor;

	/**
	 * Pointer to the tab element related with this button.
	 *
	 * @property tab
	 * @type {TabElement}
	 */
	this.tab = tab;

	//Icon
	this.icon = document.createElement("img");
	this.icon.style.pointerEvents = "none";
	this.icon.style.position = "absolute";
	this.icon.src = tab.icon;
	this.element.appendChild(this.icon);

	//Text
	this.text = document.createElement("div");
	this.text.style.position = "absolute";
	this.text.style.overflow = "hidden";
	this.text.style.textAlign = "center";
	this.text.style.pointerEvents = "none";
	this.text.style.textOverflow = "ellipsis";
	this.text.style.whiteSpace = "nowrap";
	this.text.style.color = Editor.theme.textColor;
	this.element.appendChild(this.text);

	//Title
	this.title = document.createTextNode(tab.title);
	this.text.appendChild(this.title);

	//Close button
	this.close = document.createElement("img");
	this.close.draggable = false;
	this.close.style.position = "absolute";
	this.close.style.opacity = 0.5;
	this.close.style.display = (tab.closeable) ? "block" : "none";
	this.close.src = Global.FILE_PATH + "icons/misc/close.png";
	this.element.appendChild(this.close);

	this.close.onmouseenter = function()
	{
		this.style.opacity = 1.0;
	};

	this.close.onmouseleave = function()
	{
		this.style.opacity = 0.5;
	};

	this.close.onclick = function()
	{
		self.tab.close();
	};


	//Drag state
	var dragState = TabButton.NONE;

	//Drag control
	this.element.ondragstart = function(event)
	{
		event.dataTransfer.setData("tab", self.tab.index);
		dragState = TabButton.NONE;
	};

	//Drag drop
	this.element.ondrop = function(event)
	{
		event.preventDefault();
		this.style.borderLeft = null;
		this.style.borderRight = null;
		this.style.borderBottom = null;
		this.style.borderTop = null;

		var index = event.dataTransfer.getData("tab");
		if(index !== "")
		{
			index = parseInt(index);

			if(index !== self.tab.index)
			{	
				//Before
				if(dragState === TabButton.PREVIOUS)
				{
					self.tab.container.moveTabIndex(index, index < self.tab.index ? self.tab.index - 1 : self.tab.index);
				}
				//After
				else if(dragState === TabButton.NEXT)
				{
					self.tab.container.moveTabIndex(index, index < self.tab.index ? self.tab.index : self.tab.index + 1);
				}
			}
		}
	};

	//Drag over
	this.element.ondragover = function(event)
	{
		if(self.tab.container.placement === TabGroup.TOP || self.tab.container.placement === TabGroup.BOTTOM)
		{
			if(event.layerX > self.size.x * 0.8 || event.target !== this)
			{
				if(dragState !== TabButton.NEXT)
				{
					dragState = TabButton.NEXT;
					this.style.borderLeft = null;
					this.style.borderRight = "thick solid #999999";
				}
			}
			else if(event.layerX < self.size.x * 0.2)
			{
				if(dragState !== TabButton.PREVIOUS)
				{
					dragState = TabButton.PREVIOUS;
					this.style.borderRight = null;
					this.style.borderLeft = "thick solid #999999";
				}
			}
			else
			{
				if(dragState !== TabButton.NONE	)
				{
					dragState = TabButton.NONE;
					this.style.borderLeft = null;
					this.style.borderRight = null;
				}
			}
		}
		else
		{
			if(event.layerY > self.size.y * 0.7 || event.target !== this)
			{
				if(dragState !== TabButton.NEXT)
				{
					dragState = TabButton.NEXT;
					this.style.borderTop = null;
					this.style.borderBottom = "solid #999999";
				}
			}
			else if(event.layerY < self.size.y * 0.3)
			{
				if(dragState !== TabButton.PREVIOUS)
				{
					dragState = TabButton.PREVIOUS;
					this.style.borderBottom = null;
					this.style.borderTop = "solid #999999";
				}
			}
			else
			{
				if(dragState !== TabButton.NONE	)
				{
					dragState = TabButton.NONE;
					this.style.borderBottom = null;
					this.style.borderTop = null;
				}
			}
		}
	};

	//Drag end
	this.element.ondragend = function(event)
	{
		event.preventDefault();
		
		dragState = TabButton.NONE;
		this.style.borderLeft = null;
		this.style.borderRight = null;
		this.style.borderBottom = null;
		this.style.borderTop = null;
	};

	//Drag leave
	this.element.ondragleave = function(event)
	{
		event.preventDefault();
		
		dragState = TabButton.NONE;
		this.style.borderLeft = null;
		this.style.borderRight = null;
		this.style.borderBottom = null;
		this.style.borderTop = null;
	};

	this.element.onmousedown = function(event)
	{
		var button = event.which - 1;

		//Select tab
		if(button === Mouse.LEFT)
		{
			self.tab.container.selectTab(self.tab);
		}
		//Close tab
		else if(tab.closeable && button === Mouse.MIDDLE)
		{
			self.tab.container.removeTab(self.tab);
		}
	};

	this.element.onmouseenter = function()
	{
		this.style.backgroundColor = Editor.theme.buttonOverColor;
	};

	this.element.onmouseleave = function()
	{
		if(tab.isSelected())
		{
			this.style.backgroundColor = Editor.theme.buttonOverColor;
		}
		else
		{
			this.style.backgroundColor = Editor.theme.buttonColor;
		}
	};
}

TabButton.prototype = Object.create(Element.prototype);

TabButton.NONE = 0;
TabButton.PREVIOUS = 1;
TabButton.NEXT = 2;

/**
 * Set the tab icon image.
 *
 * @method setIcon
 * @param {string} icon URL of the icon image.
 */
TabButton.prototype.setIcon = function(icon)
{
	this.tab.icon = icon;
	this.icon.src = icon;
};

/**
 * Set text to be displayed in the button as its name.
 *
 * @method setName
 * @param {string} text
 */
TabButton.prototype.setName = function(text)
{
	this.tab.title = text;
	this.title.data = text;
};

//Update selected state of the button
TabButton.prototype.updateSelection = function()
{
	this.element.style.backgroundColor = this.tab.isSelected() ? Editor.theme.buttonOverColor : Editor.theme.buttonColor;
};

TabButton.prototype.updateSize = function()
{
	Element.prototype.updateSize.call(this);
	
	//Icon
	this.icon.style.top = (this.size.y * 0.2) + "px";
	this.icon.style.left = (this.size.y * 0.2) + "px"
	this.icon.style.width = (this.size.y * 0.6) + "px";
	this.icon.style.height = (this.size.y * 0.6) + "px";

	//Text
	this.text.style.left = this.size.y + "px";
	this.text.style.top = ((this.size.y - 12) / 2) + "px";
	this.text.style.width = (this.size.x - 2 * this.size.y) + "px";
	this.text.style.height = this.size.y + "px";

	//Close
	if(this.tab.closeable === true)
	{
		this.close.style.width = (this.size.y * 0.4) + "px";
		this.close.style.height = (this.size.y * 0.4) + "px";
		this.close.style.top = (this.size.y * 0.3) + "px";
		this.close.style.right = (this.size.y * 0.3) + "px";
		this.close.style.display = "block";
	}
	else
	{
		this.close.style.display = "none";
	}

	this.updateSelection();
};
