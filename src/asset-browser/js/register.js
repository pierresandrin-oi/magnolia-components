import * as IncrementalDOM from "incremental-dom";
import futch from "frontools/helpers/futch";

class AssetBrowser extends HTMLElement {
	constructor () {
		super();

		this.HEADERS = new Headers();
		this.HEADERS.append( "Accept", "application/json" );
		this.HEADERS.append( "Content-Type", "application/json" );
	}

	render_children ( parentElement, path ) {
		const $child = parentElement.querySelector( "ul" );

		fetch( `/.rest/nodes/v1/dam${ path }?depth=1`, { headers: this.HEADERS } )
			.then( response => response.json() )
			.then( json => {
				parentElement.classList.add( "js-loaded" );
				parentElement.classList.add( "is-open" );
				IncrementalDOM.patch( $child, this.render_children_nodes.bind( this, json ) );
			} )
			.catch( err => console.warn( err ) );
	}

	render_children_nodes ( json ) {
		json.nodes.forEach( node => {
			switch ( node.type ) {
				case "mgnl:folder":
					this.render_folder_node( node );
					break;

				case "mgnl:asset":
					this.render_asset_node( node );
					break;

				default:
					break;
			}
		} );
	}

	render_folder_node ( node ) {
		return <li class="-folder" data-path={ node.path }>
			<a class="-foldername" onclick={ this.toggle_folder_cb.bind( this ) }>
				{ node.name }
			</a>
			<a class="-upload" onclick={ this.upload_asset_cb.bind( this, node.path ) } />
			<ul>{ "loading..." }</ul>
		</li>;
	}

	render_asset_node ( node ) {
		return <li class="-asset">
			<a href={ `/dam/jcr:${ node.identifier }` }>
				{ node.name }
			</a>
		</li>;
	}

	toggle_folder_cb ( event ) {
		const $currentElement = event.currentTarget.parentNode;

		if ( $currentElement.classList.contains( "js-loaded" ) ) {
			$currentElement.classList.toggle( "is-open" );
		}
		else {
			this.render_children( $currentElement, $currentElement.dataset.path );
		}
	}

	upload_asset_cb ( path ) {
		const $fileInput = document.createElement( "input" );

		$fileInput.setAttribute( "type", "file" );
		$fileInput.addEventListener( "change", this.send_form_cb.bind( this, path ) );
		$fileInput.click();
	}

	send_form_cb ( path, event ) {
		const FILE = event.currentTarget.files[ 0 ],
			FORM_DATA = new FormData();

		FORM_DATA.append( "path", path );
		FORM_DATA.append( "file", FILE, FILE.name );

		futch( this.dataset.upload, { method: "POST", body: FORM_DATA }, p => console.log( p ) );
	}

	createdCallback () {
		this.classList.add( "magnolia-asset-browser" );
		IncrementalDOM.patch( this, () => {
			IncrementalDOM.elementOpen( "span", null, null, "class", "-foldername" );
			IncrementalDOM.text( this.dataset.name );
			IncrementalDOM.elementClose( "span" );
			IncrementalDOM.elementOpen( "a", null, null, "class", "-upload", "onclick", this.upload_asset_cb.bind( this, this.dataset.path ) );
			IncrementalDOM.elementClose( "a" );
			IncrementalDOM.elementOpen( "ul" );
			IncrementalDOM.elementClose( "ul" );
		} );
	}

	attachedCallback () {
		this.render_children( this, this.dataset.path );
	}
}

function register_asset_browser () {
	document.registerElement( "magnolia-asset-browser", AssetBrowser );
}

export default register_asset_browser;
