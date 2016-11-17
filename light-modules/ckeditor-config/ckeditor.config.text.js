/**
 * External plugins added through the server-side FieldFactory are automatically registered.
 * Other external plugins (e.g. client-only) may still be registered here (and subsequently added via config.extraPlugins).
 *
 * e.g. if your plugin resides in src/main/resources/VAADIN/js:
 * CKEDITOR.plugins.addExternal("abbr", CKEDITOR.vaadinDirUrl + "js/abbr/");
 */
CKEDITOR.editorConfig = function( config ) {

	// MIRROR info.magnolia.ui.form.field.definition.RichTextFieldDefinition
	definition = {
		alignment: false,
		images: false,
		lists: false,
		source: false,
		tables: false
	};

	config.extraPlugins = "magnolialink,magnoliaFileBrowser";
	config.removePlugins = 'elementspath';

	config.baseFloatZIndex = 150;
	config.resize_enabled = false;
	config.format_tags = 'p';
	config.enterMode = CKEDITOR.ENTER_BR;
	config.autoParagraph = false;
	config.fillEmptyBlocks = false;

	config.toolbar = "Magnolia";
	config.toolbar_Magnolia = [
		{ name: "basicstyles",   items: [ "Bold", "Italic", "SpecialChar" ] },
		{ name: "clipboard",     items: [ "Cut", "Copy", "Paste", "PasteText" ] },
		{ name: "undo",          items: [ "Undo", "Redo" ] }
	];
};