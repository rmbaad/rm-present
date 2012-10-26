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
							// fontsize: '100%',
							fullscreen : true,
							addcontrols: false,
							hideprogress: false
		}

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

	Presentation.next = function() {
		next = this.current_section.next('section');
		if (next.length) {
			num = this.current_num + 1;
			this.set_current_section(next, num);
		}
	}

	Presentation.prev = function() {
		prev = this.current_section.prev('section');
		if (prev.length) {
			num = this.current_num - 1;
			this.set_current_section(prev, num);
		}
	}

	Presentation.set_styles = function() {
		options = this.get_options();
		this.obj.css({
						'width'		: options.width,
						'height'	: options.height
						// ,
						// 'position'	: 'relative'
					});
	}

	Presentation.get_options = function() {
		return this.options;
	}

	Presentation.set_progress = function() {
		this.progressbar.show();
		var percent = parseInt(this.current_num) / parseInt(this.num_sections) * 100;
		percent = percent.toFixed();
		this.progressbar.animate({'width': percent+'%'}, 200);
	}

	Presentation.resize = function() {
		this.obj.addClass('full');
		this.sections.removeClass('nofull');
		if (this.options.fullscreen) {
			// this.options.width = window.innerWidth;
			// this.options.height = window.innerHeight;
			this.scale();
		}
		this.set_styles();
	}

	Presentation.scale = function() {
		this.obj.css({
						
					});
	}

	Presentation.set_center = function() {
		css_top  = ($(window).outerHeight() - this.current_section.height()) / 2;
		css_left = ($(window).width()  - this.current_section.width())  / 2;

		console.log( $(window).height(), this.current_section.height() )

		this.obj.css({
			top: css_top,
			left: css_left
		});
	}

	Presentation.enter = function(section) {
		if (this.is_enter) {
			return false;
		}


		this.obj.addClass('full');
		this.sections.removeClass('nofull');

		$('body').keyup(this.uphandler = function(e) {
			if (e.keyCode == 39) {
				Presentation.next();
			} else if (e.keyCode == 37) {
				Presentation.prev();
			} else if (e.keyCode == 27) {
				Presentation.exit();
			}
		});

		$(window).resize(this.resizehandler = function() {
			Presentation.resize();
		})

		$(window).bind('popstate', this.pophandler = function(e) {
			Presentation.find_current_section();
			Presentation.set_current_section(null, null, 1);
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
	}

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

	Presentation.set_options = function(object) {
		$.each(object, function(key, value) {
			Presentation.options[key] = value;
		});
	}

})(Presentation);