"use strict";

/**
 * Code editor tab element based on the codemirror code editor library.
 *
 * @class CodeEditor
 * @extends TabElement
 */
function CodeEditor(parent, closeable, container, index)
{
	TabElement.call(this, parent, closeable, container, index, "Code", Global.FILE_PATH + "icons/misc/code.png");
	
	var self = this;

	/**
	 * Codemirror editor.
	 * 
	 * @property code
	 * @type {CodeMirror}
	 */
	this.code = new CodeMirror(this.element,
	{
		value: "",
		matchBrackets: true,
		hintOptions:
		{
			hint: CodeMirror.hint.anyword,
			completeSingle: false
		},
		gutters: ["CodeMirror-lint-markers"]
	});

	this.element.oncontextmenu = function(event)
	{
		var context = new ContextMenu(DocumentBody);
		context.size.set(130, 20);
		context.position.set(event.clientX, event.clientY);
		
		var refactor = context.addMenu("Refactor");
		refactor.addOption(Locale.rename, function()
		{
			self.server.rename(self.code);
		});

		refactor.addOption(Locale.select, function()
		{
			self.server.selectName(self.code);
		});

		context.addOption(Locale.search, function()
		{
			self.code.execCommand("find");
		});

		context.addOption(Locale.replace, function()
		{
			self.code.execCommand("replace");
		});

		context.addOption(Locale.replaceAll, function()
		{
			self.code.execCommand("replaceAll");
		});

		context.addOption("Documentation", function()
		{
			self.server.jumpToDef(self.code);
		});

		context.addOption(Locale.copy, function()
		{
			var text = self.code.getSelection();
			if(text !== "")
			{
				Editor.clipboard.set(text, "text");
			}
		});
		context.addOption(Locale.cut, function()
		{
			var text = self.code.getSelection();
			if(text !== "")
			{
				Editor.clipboard.set(text, "text");
				self.code.replaceSelection("");
			}
		});
		context.addOption(Locale.paste, function()
		{
			self.code.replaceSelection(Editor.clipboard.get("text"));
		});
		context.addOption("Auto ident", function()
		{
			self.code.execCommand("indentAuto");
		});
		context.addOption(Locale.selectAll, function()
		{
			self.code.execCommand("selectAll");
		});
		context.addOption(Locale.undo, function()
		{
			self.code.execCommand("undo");
		});
		context.addOption(Locale.redo, function()
		{
			self.code.execCommand("redo");
		});
		context.updateInterface();
	};

	/**
	 * Event manager to scroll.
	 *
	 * @property manager
	 * @type {EventManager}
	 */
	this.manager = new EventManager();
	this.manager.addScrollEvent(this.element, function(event)
	{
		if(event.ctrlKey && event.deltaY !== 0)
		{
			event.preventDefault();
			self.setFontSize(Editor.settings.code.fontSize - event.deltaY / 100);
		}
	});
	this.manager.create();
}

CodeEditor.prototype = Object.create(TabElement.prototype);

CodeEditor.prototype.activate = function()
{
	TabElement.prototype.activate.call(this);

	this.updateSettings();
};

CodeEditor.prototype.updateSettings = function()
{
	this.setFontSize(Editor.settings.code.fontSize);

	this.code.setOption("lint", {options: Editor.settings.jslint});
	this.code.setOption("theme", Editor.settings.code.theme);
	this.code.setOption("lineNumbers", Editor.settings.code.lineNumbers);
	this.code.setOption("lineWrapping", Editor.settings.code.lineWrapping);
	this.code.setOption("keyMap", Editor.settings.code.keymap);
	this.code.setOption("autoCloseBrackets", Editor.settings.code.autoCloseBrackets);
	this.code.setOption("styleActiveLine", Editor.settings.code.highlightActiveLine);
	this.code.setOption("showMatchesOnScrollbar", Editor.settings.code.showMatchesOnScrollbar);
	this.code.setOption("dragDrop", Editor.settings.code.dragFiles);
	this.code.setOption("indentWithTabs", Editor.settings.code.indentWithTabs);
	this.code.setOption("tabSize", Editor.settings.code.tabSize);
	this.code.setOption("indentUnit", Editor.settings.code.indentUnit);
};

/**
 * Set code editor font size.
 *
 * @method setFontSize
 * @param {number} size
 */
CodeEditor.prototype.setFontSize = function(size)
{
	if(size < 5)
	{
		size = 5;
	}

	Editor.settings.code.fontSize = size;
	this.code.display.wrapper.style.fontSize = size + "px";
};

/**
 * Get the code open in the editor.
 *
 * @method getText
 * @return {string} The code in the editor.
 */
CodeEditor.prototype.getText = function()
{
	return this.code.getValue();
};

/**
 * Set the code open in the editor.
 *
 * @method getText
 * @param {string} text Code to put in the editor.
 */
CodeEditor.prototype.setText = function(text)
{
	this.code.setValue(text);
};

/**
 * Set language mode (javascript, glsl, etc).
 *
 * @method setMode
 * @param {string} mode Language mode.
 */
CodeEditor.prototype.setMode = function(mode)
{
	this.code.setOption("mode", mode);
};

/**
 * Set onchange callback.
 *
 * @method setOnChange
 * @param {Function} callback
 */
CodeEditor.prototype.setOnChange = function(callback)
{
	this.code.on("change", callback);
};

CodeEditor.prototype.updateSize = function()
{
	TabElement.prototype.updateSize.call(this);

	this.code.setSize(this.size.x, this.size.y);
};
