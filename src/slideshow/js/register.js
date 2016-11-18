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
			CURRENT_BACKGROUND_SLIDE = this.$backgroundSlides[ this.current ];

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
		}

		for ( let i = 0; i < this.count; i++ ) {
			if ( this.last === i ) {
				if ( this.current !== this.last ) {
					this.$foregroundSlides[ i ].classList.add( "is-last" );
					this.$backgroundSlides[ i ].classList.add( "is-last" );
					setTimeout( transition_end.bind( this, i ), this.transitionDelay );
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

		if ( ++this.occurrence < 2 ) {
			CURRENT_SLIDE.classList.add( "is-first" );
			CURRENT_BACKGROUND_SLIDE.classList.add( "is-first" );
			setTimeout( () => {
				CURRENT_SLIDE.classList.remove( "is-first" );
				CURRENT_BACKGROUND_SLIDE.classList.remove( "is-first" );
			}, this.transitionDelay );
		}

		this.last = this.current;
		this.current = ( this.current + 1 ) % this.count;
	}

	createdCallback () {
		this.classList.add( "magnolia-slideshow" );

		this.$foregroundSlides = this.querySelectorAll( ".foreground > .slide" );
		this.$backgroundSlides = this.querySelectorAll( ".background > .slide" );

		this.count = this.$foregroundSlides.length;
		this.transitionDelay = Number( this.dataset.transition );

		this.current = 0;
		this.last = -1;
		this.occurrence = 0;
	}

	attachedCallback () {
		const DELAY = Number( this.dataset.delay );

		setTimeout( this._run.bind( this ), 16 );

		if ( this.count > 1 && DELAY > 0 ) {
			setInterval( this._run.bind( this ), DELAY );
		}
	}
}

function register_slideshow () {
	document.registerElement( "magnolia-slideshow", Slideshow );
}

export default register_slideshow;
