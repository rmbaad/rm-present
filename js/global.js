Presentation = {};
(function(Presentation) {
	Presentation.init = function(id) {

		// just one init
		if (typeof(is_init) != 'undefined') {
			this.enter();
			return this;
		}
		is_init = true;

		// set object and sections
		this.obj = $('#'+id);
		this.sections = this.obj.find('section');
		this.sections.hide();
		this.num_sections = this.sections.length;
		this.first_section = this.obj.find('section:first');
		this.last_section = this.obj.find('section:last');

		// detect current section
		this.find_current_section();

		this.default_options = {
							width : '50%',
							height : '500px',
							fontsize: '100%',
							fullscreen : true,
							addcontrols: false,
							hideprogress: true
		}

		this.options = Object.create(this.default_options);

		// show first action
		this.current_section.show();

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


		$('body').keyup(this.uphandler = function(e) {
			if (e.keyCode == 39) {
				Presentation.next();
			} else if (e.keyCode == 37) {
				Presentation.prev();
			} else if (e.keyCode == 27) {
				Presentation.exit();
			}
		});

		// change font size with resize
		$(window).resize(function() {
			Presentation.resize();
		})

		// detect hash change
		$(window).bind( 'popstate',function(e) {
			Presentation.find_current_section();
			Presentation.set_current_section(null, null, 1);
		});

		this.set_progress();
		// this.set_options();
		this.set_styles();
		this.prepare_images();
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

			pathname = window.location.origin;
			if (this.current_id) {
				pathname = pathname + '#' + this.current_id;
			} else {
				index = $('section').index(this.current_section) + 1;
				pathname = window.location.origin + '#' + index;
			}

			if (!nopush) {
				history.pushState(null, null, pathname);
			}
		}

		this.resize();
	}

	Presentation.next = function() {
		next = this.current_section.next('section');
		if (next.length) {
			// FIXME detect this.current_num
			num = this.current_num + 1;
			Presentation.set_current_section(next, num);
		}
	}

	Presentation.prev = function() {
		prev = this.current_section.prev('section');
		if (prev.length) {
			// FIXME detect this.current_num
			num = this.current_num - 1;
			Presentation.set_current_section(prev, num);
		}
	}

	Presentation.set_styles = function() {
		options = this.get_options();
		this.obj.css({
						'width'		: options.width,
						'height'	: options.height,
						'font-size'  : options.fontsize,
						'position'	: 'relative'
					});
	}

	Presentation.get_options = function() {
		return this.options;
	}

	// Presentation.set_options = function(options) {
	// 	// this.options = $.extend({}, this.default_options, options);
	// 	this.options = $.extend({}, opt, this.options);
	// 	console.log(this.options)
	// }

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
			// options = {
			// 				width: window.innerWidth,
			// 				height: window.innerHeight
			// }
			// this.set_options(options);
			this.options.width = window.innerWidth;
			this.options.height = window.innerHeight;
		}
		this.resize_font();
		this.set_styles();
	}

	Presentation.enter = function(section) {
		this.obj.addClass('full');
		this.sections.removeClass('nofull');

		$('.pr-prev, .pr-next').show();
		this.progressbar.show();
		this.sections.hide();
		$('body').bind('keyup', this.uphandler);
		this.set_current_section(section);
	}

	Presentation.exit = function() {
		this.obj.removeClass('full');
		this.sections.addClass('nofull');
		console.log('exit full')
		this.options = Object.create(this.default_options);
		this.set_styles();

		$('.pr-prev, .pr-next').hide();
		this.progressbar.hide();
		this.sections.show();
		history.pushState(null, null, location.origin);
		$('body').unbind('keyup', this.uphandler);
		this.obj.css({width: 'auto', height: 'auto'});
	}

	Presentation.resize_font = function() {
		size = parseInt(this.options.height) / 10;
		size = size.toFixed();
		this.options.fontsize = size+'px';
		this.set_styles();
	}

	Presentation.prepare_images = function() {
		$.each(this.sections, function(index, section) {
			var elems = $(this).find('*');
			if (elems.length == 1) {
				if (elems[0].tagName.toLowerCase() == 'img') {
					elems.load(function() {
						// console.log(this)
						// console.log(this.width, this.height)
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

})(Presentation);

$(function() {
	var pres = Presentation.init('presentation');
	$('#presentation section').click(function() {
		pres.enter($(this));
	});

});