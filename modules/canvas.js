(function(window, undefined){
	'use strict';
	
	if(!window.simply)
	{
		throw new Error('window.simply is required to use this module');
	}
	
	var canvas = document.createElement('canvas');
	var buffer = document.createElement('canvas');
	
	if(!canvas.getContext)
	{
		throw new Error('Canvas support is required to use this module');
	}
	var ctx = buffer.getContext('2d', {alpha: false});
	var canvas_ctx = canvas.getContext('2d', {alpha: false});
	
	
	var SETTINGS_DEFAULT = {
		frameskip: 0,
		lowpower: false,
		can_update: true
	};
	/*var SETTINGS = Object.assign({}, SETTINGS_DEFAULT);*/
	var SETTINGS = {};
	var EXPORTED = {};
	var CHANGED = true;
	
	var SAVED_STATES_DEFAULTS = {
		font: '10px sans-serif',
		fillStyle: '#000000',
		strokeStyle: '#000000',
		
		textAlign: 'left',
		textBaseline: 'top',
		
		lineWidth: 1,
		lineCap: 'butt',
		lineDashOffset: 0,
		lineJoin: 'miter'
	};
	var SAVED_STATES = [];
	
	// text measurement element
	var text_measurer = document.createElement('span');
	text_measurer.className = 'text-measurer';
	
	var text_measurer_holder = document.createElement('div');
	text_measurer_holder.className = 'text-measurer-holder';
	
	text_measurer_holder.appendChild(text_measurer);
	
	
	
	// global holder
	var div = document.createElement('div');
	div.id = 'm-canvas-holder';
	div.setAttribute('data-showfps', 'false');
	div.setAttribute('data-currfps', '--');
	div.setAttribute('data-shownfps', '--');
	
	div.appendChild(canvas);
	div.appendChild(text_measurer_holder);
	// div.appendChild(buffer);
	
	ctx.imageSmoothingEnabled = false;
	ctx.imageSmoothingQuality = 'high';
	
	
	// canvas coords mode
	var COORD_MODE = {
		grid_mode: {
			x: 1, y: 1, min: 0.1,
			init: function(x, y){
				this.x = x > 0 ? x|0 : 1;
				this.y = y > 0 ? y|0 : 1;
			},
			reset: function(){
				this.y = this.x = 1;
			},
			getX: function(x){
				return (x * this.x)|0;
			},
			getXFromPX: function(px){
				return px / this.x;
			},
			getY: function(y){
				return (y * this.y)|0;
			},
			getYFromPX: function(px){
				return px / this.y;
			}
		},
		pixel_mode: {
			min: 1,
			init: function(){},
			reset: function(){},
			getX: function(x){
				return x|0;
			},
			getXFromPX: function(px){
				return px|0;
			},
			getY: function(y){
				return y|0;
			},
			getYFromPX: function(px){
				return px|0;
			}
		},
		percent_mode: {
			min: 0.1,
			init: function(){},
			reset: function(){},
			getX: function(x){
				return (x * canvas.width)|0;
			},
			getXFromPX: function(x){
				return x / canvas.width;
			},
			getY: function(y){
				return (y * canvas.height)|0;
			},
			getYFromPX: function(y){
				return y / canvas.height;
			}
		},
		
		mode: 'pixel_mode',
		reset: function(){
			this.mode = 'pixel_mode';
			this.getModes().forEach(function(mode){
				this[mode + '_mode'].reset();
			}, this);
		},
		setMode: function(mode, args){
			mode = mode.toString() + '_mode';
			if(!(mode in COORD_MODE))
			{
				return false;
			}
			
			this.mode = mode;
			this[mode].init.apply(this[mode], args);
			
			return true;
		},
		getModes: function(){
			return Object.keys(this).filter(function(key){
				return /_mode$/.test(key);
			}).map(function(key){
				return key.replace(/_mode$/, '');
			});
		},
		getMode: function(){
			return {
				mode: this.mode.replace('_mode', ''),
				x: this[this.mode].x,
				y: this[this.mode].y
			};
		},
		
		getX: function(x){
			return this[this.mode].getX(x < 0 ? 0 : x)|0;
		},
		getXFromPX: function(x){
			return this[this.mode].getXFromPX(x < 0 ? 0 : x);
		},
		getY: function(y){
			return this[this.mode].getY(y < 0 ? 0 : y)|0;
		},
		getYFromPX: function(y){
			return this[this.mode].getYFromPX(y < 0 ? 0 : y);
		},
		
		getWidth: function(width){
			return this[this.mode].getX(width < this[this.mode].min ? this[this.mode] : width)|0;
		},
		getWidthFromPX: function(width){
			return this[this.mode].getXFromPX(width < 0 ? 0 : width);
		},
		getHeight: function(height){
			return this[this.mode].getY(height < this[this.mode].min ? this[this.mode] : height)|0;
		},
		getHeightFromPX: function(height){
			return this[this.mode].getYFromPX(height < 0 ? 0 : height);
		},
		
		getDebugInfo: function(){
			return this.getMode();
		}
	};
	
	
	// requestAnimationFrame and double-buffering
	var RAF = {
		handlers: [],
		id: null,
		data_default: {
			last: null,
			now: null,
			delta: 0,
			delta_avg: 0,
			
			changed: CHANGED,
			
			fps: 0,
			fps_shown: 0,
			fps_total: 0,
			fps_shown_total: 0,
			
			fps_updated: true,
			fps_ellapsed: 0,
			fps_count: 0,
			fps_shown_count: 0,
			
			last_raf_time: 0
		},
		data: {},
		fn: function(timestamp){
			RAF.data.last = RAF.data.now || performance.now();
			RAF.data.now = timestamp || performance.now();
			RAF.data.delta = Math.abs(RAF.data.now - RAF.data.last);
			RAF.data.fps_ellapsed += RAF.data.delta;
			RAF.data.changed = CHANGED;
			
			RAF.data.fps_total++;
			
			// https://dsp.stackexchange.com/questions/811/determining-the-mean-and-standard-deviation-in-real-time#comment175756_1187
			RAF.data.delta_avg += (RAF.data.delta - RAF.data.delta_avg) / RAF.data.fps_total;
			
			if(
				RAF.data.fps_ellapsed <= 999
				&& RAF.data.delta <= 999
			)
			{
				RAF.data.fps_count++;
				RAF.data.fps_updated = false;
			}
			else
			{
				if(RAF.data.delta <= 999)
				{
					
					RAF.data.fps = RAF.data.fps_count;
					RAF.data.fps_shown = RAF.data.fps_shown_count;
				}
				else
				{
					RAF.data.fps = 0;
					RAF.data.fps_shown = 0;
				}
				
				RAF.data.fps_ellapsed = 0;
				RAF.data.fps_count = 1;
				RAF.data.fps_shown_count = 0;
				RAF.data.fps_updated = true;
			}
			
			var copy = {
				last: RAF.data.last,
				now: RAF.data.now,
				delta: RAF.data.delta,
				delta_avg: RAF.data.delta_avg,
				fps: RAF.data.fps,
				fps_total: RAF.data.fps_total,
				fps_shown: RAF.data.fps_shown,
				fps_shown_total: RAF.data.fps_shown_total,
				fps_updated: RAF.data.fps_updated,
				changed: RAF.data.changed,
				last_raf_time: RAF.data.last_raf_time
			};
			
			Array.from(RAF.handlers).forEach(function(fn){
				fn && fn(copy, EXPORTED);
			});
			
			if(CHANGED && (
				!SETTINGS.canvas.frameskip
				|| !(RAF.data.fps_count % (SETTINGS.canvas.frameskip + 1))
			))
			{
				if(window.devicePixelRatio > 1 && !SETTINGS.canvas.lowpower)
				{
					canvas_ctx.drawImage(
						buffer, 0, 0,
						(buffer.width / window.devicePixelRatio)|0,
						(buffer.height / window.devicePixelRatio)|0
					);
				}
				else
				{
					canvas_ctx.drawImage(buffer, 0, 0);
				}
				
				CHANGED = false;
				RAF.data.fps_shown_count++;
				RAF.data.fps_shown_total++;
			}
			
			RAF.data.last_raf_time = performance.now() - timestamp;
			
			RAF.id = window.requestAnimationFrame(RAF.fn);
		},
		reset: function(){
			if(RAF.id)
			{
				window.cancelAnimationFrame(RAF.id);
			}
			
			RAF.handlers.length = 0;
			RAF.data = Object.assign({}, RAF.data_default);
		}
	};
	
	
	var DEBUG = {
		holder: document.createElement('div'),
		fps_elem: document.createElement('p'),
		frameskip_elem: document.createElement('p'),
		lowpower_elem: document.createElement('p'),
		can_update_elem: document.createElement('p'),
		coord_mode_elem: document.createElement('p'),
		buffer_elem: document.createElement('p'),
		buffer_info_elem: document.createElement('p'),
		
		details_fps: document.createElement('details'),
		summary_fps: document.createElement('summary'),
		
		details_ctx: document.createElement('details'),
		summary_ctx: document.createElement('summary'),
		
		spsheets: {
			data: [],
			last_len: 0,
			holder: document.createElement('div')
		},
		classes: {
			details: 'border border-secondary rounded my-2 p-1'
		},
		init: function(){
			DEBUG.holder.id = 'm-canvas-debug';
			DEBUG.holder.className = 'my-3';
			DEBUG.holder.textContent = 'DEBUG INFO:';
			
			
			DEBUG.summary_fps.textContent = 'FPS information';
			DEBUG.details_fps.className = DEBUG.classes.details;
			
			DEBUG.details_fps.appendChild(DEBUG.summary_fps);
			DEBUG.details_fps.appendChild(DEBUG.fps_elem);
			DEBUG.details_fps.appendChild(DEBUG.frameskip_elem);
			DEBUG.details_fps.appendChild(DEBUG.lowpower_elem);
			DEBUG.details_fps.appendChild(DEBUG.can_update_elem);
			
			
			
			DEBUG.summary_ctx.textContent = 'Context information';
			DEBUG.details_ctx.className = DEBUG.classes.details;
			
			DEBUG.details_ctx.appendChild(DEBUG.summary_ctx);
			DEBUG.details_ctx.appendChild(DEBUG.coord_mode_elem);
			DEBUG.details_ctx.appendChild(DEBUG.buffer_elem);
			DEBUG.details_ctx.appendChild(DEBUG.buffer_info_elem);
			
			
			
			DEBUG.holder.appendChild(DEBUG.details_fps);
			DEBUG.holder.appendChild(DEBUG.details_ctx);
		},
		reset: function(){
			if(buffer.parentNode)
			{
				buffer.removeAttribute('style');
				buffer.parentNode.removeChild(buffer);
			}
			
			if(DEBUG.holder.parentNode)
			{
				DEBUG.holder.parentNode.removeChild(DEBUG.holder);
			}
			
			DEBUG.spsheets.data.length = 0;
			DEBUG.spsheets.last_len = 0;
			while(DEBUG.spsheets.holder.firstChild)
			{
				DEBUG.spsheets.holder.removeChild(DEBUG.spsheets.holder.firstChild);
			}
		},
		show: function(){
			var ctx_text = buffer.width + 'x' + buffer.height;
			
			DEBUG.summary_ctx.textContent = 'Context information (' + ctx_text + ')';
			
			DEBUG.buffer_elem.textContent = 'Buffer size: ' + ctx_text
				+ ' (DPR: ' + window.devicePixelRatio + ')'
				+ (window.devicePixelRatio > 1 && !SETTINGS.canvas.lowpower
					? '\nOriginal size: '
						+ (buffer.width / window.devicePixelRatio)
						+ 'x'
						+ (buffer.height / window.devicePixelRatio)
					: ''
				);
			
			buffer.setAttribute('style', canvas.getAttribute('style'));
			
			// DEBUG.holder.appendChild(buffer);
			DEBUG.details_ctx.appendChild(buffer);
			DEBUG.holder.appendChild(DEBUG.spsheets.holder);
			
			div.appendChild(DEBUG.holder);
			
			RAF.handlers.push(DEBUG.update);
		},
		update: function(data){
			var fps_text = (data.fps ? data.fps_shown : '--') + '/' + (data.fps || '--');
			
			DEBUG.summary_fps.textContent = 'FPS information (' + fps_text + ')';
			
			DEBUG.fps_elem.textContent = 'Framerate: '
				+ fps_text + ' (Total: ' + data.fps_shown_total + '/' + data.fps_total + ')\n'
				+ 'Frametime: ' + data.delta.toFixed(1) + 'ms (Avg: ' + data.delta_avg.toFixed(1) + 'ms)\n'
				+ 'RAF time: ' + data.last_raf_time.toFixed(1) + 'ms';
			
			DEBUG.frameskip_elem.textContent = 'Frameskip: ' + SETTINGS.canvas.frameskip;
			
			DEBUG.lowpower_elem.textContent = 'Low power: ' + SETTINGS.canvas.lowpower
				+ (SETTINGS.canvas.lowpower && window.devicePixelRatio > 1
					? '\n⚠️ All text may show blurry'
					: ''
				);
			
			DEBUG.can_update_elem.textContent = 'Updates suspended: ' + (!SETTINGS.canvas.can_update);
			
			var coord_debug_info = COORD_MODE.getDebugInfo();
			DEBUG.coord_mode_elem.textContent = 'Coord mode: ' + coord_debug_info.mode + (
				coord_debug_info.x
					? ' - ' + coord_debug_info.x + 'x' + coord_debug_info.y
					: ''
			);
			
			DEBUG.buffer_info_elem.textContent = 'CTX info:\n'
				+ 'font: ' + ctx.font + '\n'
				+ 'fillStyle: ' + ctx.fillStyle + '\n'
				+ 'strokeStyle: ' + ctx.strokeStyle;
			
			// draw spritesheets
			if(DEBUG.spsheets.data.length > DEBUG.spsheets.last_len)
			{
				var index = DEBUG.spsheets.data.length - 1;
				var count = DEBUG.spsheets.data.length - DEBUG.spsheets.last_len;
				
				DEBUG.spsheets.last_len = DEBUG.spsheets.data.length;
				
				DEBUG.spsheets.data.slice(index, count).forEach(function(data){
					// console.log(data);
					
					var details = document.createElement('details');
					var summary = document.createElement('summary');
					
					details.appendChild(summary);
					details.className = DEBUG.classes.details;
					
					var p = document.createElement('p');
					details.appendChild(p);
					
					if(data.error)
					{
						summary.textContent = '❌ Spritesheet';
						
						p.textContent = 'Failed to load the URL:\n' + data.url;
					}
					else
					{
						summary.textContent = '✔️ Spritesheet (' + data.image.width + 'x' + data.image.height + ')';
						
						var img = document.createElement('img');
						img.src = data.url;
						
						details.appendChild(img);
						
						var text = [
							'Sprite size: ' + data.width + 'x' + data.height,
							'Usable area: ' + data.widthSheet + 'x' + data.heightSheet,
							'Number of sprites: ' + data.length,
							'Sprites per column: ' + data.cols,
							'Sprites per row: ' + data.rows
						];
						
						p.textContent = text.join('\n');
					}
					
					DEBUG.spsheets.holder.appendChild(details);
				});
			}
		},
		
		addSpriteSheet: function(spritesheet){
			DEBUG.spsheets.data.push(spritesheet);
		}
	};
	
	
	var methods = {
		setFrameskip: function(num){
			SETTINGS.canvas.frameskip = num;
		},
		getFrameskip: function(){
			return SETTINGS.canvas.frameskip;
		},
		
		getWidth: function(){
			return window.devicePixelRatio > 1 && !SETTINGS.canvas.lowpower
				? (canvas.width / window.devicePixelRatio)|0
				: canvas.width;
		},
		getHeight: function(){
			return window.devicePixelRatio > 1 && !SETTINGS.canvas.lowpower
				? (canvas.height / window.devicePixelRatio)|0
				: canvas.height;
		},
		
		setFillStyle: function(str){
			ctx.fillStyle = str;
		},
		getFillStyle: function(){
			return ctx.fillStyle;
		},
		setStrokeStyle: function(str){
			ctx.strokeStyle = str;
		},
		getStrokeStyle: function(){
			return ctx.strokeStyle;
		},
		setFont: function(str){
			ctx.font = str;
		},
		getFont: function(){
			return ctx.font;
		},
		setLineWidth: function(width){
			ctx.lineWidth = COORD_MODE.getWidth(width);
		},
		getLineWidth: function(){
			return COORD_MODE.getWidthFromPX(ctx.lineWidth);
		},
		
		fillRect: function(x, y, width, height, style){
			CHANGED = SETTINGS.canvas.can_update;
			
			var old_style = ctx.fillStyle;
			
			if(style)
			{
				ctx.fillStyle = style;
			}
			
			ctx.fillRect(x, y, width, height);
			ctx.fillStyle = old_style;
		},
		
		drawText: function(x, y, text, max_width, font, style, stroke){
			CHANGED = SETTINGS.canvas.can_update;
			
			var old_font = ctx.font;
			var old_style = ctx.fillStyle;
			var old_stroke = ctx.strokeStyle;
			
			if(font)
			{
				ctx.font = font;
			}
			
			if(style)
			{
				ctx.fillStyle = style;
			}
			
			if(stroke && stroke !== 'true')
			{
				ctx.strokeStyle = stroke;
			}
			
			ctx.fillText(text, x, y, max_width);
			
			if(stroke && stroke === 'true')
			{
				ctx.strokeText(text, x, y, max_width);
			}
			
			ctx.font = old_font;
			ctx.fillStyle = old_style;
			ctx.strokeStyle = old_stroke;
		},
		
		measureText: function(text, font){
			font = (font || ctx.font).trim();
			
			text_measurer_holder.style.setProperty('--font', font);
			text_measurer.textContent = text;
			
			var size = text_measurer.getBoundingClientRect();
			var size_holder = text_measurer_holder.getBoundingClientRect();
			
			var width = Math.ceil(size.width);
			var height = Math.ceil(size.height);
			
			var holder_height = Math.ceil(size_holder.height);
			
			var translateY = holder_height - height;
			
			var result = {
				length: text.length,
				width: COORD_MODE.getWidthFromPX(width),
				width_px: width,
				height: COORD_MODE.getHeightFromPX(holder_height),
				height_px: holder_height,
				font: font,
				translateX: 0,
				translateX_px: 0,
				translateY: COORD_MODE.getYFromPX(translateY),
				translateY_px: translateY,
				centerX: 0,
				centerX_px: 0,
				centerY: 0,
				centerY_px: 0
			};
			
			result.centerX = result.width / 2;
			result.centerX_px = result.width >> 1;
			result.centerY = result.height / 2;
			result.centerY_px = result.height >> 1;
			
			return result;
		},
		
		
		
		drawLine: function(x1, y1, x2, y2, width, stroke){
			var old_stroke = ctx.strokeStyle;
			var old_linewidth = ctx.lineWidth;
			
			if(stroke)
			{
				ctx.strokeStyle = stroke;
			}
			
			if(width)
			{
				ctx.lineWidth = width;
			}
			
			
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			
			
			ctx.strokeStyle = old_stroke;
			ctx.lineWidth = old_linewidth;
			
			CHANGED = SETTINGS.canvas.can_update;
		},
		
		drawArcRad: function(x, y, radius, startAngle, endAngle, counterclockwise, close, fill, stroke, strokeWidth){
			var old_fill = ctx.fillStyle;
			var old_stroke = ctx.strokeStyle;
			var old_linewidth = ctx.lineWidth;
			
			if(fill && fill !== 'true')
			{
				ctx.fillStyle = fill;
			}
			
			if(stroke && stroke !== 'true')
			{
				ctx.strokeStyle = stroke;
				
				if(strokeWidth)
				{
					ctx.lineWidth = strokeWidth;
				}
			}
			
			
			ctx.beginPath();
			ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
			
			if(close)
			{
				ctx.closePath();
			}
			
			if(fill)
			{
				ctx.fill();
			}
			
			if(stroke || (!fill && !stroke))
			{
				ctx.stroke();
			}
			
			
			ctx.fillStyle = old_fill;
			ctx.strokeStyle = old_stroke;
			ctx.lineWidth = old_linewidth;
			
			CHANGED = SETTINGS.canvas.can_update;
		},
		
		drawArcDeg: function(x, y, radius, startAngle, endAngle, counterclockwise, close, fill, stroke, strokeWidth){
			// https://www.rapidtables.com/convert/number/degrees-to-radians.html
			var ratio = 0.01745329252;
			
			return methods.drawArcRad(x, y, radius, startAngle * ratio, endAngle * ratio, counterclockwise, close, fill, stroke, strokeWidth);
		},
		
		drawCircle: function(x, y, radius, fill, stroke, strokeWidth){
			return methods.drawArcRad(x, y, radius, 0, 2 * Math.PI, false, false, fill, stroke, strokeWidth);
		},
		
		
		clearEverything: function(style){
			if(style)
			{
				methods.fillRect(0, 0, canvas.width, canvas.height, style);
			}
			else
			{
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			
			CHANGED = SETTINGS.canvas.can_update;
		},
		
		showFPSHandler: function(data){
			if(data.fps_updated)
			{
				div.setAttribute('data-currfps', data.fps || '--');
				div.setAttribute('data-shownfps', data.fps ? data.fps_shown : '--');
			}
		},
		showFPS: function(scale){
			div.style.setProperty('--fps-scale', scale);
			
			if(!!~RAF.handlers.indexOf(methods.showFPSHandler))
			{
				return;
			}
			
			RAF.handlers.unshift(methods.showFPSHandler);
			
			div.setAttribute('data-showfps', 'true');
			div.setAttribute('data-currfps', RAF.data.fps || '--');
			div.setAttribute('data-shownfps', '--');
		},
		hideFPS: function(){
			div.setAttribute('data-showfps', 'false');
			div.setAttribute('data-currfps', '--');
			div.setAttribute('data-shownfps', '--');
			
			div.style.setProperty('--fps-scale', '1');
			
			var index = RAF.handlers.indexOf(methods.showFPSHandler);
			
			if(!~index)
			{
				return;
			}
			
			RAF.handlers.splice(index, 1);
		},
		
		onclick: function(fn){
			canvas.onclick = function(e){
				var data = {
					trusted: e.isTrusted,
					touch: false,
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
					force: 1.0,
					alt: e.altKey,
					meta: e.metaKey,
					shift: e.shiftKey,
					ctrl: e.ctrlKey
				};
				
				fn(data, EXPORTED);
			};
		},
		onmove: function(fn){
			canvas.onmousemove = function(e){
				var data = {
					trusted: e.isTrusted,
					touch: false,
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
					force: 1.0,
					alt: e.altKey,
					meta: e.metaKey,
					shift: e.shiftKey,
					ctrl: e.ctrlKey
				};
				
				fn(data, EXPORTED);
			};
			
			if('ontouchmove' in canvas)
			{
				canvas.ontouchmove = function(e){
					if(!e.cancelable)
					{
						return;
					}
					
					e.preventDefault();
					
					var touch = e.touches[0] || e.changedTouches[0];
					var rect = canvas.getBoundingClientRect();
					
					var data = {
						trusted: e.isTrusted,
						touch: !!touch,
						x: touch ? touch.clientX - rect.x : e.offsetX,
						y: touch ? touch.clientY - rect.y : e.offsetY,
						lastX: null, lastY: null,
						button: 0,
						force: touch ? touch.force : null,
						alt: e.altKey,
						meta: e.metaKey,
						shift: e.shiftKey,
						ctrl: e.ctrlKey
					};
					
					fn(data, EXPORTED);
				};
			}
		},
		ondown: function(fn){
			canvas.onmousedown = function(e){
				var data = {
					trusted: e.isTrusted,
					touch: false,
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
					force: 1.0,
					alt: e.altKey,
					meta: e.metaKey,
					shift: e.shiftKey,
					ctrl: e.ctrlKey
				};
				
				fn(data, EXPORTED);
			};
			
			if('ontouchstart' in canvas)
			{
				canvas.ontouchstart = function(e){
					if(!e.cancelable)
					{
						return;
					}
					
					e.preventDefault();
					
					var touch = e.touches[0] || e.changedTouches[0];
					var rect = canvas.getBoundingClientRect();
					
					var data = {
						trusted: e.isTrusted,
						touch: !!touch,
						x: touch ? touch.clientX - rect.x : e.offsetX,
						y: touch ? touch.clientY - rect.y : e.offsetY,
						lastX: null, lastY: null,
						button: 0,
						force: touch ? touch.force : null,
						alt: e.altKey,
						meta: e.metaKey,
						shift: e.shiftKey,
						ctrl: e.ctrlKey
					};
					
					fn(data, EXPORTED);
				};
			}
		},
		onup: function(fn){
			canvas.onmouseup = function(e){
				var data = {
					trusted: e.isTrusted,
					touch: false,
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
					force: 1.0,
					alt: e.altKey,
					meta: e.metaKey,
					shift: e.shiftKey,
					ctrl: e.ctrlKey
				};
				
				fn(data, EXPORTED);
			};
			
			
			if('ontouchend' in canvas)
			{
				canvas.ontouchend = function(e){
					if(!e.cancelable)
					{
						return;
					}
					
					e.preventDefault();
					
					var touch = e.touches[0] || e.changedTouches[0];
					var rect = canvas.getBoundingClientRect();
					
					var data = {
						trusted: e.isTrusted,
						touch: !!touch,
						x: touch ? touch.clientX - rect.x : e.offsetX,
						y: touch ? touch.clientY - rect.y : e.offsetY,
						lastX: null, lastY: null,
						button: 0,
						force: touch ? touch.force : null,
						alt: e.altKey,
						meta: e.metaKey,
						shift: e.shiftKey,
						ctrl: e.ctrlKey
					};
					
					fn(data, EXPORTED);
				};
			}
		},
		
		ontick_int: null,
		ontick: function(fn, ms){
			if(methods.ontick_int)
			{
				return false;
			}
			
			var data = {
				last: null,
				now: null,
				delta: 0
			};
			
			methods.ontick_int = setInterval(function(){
				data.last = data.now;
				data.now = performance.now();
				data.delta = data.now - data.last;
				
				var copy = Object.assign({}, data);
				
				fn(copy, EXPORTED);
			}, ms);
			
			return true;
		},
		
		onframe: function(fn){
			RAF.handlers.push(fn);
		},
		
		getImage: function(x, y, width, height){
			var copy = document.createElement('canvas');
			
			copy.width = width;
			copy.height = height;
			
			var copy_ctx = copy.getContext('2d');
			copy_ctx.drawImage(buffer, x, y, width, height, 0, 0, width, height);
			
			copy_ctx = null;
			
			return copy;
		},
		
		saveImage: function(name, x, y, width, height){
			// https://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
			var copy = methods.getImage(x, y, width, height);
			var a = document.createElement('a');
			
			a.href = copy.toDataURL('image/png').replace('image/png', 'image/octet-stream');
			
			if(name)
			{
				a.download = name;
			}
			
			a.click();
		},
		
		drawImage: function(image, x, y){
			CHANGED = SETTINGS.canvas.can_update;
			
			return ctx.drawImage(image, x, y);
		},
		
		drawImagePart: function(source_image, source_x, source_y, width, height, x, y){
			CHANGED = SETTINGS.canvas.can_update;
			
			return ctx.drawImage(source_image, source_x, source_y, width, height, x, y, width, height);
		},
		
		createSpritesheet: function(url, sprite_width, sprite_height, fn){
			var image_canvas = document.createElement('canvas');
			var image_ctx = image_canvas.getContext('2d');
			
			var sprites = [];
			var sprites_map = Object.create(null);
			
			var onload = function onload(){
				var sprites_cols = (image_canvas.width / sprite_width) | 0;
				var sprites_rows = (image_canvas.height / sprite_height) | 0;
				
				if(sprites_cols && sprites_rows)
				{
					for(var i = 0, key = 0; i < sprites_rows; i++)
					{
						for(var j = 0; j < sprites_cols; j++)
						{
							sprites[key] = {
								x: j * sprite_width,
								y: i * sprite_height,
								width: sprite_width,
								height: sprite_height,
								key: key
							};
							
							key++;
						}
					}
				}
				
				var data = Object.defineProperties(Object.create(null), {
					error: {
						value: false,
						enumerable: true
					},
					width: {
						value: sprite_width,
						enumerable: true
					},
					widthSheet: {
						value: sprites_cols * sprite_width,
						enumerable: true
					},
					height: {
						value: sprite_height,
						enumerable: true
					},
					heightSheet: {
						value: sprites_rows * sprite_height,
						enumerable: true
					},
					length: {
						value: sprites.length,
						enumerable: true
					},
					cols: {
						value: sprites_cols,
						enumerable: true
					},
					rows: {
						value: sprites_rows,
						enumerable: true
					},
					image: {
						value: image_canvas,
						enumerable: false
					},
					url: {
						value: (typeof url === 'string' ? url : image_canvas.toDataURL('image/png')),
						enumerable: false
					},
					getSprite: {
						value: Object.assign(function getSprite(key){
							var sprite = null;
							if(typeof key === 'string' && key in sprites_map)
							{
								sprite = sprites[sprites_map[key]];
							}
							else
							{
								sprite = sprites[key];
							}
							
							return sprite || null;
						}, {
							__doc__: 'Returns the information of a single sprite based on the $key'
						}),
						enumerable: true
					},
					drawSprite: {
						value: Object.assign(function drawSprite(key, x, y){
							var sprite = data.getSprite(key);
							if(!sprite)
							{
								return null;
							}
							
							methods.drawImagePart(
								image_canvas,
								sprite.x, sprite.y,
								sprite.width, sprite.height,
								COORD_MODE.getX(x),
								COORD_MODE.getY(y)
							);
							
							return true;
						}, {
							__doc__: 'Draws the sprite $key into the canvas at $x,$y'
						}),
						enumerable: true
					},
					drawSpriteLine: {
						value: Object.assign(function drawSpriteLine(keys, x, y){
							var sprites = [];
							
							x = COORD_MODE.getX(x);
							y = COORD_MODE.getY(y);
							
							if(typeof keys === 'string')
							{
								Array.from(keys).forEach(function(key){
									var sprite = data.getSprite(key);
									if(sprite)
									{
										sprites.push(sprite);
									}
								});
							}
							else
							{
								Object.keys(keys).forEach(function(key){
									var sprite = data.getSprite(keys[key]);
									if(sprite)
									{
										sprites.push(sprite);
									}
								});
							}
							
							sprites.forEach(function(sprite, i){
								methods.drawImagePart(
									image_canvas,
									sprite.x, sprite.y,
									sprite.width, sprite.height,
									x + (i * sprite.width), y
								);
							});
							
							return true;
						}, {
							__doc__: [
								'Draws the sprite $key into the canvas at $x,$y',
								'Continues drawing until the end of the $keys, always staying on the same $y line'
							]
						}),
						enumerable: true
					},
					addMap:  {
						value: Object.assign(function addMap(map){
							if(typeof map === 'string')
							{
								Array.from(map).forEach(function(key, i){
									sprites_map[key] = i;
								});
							}
							else
							{
								Object.keys(map).forEach(function(key){
									sprites_map[key] = map[key];
								});
							}
						}, {
							__doc__: [
								'Adds name mappings to sprite numbers',
								'The argument $map must be an array or string'
							]
						}),
						enumerable: true
					},
					getSprites:  {
						value: Object.assign(function getSprites(){
							return Object.assign([], sprites);
						}, {
							__doc__: 'Returns a copy of the sprites list'
						}),
						enumerable: true
					},
					getSpritesMap:  {
						value: Object.assign(function getSpritesMap(){
							return Object.assign({}, sprites_map);
						}, {
							__doc__: 'Returns a copy of the sprite key mappings'
						}),
						enumerable: true
					}
				});
				
				DEBUG.addSpriteSheet(data);
				
				if(fn)
				{
					fn(data, EXPORTED);
				}
				
				return data;
			};
			
			var onerror = function onerror(e){
				var data = Object.defineProperties(Object.create(null), {
					error: {
						value: true,
						enumerable: true
					},
					image: {
						value: image,
						enumerable: false
					},
					url: {
						value: url,
						enumerable: false
					},
					exception: {
						value: e,
						enumerable: true
					}
				});
				
				DEBUG.addSpriteSheet(data);
				
				if(fn)
				{
					fn(data, EXPORTED);
				}
				
				return error;
			};
			
			
			if(
				url instanceof Image
				|| url.tagName === 'IMG'
				|| url.tagName === 'CANVAS'
			)
			{
				image_canvas.width = url.naturalWidth || url.width;
				image_canvas.height = url.naturalHeight || url.height;
				
				try
				{
					image_ctx.drawImage(url, 0, 0);
					
					return onload();
				}
				catch(e)
				{
					return onerror(e);
				}
			}
			else
			{
				var image = new Image();
				
				image.onload = function(){
					image_canvas.width = image.naturalWidth || image.width;
					image_canvas.height = image.naturalHeight || image.height;
					
					image_ctx.drawImage(image, 0, 0);
					
					onload();
				};
				
				image.onerror = function(){
					onerror(null);
				};
				
				image.src = url.toString();
			}
			
			/*if(
				url instanceof Image
				|| url.tagName === 'IMG'
			)
			{
				image.src = url.src;
			}
			else if(url.tagName === 'CANVAS')
			{
				image.src = url.toDataURL('image/png');
			}
			else
			{
				image.src = url.toString();
			}*/
		},
		
		suspendUpdates: function(){
			SETTINGS.canvas.can_update = false;
		},
		resumeUpdates: function(){
			SETTINGS.canvas.can_update = true;
			CHANGED = true;
		},
		
		saveState: function(){
			var state = {};
			
			for(var key in SAVED_STATES_DEFAULTS)
			{
				state[key] = ctx[key];
			}
			
			
			SAVED_STATES.push(state);
		},
		restoreState: function(){
			if(!SAVED_STATES.length)
			{
				return;
			}
			
			var state = SAVED_STATES.shift();
			
			methods.setState(state);
		},
		setState: function(state){
			for(var key in state)
			{
				if(state[key] !== ctx[key])
				{
					ctx[key] = state[key];
				}
			}
		},
		
		showDebug: function(){
			DEBUG.show();
		},
		reset: function(){
			methods.suspendUpdates();
			
			methods.hideFPS();
			
			RAF.reset();
			
			methods.resumeUpdates();
			
			if(methods.ontick_int)
			{
				clearInterval(methods.ontick_int);
				methods.ontick_int = null;
			}
			
			SAVED_STATES.length = 0;
			methods.setState(SAVED_STATES_DEFAULTS);
			
			canvas.onclick = null;
			canvas.onmousemove = null;
			canvas.onmousedown = null;
			canvas.onmouseup = null;
			
			if('ontouchend' in canvas)
			{
				canvas.ontouchstart = null;
				canvas.ontouchmove = null;
				canvas.ontouchend = null;
			}
			
			COORD_MODE.reset();
			DEBUG.reset();
		}
	};
	
	var EXPORTS = Object.defineProperties(Object.create(null), {
		showDebug: {
			value: Object.assign(function showDebug(){
				methods.showDebug();
			}, {
				__doc__: [
					'Shows extra debug information',
					'This can\'t be hidden, once shown'
				]
			}),
			enumerable: true
		},
		
		saveState: {
			value: Object.assign(function saveState(){
				methods.saveState();
			}, {
				__doc__: [
					'Saves the state of the canvas',
					'This includes the font, stroke, fill, line width and more',
					'This does not affect some other settings, like frameskip and coordinate size'
				]
			}),
			enumerable: true
		},
		restoreState: {
			value: Object.assign(function restoreState(){
				methods.restoreState();
			}, {
				__doc__: [
					'Restores to a previously saved state of the canvas',
					'This includes the font, stroke, fill, line width and more',
					'This does not affect some other settings, like frameskip and coordinate size'
				]
			}),
			enumerable: true
		},
		
		
		onmove: {
			value: Object.assign(function onmove(fn){
				if(!fn || typeof fn !== 'function')
				{
					return false;
				}
				
				methods.onmove(fn);
				
				return true;
			}, {
				__doc__: [
					'Sets the function to detect mouse movement',
					'The first argument is the triggered event',
					'The second argument is the $canvas'
				]
			}),
			enumerable: true
		},
		onclick: {
			value: Object.assign(function onclick(fn){
				if(!fn || typeof fn !== 'function')
				{
					return false;
				}
				
				methods.onclick(fn);
				
				return true;
			}, {
				__doc__: [
					'Sets the function to detect mouse clicks',
					'The first argument is the triggered event',
					'The second argument is the $canvas'
				]
			}),
			enumerable: true
		},
		ondown: {
			value: Object.assign(function ondown(fn){
				if(!fn || typeof fn !== 'function')
				{
					return false;
				}
				
				methods.ondown(fn);
				
				return true;
			}, {
				__doc__: [
					'Sets the function to detect when the mouse button is down',
					'The first argument is the triggered event',
					'The second argument is the $canvas'
				]
			}),
			enumerable: true
		},
		onup: {
			value: Object.assign(function onup(fn){
				if(!fn || typeof fn !== 'function')
				{
					return false;
				}
				
				methods.onup(fn);
				
				return true;
			}, {
				__doc__: [
					'Sets the function to detect when the mouse button is up',
					'The first argument is the triggered event',
					'The second argument is the $canvas'
				]
			}),
			enumerable: true
		},
		ontick: {
			value: Object.assign(function ontick(fn, ms){
				if(ms < 10 || methods.ontick_int || typeof fn !== 'function')
				{
					return false;
				}
				
				return methods.ontick(fn, ms);
			}, {
				__doc__: [
					'Runs the $fn every $ms',
					'The minimum time for $ms is 10ms'
				]
			}),
			enumerable: true
		},
		onframe: {
			value: Object.assign(function onframe(fn){
				if(typeof fn !== 'function')
				{
					return false;
				}
				
				methods.onframe(fn);
				return true;
			}, {
				__doc__: [
					'Runs the $fn every frame',
					'Multiple can be registered, and they will run from first to last',
					'This relies on window.requestAnimationFrame() and '
				]
			}),
			enumerable: true
		},
		onchange: {
			value: Object.assign(function onchange(fn){
				if(typeof fn !== 'function')
				{
					return false;
				}
				
				methods.onframe(function(data, obj){
					if(data.changed)
					{
						fn(data, obj);
					}
				});
				return true;
			}, {
				__doc__: [
					'Runs the $fn every frame',
					'Multiple can be registered, and they will run from first to last'
				]
			}),
			enumerable: true
		},
		
		suspendUpdates: {
			value: Object.assign(function suspendUpdates(){
				return methods.suspendUpdates();
			}, {
				__doc__: [
					'Stops updating the visible canvas',
					'All drawing operations will be only done in the buffer'
				]
			}),
			enumerable: true
		},
		resumeUpdates: {
			value: Object.assign(function resumeUpdates(){
				return methods.resumeUpdates();
			}, {
				__doc__: [
					'Resumes updating the visible canvas',
					'On the next frame available, the changes in the buffer will be displayed in the visible canvas'
				]
			}),
			enumerable: true
		},
		
		setFrameskip: {
			value: Object.assign(function setFrameskip(num){
				return methods.setFrameskip(num < 0 ? 0 : (num > 10 ? 10 : num));
			}, {
				__doc__: [
					'Sets the number of frames to skip',
					'All changes will be in a buffered canvas, outside the screen',
					'Takes a value between 0 (no skip) and 10 (renders every 11th frame, because it skips 10 frames)'
				]
			}),
			enumerable: true
		},
		getFrameskip: {
			value: Object.assign(function getFrameskip(){
				return methods.getFrameskip();
			}, {
				__doc__: 'Gets the number of frames that are skipped'
			}),
			enumerable: true
		},
		
		getWidth: {
			value: Object.assign(function getWidth(){
				return methods.getWidth();
			}, {
				__doc__: 'Gets the width of the canvas'
			}),
			enumerable: true
		},
		getHeight: {
			value: Object.assign(function getHeight(){
				return methods.getHeight();
			}, {
				__doc__: 'Gets the height of the canvas'
			}),
			enumerable: true
		},
		
		getRandomColor: {
			value: Object.assign(function getRandomColor(alpha){
				return 'rgb' + (alpha ? 'a' : '') + '(' + (Math.floor(Math.random() * 256))
					+ ',' + (Math.floor(Math.random() * 256))
					+ ',' + (Math.floor(Math.random() * 256))
					+ (alpha ? ',' + Math.random() : '')
				+ ')';
			}, {
				__doc__: [
					'Gets a random color, usable in many places',
					'If the $alpha variable is set to true, returns a color with an alpha component',
					'The alpha will be between 0 and 1 (excluded)'
				]
			}),
			enumerable: true
		},
		
		setFillStyle: {
			value: Object.assign(function setFillStyle(str){
				return methods.setFillStyle(str.toString());
			}, {
				__doc__: [
					'Sets the fill style for the canvas',
					'Default value: ' + SAVED_STATES_DEFAULTS.fillStyle
				]
			}),
			enumerable: true
		},
		getFillStyle: {
			value: Object.assign(function getFillStyle(){
				return methods.getFillStyle();
			}, {
				__doc__: 'Gets the fill style for the canvas'
			}),
			enumerable: true
		},
		setStrokeStyle: {
			value: Object.assign(function setStrokeStyle(str){
				return methods.setStrokeStyle(str.toString());
			}, {
				__doc__: [
					'Sets the stroke style for the canvas',
					'Default value: ' + SAVED_STATES_DEFAULTS.strokeStyle
				]
			}),
			enumerable: true
		},
		getStrokeStyle: {
			value: Object.assign(function getStrokeStyle(){
				return methods.getStrokeStyle();
			}, {
				__doc__: 'Gets the stroke style for the canvas'
			}),
			enumerable: true
		},
		setFontStyle: {
			value: Object.assign(function setFontStyle(str){
				return methods.setFont(str.toString());
			}, {
				__doc__: [
					'Sets the font style for the canvas',
					'Default value: ' + SAVED_STATES_DEFAULTS.font
				]
			}),
			enumerable: true
		},
		getFontStyle: {
			value: Object.assign(function getFontStyle(){
				return methods.getFont();
			}, {
				__doc__: 'Gets the font style for the canvas'
			}),
			enumerable: true
		},
		
		getLineWidth: {
			value: Object.assign(function getLineWidth(){
				return methods.getLineWidth();
			}, {
				__doc__: [
					'Gets the width of the lines being drawn on the canvas',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		setLineWidth: {
			value: Object.assign(function setLineWidth(width){
				methods.setLineWidth(width);
			}, {
				__doc__: [
					'Sets the width of the lines being drawn on the canvas',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		fillRect: {
			value: Object.assign(function fillRect(x, y, width, height, style){
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				
				width = COORD_MODE.getWidth(width);
				height = COORD_MODE.getHeight(height);
				
				return methods.fillRect(x, y, width, height, style ? style.toString() : null);
			}, {
				__doc__: [
					'Creates a rectangle at $x,$y with $width,$height',
					'Takes an optional $style, which will be reset after drawing the rectangle',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		drawText: {
			value: Object.assign(function drawText(x, y, text, max_width, font, style, stroke){
				// return methods.fillRect(+x || 0, +y || 0, +width || 0, +height || 0, style ? style.toString() : null);
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				
				return methods.drawText(
					x, y, text.toString(),
					max_width
						? COORD_MODE.getWidth(max_width)
						: undefined,
					font ? font.toString() : null,
					style ? style.toString() : null,
					stroke ? stroke.toString() : null
				);
			}, {
				__doc__: [
					'Draws the $text at $x,$y',
					'Takes an optional $max_width, which will limit the width of the text when drawing',
					'Also takes an optional $font, which will be reset after drawing the text',
					'Also takes an optional $style, which will be reset after drawing the text',
					'Also takes an optional $stroke, which will be reset after drawing the text',
					'If $stroke is true, it will use the stroke style set by !CANVAS->setStrokeStyle()',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		measureText: {
			value: Object.assign(function measureText(text, font){
				return methods.measureText(text.toString(), font ? font.toString() : null);
			}, {
				__doc__: [
					'Measures the $text size, and returns an object with the width and height',
					'Takes an optional $font, which will be used to calculate the size instead of the one provided in !CANVAS->setFontStyle()',
					'It returns an object with the following keys:',
					' • font			Full font description (size, family and style)',
					' • length 		Number of characters of the text',
					' • width 		Width, in pixels and subpixels',
					' • height		Height, in pixels and subpixels',
					' • translateX	How many pixels and subpixels to move the text in the X axis',
					' • translateY	How many pixels and subpixels to move the text in the Y axis',
					'These translation values can be useful to determine how many pixels the characters "poke out" on each axis',
					'For example, the emoji ⭐ may have an height above the line height'
				]
			}),
			enumerable: true
		},
		
		
		drawLine: {
			value: Object.assign(function drawLine(x1, y1, x2, y2, width, stroke){
				x1 = COORD_MODE.getX(x1);
				y1 = COORD_MODE.getY(y1);
				x2 = COORD_MODE.getX(x2);
				y2 = COORD_MODE.getY(y2);
				
				return methods.drawLine(
					x1, y1, x2, y2,
					width ? COORD_MODE.getWidth(width) : null,
					stroke ? stroke.toString() : null
				);
			}, {
				__doc__: [
					'Draws a line from ($x1,$y1) to ($x2,$y2)',
					'Takes an optional $width, which will be reset after drawing',
					'Also takes an optional $stroke, which will be reset after drawing',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		
		drawArc: {
			value: Object.assign(function drawArc(x, y, radius, start_angle, end_angle, ccw, close, fill, stroke, stroke_width){
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				radius = COORD_MODE.getWidth(radius);
				
				return methods.drawArcRad(
					x, y, radius,
					start_angle, end_angle,
					!!ccw, !!close,
					fill ? fill.toString() : null,
					stroke ? stroke.toString() : null,
					stroke_width ? COORD_MODE.getWidth(stroke_width) : null
				);
			}, {
				__doc__: [
					'Draws an arc centered at ($x,$y) with the specified $radius',
					'The $start_angle and $end_angle are in RADIANS (for degrees, use !CANVAS->drawArcDeg)',
					'Takes an optional $ccw, which when set to true, will draw the arc counter-clockwise',
					'Also takes an optional $close, which when set to true, will close the arc',
					'Also takes an optional $fill, which will be reset after drawing',
					'Also takes an optional $stroke, which will be reset after drawing',
					'Also takes an optional $stroke_width, which will be reset after drawing',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		drawArcDeg: {
			value: Object.assign(function drawArcDeg(x, y, radius, start_angle, end_angle, ccw, close, fill, stroke, stroke_width){
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				radius = COORD_MODE.getWidth(radius);
				
				return methods.drawArcDeg(
					x, y, radius,
					start_angle, end_angle,
					!!ccw, !!close,
					fill ? fill.toString() : null,
					stroke ? stroke.toString() : null,
					stroke_width ? COORD_MODE.getWidth(stroke_width) : null
				);
			}, {
				__doc__: [
					'Draws an arc centered at ($x,$y) with the specified $radius',
					'The $start_angle and $end_angle are in DEGREES (for radians, use !CANVAS->drawArc)',
					'Takes an optional $ccw, which when set to true, will draw the arc counter-clockwise',
					'Also takes an optional $close, which when set to true, will close the arc',
					'Also takes an optional $fill, which will be reset after drawing',
					'Also takes an optional $stroke, which will be reset after drawing',
					'Also takes an optional $stroke_width, which will be reset after drawing',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		drawCircle: {
			value: Object.assign(function drawCircle(x, y, radius, fill, stroke, stroke_width){
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				radius = COORD_MODE.getWidth(radius);
				
				return methods.drawCircle(
					x, y, radius,
					fill ? fill.toString() : null,
					stroke ? stroke.toString() : null,
					stroke_width ? COORD_MODE.getWidth(stroke_width) : null
				);
			}, {
				__doc__: [
					'Draws a circle centered at ($x,$y) with the specified $radius',
					'Takes an optional $fill, which will be reset after drawing',
					'Also takes an optional $stroke, which will be reset after drawing',
					'Also takes an optional $stroke_width, which will be reset after drawing',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		
		clear: {
			value: Object.assign(function clear(style){
				return methods.clearEverything(style ? style.toString() : null);
			}, {
				__doc__: [
					'Clears the entire area of the canvas',
					'Takes an optional $style, which will be used to fill the area with'
				]
			}),
			enumerable: true
		},
		
		showFPS: {
			value: Object.assign(function showFPS(scale){
				return methods.showFPS(+scale > 0.1 ? +scale : 1);
			}, {
				__doc__: [
					'Shows a rough FPS counter',
					'Optionally, takes a scale value',
					'Any value below 0.1 will be ignored',
					'The FPS count won\'t be part of the generated canvas image',
					'This will display the number of drawn frames and the number of frames per second for the browser',
					'For example, a value of 0/60 means that 0 frames were drawn in the last second, but the code still ran 60 times a second',
					'Frames are rendered only if they have changes or if they weren\'t skipped (set by !CANVAS->setFrameskip())'
				]
			}),
			enumerable: true
		},
		hideFPS: {
			value: Object.assign(function hideFPS(){
				return methods.hideFPS();
			}, {
				__doc__: 'Hides the FPS counter'
			}),
			enumerable: true
		},
		
		
		createSpritesheet: {
			value: Object.assign(function createSpritesheet(url, width, height, fn){
				width = COORD_MODE.getWidth(width);
				height = COORD_MODE.getHeight(height);
				
				return methods.createSpritesheet(
					url, width, height,
					fn && typeof fn === 'function' ? fn : function(){}
				);
			}, {
				__doc__: [
					'Loads an image from $url and creates a spritesheet of sprites with $width and $height',
					'Pass a $function as the last argument, to be able to use the sprites after loaded',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		getImage: {
			value: Object.assign(function getImage(x, y, width, height){
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				
				width = COORD_MODE.getWidth(width);
				height = COORD_MODE.getHeight(height);
				
				return methods.getImage(x, y, width, height);
			}, {
				__doc__: [
					'Returns an image with the contents at $x,$y, and $width and $height',
					'This function returns an actual image, to be used with !CANVAS->drawImage()',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		saveImage: {
			value: Object.assign(function saveImage(name, x, y, width, height){
				var date = new Date();
				var format_number = function(number){
					return number < 10 ? '0' + number : number;
				};
				
				name = name !== undefined && name !== null
					? name.toString()
					: date.getFullYear()
						+ '-' + format_number(date.getMonth() + 1)
						+ '-' + format_number(date.getDate())
						+ '_' + format_number(date.getHours())
						+ '_' + format_number(date.getMinutes())
						+ '_' + format_number(date.getSeconds())
						+ '.png';
				
				x = x !== undefined && x !== null ? COORD_MODE.getX(x) : 0;
				y = y !== undefined && y !== null ? COORD_MODE.getY(y) : 0;
				
				width = width !== undefined && width !== null
					? COORD_MODE.getWidth(width)
					: methods.getWidth();
				
				height = height !== undefined && height !== null
					? COORD_MODE.getHeight(height)
					: methods.getHeight();
				
				return methods.saveImage(name, x, y, width, height);
			}, {
				__doc__: [
					'Saves the canvas as a .png image file',
					'Takes an optional $filename, used for the name of the file to save',
					'If no $filename is provided, the local date and time will be used for the name',
					'Takes an optional $x,$y, and an optional $width and $height',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		drawImage: {
			value: Object.assign(function drawImage(image, x, y){
				if(
					!(image instanceof Image)
					&& !(image.tagName === 'IMG')
					&& !(image.tagName === 'CANVAS')
				)
				{
					return false;
				}
				
				x = COORD_MODE.getX(x);
				y = COORD_MODE.getY(y);
				
				methods.drawImage(image, x, y);
				
				return true;
			}, {
				__doc__: [
					'Draws the $image at $x,$y',
					'This method respects the coordinates mode set in !CANVAS->setCoordMode()'
				]
			}),
			enumerable: true
		},
		
		setCoordMode: {
			value: Object.assign(function setCoordMode(mode, args){
				return COORD_MODE.setMode(
					mode.toString(),
					Array.isArray(args)
						? args
						: (args ? [args, args] : [])
				);
			}, {
				__doc__: 'Sets the coordinate mode'
			}),
			enumerable: true
		},
		getCoordModes: {
			value: Object.assign(function getCoordModes(){
				return COORD_MODE.getModes();
			}, {
				__doc__: 'Gets all available modes'
			}),
			enumerable: true
		},
		getCoordMode: {
			value: Object.assign(function getCoordMode(){
				return COORD_MODE.getMode();
			}, {
				__doc__: [
					'Gets the current coordinate mode',
					'Contains the mode name, x scale and y scale'
				]
			}),
			enumerable: true
		},
		getCoordX: {
			value: Object.assign(function getCoordX(x){
				return COORD_MODE.getXFromPX(x);
			}, {
				__doc__: 'Calculates the $x coordinate, for the specified coodinate mode'
			}),
			enumerable: true
		},
		getCoordY: {
			value: Object.assign(function getCoordY(y){
				return COORD_MODE.getYFromPX(y);
			}, {
				__doc__: 'Calculates the $y coordinate, for the specified coodinate mode'
			}),
			enumerable: true
		},
		getCoordWidth: {
			value: Object.assign(function getCoordWidth(width){
				return COORD_MODE.getWidthFromPX(width);
			}, {
				__doc__: 'Calculates the $width, for the specified coodinate mode'
			}),
			enumerable: true
		},
		getCoordHeight: {
			value: Object.assign(function getCoordHeight(height){
				return COORD_MODE.getHeightFromPX(height);
			}, {
				__doc__: 'Calculates the $height, for the specified coodinate mode'
			}),
			enumerable: true
		},
		
		getCenter: {
			value: Object.assign(function getCoordHeight(){
				var center_width = methods.getWidth() >> 1;
				var center_height = methods.getHeight() >> 1;
				
				return {
					x: COORD_MODE.getWidthFromPX(center_width),
					x_px: center_width,
					y: COORD_MODE.getWidthFromPX(center_height),
					y_px: center_height
				};
			}, {
				__doc__: 'Returns the center coordinates of the canvas'
			}),
			enumerable: true
		}
	});
	
	simply.module_register('canvas', {
		Exports: {
			'version': '1.0',
			'init': Object.assign(function canvas_init(width, height, bgcolor, lowpower){
				if(div.parentNode)
				{
					div.parentNode.removeChild(div);
				}
				
				SETTINGS.canvas = Object.assign(SETTINGS.canvas || {}, SETTINGS_DEFAULT);
				SETTINGS.canvas.lowpower = !!lowpower;
				
				if(window.devicePixelRatio > 1 && !SETTINGS.canvas.lowpower)
				{
					canvas.width = (width * window.devicePixelRatio)|0;
					canvas.height = (height * window.devicePixelRatio)|0;
					canvas_ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
					canvas.style.width = width + 'px';
					canvas.style.height = height + 'px';
					
					
					buffer.width = canvas.width;
					buffer.height = canvas.height;
					ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
				}
				else
				{
					canvas.removeAttribute('style');
					canvas.width = width;
					canvas.height = height;
					
					buffer.width = width;
					buffer.height = height;
				}
					
				
				methods.reset();
				methods.clearEverything(bgcolor || 'white');
				
				if(SETTINGS.output_element)
				{
					var hr = SETTINGS.output_element.querySelector('hr');
					if(hr && hr.nextSibling)
					{
						SETTINGS.output_element.insertBefore(div, hr.nextSibling);
					}
					else
					{
						SETTINGS.output_element.appendChild(div);
					}
				}
				
				EXPORTED = Object.assign({}, EXPORTS);
				
				if(lowpower)
				{
					EXPORTED.setFrameskip(+lowpower);
				}
				
				Object.defineProperty(EXPORTED, '__doc__', {
					value: canvas_init.__doc_export__
				});
				
				RAF.fn();
				
				return EXPORTED;
			}, {
				__doc__: [
					'Initializes a canvas, inside the output area',
					'It\'s required to pass a $width, $height and a $bgcolor',
					'Returns a custom 2d context object',
					'If $lowpower is set to true, it will ignore the devicePixelRatio and set a frameskip of 1',
					'If $lowpower is set to a number, it will be used as the frameskip value'
				],
				__doc_export__: [
					'Canvas module object',
					'All functions available: ' + Object.keys(EXPORTS).join('(), ') + '()'
				]
			}),
			__doc__: [
				'Canvas module',
				'Please run !CANVAS->init($width, $height, $bgcolor)',
				'Store the value on a variable for later use'
			]
		},
		Cleanup: function(){},
		Init: function(settings){
			Object.assign(SETTINGS, settings);
			SETTINGS.canvas = Object.assign(SETTINGS.canvas || {}, SETTINGS_DEFAULT);
			
			DEBUG.init();
		},
		CSS: [
			'#' + div.id + ' {',
				'--fps-scale: 1;',
				'position: relative;',
				'transform: translate3d(0, 0, 0);',
				'user-select: none;',
			'}',
			'#' + div.id + ':before {',
				'content: "";',
				'pointer-events: none;',
				'display: none;',
				'position: absolute;',
				'top: 0;',
				'left: 0;',
				'background: rgba(0,0,0,.5);',
				'font-size: 1rem;',
				'font-size: calc(var(--fps-scale, 1) * 1rem);',
				'font-family: monospace;',
				'color: #fff;',
				'padding: 0 .5rem;',
			'}',
			'#' + div.id + '[data-showfps="true"]:before {',
				'content: attr(data-shownfps) "/" attr(data-currfps);',
				'display: block;',
			'}',
			'#' + div.id + ' canvas {display: block}',
			'#' + div.id + ' .text-measurer-holder {',
				'display: block;',
				'pointer-events: none;',
				'visibility: hidden;',
				'position: absolute;',
				'top: 0;',
				'left: 0;',
				'width: 0 !important;',
				// 'height: 0 !important;',
				'max-width: 0 !important;',
				// 'max-height: 0 !important;',
				'overflow: hidden;',
				'z-index: -100;',
				// 'line-height: normal;',
				'margin: 0 !important;',
				'padding: 0 !important;',
				'font: var(--font, 10px sans-serif) !important;',
			'}',
			'#' + div.id + ' .text-measurer {',
				'display: inline;',
				'margin: 0 !important;',
				'padding: 0 !important;',
				'font: var(--font, 10px sans-serif) !important;',
				// 'line-height: normal;',
				'vertical-align: bottom;',
				'text-align: left;',
			'}',
			'#m-canvas-debug p {',
				'margin-bottom: 0 !important;',
			'}',
			'#m-canvas-debug details > img {',
				'width: 100%;',
				'max-width: 100%;',
				'image-rendering: pixelated;',
			'}',
		].join('\n')
	});
	
})(Function('return this')());
