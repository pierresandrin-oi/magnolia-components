import SrcSet from "frontools/helpers/scrset";
import get_brightness from "frontools/helpers/image.brightness";

class Slideshow extends HTMLElement {
	constructor () {
		super();
	}

	/**
	 * Get the source of the element depending on the media queries
	 * @see helpers/srcset
	 * @param {HTMLElement} slide - current slide
	 * @returns {{picture: string, video: string}} - urls of each media
	 * @private
	 */
	_get_srcset ( slide ) {
		var fragment = slide.querySelector( "template" ),
			picture, video;

		if ( fragment ) {
			try { fragment = fragment.content.cloneNode( true ); }
			catch ( error ) { /* IE11 doesn't support <template> */ }
			finally {
				const pictureElement = fragment.querySelector( "picture" ),
					videoElement = fragment.querySelector( "video" );

				picture = pictureElement ? new SrcSet( pictureElement ).src : undefined;
				video = videoElement ? new SrcSet( videoElement ).src : undefined;
			}
		}

		return { picture, video };
	}

	/**
	 * Download an image
	 * @param {string} url - url of the image
	 * @returns {Promise} - The image as a blob
	 * @private
	 */
	_load_image ( url ) {
		return new Promise( function ( resolve, reject ) {
			var request = new XMLHttpRequest();

			request.open( "GET", url );
			request.responseType = "blob";
			request.addEventListener( "load", function () {
				if ( request.status === 200 ) {
					resolve( request.response );
				}
				else {
					reject( Error( `Image didn't load successfully; error code:${ request.statusText }` ) );
				}
			} );
			request.addEventListener( "error", function () {
				reject( Error( "There was a network error." ) );
			} );
			request.send();
		} );
	}

	/**
	 * Render the DOM. If a video is defined, it plays from now.
	 * @param {Function} [callback = null] Callback function
	 * @returns {void}
	 */
	render ( callback = null ) {
		var self = this,
			fragment = document.createDocumentFragment();

		/**
		 * Check if all slides have been done and do last config
		 * @this Slideshow
		 * @returns {void}
		 */
		function check_status () {
			if ( this.loaded >= this.count ) {
				if ( this.bulletsContainer ) {
					this.bulletsContainer.firstElementChild.remove();
					this.bullets = this.bulletsContainer.children;

					[ ...this.bullets ].forEach( ( bullet, index ) => bullet.dataset.goto = index );
				}

				this.app.appendChild( fragment );
				this.backgroundSlides = this.app.querySelectorAll( ".slide" );
				this.slides = this.$element.querySelectorAll( ".slide" );
				this.run();

				if ( callback && typeof callback === "function" ) {
					callback();
				}
			}
		}

		if ( !this.app ) {
			this.app = document.createElement( "div" );
			this.app.className = "background";
			this.$element.appendChild( this.app );
		}

		[ ...this.slides ].forEach( ( slide, index ) => {
			const tree = document.createElement( "div" ),
				{ picture, video } = this._get_srcset( slide ),
				bullet = this.bulletElement ? this.bulletElement.cloneNode( true ) : null;

			if ( typeof video !== "undefined" ) {
				const sourceElement = document.createElement( "source" ),
					videoElement = document.createElement( "video" );

				sourceElement.setAttribute( "src", video );
				sourceElement.setAttribute( "type", "video/mp4" );

				videoElement.setAttribute( "loop", "true" );
				videoElement.setAttribute( "autoplay", "true" );
				videoElement.setAttribute( "muted", "true" );
				videoElement.setAttribute( "webkit-playsinline", "true" );
				videoElement.setAttribute( "poster", video );

				if ( slide.dataset.position ) {
					videoElement.style.objectPosition = slide.dataset.position;
				}

				videoElement.appendChild( sourceElement );
				tree.appendChild( videoElement );
			}

			if ( bullet ) {
				bullet.removeAttribute( "hidden" );
				bullet.addEventListener( "click", this._goto_ev.bind( this ) );
				this.bulletsContainer.appendChild( bullet );
			}

			tree.className = "slide";

			if ( slide.dataset.position ) {
				tree.style.backgroundPosition = slide.dataset.position;
			}


			if ( index === 0 ) { this.app.appendChild( tree ); }
			else { fragment.appendChild( tree ); }

			this._load_image( picture )
				.then( response => {
					tree.style.backgroundImage = `url(${ URL.createObjectURL( response ) })`;
					self.loaded++;
					check_status.apply( this );

					try {
						const img = document.createElement( "img" );

						img.onload = () => {
							const brightness = get_brightness( img );

							slide.dataset.brightness = ( brightness > 128 ) ? "light" : "dark";
							tree.dataset.brightness = String( brightness );
						};
						img.src = URL.createObjectURL( response );
					}
					catch ( e ) {
						tree.dataset.brightness = "-1";
					}
				} )
				.catch( err => {
					this.$element.removeChild( slide );
					if ( index === 0 ) { this.app.removeChild( tree ); }
					else { fragment.removeChild( tree ); }
					if ( bullet ) { this.bulletsContainer.removeChild( bullet ); }

					self.count--;
					check_status.apply( this );
				} );
		} );
	}

