import * as IncrementalDOM from "incremental-dom";
import futch from "frontools/helpers/futch";

class AssetBrowser extends HTMLElement {
	constructor ( self ) {
		// Use self instead of this because of v1 polyfill
		self = super( self );

		self.HEADERS = new Headers();
		self.HEADERS.append( "Accept", "application/json" );
		self.HEADERS.append( "Content-Type", "application/json" );

		// important in case you create instances procedurally -> new MyElement();
		return self;
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
		if ( json.hasOwnProperty( "nodes" ) ) {
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
	}

	render_folder_node ( node ) {
		return <li class="folder" data-path={ node.path }>
			<a class="name" onclick={ this.toggle_folder_cb.bind( this ) }>
				<svg class="icon">
					<use class="close" xlink:href="#magnolia-asset-browser-folder-open"></use>
					<use class="open" xlink:href="#magnolia-asset-browser-folder-close"></use>
				</svg>
				{ node.name }
			</a>
			<a class="upload has-icon" onclick={ this.upload_asset_cb.bind( this, node.path ) }>
				<svg class="icon"><use xlink:href="#magnolia-asset-browser-upload"></use></svg>
			</a>
			<ul>
				<li class="loading has-icon"><svg class="icon"><use xlink:href="#magnolia-asset-browser-loading"></use></svg></li>
			</ul>
		</li>;
	}

	render_asset_node ( node ) {
		return <li class="asset">
			<a class="name" href={ `/dam/jcr:${ node.identifier }` }>
				<svg class="icon"><use xlink:href="#magnolia-asset-browser-asset"></use></svg>
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

	upload_asset_cb ( path, event ) {
		const $fileInput = document.createElement( "input" );

		$fileInput.setAttribute( "type", "file" );
		$fileInput.addEventListener( "change", this.send_form_cb.bind( this, path, event.currentTarget.parentNode ) );
		$fileInput.click();
	}

	send_form_cb ( path, parentElement, event ) {
		const FILE = event.currentTarget.files[ 0 ],
			FORM_DATA = new FormData();

		FORM_DATA.append( "path", path );
		FORM_DATA.append( "file", FILE, FILE.name );

		function progress_cb ( event ) {
			console.log( `${ event.loaded / event.total * 100 }%` );
		}

		futch( this.dataset.upload, { method: "POST", body: FORM_DATA }, progress_cb )
			.then( () => this.render_children( parentElement, path ) )
			.catch( err => console.log( err ) );
	}

	connectedCallback () {
		const $ul = document.createElement( "ul" );

		this.classList.add( "magnolia-asset-browser" );
		this.appendChild( $ul );

		IncrementalDOM.patch( $ul, this.render_children_nodes.bind( this, {
			nodes: [{
				type: "mgnl:folder",
				path: this.dataset.path,
				name: this.dataset.name
			}]
		} ) );

		// loads and opens the root path
		this.render_children( this.querySelector( "ul > li" ), this.dataset.path );
	}
}

function register_asset_browser () {
	customElements.define( "magnolia-asset-browser", AssetBrowser );
}

export default register_asset_browser;
export { AssetBrowser };
