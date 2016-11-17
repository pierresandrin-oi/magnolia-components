function create_custom_event ( eventName, detail ) {
	let changeEvent = null;

	try {
		changeEvent = new CustomEvent( eventName, { detail } );
	}
	catch ( err ) { // IE11
		changeEvent = document.createEvent( "CustomEvent" );
		changeEvent.initCustomEvent( eventName, true, true, { detail } );
	}

	return changeEvent;
}

class Slideshow extends HTMLElement {
	constructor () {
		super();
	}

	/**
	 * Add, remove CSS classes to the slides. Content and Background.
	 * @returns {void}
	 * @private
	 */
	_run () {
		const CURRENT_SLIDE = this.$foregroundSlides[ this.current ],
			CURRENT_BACKGROUND_SLIDE = this.$backgroundSlides[ this.current ],
			CHANGE_EVENT = create_custom_event( "change", {
				id: this.current,
				occurrence: ++this.occurrence
			} );

		/**
		 * Remove last slide CSS classes when transition ends
		 * @param {number} index - Slide index
		 * @this Slideshow
		 * @returns {void}
		 * @private
		 */
		function transition_end ( index ) {
			this.$foregroundSlides[ index ].classList.remove( "is-show" );
			this.$foregroundSlides[ index ].classList.remove( "is-last" );
			this.$backgroundSlides[ index ].classList.remove( "is-show" );
			this.$backgroundSlides[ index ].classList.remove( "is-last" );
			if ( this.bullets ) {
				this.bullets[ index ].classList.remove( "is-show" );
				this.bullets[ index ].classList.remove( "is-last" );
			}
		}

		for ( let i = 0; i < this.count; i++ ) {
			if ( this.last === i ) {
				if ( this.current !== this.last ) {
					this.$foregroundSlides[ i ].classList.add( "is-last" );
					this.$backgroundSlides[ i ].classList.add( "is-last" );
					this.timeoutID = setTimeout( transition_end.bind( this, i ), this.transitionDelay );
				}
			}
			else {
				this.$foregroundSlides[ i ].classList.remove( "is-last" );
				this.$backgroundSlides[ i ].classList.remove( "is-show" );
				this.$backgroundSlides[ i ].classList.remove( "is-last" );
			}

			this.$foregroundSlides[ i ].classList.remove( "is-show" );
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

		this.last = this.current;
		this.current = ( this.current + 1 ) % this.count;

		this.dispatchEvent( CHANGE_EVENT );
	}

	/**
	 * Go to that slide
	 * @param {number} slideNumber - slide id
	 * @returns {void}
	 */
	goto ( slideNumber ) {
		clearInterval( this.intervalID );
		clearTimeout( this.timeoutID );
		this.current = slideNumber < 0 ? slideNumber % this.count + this.count : slideNumber % this.count;
		this._run();
	}

	/**
	 * Go to the next slide
	 * @returns {void}
	 */
	next () { this.goto( this.current + 1 ); }

	/**
	 * Go to the previous slide
	 * @returns {void}
	 */
	previous () { this.goto( this.current + 1 ); }

	createdCallback () {
		this.classList.add( "magnolia-slideshow" );

		this.$foregroundSlides = this.querySelectorAll( ".foreground > .slide" );
		this.$backgroundSlides = this.querySelectorAll( ".background > .slide" );

		this.count = this.$foregroundSlides.length;
		this.transitionDelay = Number( this.dataset.transition );

		this.current = 0;
		this.last = -1;
		this.intervalID = 0;
		this.timeoutID = 0;
		this.occurrence = 0;
	}

	attachedCallback () {
		const DELAY = Number( this.dataset.delay );

		setTimeout( this._run.bind( this ), 16 );

		if ( this.count > 1 && DELAY > 0 ) {
			this.intervalID = setInterval( this._run.bind( this ), DELAY );
		}
	}
}

function register_slideshow () {
	document.registerElement( "magnolia-slideshow", Slideshow );
}

export default register_slideshow;