	/**
	 * Add, remove CSS classes to the slides. Content and Background.
	 * @returns {void}
	 * @private
	 */
	_show () {
		const CURRENT_SLIDE = this.slides[ this.current ],
			CURRENT_BACKGROUND_SLIDE = this.backgroundSlides[ this.current ];
		let changeEvent;

		this.occurrence++;

		try {
			changeEvent = new CustomEvent(
				"change",
				{
					detail: {
						id: this.current,
						brightness: CURRENT_SLIDE.dataset.brightness,
						occurrence: this.occurrence
					}
				}
			);
		}
		catch ( err ) {
			changeEvent = document.createEvent( "CustomEvent" );
			changeEvent.initCustomEvent( "change", true, true, {
				detail: {
					id: this.current,
					brightness: CURRENT_SLIDE.dataset.brightness,
					occurrence: this.occurrence
				}
			} );
		}

		/**
		 * Remove last slide CSS classes when transition ends
		 * @param {number} index - Slide index
		 * @this Slideshow
		 * @returns {void}
		 * @private
		 */
		function transition_end ( index ) {
			this.slides[ index ].classList.remove( "is-show" );
			this.slides[ index ].classList.remove( "is-last" );
			this.backgroundSlides[ index ].classList.remove( "is-show" );
			this.backgroundSlides[ index ].classList.remove( "is-last" );
			if ( this.bullets ) {
				this.bullets[ index ].classList.remove( "is-show" );
				this.bullets[ index ].classList.remove( "is-last" );
			}
		}

		for ( let i = 0; i < this.count; i++ ) {
			if ( this.last === i ) {
				if ( this.current !== this.last ) {
					this.slides[ i ].classList.add( "is-last" );
					this.backgroundSlides[ i ].classList.add( "is-last" );
					if ( this.bullets ) { this.bullets[ i ].classList.add( "is-last" ); }
					this.timeoutID = setTimeout( transition_end.bind( this, i ), this.transitionDelay );
				}
			}
			else {
				this.slides[ i ].classList.remove( "is-last" );
				this.backgroundSlides[ i ].classList.remove( "is-show" );
				this.backgroundSlides[ i ].classList.remove( "is-last" );
				if ( this.bullets ) {
					this.bullets[ i ].classList.remove( "is-show" );
					this.bullets[ i ].classList.remove( "is-last" );
				}
			}

			this.slides[ i ].classList.remove( "is-show" );
		}

		CURRENT_SLIDE.classList.add( "is-show" );
		CURRENT_BACKGROUND_SLIDE.classList.add( "is-show" );
		if ( this.occurrence <= 1 ) {
			CURRENT_SLIDE.classList.add( "is-first" );
			CURRENT_BACKGROUND_SLIDE.classList.add( "is-first" );
			setTimeout( () => {
				CURRENT_SLIDE.classList.remove( "is-first" );
				CURRENT_BACKGROUND_SLIDE.classList.remove( "is-first" );
			}, this.transitionDelay );
		}
		if ( this.bullets ) { this.bullets[ this.current ].classList.add( "is-show" ); }

		this.last = this.current;
		this.current = ( this.current + 1 ) % this.count;

		this.$element.dispatchEvent( changeEvent );
	}

	/**
	 * Go to that slide
	 * @param {number} slideNumber - slide id
	 * @returns {void}
	 */
	goto ( slideNumber ) {
		clearInterval( this.intervalID );
		clearTimeout( this.timeoutID );
		this.current = slideNumber % this.count;
		this._show();
	}

	/**
	 * When click on a bullet, go to this slide
	 * @param {Event} event - Mouse Event
	 * @returns {void}
	 * @private
	 */
	_goto_ev ( event ) { this.goto( event.currentTarget.dataset.goto );	}

	/**
	 * Go to the next slide
	 * @returns {void}
	 */
	next () { this.goto( this.current + 1 ); }

	createdCallback () {
		this.classList.add( "magnolia-slideshow" );

		this.$element = this;
		this.app = null;
		this.slides = this.querySelectorAll( ".slide" );

		this.count = this.slides.length;
		this.delay = Number( this.dataset.delay );
		this.transitionDelay = Number( this.dataset.transition );
		this.current = 0;
		this.last = -1;
		this.intervalID = 0;
		this.timeoutID = 0;
		this.bullets = null;
		this.loaded = 0;
		this.occurrence = 0;

		try {
			this.bulletsContainer = this.$element.querySelector( ".Slideshow-Bullets" );
			this.bulletElement = this.bulletsContainer.firstElementChild;
		}
		catch ( error ) {
			this.bulletsContainer = null;
			this.bulletElement = null;
		}

		this.render();
	}

	// attachedCallback () {
	run () {
		setTimeout( this._show.bind( this ), 16 );

		if ( this.count > 1 && this.delay > 0 ) {
			this.intervalID = setInterval( this._show.bind( this ), this.delay );
		}
	}
}

function register_slideshow () {
	document.registerElement( "magnolia-slideshow", Slideshow );
}

export default register_slideshow;