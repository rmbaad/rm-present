Presentation = {};
(function(Presentation) {
	Presentation.init = function(id, options) {

		// just one init
		if (typeof(is_init) != 'undefined') {
			this.enter();
			return this;
		}
		is_init = true;

		// set object and sections
		this.obj = $('#'+id);
		this.sections = this.obj.find('section');

		this.sections.addClass('nofull');

		this.sections.click(function() {
			Presentation.enter($(this));
		});
		
		this.num_sections = this.sections.length;
		this.first_section = this.obj.find('section:first');
		this.last_section = this.obj.find('section:last');

		this.default_options = {
							width : '640px',
							height : '360px',
							fullscreen : true,
							addcontrols: false,
							hideprogress: false
		}

		// Create options object
		this.options = Object.create(this.default_options);

		if (options) {
			this.set_options(options);
		}

		// add controls
		if (this.options.addcontrols) {
			this.obj.append('<div class="left-control pr-prev"></div>');
			this.obj.append('<div class="right-control pr-next"></div>');

			// add next litener
			this.next_buttons = $('.pr-next');
			this.next_buttons.click(function() {
				Presentation.next();
			});

			// add prev litener
			this.prev_buttons = $('.pr-prev');
			this.prev_buttons.click(function() {
				Presentation.prev();
			});
		}

		// Add progressbar
		this.obj.append('<div class="pr-progressbar" id="pr-progressbar"></div>');
		this.progressbar = $('#pr-progressbar');

		this.prepare_images();

		// detect current section
		this.find_current_section();
		if (this.hashtag) {
			this.enter();
		}
		return this;
	}

	// Find current section by hashtag, index or get default
	Presentation.find_current_section = function() {
		if (window.location.hash) {
			find_section = this.obj.find(window.location.hash)
			if (!find_section.length) {
				hash = window.location.hash.split('#')[1];
				if (parseInt(hash) == hash) {
					hash = hash - 1;
					find_section = this.obj.find('section:eq('+hash+')');
				}
			}

			if (find_section) {
				this.current_section = find_section;
				this.current_num = $('section').index(this.current_section) + 1;
				this.hashtag = true;
			}
		} else {
			this.current_section = false;
		}

		if (!this.current_section) {
			this.current_section = this.first_section;
			this.current_num = 1;
		}
	}

	// Set current section
	Presentation.set_current_section = function(section, num, nopush) {
		if (!section && this.current_section) {
			section = this.current_section;
			num = this.current_num;
		}

		if (section && section.length) {
			this.sections.hide();
			section.show();

			this.current_section = section;
			if (num) {
				this.current_num = num;
			} else {
				this.current_num = $('section').index(this.current_section) + 1;
			}
			Presentation.set_progress();

			// hide progressbar for images
			if (this.options.hideprogress) {
				elems = this.current_section.find('*');
				if (elems.length == 1) {
					if (elems[0].tagName.toLowerCase() == 'img') {
						this.progressbar.hide();
					}
				}
			}

			this.current_id = this.current_section.attr('id');

			// History
			pathname = location.href.replace(location.hash, '');
			if (this.current_id) {
				pathname = pathname + '#' + this.current_id;
			} else {
				index = $('section').index(this.current_section) + 1;
				pathname = pathname + '#' + index;
			}

			if (!nopush) {
				history.pushState(null, null, pathname);
			}
		}
	}

	// Go to next section
	Presentation.next = function() {
		next = this.current_section.next('section');
		if (next.length) {
			num = this.current_num + 1;
			this.set_current_section(next, num);
		}
	}

	// Go to previous section
	Presentation.prev = function() {
		prev = this.current_section.prev('section');
		if (prev.length) {
			num = this.current_num - 1;
			this.set_current_section(prev, num);
		}
	}

	// Set sizes for global object
	Presentation.set_styles = function() {
		options = this.get_options();
		this.obj.css({
						'width'		: options.width,
						'height'	: options.height
					});
	}

	// Get options
	Presentation.get_options = function() {
		return this.options;
	}

	// Update progressbar
	Presentation.set_progress = function() {
		this.progressbar.show();
		var percent = parseInt(this.current_num) / parseInt(this.num_sections) * 100;
		percent = percent.toFixed();
		this.progressbar.animate({'width': percent+'%'}, 150);
	}

	// Resize section
	Presentation.resize = function() {
		this.obj.addClass('full');
		this.sections.removeClass('nofull');
		if (this.options.fullscreen) {
			this.set_center();
			this.scale();
		}
		this.set_styles();
	}

	// Scale presentation
	Presentation.scale = function() {
		
		section_width = this.current_section.width();
		section_height = this.current_section.height();

		window_width = $(document).width();
		window_height = $(document).height();


		if (window_width / window_height > 1.7) {
			scale = window_height / section_height;
		} else {
			scale = window_width / section_width;
		}

		this.scale_style = {
					  '-webkit-transform': 'scale('+scale+')',
					     '-moz-transform': 'scale('+scale+')',
					      '-ms-transform': 'scale('+scale+')',
					       '-o-transform': 'scale('+scale+')',
					          'transform': 'scale('+scale+')'
					}

		this.obj.css(this.scale_style);
	}

	// Set presentation to center
	Presentation.set_center = function() {
		css_top  = ($(document).height() - this.current_section.height()) / 2;
		css_left = ($(document).width()  - this.current_section.width())  / 2;

		this.obj.css({
			top: css_top,
			left: css_left
		});
	}

	// Enter in presentation mode
	Presentation.enter = function(section) {
		if (this.is_enter) {
			return false;
		}

		this.obj.addClass('full');
		this.sections.removeClass('nofull');

		$('body').keyup(this.uphandler = function(e) {
			if (e.keyCode == 39) {
				// Right
				Presentation.next();
			} else if (e.keyCode == 37) {
				// Left
				Presentation.prev();
			} else if (e.keyCode == 27) {
				// Escale
				Presentation.exit();
			} else if (e.keyCode == 36) {
				// Home
				Presentation.set_current_section(Presentation.first_section);
			} else if (e.keyCode == 35) {
				// End
				Presentation.set_current_section(Presentation.last_section);
			}
		});

		$(window).resize(this.resizehandler = function() {
			Presentation.resize();
		})

		$(window).bind('popstate', this.pophandler = function(e) {
			Presentation.enter();
		});

		$('.pr-prev, .pr-next').show();
		this.set_progress();
		this.sections.hide();
		this.set_current_section(section);
		this.set_styles();
		this.resize();
		this.is_enter = true;
		this.set_center();
	}

	// Exit from presentation mode
	Presentation.exit = function() {
		this.obj.removeClass('full');
		this.sections.addClass('nofull');

		this.options = Object.create(this.default_options);
		this.set_styles();

		$('.pr-prev, .pr-next').hide();
		this.progressbar.hide();
		this.sections.show();
		history.pushState(null, null, location.href.replace(location.hash, ''));
		$('body').unbind('keyup', this.uphandler);
		$(window).unbind('resize', this.resizehandler);
		$(window).unbind('resize', this.pophandler);
		this.obj.css({width: 'auto', height: 'auto'});
		this.is_enter = false;


		this.scale_style = {
			  '-webkit-transform': 'none',
			     '-moz-transform': 'none',
			      '-ms-transform': 'none',
			       '-o-transform': 'none',
			          'transform': 'none'
			}

		this.obj.css(this.scale_style);
	}

	// Scale images
	Presentation.prepare_images = function() {
		$.each(this.sections, function(index, section) {
			var elems = $(this).find('*');
			if (elems.length == 1) {
				if (elems[0].tagName.toLowerCase() == 'img') {
					$(this).css('text-align', 'center');
					elems.load(function() {
						var w = this.width;
						var h = this.height;
						if (this.width > this.height) {
							this.style.width = '100%';
							this.style.maxWidth = w+'px';

						} else {
							this.style.height = '100%';
							this.style.maxHeight = h+'px';
						}
						this.style.margin = 'auto';
					});
				}
			}
		});
	}

	// Set options
	Presentation.set_options = function(object) {
		$.each(object, function(key, value) {
			Presentation.options[key] = value;
		});
	}

})(Presentation);