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
		alignment: true,
		images: false,
		lists: true,
		source: false,
		tables: false
	};

	config.extraPlugins = "magnolialink,magnoliaFileBrowser";
	config.removePlugins = 'elementspath';

	config.baseFloatZIndex = 150;
	config.resize_enabled = false;
	config.format_tags = 'h2;h3;p';
	config.fillEmptyBlocks = false;
	config.toolbar = "Magnolia";
	config.toolbar_Magnolia = [
		{ name: "basicstyles",   items: [ "Bold", "Italic", "SpecialChar" ] },
		{ name: "paragraph",     items: [ "BulletedList" ] },
		{ name: "links",         items: [ "Link", "InternalLink", "DamLink", "Unlink" ] },
		{ name: "styles",        items: [ "Format" ] },
		{ name: "clipboard",     items: [ "Cut", "Copy", "Paste", "PasteText" ] },
		{ name: "undo",          items: [ "Undo", "Redo" ] },
		{ name: "tools",         items: [ "Source" ] },
	];
};