class Slideshow extends HTMLElement {
	constructor () {
		super();

		this._current = 0;
		this._last = -1;
		this._occurrence = 0;
	}

	/**
	 * Add, remove CSS classes to the slides. Content and Background.
	 * @returns {void}
	 * @private
	 */
	_run () {
		const CURRENT_SLIDE = this.$foregroundSlides[ this._current ],
			CURRENT_BACKGROUND_SLIDE = this.$backgroundSlides[ this._current ];

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

		for ( let i = 0; i < this._count; i++ ) {
			if ( this._last === i ) {
				if ( this._current !== this._last ) {
					this.$foregroundSlides[ i ].classList.add( "is-last" );
					this.$backgroundSlides[ i ].classList.add( "is-last" );
					setTimeout( transition_end.bind( this, i ), this._transitionDelay );
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

		if ( ++this._occurrence < 2 ) {
			CURRENT_SLIDE.classList.add( "is-first" );
			CURRENT_BACKGROUND_SLIDE.classList.add( "is-first" );
			setTimeout( () => {
				CURRENT_SLIDE.classList.remove( "is-first" );
				CURRENT_BACKGROUND_SLIDE.classList.remove( "is-first" );
			}, this._transitionDelay );
		}

		this._last = this._current;
		this._current = ( this._current + 1 ) % this._count;
	}

	connectedCallback () {
		const DELAY = Number( this.dataset.delay );

		this.$foregroundSlides = this.querySelectorAll( ".foreground > .slide" );
		this.$backgroundSlides = this.querySelectorAll( ".background > .slide" );

		this._count = this.$foregroundSlides.length;
		this._transitionDelay = Number( this.dataset.transition );

		if ( this._count > 1 && DELAY > 0 ) {
			setInterval( this._run.bind( this ), DELAY );
		}

		requestAnimationFrame( this._run.bind( this ) );
	}
}

function register_slideshow () {
	customElements.define( "magnolia-slideshow", Slideshow );
}

export { Slideshow, register_slideshow };
