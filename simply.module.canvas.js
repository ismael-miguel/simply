(function(window, undefined){
	'use strict';
	
	if(!window.simply)
	{
		throw new Error('window.simply is required to use this module');
	}
	
	var canvas = document.createElement('canvas');
	canvas.style.display = 'block';
	
	if(!canvas.getContext)
	{
		throw new Error('Canvas support is required to use this module');
	}
	
	var ctx = canvas.getContext('2d');
	
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
		
		onclick: function(fn){
			canvas.onclick = function(e){
				var data = {
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
		ondown: function(fn){
			canvas.onmousedown = function(e){
				var data = {
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
		onup: function(fn){
			canvas.onmouseup = function(e){
				var data = {
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
		reset: function(){
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
					'Also taken an optional $font, which will be reset after drawing the text',
					'Also takes an optional $style, which will be reset after drawing the text',
					'Also taken an optional $stroke, which will be reset after drawing the text',
					'If $stroke is true, it will use the stroke style set by !CANVAS->getStrokeStyle()'
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
	});
	
	simply.module_register('canvas', {
		Exports: {
			'version': '1.0',
			'init': Object.assign(function canvas_init(width, height, bgcolor){
				if(canvas.parentNode)
				{
					canvas.parentNode.removeChild(canvas);
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
						SETTINGS.output_element.insertBefore(canvas, hr.nextSibling);
					}
					else
					{
						SETTINGS.output_element.appendChild(canvas);
					}
				}
				
				return EXPORTED = Object.assign({}, EXPORTS);
			}, {
				__doc__: [
					'Initializes a canvas, inside the output area',
					'It\'s required to pass a $width, $height and a $bgcolor',
					'Returns a custom 2d context object'
				],
				result: null
			})
		},
		Cleanup: function(){},
		Init: function(settings){
			Object.assign(SETTINGS, settings);
		}
	});
	
})(Function('return this')());