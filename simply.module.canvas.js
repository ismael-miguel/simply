(function(window, undefined){
	'use strict';
	
	if(!window.simply)
	{
		throw new Error('window.simply is required to use this module');
	}
	
	var canvas = document.createElement('canvas');
	
	if(!canvas.getContext)
	{
		throw new Error('Canvas support is required to use this module');
	}
	var ctx = canvas.getContext('2d');
	
	
	
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
	
	div.appendChild(canvas);
	div.appendChild(text_measurer_holder);
	
	
	// ctx.globalCompositeOperation = 'destination-in';
	// console.log(ctx.globalCompositeOperation);
	ctx.imageSmoothingEnabled = false;
	ctx.imageSmoothingQuality = 'high';
	
	var SETTINGS = {};
	var EXPORTED = {};
	
	var methods = {
		getWidth: function(){
			return canvas.width;
		},
		getHeight: function(){
			return canvas.height;
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
		
		fillRect: function(x, y, width, height, style){
			var old_style = ctx.fillStyle;
			
			if(style)
			{
				ctx.fillStyle = style;
			}
			
			ctx.fillRect(x, y, width, height);
			ctx.fillStyle = old_style;
		},
		
		drawText: function(x, y, text, max_width, font, style, stroke){
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
			
			text_measurer.style.setProperty('--font', font);
			text_measurer.textContent = text;
			
			var size = text_measurer.getBoundingClientRect();
			var size_holder = text_measurer_holder.getBoundingClientRect();
			
			return {
				length: text.length,
				width: size.width,
				height: size_holder.height,
				font: font,
				translateX: 0,
				translateY: size_holder.height - size.height
			};
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
		},
		
		showFPS_raf: null,
		showFPS: function(scale){
			div.style.setProperty('--fps-scale', scale);
			
			if(methods.showFPS_raf)
			{
				return;
			}
			
			var times = [];
			var last_fps = '--';
			
			div.setAttribute('data-showfps', 'true');
			
			// Taken from: https://stackoverflow.com/questions/69279653/use-gpu-to-draw-on-html5-canvas-on-google-chrome
			var update_fps = function() {
				methods.showFPS_raf = window.requestAnimationFrame(update_fps);
				
				var now = performance.now();
				while (times.length > 0 && times[0] <= now - 1000) {
					times.shift();
					last_fps = times.length.toString();
				}
				times.push(now);
				
				// methods.fillRect(0, 0, 40, 30, '#000');
				// methods.drawText(3, 3, last_fps);
				div.setAttribute('data-currfps', last_fps);
			};
			
			update_fps();
		},
		
		hideFPS: function(){
			if(methods.showFPS_raf)
			{
				div.setAttribute('data-currfps', '--');
				div.setAttribute('data-showfps', 'false');
				div.style.setProperty('--fps-scale', '1');
				
				window.cancelAnimationFrame(methods.showFPS_raf);
				methods.showFPS_raf = null;
			}
		},
		
		onclick: function(fn){
			canvas.onclick = function(e){
				var data = {
					trusted: e.isTrusted,
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
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
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
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
					e.preventDefault();
					
					var touch = e.touches[0] || e.changedTouches[0];
					var rect = canvas.getBoundingClientRect();
					
					var data = {
						trusted: e.isTrusted,
						x: touch ? touch.clientX - rect.x : e.offsetX,
						y: touch ? touch.clientY - rect.y : e.offsetY,
						lastX: e.movementX, lastY: e.movementY,
						button: e.button,
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
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
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
					e.preventDefault();
					
					var touch = e.touches[0] || e.changedTouches[0];
					var rect = canvas.getBoundingClientRect();
					
					var data = {
						trusted: e.isTrusted,
						x: touch ? touch.clientX - rect.x : e.offsetX,
						y: touch ? touch.clientY - rect.y : e.offsetY,
						lastX: e.movementX, lastY: e.movementY,
						button: e.button,
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
					x: e.offsetX, y: e.offsetY,
					lastX: e.movementX, lastY: e.movementY,
					button: e.button,
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
					e.preventDefault();
					
					var touch = e.touches[0] || e.changedTouches[0];
					var rect = canvas.getBoundingClientRect();
					
					var data = {
						trusted: e.isTrusted,
						x: touch ? touch.clientX - rect.x : e.offsetX,
						y: touch ? touch.clientY - rect.y : e.offsetY,
						lastX: e.movementX, lastY: e.movementY,
						button: e.button,
						alt: e.altKey,
						meta: e.metaKey,
						shift: e.shiftKey,
						ctrl: e.ctrlKey
					};
					
					fn(data, EXPORTED);
				};
			}
		},
		reset: function(){
			methods.hideFPS();
			
			ctx.font = '10px sans-serif';
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			ctx.lineWidth = 1;
			
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
		}
	};
	
	var EXPORTS = Object.defineProperties(Object.create(null), {
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
			value: Object.assign(function getRandomColor(){
				return "rgb(" + (Math.floor(Math.random() * 256))
					+ "," + (Math.floor(Math.random() * 256))
					+ "," + (Math.floor(Math.random() * 256))
				+ ")";
			}, {
				__doc__: 'Gets a random color, usable in many places'
			}),
			enumerable: true
		},
		
		setFillStyle: {
			value: Object.assign(function setFillStyle(str){
				return methods.setFillStyle(str.toString());
			}, {
				__doc__: [
					'Sets the fill style for the canvas',
					'Default value: #000000'
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
		getStrokeStyle: {
			value: Object.assign(function getStrokeStyle(str){
				return methods.getStrokeStyle(str.toString());
			}, {
				__doc__: [
					'Sets the stroke style for the canvas',
					'Default value: #000000'
				]
			}),
			enumerable: true
		},
		setStrokeStyle: {
			value: Object.assign(function setStrokeStyle(){
				return methods.setStrokeStyle();
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
					'Default value: 10px sans-serif'
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
		
		fillRect: {
			value: Object.assign(function fillRect(x, y, width, height, style){
				return methods.fillRect(+x || 0, +y || 0, +width || 0, +height || 0, style ? style.toString() : null);
			}, {
				__doc__: [
					'Creates a rectangle at $x,$y with $width,$height',
					'Takes an optional $style, which will be reset after drawing the rectangle'
				]
			}),
			enumerable: true
		},
		
		drawText: {
			value: Object.assign(function drawText(x, y, text, max_width, font, style, stroke){
				// return methods.fillRect(+x || 0, +y || 0, +width || 0, +height || 0, style ? style.toString() : null);
				return methods.drawText(
					+x || 0, +y || 0, text.toString(),
					max_width ? max_width : undefined,
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
					'If $stroke is true, it will use the stroke style set by !CANVAS->getStrokeStyle()'
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
					'• font			Full font description (size, family and style)',
					'• length 		Number of characters of the text',
					'• width 		Width, in pixels and subpixels',
					'• height		Height, in pixels and subpixels',
					'• translateX	How many pixels and subpixels to move the text in the X axis',
					'• translateY	How many pixels and subpixels to move the text in the Y axis',
					'These translation values can be useful to determine how many pixels the characters "poke out" on each axis',
					'For example, the emoji ⭐ may have an height above the line height'
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
					'The FPS count won\'t be part of the generated canvas image'
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
		}
	});
	
	simply.module_register('canvas', {
		Exports: {
			'version': '1.0',
			'init': Object.assign(function canvas_init(width, height, bgcolor){
				if(div.parentNode)
				{
					div.parentNode.removeChild(div);
				}
				
				canvas.width = width;
				canvas.height = height;
				
				methods.reset();
				methods.clearEverything(bgcolor);
				
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
				
				Object.defineProperty(EXPORTED, '__doc__', {
					value: canvas_init.__doc_export__
				});
				
				return EXPORTED;
			}, {
				__doc__: [
					'Initializes a canvas, inside the output area',
					'It\'s required to pass a $width, $height and a $bgcolor',
					'Returns a custom 2d context object'
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
		},
		CSS: [
			'#' + div.id + ' {',
				'--fps-scale: 1;',
				'position: relative;',
				'transform: translate3d(0, 0, 0);',
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
				'content: attr(data-currfps);',
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
			'}',
			'#' + div.id + ' .text-measurer {',
				'display: inline;',
				'margin: 0 !important;',
				'padding: 0 !important;',
				'font: var(--font, 10px sans-serif) !important;',
				'line-height: normal;',
				'vertical-align: bottom;',
				'text-align: left;',
			'}',
		].join('\n')
	});
	
})(Function('return this')());
