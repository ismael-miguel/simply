// https://www.youtube.com/watch?v=W9BTq_L6ut4&list=PLGNbPb3dQJ_5FTPfFIg28UxuMpu7k0eT4&index=4

(function(window, undefined){
	'use strict';
	
	/*const RE = /\$?[a-z][_a-z\d]*|0(?:x[\da-f]+|b[01]+)|\d+(?:\.\d+)?(?:e\d+)?|->|\/[\*\/]|\*\/|[ \t]+|\r?\n|[,\[\]]|"[^"]*"/gmiud;
	const token_types = {
		decision: ['if', 'case', 'switch', 'else', 'elseif'],
		loop: ['while', 'for', 'each'],
		comment: ['//', '/*', '* /'],
		open_scope: ['then', 'begin', 'do'],
		assign: ['store', 'set', 'define', 'create'],
		output: ['say', 'show', 'display', 'echo'],
	};
	
	const parser = {
		tokenizer: function(text){
			
		}
	};*/
	
	
	/* a test of 55*44.0 2e2
	
	set $a to ["a","b","c","d","e"]

	create function abcd[$a, $b default "", $c] begin
		if $s is equal to 44 then
		else if $b is equal to 55 begin
		end

		switch $a begin
			case "a" then
				say "hello
	world"
			end
		end
	end
	*/
	
	/*
		# example code
		define a function called &fn with arguments ($a, $b, $c)
		begin
			create variable $x and set it to 5
			return $x
		end

		create a constant !ABC and set the value 5 into it

		in case the constant !ABC is not set
		begin
			echo "Please define the constant !ABC"
		end

		for each value in $a as key $key and value $value
		begin
			if the $key is 5
				echo $key
		end
	*/
	
	/*
		> Note 1:
		
		IMPORTANT: JavaScript's type checking screws up boolean verification
		
		It is hard to detect if a value is really falsy, due to this.
		For example, the values "new Boolean(false)" and "[]" can both be true and false.
		
		When verifying with double negation, both values return true (!![] === true)
		When checking if it is equal to false, both values also return true ([] == false)
		
		To make sure we detect all falsy values properly, we need to check them like this:
			!!value || value == false;
		
		And to detect all truthy values, we need to check like this:
			value;
	*/
	
	
	// https://github.com/hirak/phpjs/blob/master/functions/strings/sprintf.js
	var sprintf = function sprintf() {
		//  discuss at: http://phpjs.org/functions/sprintf/
		// original by: Ash Searle (http://hexmen.com/blog/)
		// improved by: Michael White (http://getsprink.com)
		// improved by: Jack
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Dj
		// improved by: Allidylls
		//    input by: Paulo Freitas
		//    input by: Brett Zamir (http://brett-zamir.me)
		//   example 1: sprintf("%01.2f", 123.1);
		//   returns 1: 123.10
		//   example 2: sprintf("[%10s]", 'monkey');
		//   returns 2: '[    monkey]'
		//   example 3: sprintf("[%'#10s]", 'monkey');
		//   returns 3: '[####monkey]'
		//   example 4: sprintf("%d", 123456789012345);
		//   returns 4: '123456789012345'
		//   example 5: sprintf('%-03s', 'E');
		//   returns 5: 'E00'

		var regex = /%%|%(\d+\$)?([\-+\'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
		var a = arguments;
		var i = 0;
		var format = a[i++];

		// pad()
		var pad = function (str, len, chr, leftJustify) {
			if (!chr) {
				chr = ' ';
			}
			var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
				.join(chr);
			return leftJustify ? str + padding : padding + str;
		};

		// justify()
		var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
			var diff = minWidth - value.length;
			if (diff > 0) {
				if (leftJustify || !zeroPad) {
					value = pad(value, minWidth, customPadChar, leftJustify);
				} else {
					value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
				}
			}
			return value;
		};

		// formatBaseX()
		var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
			// Note: casts negative numbers to positive ones
			var number = value >>> 0;
			prefix = (prefix && number && {
				'2': '0b',
				'8': '0',
				'16': '0x'
			}[base]) || '';
			value = prefix + pad(number.toString(base), precision || 0, '0', false);
			return justify(value, prefix, leftJustify, minWidth, zeroPad);
		};

		// formatString()
		var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
			if (precision !== null && precision !== undefined) {
				value = value.slice(0, precision);
			}
			return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
		};

		// doFormat()
		var doFormat = function (substring, valueIndex, flags, minWidth, precision, type) {
			var number, prefix, method, textTransform, value;

			if (substring === '%%') {
				return '%';
			}

			// parse flags
			var leftJustify = false;
			var positivePrefix = '';
			var zeroPad = false;
			var prefixBaseX = false;
			var customPadChar = ' ';
			var flagsl = flags.length;
			var j;
			for (j = 0; flags && j < flagsl; j++) {
				switch (flags.charAt(j)) {
					case ' ':
						positivePrefix = ' ';
						break;
					case '+':
						positivePrefix = '+';
						break;
					case '-':
						leftJustify = true;
						break;
					case "'":
						customPadChar = flags.charAt(j + 1);
						break;
					case '0':
						zeroPad = true;
						customPadChar = '0';
						break;
					case '#':
						prefixBaseX = true;
						break;
				}
			}

			// parameters may be null, undefined, empty-string or real valued
			// we want to ignore null, undefined and empty-string values
			if (!minWidth) {
				minWidth = 0;
			} else if (minWidth === '*') {
				minWidth = +a[i++];
			} else if (minWidth.charAt(0) === '*') {
				minWidth = +a[minWidth.slice(1, -1)];
			} else {
				minWidth = +minWidth;
			}

			// Note: undocumented perl feature:
			if (minWidth < 0) {
				minWidth = -minWidth;
				leftJustify = true;
			}

			if (!isFinite(minWidth)) {
				throw new Error('sprintf: (minimum-)width must be finite');
			}

			if (!precision) {
				precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
			} else if (precision === '*') {
				precision = +a[i++];
			} else if (precision.charAt(0) === '*') {
				precision = +a[precision.slice(1, -1)];
			} else {
				precision = +precision;
			}

			// grab value using valueIndex if required?
			value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

			switch (type) {
				case 's':
					return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
				case 'c':
					return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
				case 'b':
					return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'o':
					return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'x':
					return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'X':
					return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
						.toUpperCase();
				case 'u':
					return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'i':
				case 'd':
					number = +value || 0;
					// Plain Math.round doesn't just truncate
					number = Math.round(number - number % 1);
					prefix = number < 0 ? '-' : positivePrefix;
					value = prefix + pad(String(Math.abs(number)), precision, '0', false);
					return justify(value, prefix, leftJustify, minWidth, zeroPad);
				case 'e':
				case 'E':
				case 'f': // Should handle locales (as per setlocale)
				case 'F':
				case 'g':
				case 'G':
					number = +value;
					prefix = number < 0 ? '-' : positivePrefix;
					method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
					textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
					value = prefix + Math.abs(number)[method](precision);
					return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
				default:
					return substring;
			}
		};

		return format.replace(regex, doFormat);
	};
	
	
	
	// used only for error reporting
	const FILENAME = 'simply';
	
	const MODULES_ORDER = ['rick'];
	const MODULES_DEFAULTS = {
		Spec: [],
		Exports: {},
		Analyze: {},
		Compile: {},
		Cleanup: function(){},
		Init: function(){},
		CSS: ''
	};
	const MODULES = {
		'rick': Object.assign(Object.create(null), MODULES_DEFAULTS, {
			Exports: {
				'version': '1.0',
				'roll': Object.assign(function rickroll(){
					if(!rickroll.result)
					{
						var n = 'Never gonna ';
						var N = [
							n + 'give you up',
							'let you down',
							'run around and desert you',
							'make you cry',
							'say goodbye',
							'tell a lie and hurt you'
						].join('\n' + n);
						
						var f = ' how I\'m feeling';
						var F = [
							'I just wanna tell you' + f,
							'Gotta make you understand'
						].join('\n');
						
						var g = [
							'We\'ve known each other for so long',
							'Your heart\'s been aching, but you\'re too shy to say it (say it)',
							'Inside, we both know what\'s been going on (going on)',
							'We know the game and we\'re gonna play it'
						].join('\n');
						
						rickroll.result = [
							'We\'re no strangers to love',
							'You know the rules and so do I (do I)',
							'A full commitment\'s what I\'m thinking of',
							'You wouldn\'t get this from any other guy',
							'', F,'', N,'', g,'',
							'And if you ask me' + f,
							'Don\'t tell me you\'re too blind to see',
							'', N,'', N,'', g,'', F, '', N, '', N, '', N
						].join('\n');
					}
					
					return rickroll.result;
				}, {
					__doc__: 'Returns the lyrics to Rick Astley - Never Gonna Give You Up',
					result: null
				})
			}
		})
	};
	
	const RDP = {
		Spec: [
			
			// SEPARATORS
			// expression separator
			[/^(?:;|\.?\r?\n|\.$)/, ';'],
			// value separator
			[/^,\s*/, ','],
			
			// WHITESPACE
			[/^\s+/, null],
			
			// COMMENTS
			// single-line comments
			[/^\/\/.*(?:\r?\n|\r)?/, 'COMMENT_SINGLE_LINE'],
			// multiline comments
			[/^\/\*[\s\S]*?\*\//, 'COMMENT_MULTI_LINE'],
			
			// NUMBERS
			[/^[+\-]?(?:0x[\da-f]+(?:\.[\da-f]+)?|0b[01]+(?:\.[01]+)?|0*\.\d+|\d+(?:\.\d+)?)/i, 'NUMBER'],
			
			// STRINGS
			[/^"(?:\\(?:["'0trnf]|x[0-9a-z]{2}|u[0-9a-z]{4})|[^"])*"/, 'STRING'],
			[/^'(?:\\(?:["'0trnf]|x[0-9a-z]{2}|u[0-9a-z]{4})|[^'])?'/, 'CHAR'],
			
			// PARENTHESIS
			[/^\(/, '('],
			[/^\)/, ')'],
			
			// ARRAY
			[/^[\[]/, '['],
			[/^[\]]/, ']'],
			
			// IDENTIFIERS
			// variable
			[/^[\$%][a-z_][a-z\d_]*/i, 'VARIABLE'],
			// function
			[/^&[a-z_][a-z\d_]*/i, 'FUNCTION'],
			// constant
			[/^![A-Z_][A-Z\d_]*/, 'CONSTANT'],
			// constant values
			[/^(?:true|false|null|infinit[ey]|nan)(?![a-z\d])/i, 'CONSTANT_VAL'],
			
			// OUTPUT
			[/^(?:echo|print|out(?:put)?|show|display|write|tell)(?:f)?(?![a-z\d])/i, 'OUTPUT'],
			
			// CALL FUNCTION
			[/^(?:call(?:ing)?|run(?:ning)?|exec(?:ute|uting)?)(?![a-z\d])/i, 'CALL'],
			
			// ASSING
			[/^(?:set|give|assign|\:?=)(?![a-z\d=])/i, 'ASSIGN'],
			
			// DEFINE
			[/^(?:def(?:ine)?|create|make)(?![a-z\d])/i, 'DEFINE'],
			
			// SCOPE MANIPULATION
			// open
			[/^(?:(?:begin|open|start)(?![a-z\d])|\{)/i, 'SCOPE_OPEN'],
			// close
			[/^(?:(?:end|close|finish(?:ed))(?![a-z\d])|\})/i, 'SCOPE_CLOSE'],
			
			// DECISION BLOCKS
			// if/in case
			[/^(?:if|in case)(?![a-z\d])/i, 'IF_BLOCK'],
			// unless - same as "if", but negative
			[/^(?:unless)(?![a-z\d])/i, 'UNLESS_BLOCK'],
			// else block
			[/^(?:else|otherwise)(?![a-z\d])/i, 'ELSE_BLOCK'],
			
			// RETURN
			[/^(?:return|send|pass)(?![a-z\d])/i, 'RETURN'],
			
			// FOR LOOP
			[/^(?:for|loop from)(?![a-z\d])/i, 'FOR_LOOP'],
			
			// FOREACH LOOP
			//[/^(?:foreach|each|loop through)(?![a-z\d])/i, 'EACH_LOOP'],
			
			// OPERATORS
			[/^(?:->|::|\.\.|[\^\!\.~]|[><\-+\/\*\|]{1,2}|===?)/, 'OPERATOR'],
			
			// ANY 'WORD'
			[/^[a-z][a-z_]*/i, 'WORD'],
			[/^[^;,\[\("'\da-z#\s]+/i, 'SYMBOL']
		],
		Words: {
			'OPEN': ['open', 'start', 'begin'],
			'CLOSE': ['close', 'end'],
			'ARGS': ['arg', 'argument', 'args', 'arguments', 'param', 'params', 'parameter', 'parameters'],
			'FORMATTED': ['format', 'formatted'],
			'CALC_ADD': ['sum', 'add'],
			'CALC_SUB': ['subtract', 'sub'],
			'DEFINE': ['def', 'create', 'define', 'make'],
			'ASSIGN': ['set', 'give', 'assign'],
			// 'FUNCTION': ['fn', 'func', 'function', 'method', 'proc', 'procedure'],
			'BOOL_HAS': ['contains', 'has', 'in'],
			// 'KEYWORDS': ['from', 'to', 'step'],
			'IGNORE': [
				'var', 'variable', 'cons', 'constant', 'and', 'it', 'to', 'the', 'value', 'values',
				'a', 'an', 'as', 'with', 'name', 'named', 'called', 'which', 'takes', 'that', 'this',
				'global', 'content', 'contents', 'me', 'of', 'into', 'string', 'by', 'result', 'results',
				'then',
				
				// FUNCTION:
				'fn', 'func', 'function', 'method', 'proc', 'procedure'
			]
		},
		Symbols: {
			'BOOLEAN': [],
			'COMPARE': ['==', '===', '<', '>', '>=', '<=', '=>', '=<', '!=', '!==', '<>'],
			'INDEX': ['::', '->']
		},
		
		FNS: {
			// miscellaneous
			iff: Object.assign(function iff(cond, true_val, false_val){
				return cond ? true_val : false_val;
			}, {
				__doc__: 'If the $cond is true, returns $true_val, otherwise returns $false_val'
			}),
			len: Object.assign(function len(value){
				switch(typeof value)
				{
					case 'string':
						return value.length;
					
					case 'object':
						if(!value)
						{
							return null;
						}
						else if(Array.isArray(value))
						{
							return value.length;
						}
						else
						{
							return Object.keys(value).length;
						}
					
					default:
						return null;
				}
				
			}, {
				__doc__: 'Returns the number of elements in the string, array or character.'
			}),
			doc: Object.assign(function doc(fn, no_header){
				return !fn.hasOwnProperty('__doc__')
					? null
					: (
						(no_header
							? ''
							: 'Documentation for '
								+ (typeof fn === 'function'
									? fn.name || 'anonymous function'
									: typeof fn
								)
								+ ':\n'
						) + (Array.isArray(fn.__doc__)
							? fn.__doc__.join('.\n')
							: fn.__doc__
						) + '.'
					).replace(/(?:([^\.])\.(\.)|(\:)\.)$/mg, '$1$2$3');
			}, {
				__doc__: 'Returns the documentation string for a function, if it exists, otherwise returns null'
			}),
			empty: Object.assign(function empty(value){
				return value === undefined
					|| value === null
					|| value.length === 0
					|| Object.keys(value).length === 0;
			}, {
				__doc__: [
					'Checks if the value is empty',
					'Empty values are null, empty strings, empty arrays and empty objects'
				]
			}),
			json_encode: Object.assign(function json_encode(obj, spaces){
				if(spaces)
				{
					if(Array.isArray(spaces))
					{
						spaces = spaces.slice(0, 9).join('').slice(0, 9);
					}
					else if(typeof spaces === 'string')
					{
						spaces = spaces.slice(0, 9);
					}
					else if(typeof spaces === 'number')
					{
						spaces = Math.max(Math.abs(spaces), 10);
					}
					else
					{
						spaces = undefined;
					}
				}
				
				return JSON.stringify(obj, null, spaces);
			}, {
				__doc__: [
					'Turns the $object into a JSON string',
					'Optionally, accepts a value into the $spaces variable, which will be used to indent the resulting JSON',
					'It accepts the following values:',
					'- A number between 0 and 10, which will be used as the number of spaces',
					'- A character, which will be used as the character to indent',
					'- A string, in which the first 10 characters will be used as the characters to indent'
				]
			}),
			json_decode: Object.assign(function json_decode(str){
				return JSON.parse(str.toString());
			}, {
				__doc__: 'Parses the $str as a JSON string'
			}),
			
			// array related
			join: Object.assign(function join(array, str){
				if(
					arguments.length < 2
					|| array === null
					|| array === undefined
				)
				{
					return '';
				}
				
				return Object.values(array).join(str);
			}, {
				__doc__: 'Joins all the values in $array, separated by $string. (Example: [1,2,3], "" -> "123")'
			}),
			range: Object.assign(function range(start, end, step){
				if(
					typeof start !== 'number'
					|| typeof end !== 'number'
					|| (
						step !== undefined
						&& typeof step !== 'number'
					)
				)
				{
					return [];
				}
				
				var max = Math.max(start, end);
				var min = Math.min(start, end);
				var difference = max - min;
				
				
				/*
					Allow accepting negative steps for positive start and end.
					For example, if we receive (5, 1, -1), we need to swap the start and end.
				*/
				if(step < 0 && end > start)
				{
					var tmp = end;
					end = start;
					start = tmp;
				}
				else if(step === undefined)
				{
					// If no step was provided, assume 1
					step = 1;
				}
				
				// We need the step to always be a positive number
				step = Math.abs(step);
				
				
				if(start === end || !step || step > difference)
				{
					return [start];
				}
				
				var steps = ((difference / step) | 0) + 1;
				
				/*
					Taken from: https://stackoverflow.com/a/10050831
					
					We need to add 1 because, for example, there are 5 steps from 1 to 5
					insted of 4 given by (5 - 1) / 1 = 4.
					
					If the step is set to 2, we calculate (5 - 1) / 2 = 2.
					However, there's 3 steps: 1, 3, 5.
					
					If step is set to 3, we calculate (5 - 1) / 3 = 1.333...
					However, there's 2 steps: 1, 4
					
					If step is now 4, we calculate (5 - 1) / 4 = 1.
					But, we know there's 2 steps: 1, 5
				*/
				
				var values = Array.apply(null, Array(steps)).map(function(_, i){
					var value = min + (i * step);
					return value > max ? max : value;
				});
				
				/*
					Handle cases where the start value is higher than the end.
					To do it, we need to reverse the array.
					
					In the step above, we calculated the steps from max to min.
					In case the number of steps isn't a whole number, there can be a difference between
					the end value and the last calculated value.
					
					For example, with the values (5, 1, 3), we get [1, 4].
					When we reverse it, we have [4, 1], which doesn't respect the starting value.
					The "drift" is just the difference betwee the first value in [4, 1] and the start value (5).
					
					Calculating the "drift" gives us 1, which we add to all elements, resulting in [5, 2],
					which is the expected result.
				*/
				if(start > end)
				{
					values = values.reverse();
					
					var drift = max - values[0];
					if(drift)
					{
						values = values.map(function(value){
							return value + drift;
						});
					}
				}
				
				return values;
			}, {
				__doc__: [
					'Returns an array that goes from $start to $end, going by $step',
					'If $start is higher than $end, OR $step is lower than 0, the range is inverted',
					'Returns an empty array if $start or $end or $step (when provided) aren\'t numbers'
				]
			}),
			array_chunk: Object.assign(function array_chunk(array, length){
				if(length < 1)
				{
					return [];
				}
				else if(length > array.length)
				{
					return [array];
				}
				
				var size = Math.ceil(array.length / length);
				var result = Array(size);
				var offset = 0;
				
				for(var i = 0; i < size; i++) {
					result[i] = str.slice(offset, offset + length);
					offset += length;
				}
				
				return result;
			}, {
				__doc__: [
					'Splits the string into chunks of up to a specified length',
					'If the length is lower than 1, returns an empty array'
				]
			}),
			array_concat: Object.assign(function array_concat(){
				var array = [];
				return array.concat.apply(array, Array.from(arguments));
			}, {
				__doc__: [
					'Concatenates all values into a single array',
					'Returns an empty array if no values are passed'
				]
			}),
			array_rev: Object.assign(function array_rev(array){
				return array.reverse();
			}, {
				__doc__: 'Reverses the array'
			}),
			array_keys: Object.assign(function array_keys(array){
				return Object.keys(array);
			}, {
				__doc__: 'Returns the keys in the array'
			}),
			array_update: Object.assign(function array_update(array, obj){
				return Object.assign(array, obj);
			}, {
				__doc__: 'Updates the values in the $array, based on the values in $obj'
			}),
			array_contains: Object.assign(function array_contains(array, value){
				array = Array.from(array);
				var keys = RDP.FNS.array_keys(array);
				
				return keys.some(function(key){
					return array[key] === value;
				});
			}, {
				__doc__: 'Verifies if the $array contains the $value'
			}),
			array_map: Object.assign(function array_map(array, fn){
				var result = Array.isArray(array) ? [] : {};
				
				if(array)
				{
					Object.keys(array).forEach(function(key){
						result[key] = fn(array[key], key);
					});
				}
				
				return result;
				
				/*return Array.from(array).map(function(value, index){
					return fn(value, index);
				});*/
			}, {
				__doc__: 'Runs the $fn for each element in the $array, returning a new copy with the new values'
			}),
			
			// string related
			mirror_text: Object.assign(function mirror_text(str){
				// https://emojipedia.org/
				// https://www.w3.org/TR/xml-entity-names/Overview.html
				var left = '<{[(\\`⬅️↖️⬆️↗️📈🔺◀️🔼⏪⏮️⏫👈👆🔍⤴️6◀◁◂◃◄◅▲△▴▵◸◹⚞☜☝☚☖☗⚍⚻';
				var right = '>}])/´➡️↘️⬇️↙️📉🔻▶️🔽⏩⏭️⏬👉👇🔎⤵️9▶▷▸▹►▻▼▽▾▿◿◺⚟☞☟☛⛉⛊⚎⚺';
				
				return str.toString().replace(/./gu, function(chr){
					return right[left.indexOf(chr)]
						|| left[right.indexOf(chr)]
						|| chr;
				});
			}, {
				__doc__: 'Tries to flip the characters by 180º. (Example: "<hello>" will return ">hello<")'
			}),
			hello_world: Object.assign(function hello_world(flags, negative){
				var FLAG_LCASE_HG = 0b10000;
				var FLAG_NO_COMMA = 0b1000;
				var FLAG_NO_SPACE = 0b100;
				var FLAG_LCASE_W = 0b10;
				var FLAG_NO_EXCLAM = 0b1;
				
				flags = typeof flags === 'number'
					? window.Math.abs(flags)
					: (typeof flags === 'string'
						? window.Math.abs(RDP.Utils.parseNumber(flags))
						: 0
					);
				
				return (negative
						? ['G', 'g'][(flags & FLAG_LCASE_HG) >> 4] + 'oodbye'
						: ['H', 'h'][(flags & FLAG_LCASE_HG) >> 4] + 'ello'
					)
					+ [',', ''][(flags & FLAG_NO_COMMA) >> 3]
					+ [' ', ''][(flags & FLAG_NO_SPACE) >> 2]
					+ ['W', 'w'][(flags & FLAG_LCASE_W) >> 1]
					+ 'orld'
					+ ['!', ''][flags & FLAG_NO_EXCLAM];
			}, {
				__doc__: [
					'Generates the "Hello, World!" text. (Please check: https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)',
					'The function accepts a binary 5-bit integer as a flag, and generates the text based on the following bits being set:',
					'1- The "H" in "Hello" will be in lowercase instead: "hello"',
					'2- Removes the comma',
					'3- Removes the space after the comma',
					'4- The "W" in "World" will be in lowercase instead: "world"',
					'5- Removes the exclamation mark (!) at the end',
					'Psst! T̶r̶y̶ ̶p̶a̶s̶s̶i̶n̶g̶ ̶t̶r̶u̶e̶ ̶a̶s̶ ̶t̶h̶e̶ ̶2̶n̶d̶ ̶a̶r̶g̶u̶m̶e̶n̶t̶.'
				]
			}),
			is_palindrome: Object.assign(function is_palindrome(str){
				str = str.toString().toLowerCase().replace(/[^a-z]/g,'');
				
				if(!str.length)
				{
					return null;
				}
				
				if(!is_palindrome.results.hasOwnProperty(str))
				{
					is_palindrome.results[str] = (
						str.substring(0, str.length >> 1)
						=== str.substr(-(str.length >> 1)).split('').reverse().join('')
					);
				}
				
				return is_palindrome.results[str];
			}, {
				__doc__: [
					'Verifies is the passed value is a palindrome, or null if it is empty',
					'A palindrome is a number or string that can be read the same when written backwards',
					'For example: racecar and 808'
				],
				results: {racecar: true, tacocat: true}
			}),
			is_anagram: Object.assign(function is_anagram(str, str2){
				var cleanup = function(str) {
					return str.toLowerCase().replace(/[^a-z\d]/g, '').split('').sort().join('');
				}
				
				if(!is_anagram.results)
				{
					is_anagram.results = {};
				}
				
				str = cleanup(str);
				str2 = cleanup(str2);
				
				if(!is_anagram.results[str].hasOwnProperty(str2))
				{
					is_anagram.results[str][str2] = str.length && str === str2;
				}
				
				return is_anagram.results[str][str2];
			}, {
				__doc__: 'Verifies if $str1 is an anagram of $str2 (E.g.: "listen" and "silent"). Please check: https://en.wikipedia.org/wiki/Anagram',
				results: {}
			}),
			marsagain: Object.assign(function marsagain(str, str2){
				return RDP.FNS.is_anagram(str, str2);
			}, {
				__doc__: '🤫 this is a secret function. Just an anagram for &is_anagram().'
			}),
			str_split: Object.assign(function str_split(str, sep, limit){
				return str.toString().split(sep, limit);
			}, {
				__doc__: [
					'Splits the string into multiple parts',
					'Takes a separator and an optional limit number of splits to execute'
				]
			}),
			str_chunk: Object.assign(function str_chunk(str, length){
				if(length < 1)
				{
					return [];
				}
				else if(length > str.length)
				{
					return [str];
				}
				else if(length === 1)
				{
					return str.split('');
				}
				
				var size = Math.ceil(str.length / length);
				var result = Array(size);
				var offset = 0;
				
				for(var i = 0; i < size; i++) {
					result[i] = str.substr(offset, length);
					offset += length;
				}
				
				return result;
			}, {
				__doc__: [
					'Splits the string into chunks of up to a specified length',
					'If the length is lower than 1, returns an empty array'
				]
			}),
			str_concat: Object.assign(function str_concat(){
				return Array.from(arguments).join('');
			}, {
				__doc__: [
					'Concatenates all values into a single string',
					'Returns an empty string if no values are passed'
				]
			}),
			str_rev: Object.assign(function str_rev(str){
				return window.esrever
					? window.esrever.reverse(str)
					: Array.from(str).reverse().join('');
			}, {
				__doc__: [
					'Reverses a string',
					'If you want proper results for UTF-8/UTF-16, you may want to include https://github.com/mathiasbynens/esrever'
				]
			}),
			str_compare: Object.assign(function str_compare(str1, str2){
				return str1 === str2 ? 0 : (str1 > str2 ? 1 : -1);
			}, {
				__doc__: [
					'Compares $str1 with $str2, returning 0 if they are equal',
					'If $str1 is greater than $str2, returns 1, otherwise returns -1'
				]
			}),
			trim: Object.assign(function trim(str, chars){
				if(chars)
				{
					if(!Array.isArray(chars))
					{
						chars = Array.from(chars.toString());
					}
					
					var start = 0;
					var end = str.length - 1;
					
					if(!end)
					{
						return '';
					}
					
					for(; !!~chars.indexOf(str[start]); start++);
					for(; !!~chars.indexOf(str[end]); end--); end++;
					
					return str.slice(start, end);
				}
				else
				{
					return str.toString().trim();
				}
			}, {
				__doc__: [
					'Trims whitespace characters from the start and end of the string',
					'A writespace character is a space, a tab, a non-breaking space, line terminators, a null byte and others',
					'Optionally takes a string or an array with all the characters to trim'
				]
			}),
			ltrim: Object.assign(function ltrim(str, chars){
				if(chars)
				{
					if(!Array.isArray(chars))
					{
						chars = Array.from(chars.toString());
					}
					
					var start = 0;
					var end = str.length - 1;
					
					if(!end)
					{
						return '';
					}
					
					for(; !!~chars.indexOf(str[start]); start++);
					
					return str.slice(start, end);
				}
				else
				{
					return str.toString().trimStart();
				}
			}, {
				__doc__: [
					'Trims whitespace characters from the start of the string',
					'A writespace character is a space, a tab, a non-breaking space, line terminators, a null byte and others',
					'Optionally takes a string or an array with all the characters to trim'
				]
			}),
			rtrim: Object.assign(function rtrim(str, chars){
				if(chars)
				{
					if(!Array.isArray(chars))
					{
						chars = Array.from(chars.toString());
					}
					
					var start = 0;
					var end = str.length - 1;
					
					if(!end)
					{
						return '';
					}
					
					for(; !!~chars.indexOf(str[end]); end--); end++;
					
					return str.slice(start, end);
				}
				else
				{
					return str.toString().trimEnd();
				}
			}, {
				__doc__: [
					'Trims whitespace characters from the end of the string',
					'A writespace character is a space, a tab, a non-breaking space, line terminators, a null byte and others',
					'Optionally takes a string or an array with all the characters to trim'
				]
			}),
			str_contains: Object.assign(function str_contains(str, substr){
				str = str.toString();
				substr = substr.toString();
				
				return str.length !== str.replace(substr, '').length;
			}, {
				__doc__: 'Verifies if the $string contains the $substring'
			}),
			ord: Object.assign(function ord(chr){
				return chr.toString().codePointAt(0);
			}, {
				__doc__: 'Returns the Unicode Codepoint for the character'
			}),
			chr: Object.assign(function chr(codepoint){
				return String.fromCodePoint(codepoint);
			}, {
				__doc__: 'Returns an Unicode character corresponding to the codepoint provided'
			}),
			str_pad: Object.assign(function str_pad(str, len, chars){
				str = str.toString();
				
				if(!len || len >= str.length)
				{
					return str;
				}
				
				if(chars === null || chars === undefined)
				{
					chars = ' ';
				}
				else if(chars)
				{
					chars = Array.isArray(chars)
						? chars.join('')
						: chars.toString();
				}
				
				var count = len - str.length;
				
				if(count === 1)
				{
					return str + chars[0];
				}
				
				return str.padStart(count >> 1, chars).padEnd(count, chars);
			}, {
				__doc__: [
					'Pads the $string to the $length using the optional $chars, or space',
					'This function favors adding chars to the right, in case the $string xor $length is an odd number'
				]
			}),
			str_lpad: Object.assign(function str_lpad(str, len, chars){
				str = str.toString();
				
				if(!len || len >= str.length)
				{
					return str;
				}
				
				if(chars === null || chars === undefined)
				{
					chars = ' ';
				}
				else if(chars)
				{
					chars = Array.isArray(chars)
						? chars.join('')
						: chars.toString();
				}
				
				return str.padStart(len, chars);
			}, {
				__doc__: [
					'Pads the $string to the $length using the optional $chars, or space',
					'This function only on the left side of the $string'
				]
			}),
			str_rpad: Object.assign(function str_rpad(str, len, chars){
				str = str.toString();
				
				if(!len || len >= str.length)
				{
					return str;
				}
				
				if(chars === null || chars === undefined)
				{
					chars = ' ';
				}
				else if(chars)
				{
					chars = Array.isArray(chars)
						? chars.join('')
						: chars.toString();
				}
				
				return str.padEnd(len, chars);
			}, {
				__doc__: [
					'Pads the $string to the $length using the optional $chars, or space',
					'This function only on the right side of the $string'
				]
			}),
			toupper: Object.assign(function toupper(str){
				return str.toString().toUpperCase();
			}, {
				__doc__: 'Converts the string to uppercase characters'
			}),
			tolower: Object.assign(function tolower(str){
				return str.toString().toLowerCase();
			}, {
				__doc__: 'Converts the string to lowercase characters'
			}),
			ucfirst: Object.assign(function ucfirst(str){
				return str.toString().toLowerCase().replace(/^./, function(_){
					return _.toUpperCase();
				});
			}, {
				__doc__: 'Converts the first character to uppercase'
			}),
			ucwords: Object.assign(function ucwords(str){
				return str.toString().toLowerCase().replace(/(^.| .)/g, function(_){
					return _.toUpperCase();
				});
			}, {
				__doc__: [
					'Converts All Words To Uppercase',
					'A word is anything that is separated by a space'
				]
			}),
			
			// math-related
			is_prime: Object.assign(function is_prime(number){
				if(typeof number !== 'number')
				{
					return null;
				}
				
				number = Math.abs(number);
				
				if(is_prime.results.hasOwnProperty(number))
				{
					return is_prime.results[number];
				}
				
				for(var i = 2, stop = Math.sqrt(number); i <= stop; i++)
				{
					if(number % i === 0)
					{
						return is_prime.results[number] = false;
					}
				}
				
				return is_prime.results[number] = number > 1;
			}, {
				__doc__: [
					'Checks if the number is a prime number, or returns null',
					'A prime number is a number that has no divisors, besides 1 and itself.',
					'For example, 7 is a prime number because you can only divide it by 1 and 7.',
					'The number 8 isn\'t a prime number because it can be divided by 1, 2, 4 and 8.'
				],
				results: Object.assign({}, [
					null, true, true, true,
					false, true, true, true,
					false, false, false, true
				])
			}),
			is_perfect_square: Object.assign(function is_perfect_square(number){
				if(typeof number !== 'number')
				{
					return null;
				}
				
				number = Math.abs(number);
				
				if(number < 4)
				{
					return number === 1;
				}
				
				for(var i = 2; (i * i) <= number; i++)
				{
					if(number === (i * i))
					{
						return true;
					}
				}
				
				return false;
			}, {
				__doc__: [
					'Checks if the number is a perfect square, or returns null',
					'A perfect square is an integer number that results from calculating the square of another integer number',
					'For example, 4 is a perfect square, because it is 2² = 2*2 = 4'
				]
			}),
			is_perfect_cube: Object.assign(function is_perfect_cube(number){
				if(typeof number !== 'number')
				{
					return null;
				}
				
				number = Math.abs(number);
				
				if(number < 8)
				{
					return number === 1;
				}
				
				for(var i = 2; (i * i * i) <= number; i++)
				{
					if(number === (i * i * i))
					{
						return true;
					}
				}
				
				return false;
			}, {
				__doc__: [
					'Checks if the number is a perfect cube, or returns null',
					'A perfect cube is an integer number that results from calculating the cube of another integer number',
					'For example, 8 is a perfect cube, because it is 2³ = 2*2*2 = 8'
				]
			}),
			is_nan: Object.assign(function is_nan(number){
				return Number.isNaN(number);
			}, {
				__doc__: [
					'Checks if the number is NaN or not',
					'It only returns true if the number is NaN',
					'All other values return false'
				]
			}),
			is_odd: Object.assign(function is_odd(number){
				return !!(number % 2);
			}, {
				__doc__: [
					'Checks if the number is odd',
					'NaN, Infinity, -Infinity and 0 return false',
					'Fractional numbers return true'
				]
			}),
			is_even: Object.assign(function is_even(number){
				return !(number % 2);
			}, {
				__doc__: [
					'Checks if the number is even',
					'NaN, Infinity, -Infinity and 0 return true',
					'Fractional numbers return false'
				]
			}),
			nth_root: Object.assign(function nth_root(number, root){
				// taken from: https://stackoverflow.com/a/35690374
				if(number < 0 && root%2 != 1) return NaN; // Not well defined
				return (number < 0 ? -1 : 1) * Math.pow(Math.abs(number), 1/root);
			}, {
				__doc__: [
					'Calculates the nth root of any number',
					'Returns NaN if there are no solutions',
					'Otherwise, returns a positive or negative number, depending on the needs'
				]
			}),
			sqrt: Object.assign(function sqrt(number){
				return Math.sqrt(number);
			}, {
				__doc__: [
					'Calculates the square root of any number',
					'Returns NaN on negative numbers'
				]
			}),
			pow: Object.assign(function pow(number, power){
				return Math.pow(number, power);
			}, {
				__doc__: [
					'Calculates the number (base) raised by the power (exponent)',
					'Returns NaN on negative numbers with fractional powers'
				]
			}),
			rand: Object.assign(function rand(min, max){
				if(min === undefined)
				{
					min = Number.MIN_SAFE_INTEGER;
				}
				
				if(max === undefined)
				{
					max = Number.MAX_SAFE_INTEGER;
				}
				
				// taken from https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
				return Math.floor(Math.random() * (max - min + 1) + min);
			}, {
				__doc__: [
					'Returns a random integer number between $min and $max',
					'If not set, $min will be ' + Number.MIN_SAFE_INTEGER + ' and $max will be ' + Number.MAX_SAFE_INTEGER
				]
			}),
			add: Object.assign(function add(){
				return Array.from(arguments).reduce(function(value, total){
					return value + total;
				}, 0);
			}, {
				__doc__: 'Adds all values together'
			}),
			sum: Object.assign(function sum(){
				return Array.from(arguments).reduce(function(value, total){
					return value + total;
				}, 0);
			}, {
				__doc__: 'Adds all values together'
			}),
			sub: Object.assign(function sub(){
				var array = Array.from(arguments);
				
				if(array.length === 0)
				{
					return 0;
				}
				else if(array.length === 1)
				{
					return -array[0];
				}
				
				var initial = array.shift();
				
				return array.reduce(function(value, total){
					return value - total;
				}, initial);
			}, {
				__doc__: 'Subtracts all values together'
			}),
			prod: Object.assign(function prod(){
				var array = Array.from(arguments);
				
				if(array.length === 0)
				{
					return 0;
				}
				else if(array.length === 1)
				{
					return array[0];
				}
				
				var initial = array.shift();
				
				return array.reduce(function(total, value){
					return total * value;
				}, initial);
			}, {
				__doc__: 'Multiplies all values together'
			}),
			multi: Object.assign(function multi(){
				return RDP.FNS.prod.call(RDP.FNS, Array.from(arguments));
			}, {
				__doc__: 'Multiplies all values together'
			}),
			div: Object.assign(function div(){
				var array = Array.from(arguments);
				
				if(array.length === 0)
				{
					return 0;
				}
				else if(array.length === 1)
				{
					return array[0];
				}
				
				var initial = array.shift();
				
				return array.reduce(function(total, value){
					return total / value;
				}, initial);
			}, {
				__doc__: 'Divides the first value by all subsequent values'
			}),
			mod: Object.assign(function mod(num, divisor){
				return num % divisor;
			}, {
				__doc__: 'Returns the modulos (reminder) of dividing $num by $divisor'
			}),
			compare: Object.assign(function compare(num1, num2){
				return num1 === num2 ? 0 : (num1 > num2 ? 1 : -1);
			}, {
				__doc__: [
					'Compares $num1 with $num2, returning 0 if they are equal',
					'If $num1 is greater than $num2, returns 1, otherwise returns -1'
				]
			}),
			clamp: Object.assign(function clamp(min, max, num){
				return num < min ? min : (num > max ? max : num);
			}, {
				__doc__: [
					'Makes sure the $number is between $min and $max',
					'If $number is greater than $max, returns $max',
					'If $number is lower than $min, returns $min',
					'Otherwise, returns the $number'
				]
			}),
			min: Object.assign(function min(){
				var array = Array.from(arguments);
				
				if(!array.length)
				{
					return null;
				}
				else if(array.length === 1)
				{
					return array[0];
				}
				
				return Math.min.apply(Math, array);
			}, {
				__doc__: 'Returns the minimum value'
			}),
			max: Object.assign(function max(){
				var array = Array.from(arguments);
				
				if(!array.length)
				{
					return null;
				}
				else if(array.length === 1)
				{
					return array[0];
				}
				
				return Math.max.apply(Math, array);
			}, {
				__doc__: 'Returns the maximum value'
			}),
			abs: Object.assign(function abs(num){
				return Math.abs(num);
			}, {
				__doc__: [
					'Returns the absolute value of the $number',
					'That is, it returns the number without the negative sign'
				]
			}),
			factorial: Object.assign(function factorial(num){
				var negative = num < 0;
				num = Math.abs(num);
				
				if(!factorial.result[num])
				{
					factorial.result[num] = RDP.FNS.prod.call(RDP.FNS, RDP.FNS.range(1, num, 1));
				}
				
				return factorial.result[num] - negative;
			}, {
				__doc__: 'Calculates the factorial of $number',
				results: [
					1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880,
					3628800, 39916800, 479001600, 6227020800,
					87178291200, 1307674368000, 20922789888000,
					355687428096000, 6402373705728000,
					121645100408832000, 2432902008176640000
				]
			}),
			round: Object.assign(function round(num, decimals){
				var precision = Math.pow(10, decimals || 0);
				return Math.round(num * precision) / precision;
			}, {
				__doc__: [
					'Rounds the $number to the number of $decimals',
					'Negative $decimals will round to the nearest 10*abs($decimals)',
					'E.g.: round(123.45, -1) = 120, round(123.45) = 123, round(123.45, 1) = 123.5'
				]
			}),
			
			// type convertion and information
			int: Object.assign(function int(any, radix){
				return parseInt(any, radix);
			}, {
				__doc__: 'Converts anything into an integer, or NaN'
			}),
			float: Object.assign(function float(any){
				return parseFloat(any);
			}, {
				__doc__: 'Converts anything into a float, or NaN'
			}),
			str: Object.assign(function str(any){
				return '' + any;
			}, {
				__doc__: 'Converts anything into a string'
			}),
			is: Object.assign(function is(any, type_name){
				return RDP.FNS.get_type(any) === (type_name + '').toLowerCase();
			}, {
				__doc__: 'Checks if the value passed is of the type passed'
			}),
			get_type: Object.assign(function get_type(any){
				var type = typeof any;
				switch(type)
				{
					case 'boolean':
					case 'number':
					case 'string':
					case 'function':
						return type;
						
					case 'object':
						if(Array.isArray(any))
						{
							return 'array';
						}
						else if(any === null || any === undefined)
						{
							return 'null';
						}
						else
						{
							return 'object';
						}
					
					case 'undefined':
						return 'null';
						
					default:
						return null;
				}
				
				// intentional dead code
				return null;
			}, {
				__doc__: 'Returns a string with the type of the value'
			})
		},
		
		Tokenizer: function Tokenizer(){
			this._code = '';
			this._cursor = 0;
			
			this._line = 0;
			this._column = 0;
			this._last_token = {};
		},
		
		Parser: function Parser(){
			this._code = '';
			this._tokenizer = new RDP.Tokenizer();
			this._syntax_analyzer = new RDP.SyntaxAnalyzer();
			
			this._line = 0;
			this._lookahead = null;
		},
		
		SyntaxAnalyzer: function SyntaxAnalyzer(){
			this._abs = {};
			
			this._cursor = 0;
			
			this._last_token = {};
		},
		
		Optimizer: function Optimizer(){
			this._abs = {};
			this._compiler = null;
		},
		
		Compiler: function Compiler(){
			this._abs = {};
			
			this._code = [];
			
			this._optimizer = new RDP.Optimizer();
		},
		
		Utils: {
			isNewLine: function isNewLine(str){
				return /^(?:\r\n|[\r\n])+$/.test(str);
			},
			hasNewLine: function hasNewLine(str){
				return /\r\n|[\r\n]/.test(str);
			},
			countNewLines: function countNewLines(str){
				/**
				 * https://stackoverflow.com/a/43820645
				 * Using str.split(/\r\n|\r|\n/).length causes wrong results.
				 * For a string with 0 or 1 lines, counts as 2 lines ... always ...
				 */
				
				return (str.match(/\r\n|[\r\n]/) || '').length;
			},
			getLastLineLength: function getLastLineLength(str){
				if(this.isNewLine(str))
				{
					return 0;
				}
				else if(!this.hasNewLine(str))
				{
					return str.length;
				}
				else
				{
					return (str.split(/\r\n|[\r\n]/).slice(-1)[0] || '').length;
				}
			},
			removeNewLines: function removeNewLines(str, chr){
				return (str + '').replace(/\r\n|[\r\n]/, chr ? chr : ' ');
			},
			
			parseNumber: function parseNumber(value){
				return /^[\-+]?0x/.test(value)
					? value.replace(/0x([\da-f]+)\.([\da-f]+)$/i, '0x$1 0x$2')
						.split(' ')
						.map(function(value){
							return window.parseInt(value);
						})
						.join('.')
					: (
						/^[\-+]?0b/.test(value)
						? value.replace(/0b([01]+)\.([01]+)$/i, '$1 $2')
							.replace('0b', '')
							.split(' ')
							.map(function(value){
								return window.parseInt(value, 2);
							})
							.join('.')
						: window.parseFloat(value)
					);
			},
			
			getWordType: function getWordType(value){
				return Object.keys(RDP.Words).filter(function(key){
					return !!~RDP.Words[key].indexOf(value);
				})[0];
			},
			
			tokenIsLiteral: function tokenIsLiteral(token){
				return !!~[
					'[',
					'NUMBER',
					'STRING',
					'CHAR',
					'VARIABLE',
					'FUNCTION',
					'CONSTANT',
					'CONSTANT_VAL',
					'ArrayLiteral',
					'NumericLiteral',
					'CharLiteral',
					'StringLiteral',
					'ConstantLiteral'
				].indexOf(token.type);
			},
			
			tokenIsExpression: function tokenIsExpression(token){
				return this.tokenIsLiteral(token)
					|| !!~[
						'VariableExpression',
						'ConstantExpression',
						'CallExpression',
						'CALL',
						'(',
						'ParenthesizedExpression'
					].indexOf(token.type);
			},
			
			tokenOpensArguments: function tokenOpensArguments(token){
				return (
					token.type === '('
				) || (
					token.type === 'WORD'
					&& ~RDP.Words.ARGS.indexOf(token.value.toLowerCase())
				);
			},
			
			tokenClosesArguments: function tokenClosesArguments(token){
				return token.type === '(' || token.type === ';';
			},
			
			tokenOpensIndexing: function tokenOpensIndexing(token){
				return (
					token.type === '['
				) || (
					token.type === 'OPERATOR'
					&& ~RDP.Symbols.INDEX.indexOf(token.value)
				);
			}
		}
	};
	
	RDP.Tokenizer.prototype = {
		init: function(code){
			this._code = code;
			this._cursor = 0;
			
			this._line = +!!code;
			this._column = 0;
			this._last_token = {};
		},
		
		isEOF: function(){
			return this._cursor >= this._code.length;
		},
		
		hasMoreTokens: function(){
			return this._cursor < this._code.length;
		},
		
		getNextToken: function(){
			if(!this.hasMoreTokens())
			{
				return null;
			}
			
			const code = this._code.slice(this._cursor);
			
			for(const [regex, type] of RDP.Spec)
			{
				var matches = regex.exec(code);
				if(!matches)
				{
					continue;
				}
				
				this._cursor += matches[0].length;
				
				if(!type)
				{
					var newlines = RDP.Utils.countNewLines(matches[0]);
					if(newlines)
					{
						this._line += newlines;
						this._column = RDP.Utils.getLastLineLength(matches[0]);
					}
					else
					{
						this._column += RDP.Utils.getLastLineLength(matches[0]);
					}
					
					return this.getNextToken();
				}
				
				var token = {
					type: type,
					value: matches[0],
					line: this._line,
					column: this._column + 1
				};
				
				// need to repeat here, otherwise the line number is wrong...
				var newlines = RDP.Utils.countNewLines(token.value);
				if(newlines)
				{
					this._line += newlines;
					this._column = RDP.Utils.getLastLineLength(token.value);
				}
				else
				{
					this._column += RDP.Utils.getLastLineLength(token.value);
				}
				
				return this._last_token = token;
			}
			
			this._last_token = {
				type: undefined,
				value: code[0],
				line: this._line,
				column: this._column
			};
			
			throw new SyntaxError('Unexpected token "' + code[0] + '"', FILENAME, this._line);
		},
		
		getLastToken: function(){
			return this._last_token || {
				type: undefined,
				value: undefined,
				line: this._line,
				column: this._column
			};
		}
	};
	
	RDP.Parser.prototype = {
		parse: function(code){
			this._line = +!!code;
			
			this._code = code;
			this._tokenizer.init(code);
			
			this._lookahead = this._tokenizer.getNextToken();
			
			this._syntax_analyzer.init(this.Program());
			
			return this._syntax_analyzer.analyze();
		},
		
		getLastToken: function(){
			return this._tokenizer.getLastToken();
		},
		
		_eat: function(){
			var types = Array.from(arguments);
			var token = this._lookahead;
			
			if(token == null)
			{
				throw new SyntaxError('Unexpected end of input, expected ' + types, FILENAME, this._line);
			}
			
			if(types[0] !== '*')
			{
				if(!~types.indexOf(token.type))
				{
					var message = 'Unexpected token ' + JSON.stringify(token.value) + ' of type ' + (token.type || 'UNKNOWN') + ', expected ' + types;
					
					throw new SyntaxError(message, FILENAME, token.line);
				}
			}
			
			if(!token.line)
			{
				token.line = this._line;
			}
			
			do
			{
				this._lookahead = this._tokenizer.getNextToken();
				
				this._line += RDP.Utils.countNewLines(token.value || token.value_raw);
				
				if(this._lookahead && this._lookahead.type === 'WORD')
				{
					this._lookahead.value_raw = this._lookahead.value;
					this._lookahead.value = RDP.Utils.getWordType(this._lookahead.value_raw);
				}
			}
			while (
				this._lookahead
				&& this._lookahead.type === 'WORD'
				&& this._lookahead.value === 'IGNORE'
			);
			
			return token;
		},
		
		_jump: function(){
			// if this is the last token, do nothing
			if(!this._lookahead)
			{
				return null;
			}
			
			var types = Array.from(arguments);
			
			// if there are types passed, and the next token isn't that type, do nothing
			if(types.length && !~types.indexOf(this._lookahead.type))
			{
				return false;
			}
			
			// otherwise, eat regardless of type
			return this._eat(this._lookahead.type);
		},
		
		/**
		 * Main entry point for the code
		 * 
		 * Program
		 *   : PrimaryExpression
		 *   ;
		 */
		Program: function(){
			var program = {
				type: 'Program',
				body: []
			};
			
			while(!this._tokenizer.isEOF() || this._lookahead)
			{
				var token = this.PrimaryExpression();
				if(token)
				{
					if(token.type === 'WordStatement' && token.value === 'IGNORE')
					{
						continue;
					}
					
					program.body = program.body.concat(token);
				}
				else
				{
					continue;
				}
			}
			
			return program;
		},
		
		/**
		 * PrimaryExpression
		 *   : ExpressionStatement
		 *   | ParenthesizedExpression
		 *   | CommentStatement
		 *   | FunctionStatement
		 *   | WordStatement
		 *   | SymbolStatement
		 *   ;
		 */
		PrimaryExpression: function(){
			switch(this._lookahead.type)
			{
				case ';':
					this._eat(';');
					return null;
				
				case 'COMMENT_SINGLE_LINE':
				case 'COMMENT_MULTI_LINE':
					return this.CommentStatement();
				
				case 'OUTPUT':
					return this.OutputStatement();
				
				case 'DEFINE':
					return this.DefineStatement();
				
				case 'ASSIGN':
					return this.AssignStatement();
				
				case 'RETURN':
					return this.ReturnStatement();
				
				case 'WORD':
					return this.WordStatement();
				
				case 'SYMBOL':
					return this.SymbolStatement();
				
				case 'FUNCTION':
					return this.CallStatement();
				
				case 'IF_BLOCK':
				case 'UNLESS_BLOCK':
					return this.IfBlockStatement();
				case 'ELSE_BLOCK':
					return this.ElseBlockStatement();
				
				case 'FOR_LOOP':
					return this.ForLoopBlockStatement();
				
				default:
					return this.ExpressionStatement();
			}
		},
		
		/**
		 * CommentStatement
		 *   : SinglelineCommentStatement
		 *   | MultilineCommentStatement
		 *   ;
		 */
		CommentStatement: function(){
			switch(this._lookahead.type)
			{
				case 'COMMENT_SINGLE_LINE':
					return this.SinglelineCommentStatement();
				
				case 'COMMENT_MULTI_LINE':
					return this.MultilineCommentStatement();
				
				default:
					throw new SyntaxError('Unexpected comment statement of type ' + this._lookahead.type, FILENAME, this._line);
			}
		},
		
		
		/**
		 * SinglelineCommentStatement
		 *   : '//' ... '\n'
		 *   ;
		 */
		SinglelineCommentStatement: function(){
			var token = this._eat('COMMENT_SINGLE_LINE');
			
			return {
				type: 'CommentStatement',
				value: token.value.slice(2).trim(),
				line: token.line,
				column: token.column,
				multi: false
			};
		},
		
		/**
		 * MultilineCommentStatement
		 *   : '/*' ... '*\/'
		 *   ;
		 */
		MultilineCommentStatement: function(){
			var token = this._eat('COMMENT_MULTI_LINE');
			
			return {
				type: 'CommentStatement',
				value: token.value.slice(2, -2),
				line: token.line,
				column: token.column,
				multi: true
			};
		},
		
		/**
		 * OutputStatement
		 *   : OUTPUT ArgumentsGroupFreeform
		 *   ;
		 */
		OutputStatement: function(){
			var token = this._eat('OUTPUT');
			var result = {
				type: 'OutputStatement',
				format: /f$/.test(token.value),
				args: [],
				line: token.line,
				column: token.column
			};
			
			var check_formatted = function(){
				if(this._lookahead && this._lookahead.type === 'WORD')
				{
					if(this._lookahead.value === 'FORMATTED')
					{
						if(result.format)
						{
							throw new SyntaxError('Unexpected word ' + JSON.stringify(this._lookahead.value_raw) + ' - Already in formatted output');
						}
						
						this._eat(this._lookahead.type);
						result.format = true;
					}
					else
					{
						throw new SyntaxError('Unexpected word ' + JSON.stringify(this._lookahead.value_raw));
					}
				}
			};
			
			check_formatted.call(this);
			
			result.args = this.ArgumentsGroupFreeform().value || [];
			
			check_formatted.call(this);
			
			return result;
		},
		
		/**
		 * CallStatement
		 *   : FUNCTION ArgumentsGroup [AssignExpression VariableExpression]
		 *   ;
		 */
		CallStatement: function(){
			var token = this._eat('FUNCTION');
			var result = {
				type: 'CallExpression',
				value: {
					type: 'FunctionExpression',
					value: token.value.slice(1),
					index: null,
					line: token.line,
					column: token.column,
					create: false
				},
				args: this.ArgumentsGroup(),
				line: token.line,
				column: token.column
			};
			
			
			if(this._lookahead.type !== 'ASSIGN')
			{
				return result;
			}
			
			
			this._eat(this._lookahead.type);
			var var_exp = this.VariableExpression();
			
			var_exp.assign = result;
			
			return var_exp;
		},
		
		/**
		 * CallExpression
		 *   : [CALL] FunctionExpression ArgumentsGroup
		 *   ;
		 */
		CallExpression: function(){
			var token = this._jump('CALL');
			
			if(token)
			{
				return {
					type: 'CallExpression',
					value: this.ValueExpression(),
					args: this.ArgumentsGroup(),
					line: token.line,
					column: token.column
				};
			}
			
			token = this.ValueExpression();
			
			return {
				type: 'CallExpression',
				value: token,
				args: this.ArgumentsGroup(),
				line: token.line,
				column: token.column
			};
		},
		
		
		/**
		 *   DefineStatement
		 *   : DefineFunctionStatement
		 *   | VariableExpression [AssignExpression]
		 *   | ConstantExpression [AssignExpression]
		 *   ;
		 */
		DefineStatement: function(){
			var token = this._eat('DEFINE');
			var expression = this.Expression();
			
			if(
				expression.type !== 'VariableExpression'
				&& expression.type !== 'FunctionExpression'
				&& expression.type !== 'ConstantExpression'
			)
			{
				throw new SyntaxError('Expected a variable, a constant or a function expression, got ' + expression.type);
			}
			
			// functions have a different definition handling
			if(expression.type === 'FunctionExpression')
			{
				if(RDP.FNS.hasOwnProperty(expression.value))
				{
					throw new SyntaxError('Cannot redefine the function &' + expression.value);
				}
				
				var result = this.DefineFunctionStatement();
				
				result.fn = expression;
				result.line = expression.line;
				result.column = expression.column;
				
				return result;
			}
			
			// handle anything that isn't a function
			expression.create = true;
			
			if(this._lookahead.type === 'ASSIGN')
			{
				expression.assign = this.AssignExpression();
			}
			
			return {
				type: 'DefineStatement',
				value: expression,
				line: token.line,
				column: token.column
			};
		},
		
		/**
		 *   DefineFunctionStatement
		 *   : FunctionExpression [
		 * 	   ARGS [ VariableExpression [',' VariableExpression]* ] ]
		 *     | [ '(' [ VariableExpression [',' VariableExpression]* ] ')' ]
		 *     | [ ARGS '(' [ VariableExpression [',' VariableExpression]* ] ')' ]
		 * 	 ] (
		 *       SCOPE_OPEN Statement [Statement]* SCOPE_CLOSE
		 *       | Statement
		 *   )
		 *   ;
		 */
		DefineFunctionStatement: function(){
			var result = {
				type: 'DefineFunctionStatement',
				fn: null,
				args: [],
				body: [],
				line: null,
				column: null,
				arrow: false
			};
			
			if(!this._lookahead)
			{
				return result;
			}
			
			
			// handle all arguments
			if(RDP.Utils.tokenOpensArguments(this._lookahead))
			{
				var args_token = this._eat(this._lookahead.type);
				
				if(this._lookahead.type === '(')
				{
					if(args_token.type === '(')
					{
						throw new SyntaxError('Expected a variable, got ' + args_token.type);
					}
					
					args_token = this._eat('(');
				}
				
				while(
					this._lookahead
					&& this._lookahead.type === 'VARIABLE'
				)
				{
					var arg = this.VariableExpression();
					
					if(arg.index)
					{
						throw new SyntaxError('Indexes are not allowed for variables in a function definition');
					}
					
					result.args[result.args.length] = arg;
					
					this._jump(',');
				}
				
				if(args_token.type === '(')
				{
					this._eat(')');
				}
			}
			
			this._jump(';');
			if(this._lookahead.type === 'SCOPE_OPEN')
			{
				this._eat('SCOPE_OPEN');
				
				while(this._lookahead && this._lookahead.type !== 'SCOPE_CLOSE')
				{
					var tokens = this.PrimaryExpression();
					if(tokens)
					{
						result.body = result.body.concat(tokens);
					}
				}
				
				this._eat('SCOPE_CLOSE');
			}
			else
			{
				result.arrow = true;
				
				var tokens = this.PrimaryExpression();
				if(tokens)
				{
					result.body = result.body.concat(tokens);
				}
				
				// keeping this here, in case i change my mind
				/*if(
					result.body.length === 1
					&& RDP.Utils.tokenIsExpression(result.body[0])
				)
				{
					result.body = [{
						type: 'ReturnStatement',
						value: result.body[0],
						line: result.body[0].line,
						column: result.body[0].column
					}];
				}*/
			}
			
			return result;
		},
		
		
		/**
		 *   AssignExpression
		 *   : ASSIGN ValueExpression
		 *   ;
		 */
		AssignExpression: function(){
			var token = this._eat('ASSIGN');
			
			var result = {
				type: 'AssignExpression',
				value: this.Expression(),// this.ValueExpression(),
				line: token.line,
				column: token.column
			};
			
			if(
				result.value.type === 'FunctionExpression'
				&& RDP.Utils.tokenOpensArguments(this._lookahead)
			)
			{
				result.value = {
					type: 'CallExpression',
					value: result.value,
					args: this.ArgumentsGroup(),
					line: result.value.line,
					column: result.value.column
				};
			}
			
			return result;
		},
		
		
		/**
		 *   AssignExpression
		 *   : VARIABLE ValueExpression
		 *   | ValueExpression VARIABLE
		 *   ;
		 */
		AssignStatement: function(){
			var assign = this.AssignExpression();
			var result = {
				type: 'AssignStatement',
				value: null,
				assign: assign,
				line: assign.line,
				column: assign.column
			};
			
			if(assign.value.type === 'VariableExpression')
			{
				if(assign.value.assign)
				{
					result.value = assign.value;
					result.assign = result.value.assign;
					result.value.assign = null;
				}
				else
				{
					result.value = assign.value;
					assign.value = this.Expression();
				}
			}
			else
			{
				result.value = this.Expression();
			}
			
			return result;
		},
		
		
		/**
		 *   ReturnStatement
		 *   : [ValueExpression]
		 *   ;
		 */
		ReturnStatement: function(){
			var token = this._eat('RETURN');
			var result = {
				type: 'ReturnStatement',
				value: {
					type: 'ConstantLiteral',
					value: 'null',
					line: token.line,
					column: token.column
				},
				line: token.line,
				column: token.column
			};
			
			if(this._lookahead && this._lookahead.type !== ';')
			{
				result.value = this.ArgumentsGroupFreeform(true).value[0];
			}
			
			return result;
		},
		
		/**
		 * WordStatement
		 *   : (.*)
		 *   ;
		 */
		WordStatement: function(){
			var token = this._eat('WORD');
			var value = token.value.toLowerCase();
			
			return {
				type: 'WordStatement',
				value: Object.keys(RDP.Words).filter(function(key){
					return !!~RDP.Words[key].indexOf(value);
				})[0],
				value_raw: token.value,
				line: token.line,
				column: token.column
			};
		},
		
		/**
		 * SymbolStatement
		 *   : (.*)
		 *   ;
		 */
		SymbolStatement: function(){
			var token = this._eat('SYMBOL');
			
			return {
				type: 'SymbolStatement',
				value: token.value,
				line: token.line,
				column: token.column
			};
		},
		
		/**
		 *   IfBlockStatement
		 *     : IF_BLOCK Expression SCOPE_OPEN [Statement]* SCOPE_CLOSE
		 *     | UNLESS_BLOCK Expression SCOPE_OPEN [Statement]* SCOPE_CLOSE
		 *     | IF_BLOCK Expression Statement
		 *     | UNLESS_BLOCK Expression Statement
		 *     ;
		 */
		IfBlockStatement: function(){
			var token = this._eat('IF_BLOCK', 'UNLESS_BLOCK');
			var expression = this.Expression();
			
			var result = {
				type: 'IfBlockStatement',
				condition: expression,
				body: [],
				line: token.line,
				column: token.column,
				unless: token.type === 'UNLESS_BLOCK'
			};
			
			if(!this._lookahead)
			{
				return result;
			}
			
			this._jump(';');
			if(this._lookahead.type === 'SCOPE_OPEN')
			{
				this._eat('SCOPE_OPEN');
				
				while(this._lookahead && this._lookahead.type !== 'SCOPE_CLOSE')
				{
					var tokens = this.PrimaryExpression();
					if(tokens)
					{
						result.body = result.body.concat(tokens);
					}
				}
				
				this._eat('SCOPE_CLOSE');
			}
			else
			{
				var tokens = this.PrimaryExpression();
				if(tokens)
				{
					result.body = result.body.concat(tokens);
				}
			}
			
			
			return result;
		},
		
		/**
		 *   ElseBlockStatement
		 *     : ELSE_BLOCK SCOPE_OPEN [Statement]* SCOPE_CLOSE
		 *     | ELSE_BLOCK Statement
		 *     ;
		 */
		ElseBlockStatement: function(){
			var token = this._eat('ELSE_BLOCK');
			
			var result = {
				type: 'ElseBlockStatement',
				body: [],
				line: token.line,
				column: token.column
			};
			
			if(!this._lookahead)
			{
				return result;
			}
			
			this._jump(';');
			if(this._lookahead.type === 'SCOPE_OPEN')
			{
				this._eat('SCOPE_OPEN');
				
				while(this._lookahead && this._lookahead.type !== 'SCOPE_CLOSE')
				{
					var tokens = this.PrimaryExpression();
					if(tokens)
					{
						result.body = result.body.concat(tokens);
					}
				}
				
				this._eat('SCOPE_CLOSE');
			}
			else
			{
				var tokens = this.PrimaryExpression();
				if(tokens)
				{
					result.body = result.body.concat(tokens);
				}
			}
			
			
			return result;
		},
		
		/**
		 *   ForLoopBlockStatement
		 *     : FOR_BLOCK BodyGroup
		 *     ;
		 */
		ForLoopBlockStatement: function(){
			var token = this._eat('FOR_LOOP');
			
			var result = {
				type: 'ForLoopBlockStatement',
				loop: {
					type: 'none',
					var: null,
					start: null,
					end: null,
					step: null
				},
				body: [],
				line: token.line,
				column: token.column
			};
			
			if(!this._lookahead)
			{
				throw new SyntaxError('Unexpected end of the code');
			}
			
			if(token.value.toLowerCase() === 'for')
			{
				/*if(this._lookahead.value === '(')
				{
					this._eat('(');
					
					// classic for(<var>; <cond>; <inc>)
					result.loop.type = 'c-style';
					
					result.loop.start = this.AssignExpression();
					this._eat(';');
					result.loop.end = this.Expression();
					this._eat(';');
					result.loop.step = this.Expression();
				
					this._eat(')');
				}
				else */
				if(this._lookahead.type === 'VARIABLE')
				{
				
					result.loop.var = this.VariableExpression();
					result.loop.start = null;
					
					// for <var> from <value> to <value> step <value>
					result.loop.type = 'simple';
					
					if(this._lookahead && this._lookahead.value !== 'BOOL_HAS')
					{
						this._jump('WORD');
						result.loop.start = this.Expression();
						
						this._jump('WORD');
						result.loop.end = this.Expression();
						
						this._jump('WORD');
						if(this._lookahead && RDP.Utils.tokenIsExpression(this._lookahead))
						{
							result.loop.step = this.Expression();
						}
					}
					else
					{
						// for <var> in <value>..<value>
						result.loop.type = 'range';
						
						this._eat('WORD');
						result.loop.start = this.Expression();
						
						var operator = this._eat('OPERATOR');
						
						if(operator.value !== '..')
						{
							throw new SyntaxError('Expected range operator (".."), got ' + JSON.stringify(operator.value));
						}
						
						result.loop.end = this.Expression();
					}
				}
				else
				{
					throw new SyntaxError('Invalid for loop definition. Expected a variable or an expression');
				}
				
				this._jump(';');
			}
			else
			{
				// loop from <value> to <value> as <var>
				
				result.loop.start = this.Expression();
				this._jump('WORD');
				result.loop.end = this.Expression();
				this._jump('WORD');
				result.loop.var = this.VariableExpression();
			}
			
			// TODO: FINISH
			
			if(!this._lookahead)
			{
				return result;
			}
			
			result.body = this.BodyGroup();
			
			return result;
		},
		
		/**
		 * ParenthesizedExpression
		 *   : '(' Expression ')'
		 *   ;
		 */
		ParenthesizedExpression: function(){
			var open = this._eat('(');
			
			while(this._lookahead && this._lookahead.value === '\n')
			{
				this._jump(this._lookahead.type);
			}
			
			var expression = this.Expression();
			
			
			while(this._lookahead && this._lookahead.value === '\n')
			{
				this._jump(this._lookahead.type);
			}
			
			var close = this._eat(')');
			
			return {
				type: 'ParenthesizedExpression',
				value: expression,
				line: open.line,
				column: open.column,
				close_line: close.line,
				close_column: close.column
			};
		},
		
		/**
		 * ExpressionStatement
		 *   : Expression ';'
		 *   | Expression
		 *   ;
		 */
		ExpressionStatement: function(){
			var expression = this.Expression();
			
			//if(!this._tokenizer.isEOF())
			if(this._lookahead && this._lookahead.type === ';')
			{
				this._eat(';');
			}
			
			if(this._lookahead && this._lookahead.type === ',')
			{
				this._eat(',');
			}
			
			return expression;
		},
		
		
		
		/**
		 * Expression
		 *   : ParenthesizedExpression
		 *   | ValueExpression
		 *   ;
		 */
		Expression: function(){
			switch(this._lookahead.type)
			{
				case '(':
					return this.ParenthesizedExpression();
				
				/*case 'OPERATOR':
					return this.OperatorExpression();*/
					
				default:
					return this.ValueExpression();
			}
		},
		
		
		/**
		 * ValueExpression
		 *   : VariableExpression
		 *   | FunctionExpression
		 *   | ConstantExpression
		 *   | CallExpression
		 *   | Literal
		 *   ;
		 */
		ValueExpression: function(){
			switch(this._lookahead.type)
			{
				case 'VARIABLE':
					return this.VariableExpression();
				
				case 'FUNCTION':
					return this.FunctionExpression();
				
				case 'CONSTANT':
					return this.ConstantExpression();
				
				case 'CALL':
					return this.CallExpression();
				
				default:
					return this.Literal();
			}
		},
		
		
		/**
		 * IndexExpression
		 *   : ('[' (VARIABLE|CONSTANT|NUMBER|STRING|CHAR)* ']')*
		 *   | ( -> | :: ) WORD
		 *   ;
		 */
		IndexExpression: function(){
			var indexes = [];
			
			do
			{
				var open = this._eat(this._lookahead.type);
				var token = {
					type: 'IndexExpression',
					value: null,
					line: open.line,
					column: open.column,
					close_line: open.line,
					close_column: open.column
				};
				
				switch(open.type)
				{
					case '[':
						switch(this._lookahead.type)
						{
							case ']':
								// just leave in case of empty index
								break;
							
							case 'NUMBER':
								token.value = this.NumericLiteral();
								break;
								
							case 'STRING':
								token.value = this.StringLiteral();
								break;
								
							case 'CHAR':
								token.value = this.CharLiteral();
								break;
								
							case 'VARIABLE':
								token.value = this.VariableExpression();
								break;
								
							case 'CONSTANT':
								token.value = this.ConstantExpression();
								break;
							
							default:
								throw new SyntaxError('Expected literal type or variable or constant, got "' + this._lookahead.type + '"', FILENAME, this._line);
						}
						
						
						var close = this._eat(']');
						
						token.close_line = close.line;
						token.close_column = close.column;
						
						break;
					
					case 'OPERATOR':
						if(!this._lookahead)
						{
							throw new SyntaxError('Unexpected end of the code', FILENAME, this._line);
						}
						
						// var value = this._lookahead.value || this._lookahead.value_raw;
						var value_token = this._eat('*');
						
						var value = value_token.value || value_token.value_raw;
						
						if(!/^[a-z_\d]+$/i.test(value))
						{
							throw new SyntaxError('Expected any word, got "' + value + '"', FILENAME, this._line);
						}
						
						// var value_token = this._eat(this._lookahead.type);
						
						// Fakes a string literal to be easier to compile
						token.value = {
							type: 'StringLiteral',
							value: value,
							line: value_token.line,
							column: value_token.column
						};
						
						while(this._lookahead && /^[a-z_\d]+$/i.test(this._lookahead.value || this._lookahead.value_raw))
						{
							value_token = this._eat(this._lookahead.type);
							
							token.value.value += this._lookahead.value || this._lookahead.value_raw;
						}
						
						token.close_line = value_token.line;
						token.close_column = value_token.column + token.value.value.length;
						
						break;
					
					default:
						throw new SyntaxError('Expected [ or OPERATOR -> or :: or . (period), got "' + this._lookahead.type + '"', FILENAME, this._line);
				}
				
				indexes[indexes.length] = token;
				
			}
			while(this._lookahead && RDP.Utils.tokenOpensIndexing(this._lookahead));
			
			return {
				type: 'IndexExpressionGroup',
				value: indexes,
				line: indexes[0].line,
				column: indexes[0].column,
				close_line: indexes[indexes.length - 1].close_line,
				close_column: indexes[indexes.length - 1].close_column
			};
		},
		
		
		/**
		 * VariableExpression
		 *   : VARIABLE [ IndexExpression [ ',' \s* IndexExpression ] ]
		 *   ;
		 */
		VariableExpression: function(){
			var token = this._eat('VARIABLE');
			var result = {
				type: 'VariableExpression',
				value: token.value.slice(1),
				line: token.line,
				column: token.column,
				global: token.value[0] === '%',
				index: null,
				create: false,
				assign: null
			};
			
			if(this._lookahead && RDP.Utils.tokenOpensIndexing(this._lookahead))
			{
				result.index = this.IndexExpression();
			}
			
			if(this._lookahead && this._lookahead.type === 'ASSIGN')
			{
				result.assign = this.AssignExpression();
			}
			
			return result;
		},
		
		
		/**
		 * ConstantExpression
		 *   : CONSTANT [ IndexExpression [ ',' \s* IndexExpression ] ]
		 *   ;
		 */
		ConstantExpression: function(){
			var token = this._eat('CONSTANT');
			var result = {
				type: 'ConstantExpression',
				value: token.value.slice(1),
				line: token.line,
				column: token.column,
				index: null,
				create: false,
				assign: null
			};
			
			
			if(this._lookahead && RDP.Utils.tokenOpensIndexing(this._lookahead))
			{
				
				result.index = this.IndexExpression();
			}
			
			return result;
		},
		
		/**
		 * FunctionExpression
		 *   : FUNCTION
		 *   ;
		 */
		FunctionExpression: function(){
			var token = this._eat('FUNCTION');
			
			return {
				type: 'FunctionExpression',
				value: token.value.slice(1),
				index: null,
				line: token.line,
				column: token.column,
				create: false
			};
		},
		
		
		/**
		 * Literal
		 *   : NumericLiteral
		 *   | StringLiteral
		 *   | CharLiteral
		 *   | ArrayLiteral
		 *   | ConstantLiteral
		 *   ;
		 */
		Literal: function(){
			switch(this._lookahead.type)
			{
				case 'NUMBER':
					return this.NumericLiteral();
				case 'STRING':
					return this.StringLiteral();
				case 'CHAR':
					return this.CharLiteral();
				case '[': // array
					return this.ArrayLiteral();
				case 'CONSTANT_VAL': // array
					return this.ConstantLiteral();
				
				default:
					throw new SyntaxError('Unexpected token ' + JSON.stringify(this._lookahead.value) + ' of type ' + this._lookahead.type, FILENAME, this._line);
			}
		},
		
		/**
		 * NumericLiteral
		 *   : NUMBER
		 *   ;
		 */
		NumericLiteral: function(){
			var token = this._eat('NUMBER');
			
			return {
				type: 'NumericLiteral',
				value: token.value,
				line: token.line,
				column: token.column
			};
		},
		
		/**
		 * StringLiteral
		 *   : STRING
		 *   ;
		 */
		StringLiteral: function(){
			var token = this._eat('STRING');
			
			return {
				type: 'StringLiteral',
				value: token.value.slice(1, -1),
				line: token.line,
				column: token.column
			};
		},
		
		/**
		 * CharLiteral
		 *   : CHAR
		 *   ;
		 */
		CharLiteral: function(){
			var token = this._eat('CHAR');
			
			return {
				type: 'CharLiteral',
				value: token.value.slice(1, -1),
				line: token.line,
				column: token.column
			};
		},
		
		/**
		 * ArrayLiteral
		 *   : '[' Literal* ']'
		 *   ;
		 */
		ArrayLiteral: function(){
			var token = this._eat('[');
					
			while(this._lookahead && this._lookahead.value === '\n')
			{
				this._jump(this._lookahead.type);
			}
			
			var result = {
				type: 'ArrayLiteral',
				value: this.ArgumentsGroupFreeform().value,
				line: token.line,
				column: token.column
			};
			
			/*while(this._lookahead.type !== ']')
			{
				result.value[result.value.length] = this.Expression();
				
				if(this._lookahead.type === ',')
				{
					this._eat(',');
				}
			}*/
					
			while(this._lookahead && this._lookahead.value === '\n')
			{
				this._jump(this._lookahead.type);
			}
			
			this._eat(']');
			
			return result;
		},
		
		/**
		 * ConstantLiteral
		 *   : CONSTANT_VAL
		 *   ;
		 */
		ConstantLiteral: function(){
			var token = this._eat('CONSTANT_VAL');
			
			return {
				type: 'ConstantLiteral',
				value: token.value,
				line: token.line,
				column: token.column
			};
		},
		
		
		
		
		/**
		 * ArgumentsGroup
		 *   : ARGS Expression ["," Expression]*
		 *   | "(" Expression ["," Expression]* ")"
		 *   ;
		 */
		ArgumentsGroup: function(){
			var result = {
				type: 'ArgumentsGroup',
				value: [],
				line: null,
				column: null
			};
			
			if(RDP.Utils.tokenOpensArguments(this._lookahead))
			{
				var args_token = this._eat(this._lookahead.type);
				result.line = args_token.line;
				result.column = args_token.column;
				
				if(this._lookahead.type === '(')
				{
					if(args_token.type === '(')
					{
						throw new SyntaxError('Unexpected token ' + args_token.value + ' of type ' + args_token.type);
					}
					
					args_token = this._eat('(');
				}
				
				while(this._lookahead && this._lookahead.value === '\n')
				{
					this._jump(this._lookahead.type);
				}
				
				while(this._lookahead && RDP.Utils.tokenIsExpression(this._lookahead))
				{
					var arg = this.Expression();
					
					if(
						arg.type === 'FunctionExpression'
						&& RDP.Utils.tokenOpensArguments(this._lookahead)
					)
					{
						arg = {
							type: 'CallExpression',
							value: arg,
							args: this.ArgumentsGroup(),
							line: arg.line,
							column: arg.column
						};
					}
					
					result.value[result.value.length] = arg;
					
					while(this._lookahead && this._lookahead.value === '\n')
					{
						this._jump(this._lookahead.type);
					}
					
					this._jump(',');
					
					while(this._lookahead && this._lookahead.value === '\n')
					{
						this._jump(this._lookahead.type);
					}
				}
				
				if(args_token.type === '(')
				{
					this._eat(')');
				}
			}
			
			return result;
		},
		
		/**
		 * ArgumentsGroupFreeform
		 *   : Expression ["," Expression]*
		 *   ;
		 */
		ArgumentsGroupFreeform: function(single_arg){
			var result = {
				type: 'ArgumentsGroup',
				value: [],
				line: null,
				column: null
			};
				
			while(this._lookahead && RDP.Utils.tokenIsExpression(this._lookahead))
			{
				var arg = this.Expression();
				
				if(
					arg.type === 'FunctionExpression'
					&& RDP.Utils.tokenOpensArguments(this._lookahead)
				)
				{
					arg = {
						type: 'CallExpression',
						value: arg,
						args: this.ArgumentsGroup(),
						line: arg.line,
						column: arg.column
					};
				}
				
				result.value[result.value.length] = arg;
				
				if(
					single_arg
					&& this._lookahead
					&& !RDP.Utils.tokenClosesArguments(this._lookahead)
				)
				{
					throw new SyntaxError('Only a single argument is expected', FILENAME, this._line);
				}
				
				var jumped = this._jump(',');
				if(jumped)
				{
					while(this._lookahead && this._lookahead.value === '\n')
					{
						this._jump(this._lookahead.type);
					}
				}
			}
			
			return result;
		},
		
		/**
		 * BodyGroup
		 *   : SCOPE_OPEN [Statement]* SCOPE_CLOSE
		 *   | Statement
		 *   ;
		 */
		BodyGroup: function(){
			var body = [];
			
			this._jump(';');
			if(this._lookahead.type === 'SCOPE_OPEN')
			{
				this._eat('SCOPE_OPEN');
				
				while(this._lookahead && this._lookahead.type !== 'SCOPE_CLOSE')
				{
					var tokens = this.PrimaryExpression();
					if(tokens)
					{
						body = body.concat(tokens);
					}
				}
				
				this._eat('SCOPE_CLOSE');
			}
			else
			{
				var tokens = this.PrimaryExpression();
				if(tokens)
				{
					body = body.concat(tokens);
				}
			}
			
			return body;
		}
	};
	
	RDP.SyntaxAnalyzer.prototype = {
		init: function(abs){
			this._abs = abs;
			this._cursor = 0;
			
			this._lookahead = abs.body[0];
			this._last_token = null;
		},
		
		_eat: function(){
			var types = Array.from(arguments);
			var token = this._lookahead;
			
			if(token == null)
			{
				throw new SyntaxError('Unexpected end of input, expected ' + types, FILENAME, token.line);
			}
			
			if(!~types.indexOf(token.type))
			{
				var message = 'Unexpected token ' + JSON.stringify(token.value) + ' of type ' + token.type + ', expected ' + types;
				
				throw new SyntaxError(message, FILENAME, token.line);
			}
			
			this._lookahead = this.getNextToken();
			
			return token;
		},
		
		hasMoreTokens: function(){
			return this._cursor < this._abs.body.length;
		},
		
		getNextToken: function(){
			if(!this.hasMoreTokens())
			{
				return null;
			}
			
			++this._cursor;
			
			return this._last_token = this._abs.body[this._cursor];
		},
		
		analyze: function(){
			var new_body = [];
			
			while(this.hasMoreTokens())
			{
				var token = this._lookahead;
				this._lookahead = this.getNextToken();
				
				new_body[new_body.length] = this.analyzeToken(token);
			}
			
			this._abs.body = new_body;
			
			return this._abs;
		},
		
		analyzeToken: function(token){
			switch(token.type)
			{
				case 'OutputStatement':
					return this.analyzeOutputStatement(token);
				
				case 'CallExpression':
					return this.analyzeCallExpression(token);
				
				case 'WordStatement':
					return this.analyzeWordStatement(token);
				
				/*case 'ElseBlockStatement': // <-- to fix!
					return this.analyzeElseBlockStatement(token);*/
				
				default:
					return token;
			}
		},
		
		analyzeElseBlockStatement: function(token){
			if(!this._last_token || this._last_token.type !== 'IfBlockStatement')
			{
				throw new SyntaxError('An else block can only come after an if/unless block', FILENAME, token.line);
			}
			
			return token;
		},
		
		analyzeOutputStatement: function(token){
			if(token.format)
			{
				if(!token.args.length)
				{
					throw new SyntaxError('Expected output format string, but none provided', FILENAME, token.line);
				}
				
				token.format = token.args.shift();
			}
			
			return token;
		},
		
		analyzeCallExpression: function(token){
			if(
				RDP.Utils.tokenIsLiteral(token.value)
				&& token.value.type !== 'FUNCTION'
			)
			{
				throw new SyntaxError('Expected function value, got ' + token.value.type, FILENAME, token.line);
			}
			
			return token;
		},
		
		analyzeWordStatement: function(token){
			switch(token.value)
			{
				case 'DEFINE':
					return this.analyzeWordDefineStatement(token);
				
				default:
					return token;
			}
		},
		
		analyzeWordDefineStatement: function(token){
			var new_token = {
				type: this._lookahead.type,
				value: this._lookahead.value,
				line: token.line,
				column: token.column
			};
			
			switch(this._lookahead.type)
			{
				case 'WordStatement':
					var token = this._eat('WordStatement');
					
					if(token.value !== 'FUNCTION')
					{
						throw new SyntaxError('Unexpected token ' + JSON.stringify(token.value_raw) + ', expected ' + RDP.Words.OPEN, FILENAME, token.line);
					}
					
					var fn_token = this._eat('FunctionExpression');
					
					if(
						this._lookahead
						&& this._lookahead.type === 'WordStatement'
						&& this._lookahead.value === 'OPEN'
					)
					{
						this._eat('WordStatement');
						
						while(
							this._lookahead
							&& (
								this._lookahead.type !== 'WordStatement'
								|| this._lookahead.value !== 'CLOSE'
							)
						)
						{
							token = this._lookahead;
							this._lookahead = this.getNextToken();
							
							fn_token.body[fn_token.body.length] = this.analyzeToken(token);
						}
						
						this._eat('WordStatement');
					}
					else
					{
						var token = this._lookahead;
						this._lookahead = this.getNextToken();
						
						fn_token.body = [this.analyzeToken(token)];
					}
					
					new_token.type = fn_token.type;
					new_token.value = fn_token.value;
					new_token.args = fn_token.args;
					new_token.body = fn_token.body;
					
					break;
				
				case 'VariableExpression':
				case 'ConstantExpression':
					var token = this._eat(this._lookahead.type);
					
					new_token.global = token.global;
					new_token.index = token.index;
					new_token.start_value = null;
					new_token.create = true;
					
					if(
						this._lookahead
						&& this._lookahead.type === 'WordStatement'
						&& this._lookahead.value === 'ASSIGN'
					)
					{
						this._eat('WordStatement');
						
						new_token.start_value = this._eat(
							'NumericLiteral',
							'StringLiteral',
							'CharLiteral',
							'VariableExpression',
							'ConstantExpression',
							'ArrayLiteral'
						);
					}
				
					break;
				
				default:
					// intentionally have nothing here!
					break;
			}
			
			return new_token;
		}
	};
	
	RDP.Optimizer.prototype = {
		init: function init(abs, compiler){
			this._abs = abs;
			this._compiler = compiler;
		},
		
		optimize: function optimize(settings){
			if (!settings)
			{
				return this._abs;
			}
			
			for(var name in this.optimizers)
			{
				if(!this._abs.body.length)
				{
					return this._abs;
				}
				
				if(settings === true || settings[name])
				{
					this._abs.body = this.optimizers[name].fn.call(
						this,
						this._abs.body,
						settings === true
							? true
							: settings[name]
					);
				}
			}
			
			return this._abs;
		},
		
		getOptimizationsInfo: function getOptimizationsInfo(){
			var info = {};
			var replace = {
				'`': '<code>',
				'´': '</code>',
				'"': '&quot;',
				'<': '&lt;',
				'>': '&gt;'
			};
			
			for(var name of Object.keys(this.optimizers))
			{
				info[name] = {
					name: name,
					title: this.optimizers[name].title,
					desc: this.optimizers[name].desc.map(function(line){
						return line.replace(/[`´"<>]/g, function(chr){
							return replace[chr];
						});
					}),
					types: this.optimizers[name].types
				};
			}
			
			return info;
		},
		
		_handleBodyTokens: function _handleBodyTokens(body, types, fn){
			if(!Array.isArray(types))
			{
				types = [types];
			}
			
			var handle_body = function handle_body(token){
				if(token.body && token.body.length)
				{
					// Read Note 1
					token.body = token.body.map(handle_body, this).filter(function(value){
						return value;
					});
				}
				/*else if(token.args && token.args.length)
				{
					// Read Note 1
					token.args = token.args.map(handle_body, this).filter(function(value){
						return value;
					});
				}*/
				
				if(types.length && !~types.indexOf(token.type))
				{
					return token;
				}
				
				return fn.call(this, token);
			};
			
			return body.length
				// Read Note 1
				? body.map(handle_body, this).filter(function(value){
					return value;
				})
				: body;
		},
		
		_handleValues: function _handleValues(values, types, fn){
			if(!Array.isArray(types))
			{
				types = [types];
			}
			
			var handle_values = function handle_values(token){
				if(
					token.type === 'ArrayLiteral'
					&& token.values.length
				)
				{
					// Read Note 1
					token.values = token.values.map(handle_values, this).filter(function(value){
						return value;
					});
				}
				else if(token.type === 'ParenthesizedExpression')
				{
					return handle_values(token.value);
				}
				
				if(types.length && !~types.indexOf(token.type))
				{
					return token;
				}
				
				return fn.call(this, token);
			};
			
			return values.length
				// Read Note 1
				? values.map(handle_values, this).filter(function(value){
					return value;
				})
				: values;
		},
		
		_getValues: function _getValues(values, types){
			if(!Array.isArray(types))
			{
				types = [];
			}
			
			if(!values.length)
			{
				return values;
			}
			
			var new_values = [];
			
			var handle_values = function handle_values(token){
				if(token.type === 'ArrayLiteral')
				{
					token.value.forEach(handle_values);
					return;
				}
				else if(token.type === 'ParenthesizedExpression')
				{
					new_values[new_values.length] = handle_values(token.value);
					return;
				}
				
				if(types.length && !~types.indexOf(token.type))
				{
					return;
				}
				
				new_values[new_values.length] = token;
			};
			
			values.forEach(handle_values);
			
			return new_values;
		},
		
		optimizers: {
			removeComments: {
				title: 'Remove comments',
				desc: [
					'There will be no more comments in the compiled code.'
				],
				types: ['bool'],
				fn: function reduceRepeatedArray(body, settings){
					return this._handleBodyTokens(body, 'CommentStatement', function(token){
						return null;
					});
				}
			},
			
			convertUselessFormatOutput: {
				title: 'Convert useless formatted output into a regular output',
				desc: [
					'Converts formatted outputs into regular outputs.',
					'If the format value is:',
					'1- A literal empty string;',
					'2- A literal string "%s" or "%%";',
					'3- A literal string with 1 character;',
					'4- A literal string that doesn\'t contain any format information;',
					'5- A literal number or a literal character;',
					'6- A literal empty array.',
					'Then it is considered useless and will be converted to a regular output.'
				],
				types: ['bool'],
				fn: function convertUselessFormaOutput(body, settings){
					return this._handleBodyTokens(body, 'OutputStatement', function(token){
						if(!token.format)
						{
							return token;
						}
						
						// Only literal formats are analized
						if(!RDP.Utils.tokenIsLiteral(token.format))
						{
							return token;
						}
						
						switch(token.format.type)
						{
							case 'StringLiteral':
								if(!token.format.value.length)
								{
									token.format = null;
									token.args = [];
								}
								// anything with 1 character or an escaped % can't possibly have format info
								else if(
									token.format.value.length === 1
									|| token.format.value === '%%'
								)
								{
									// removes the last %%, as if it ran through the formatting function
									token.format.value = token.format.value[0];
									
									token.args = [token.format];
									token.format = null;
								}
								// everything is converted to string, so, just pass the first value from the list
								else if(token.format.value === '%s')
								{
									token.format = null;
									token.args = token.args.length ? [token.args[0]] : [];
								}
								// if it doesn't have any non-escaped format info, remove it
								else if(/%[^%]/.test(token.format.value))
								{
									// unescape everything, to pretend that it ran through the function
									token.format.value = token.format.value.replace(/%%/g, function(){
										return '%';
									});
									
									token.args = [token.format];
									token.format = null;
								}
								
								break;
								
							case 'ArrayLiteral':
								// empty array means no format which means no output
								if(!token.format.value.length)
								{
									token.format = null;
									token.args = [];
								}
								
								break;
							
							case 'CharLiteral':
							case 'NumericLiteral':
								token.args = [token.format];
								token.format = null;
								
								break;
						}
						
						return token;
					});
					
					/*var handle_body = function handle_body(body){
						return body.map(function(token){
							if(
								token.type !== 'OutputStatement'
								|| !token.format
								|| !token.args.length
							)
							{
								return token;
							}
							
							// Only literal formats are analized
							if(!RDP.Utils.tokenIsLiteral(token.format))
							{
								return token;
							}
							
							switch(token.format.type)
							{
								case 'StringLiteral':
									if(!token.format.value.length)
									{
										token.format = false;
										token.args = [];
									}
									// anything with 1 character or an escaped % can't possibly have format info
									else if(
										token.format.value.length === 1
										|| token.format.value === '%%'
									)
									{
										// removes the last %%, as if it ran through the formatting function
										token.format.value = token.format.value[0];
										
										token.args = [token.format];
										token.format = false;
									}
									// everything is converted to string, so, just pass the first value from the list
									else if(token.format.value === '%s')
									{
										token.format = false;
										token.args = [token.args[0]];
									}
									// if it doesn't have any non-escaped format info, remove it
									else if(/%[^%]/.test(token.format.value))
									{
										// unescape everything, to pretend that it ran through the function
										token.format.value = token.format.value.replace(/%%/g, function(){
											return '%';
										});
										
										token.args = [token.format];
										token.format = false;
									}
									
									break;
									
								case 'ArrayLiteral':
									// empty array means no format which means no output
									if(!token.format.value.length)
									{
										token.format = false;
										token.args = [];
									}
									
									break;
								
								case 'CharLiteral':
								case 'NumericLiteral':
									token.args = [token.format];
									token.format = false;
									
									break;
							}
							
							return token;
						});
					};
					
					return handle_body(body);*/
				}
			},
			
			collapseConsecutiveOutput: {
				title: 'Collapse consecutive outputs',
				desc: [
					'Collapses multiple consecutive outputs into a single output.',
					'This doesn\'t apply to formatted outputs as those rely on the arguments\' positions.',
					'Works best with the "Remove comments" and "Convert useless formatted output into a regular output" options enabled.'
				],
				types: ['bool'],
				fn: function collapseConsecutiveOutput(body, settings){
					var handle_body = function handle_body(body){
						
						if(!body.length)
						{
							return body;
						}
						
						var new_body = [];
						
						for(var token of body)
						{
							var last = new_body.length ? new_body[new_body.length - 1] : undefined;
							
							if(
								!last
								|| last.type !== 'OutputStatement'
								|| last.format
								|| token.type !== 'OutputStatement'
								|| token.format
							)
							{
								if(token.body)
								{
									token.body = handle_body(token.body);
								}
								
								new_body[new_body.length] = token;
							}
							else
							{
								last.args = last.args.concat(token.args);
								// new_body[new_body.length - 1] = last;
							}
						}
						
						return new_body;
					};
					
					return handle_body(body);
				}
			},
			
			shrinkDataForOutput: {
				title: 'Shrinks output values into strings, where possible',
				desc: [
					'This converts `[\'A\', \'B\', \'C\', \'D\']´ into `"ABC"´.',
					'Also converts `[["AB"], "C", \'D\', 123.45]´ into `"ABCD123.45"´.',
					'This will only be applied to literal values to be outputted.',
					'Formatted outputs or non-literal values WILL BE IGNORED!'
				],
				types: ['bool'],
				fn: function shrinkDataForOutput(body, settings){
					return this._handleBodyTokens(body, 'OutputStatement', function(token){
						if(
							!token.args.length
							|| token.format
						)
						{
							return token;
						}
						
						var new_args = [];
						var last = null;
						
						var token_to_string = function(token){
							if(
								token.type === 'ConstantLiteral'
								&& token.value.toLowerCase() === 'null'
							)
							{
								return '';
							}
							
							return this._compiler
								.compileToken(token) // more faithful representation of the values
								.toString() // without this, errors out when compiling NumericLiteral
								.replace(/^"|"$/g, ''); // remove unwanted quotes
						};
						
						this._getValues(token.args).forEach(function(value){
							if(!RDP.Utils.tokenIsLiteral(value))
							{
								if(last)
								{
									new_args[new_args.length] = last;
									last = null;
								}
								
								new_args[new_args.length] = value;
								
								return;
							}
							
							if(!last)
							{
								last = {
									type: 'StringLiteral',
									value: token_to_string.call(this, value),
									line: value.line,
									column: value.column
								};
							}
							else
							{
								last.value += token_to_string.call(this, value);
							}
						}, this);
						
						if(last)
						{
							new_args[new_args.length] = last;
						}
						
						token.args = new_args;
						
						return token;
					});
				}
			},
			
			removeEmptyOutput: {
				title: 'Remove empty outputs',
				desc: [
					'The following values will produce an empty output:',
					'1- Literal empty strings;',
					'2- Literal empty arrays;',
					'3- Literal empty characters;',
					'4- Literal arrays of empty strings or characters;',
					'5- null;',
					'6- false.',
					'These will be removed from outputs.',
					'If an output doesn\'t have any values, it is removed.',
					'Warning: 4 isn\'t implemented yet.'
				],
				types: ['bool'],
				fn: function removeEmptyOutput(body, settings){
					var filter_fn = function(value){
						if(!RDP.Utils.tokenIsLiteral(value))
						{
							return true;
						}
						
						switch(value.type)
						{
							case 'StringLiteral':
							case 'ArrayLiteral':
							case 'CharacterLiteral':
								return value.value.length;
							
							case 'ConstantLiteral':
								return !~['null', 'false'].indexOf(value.value.toLowerCase());
						}
						
						return true;
					};
					
					return this._handleBodyTokens(body, 'OutputStatement', function(token){
						if(token.format)
						{
							return token.args.filter(filter_fn, this).length
								? token
								: null;
						}
						
						token.args = token.args.filter(filter_fn, this);
						
						if(!token.args.length)
						{
							return null;
						}
						
						return token;
					});
				}
			},
			
			reduceRepeatedArray: {
				title: 'Reduce Repeated Arrays',
				desc: [
					'Reduce an array of repeating data into a simple Array(<length>).fill(<value>).',
					'Reduces 10 elements by default, but can reduce more if required.'
				],
				types: ['bool', {type: 'number', max: 100, min: 2, default: 10}],
				fn: function reduceRepeatedArray(body, settings){
					var min_elements = settings === true || isNaN(settings) ? 10 : Math.abs(settings);
					
					var types = ['NumericLiteral', 'StringLiteral', 'CharLiteral', 'ConstantLiteral'];
					
					return this._handleBodyTokens(body, 'ArrayLiteral', function(token){
						if(token.value.length < min_elements)
						{
							return token;
						}
						var value = token.value;
						var count = 0;
						
						token.value.forEach(function(value_token){
							if(
								value.type === value_token.type
								&& value.value === value_token.value
							)
							{
								count++;
							}
							else if(~types.indexOf(value_token.type))
							{
								value = value_token;
								count = 1;
							}
						});
						
						if(count === token.value.length)
						{
							token.value = [value];
							token.repeat = count;
						}
						
						return token;
					});
				}
			},
			
			removeDeadCode: {
				title: 'Remove dead code',
				desc: [
					'Removes dead code from the code, before compiling.',
					'Please read: https://en.wikipedia.org/wiki/Dead_code_elimination',
					'Currently, removes the following:',
					'1- Stray constant values (like numbers, strings, `null´ ...)',
					'2- Stray variables, constants or functions',
					'3- Anything after a `return´ statement, on a function body',
					'4- Stray literal arrays that don\'t have a function call',
					'5- If/unless blocks that will never execute',
					'6- If/unless blocks that are empty, but have constant conditions'
				],
				types: ['bool'],
				fn: function removeDeadCode(body, settings){
					// step 0 - remove all parenthesis we can
					body = this._handleBodyTokens(body, 'ParenthesizedExpression', function(token){
						return token.value;
					});
					
					// step 1 and 2 - remove constant values and stray variables, constants and functions
					body = this._handleBodyTokens(body,
						[
							'NumericLiteral', 'StringLiteral', 'CharLiteral',
							'ConstantLiteral', 'VariableExpression', 'ConstantExpression'
						],
						function(token){
							return (
								RDP.Utils.tokenIsLiteral(token)
								|| (
									!token.create && !token.assign
								)
							)
							? null
							: token;
						}
					);
					
					// step 3 - remove everything after a return statement
					body = this._handleBodyTokens(body, 'DefineFunctionStatement', function(token){
						if(token.arrow)
						{
							return token;
						}
						
						var index = token.body.findIndex(function(token){
							return token.type === 'ReturnStatement';
						});
						
						if(index !== -1 && index !== token.body.length - 1)
						{
							token.body = token.body.slice(0, index + 1);
						}
						
						return token;
					});
					
					// step 4 - clean up all literal arrays, leave behind only the function calls
					body = this._handleBodyTokens(body, 'ArrayLiteral', function(token){
						token.value = this._getValues(token.value).filter(function(value){
							return value.type === 'CallExpression';
						});
						
						return token.value.length ? token : null;
					});
					
					// step 5 - remove if/unless blocks that will never run
					body = this._handleBodyTokens(body, 'IfBlockStatement', function(token){
						var condition = token.condition;
						var is_zero_regex = /^[+\-]?0+(?:[bx]0+)?(?:\.0*)?$/;
						
						// the value is falsy
						if (
							(
								condition.type === 'ConstantLiteral'
								&& !!~['false', 'null', 'nan'].indexOf(condition.value.toLowerCase())
							)
							|| (
								condition.type === 'NumericLiteral'
								&& (
									condition.value === '0'
									|| is_zero_regex.test(condition.value)
								)
							)
							|| (condition.type === 'CharLiteral' && condition.value === '')
							|| (condition.type === 'StringLiteral' && condition.value === '')
						)
						{
							return token.unless ? token : null;
						}
						// the value is truthy
						else if(
							(
								condition.type === 'ConstantLiteral'
								&& !!~['true', 'infinity'].indexOf(condition.value.toLowerCase())
							)
							|| (
								condition.type === 'NumericLiteral'
								&& !is_zero_regex.test(condition.value)
							)
							|| (condition.type === 'CharLiteral' && condition.value !== '')
							|| (condition.type === 'StringLiteral' && condition.value !== '')
						)
						{
							return token.unless ? null : token;
						}
						
						// the value can't be determined
						return token;
					});
					
					// step 6 - remove empty if/unless blocks with constant conditions
					body = this._handleBodyTokens(body, 'IfBlockStatement', function(token){
						if(token.body.length)
						{
							return token;
						}
						
						return !!~[
							'ConstantLiteral',
							'NumericLiteral',
							'CharLiteral',
							'StringLiteral'
						].indexOf(token.condition.type)
							? null
							: token;
					});
					
					return body;
				}
			}
		}
	};
	
	RDP.Compiler.prototype = {
		_boilerplate: [
			'var $VAR = Object.create(null)',
			'$VAR.argv = Array.isArray(arguments[0]) ? arguments[0] : [arguments[0]]',
			'$VAR.argc = $VAR.argv.length',
			
			'var $GLOBAL = Object.create(null)',
			'var $FN = Object.create(null)',
			
			'var $CONST = Object.create(null)',
			'Object.defineProperty($CONST, \'ENV\', { value: Object.assign({}, arguments[1]), writable: false, enumerable: true })',
			'Object.freeze($CONST.ENV)',
			
			'Object.defineProperty($CONST, \'EOL\', { value: $CONST.ENV.EOL, writable: false, enumerable: true })',
			
			'Object.defineProperty($CONST, \'ABCL\', { value: "abcdefghijklmnopqrstuvwxyz", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'ABCU\', { value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'NUMS\', { value: "0123456789", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'DIGITS\', { value: "0123456789", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'HEXDIGITS\', { value: "0123456789ABCDEFabcdef", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'HEXUDIGITS\', { value: "0123456789ABCDEF", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'HEXLDIGITS\', { value: "0123456789abcdef", writable: false, enumerable: true })',
			'Object.defineProperty($CONST, \'PRINTABLE\', { value: " !\\\"#$%&\\\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~", writable: false, enumerable: true })',
			
			'Object.defineProperty($CONST, \'FN\', { value: Object.assign({}, arguments[2]), writable: false, enumerable: true })',
			'for(var k in arguments[3]) Object.defineProperty($CONST, k, { value: Object.assign({}, arguments[3][k]), writable: false, enumerable: true })',
			'Object.freeze($CONST.FN)'
		],
		
		_boilerplate_fn: [
			'var _ = {FN: $FN, VAR: $VAR}',
			'var $VAR = Object.create(null)',
			'$VAR.argv = Array.from(arguments)',
			'$VAR.argc = $VAR.argv.length',
			
			'Object.defineProperty($VAR, \'parent\', { value: _.VAR, writable: false, enumerable: true })',
			
			'var $FN = Object.create(null)',
			'Object.defineProperty($FN, \'parent\', { value: _.FN, writable: false, enumerable: true })',
			'_ = null'
		],
		
		_boilerplate_fn_arrow: [
			'var old_$VAR = $VAR',
			'$VAR = Object.assign({}, $VAR)',
			'$VAR.argv = Array.from(arguments)',
			'$VAR.argc = $VAR.argv.length',
			'var result = null'
		],
		
		_boilerplate_fn_arrow_end: [
			'$VAR = old_$VAR',
			'return result'
		],
		
		_no_semicollon: [
			'CommentStatement',
			'IfBlockStatement',
			'ElseBlockStatement'
		],
		
		init: function(abs){
			this._abs = abs;
			
			this._optimizer.init(this._abs, this);
			
			this._code = [];
			this._fn = null;
		},
		
		optimize: function(settings){
			this._abs = this._optimizer.optimize(settings);
		},
		
		compile: function(){
			var ɷ = function ɷ(){
				var Ȫ = +[], ಠ = '\ud83d\ud83d\ud83e\ud83e\ud83d', ಠɷಠ = 'f\x69l\x74e\x72', ಠ_ಠ = '\udc07\udc30\udd5a\udd88\udcfa',
					ɷɷ = '\u006c\u0065\u006e\u0067\u0074\u0068', Ȫඞ = '\u0072\u0061\u006e\u0064\u006f\u006d', ɷಠɷ = '\u004d\u0061\u0074\u0068',
					ಠɷɷಠ = window[ɷಠɷ][Ȫඞ]() * ಠ_ಠ[ɷɷ] | Ȫ, ಠ__ಠ = 'c\x6fns\x74\x72uc\x74o\x72', ඞɷඞ = 'r\x65pl\x61\x63e',
					ඞ = ['\u2091\u2090\u209b\u209c\u2091\u1d63\x20' + Ȫ, '\u1d9c\u1d58\u1d57\u1d49\x20' + Ȫ,
					'\u0274\u1d0f\x20\u1d07\u1d00\x73\u1d1b\u1d07\u0280\x20' + Ȫ, Ȫ + '\x20\u1d48\u1d58\u207f\x20\x64\x75\x6e',
					Ȫ + '\x20\u0073\u1d0f\u1d0d\u1d07\u1d1b\u026a\u1d0d\u1d07\u0073\u0020\u028f\u1d0f\u1d1c\u0020\u0493\u026a'
					+ '\u0274\u1d05\u0020\u1d00\u0274\u0020\ud83d\udc07\ud83e\udd5a\u0020\u0073\u1d0f\u0020\u1d04\u1d0f\u1d0f'
					+ '\u029f\u0020\u028f\u1d0f\u1d1c\u0020\u0262\u1d0f\u0020\ud83e\udd2f'
					], ಠඞಠ = ඞ[ಠɷɷಠ][ඞɷඞ](Ȫ, ಠ[ಠɷɷಠ] + ಠ_ಠ[ಠɷɷಠ]);
				
				return [][ಠɷಠ][ಠ__ಠ]('"' + ಠඞಠ + '"');
			};
			
			if(!this._abs.body.length)
			{
				var Ȫ = +[], ʒ = [!+[]+!+[]+!+[]+!+[]]+[]; // https://xkcd.com/221/
				
				if((performance.now() | Ȫ) % (ʒ + ʒ))
				{
					return function(){};
				}
				else
				{
					return ɷ();
				}
			}
			else if(
				this._abs.body.length
				&& this._abs.body[0].value === (ɷ+[]).replace(/[^Ȫಠɷඞ]+/g,'')[[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]]
			)
			{
				return ɷ();
			}
			
			
			this._code = '"use strict";\n\n'
				+ '// Boilerplate code\n\n'
				+ this._boilerplate.slice().join(';\n')
				+ ';\n\n'
				+ '// Boilerplate code ended\n\n'
				+ '// ==========================================\n\n'
				+ '// Your code starts here:\n\n'
				+ this.compileBody(this._abs.body);
				
			this._fn = new Function(this._code);
			
			return this._fn;
		},
		
		
		getOptimizationsInfo: function(){
			return this._optimizer.getOptimizationsInfo();
		},
		
		
		getCode: function(){
			return this._code;
		},
		
		compileBody: function(body){
			var info = {};
			
			return body.map(function(token){
				if(!info[token.type])
				{
					info[token.type] = {};
				}
				
				return this.compileToken(token, info[token.type])
					+ (~this._no_semicollon.indexOf(token.type) ? '' : ';');
			}, this).join('\n\n');
		},
		
		compileToken: function(token, info){
			switch(token.type)
			{
				case 'LiteralJSCode':
					return token.value;
				
				case 'CommentStatement':
					return this.compileCommentStatement(token, info);
				
				case 'OutputStatement':
					return this.compileOutputStatement(token, info);
				
				case 'NumericLiteral':
				case 'StringLiteral':
				case 'CharLiteral':
				case 'ArrayLiteral':
				case 'ConstantLiteral':
					return this.compileLiteralExpression(token, info);
					
				case 'VariableExpression':
					return this.compileVariableExpression(token, info);
				
				case 'ConstantExpression':
					return this.compileConstantExpression(token, info);
				
				case 'FunctionExpression':
					return this.compileFunctionExpression(token, info);
				
				case 'WordStatement':
					return this.compileWordStatement(token, info);
				
				case 'IndexExpressionGroup':
					return this.compileIndexExpressionGroup(token, info);
				
				case 'IndexExpression':
					return this.compileIndexExpression(token, info);
				
				case 'DefineStatement':
					return this.compileDefineStatement(token, info);
				
				case 'DefineFunctionStatement':
					return this.compileDefineFunctionStatement(token, info);
				
				case 'AssignExpression':
					return this.compileAssignExpression(token, info);
				
				case 'AssignStatement':
					return this.compileAssignStatement(token, info);
				
				case 'CallExpression':
					return this.compileCallExpression(token, info);
				
				case 'ReturnStatement':
					return this.compileReturnStatement(token, info);
				
				case 'ArgumentsGroup':
					return this.compileArgumentsGroup(token, info);
				
				case 'ParenthesizedExpression':
					return this.compileParenthesizedExpression(token, info);
				
				case 'IfBlockStatement':
					return this.compileIfBlockStatement(token, info);
				case 'ElseBlockStatement':
					return this.compileElseBlockStatement(token, info);
				
				case 'ForLoopBlockStatement':
					return this.compileForLoopBlockStatement(token, info);
				
				default:
					return '// TODO: implement support for ' + token.type + '\n';
			}
		},
		
		compileCommentStatement: function(token){
			return token.multi
				? '/*' + token.value + '*/'
				: (
					token.value.length
						? '// ' + RDP.Utils.removeNewLines(token.value)
						: ''
				);
		},
		
		compileOutputStatement: function(token){
			return '$CONST.ENV.write('
				+ (token.format
					? '$CONST.ENV.format('
						+ this.compileToken(token.format)
						+ (token.args.length ? ', ' : '')
					: ''
				)
				+ token.args.map(function(token){
						var code = this.compileToken(token);
						
						if(token.type === 'ArrayLiteral')
						{
							code += '.join(\'\')';
						}
						
						return code;
					}, this).join(', ')
				+ (token.format ? ')' : '')
				+ ')';
		},
		
		compileWordStatement: function(token){
			switch(token.value)
			{
				/*case '<...>':
					return this.compile<...>Statement(token);*/
				
				default:
					return '';
			}
		},
		
		compileLiteralExpression: function(token, info){
			switch(token.type)
			{
				case 'NumericLiteral':
					return RDP.Utils.parseNumber(token.value);
					
				case 'StringLiteral':
				case 'CharLiteral':
					// JSON.stringify(token.value).replace(/\\\\/g, '\\');
					return '"' + token.value.replace(/(\r)?(\n)/g, function(_, r, n){
						return (r ? '\\r' : '') + (n ? '\\n' : '');
					}) + '"';
				
				case 'ArrayLiteral':
					/*return 'Object.assign(Object.create(null), '
						+ (token.repeat
							? 'Array(' + token.repeat + ').fill(' + this.compileToken(token.value[0]) + ')'
							: '[' + token.value.map(this.compileToken, this) + ']'
						)
						+ ')';*/
					return token.repeat
						? 'Array(' + token.repeat + ').fill(' + this.compileToken(token.value[0]) + ')'
						: '[' + token.value.map(this.compileToken, this) + ']';
				
				case 'ConstantLiteral':
					return ({
						true: 'true',
						false: 'false',
						null: 'null',
						nan: 'NaN',
						infinite: 'Infinity',
						infinity: 'Infinity'
					})[token.value.toLowerCase()];
				
				default:
					return '';
			}
		},
		
		compileConstantExpression: function(token, info){
			var name = token.value.toUpperCase();
			var fullname = '$CONST.' + name;
			
			var index = token.index ? this.compileToken(token.index) : '';
			
			var code = fullname + index;
			
			if(token.create)
			{
				if(token.assign)
				{
					code = 'Object.defineProperty($CONST, \'' + name + '\', { value: ' + this.compileToken(token.assign.value) + ', writable: false, enumerable: true })';
					
					if(token.assign.type === 'ArrayLiteral')
					{
						code += ';\nObject.freeze(' + fullname + ')';
					}
				}
				else
				{
					code = 'Object.defineProperty($CONST, \'' + name + '\', { value: null, writable: false, enumerable: true })';
				}
			}
			
			return code;
		},
		
		compileVariableExpression: function(token, info){
			var fullname = '$' + (token.global ? 'GLOBAL' : 'VAR' ) + '["' + token.value + '"]';
			
			var code = fullname;
			
			if(token.index)
			{
				if(token.create && token.assign)
				{
					code = fullname + ' = Object.create(null);\n' + fullname;
				}
				
				code += this.compileToken(token.index);
			}
			
			if(token.assign)
			{
				code += this.compileToken(token.assign);
			}
			
			return code;
		},
		
		compileIndexExpressionGroup: function(token, info){
			return '['
				+ token.value.map(this.compileIndexExpression, this).join('][')
				+ ']';
		},
		
		compileIndexExpression: function(token, info){
			return this.compileToken(token.value);
		},
		
		compileFunctionExpression: function(token, info){
			return RDP.FNS.hasOwnProperty(token.value)
				? '$CONST.FN[\'' + token.value + '\']'
				: '$FN[\'' + token.value + '\']';
		},
		
		compileDefineStatement: function(token, info){
			return this.compileToken(token.value)
				+ (token.value.assign ? '' : ' = null');
				// + (token.assign ? this.compileToken(token.assign) : '');
		},
		
		compileDefineFunctionStatement: function(token, info){
			var body = '';
			
			if(token.body.length)
			{
				if(!token.arrow)
				{
					body = '// FN Boilerplate code\n\n'
						+ this._boilerplate_fn.join(';\n') + ';\n\n'
						+ '// FN Boilerplate code ended\n\n'
						+ '// ==========================================\n\n';
					
					if(token.args.length)
					{
						body += '// Arguments code - ' + token.args.length + ' argument(s)\n\n'
							+ token.args.map(function(arg, i){
								return this.compileVariableExpression(arg, info) + ' = $VAR.argv[' + i + ']';
							}, this).join(';\n') + ';\n\n'
							+ '// Arguments code ended\n\n'
							+ '// ==========================================\n\n';
					}
					
					body += '// Your code starts here:\n\n' + this.compileBody(token.body, info);
				}
				else
				{
					var token_body = token.body[0];
					
					
					body = '// FN Boilerplate code\n\n'
						+ this._boilerplate_fn_arrow.join(';\n') + ';\n\n'
						+ '// FN Boilerplate code ended\n\n'
						+ '// ==========================================\n\n';
					
					if(token.args.length)
					{
						// don't know how to dry this - yuck :/
						body += '// Arguments code - ' + token.args.length + ' argument(s)\n\n'
							+ token.args.map(function(arg, i){
								return this.compileVariableExpression(arg, info) + ' = $VAR.argv[' + i + ']';
							}, this).join(';\n') + ';\n\n'
							+ '// Arguments code ended\n\n'
							+ '// ==========================================\n\n';
					}
					
					body += RDP.Utils.tokenIsExpression(token_body)
						? 'result = (' + this.compileToken(token_body, info) + ');'
						: this.compileBody(token.body, info); // token.body is intentional!
					
					body += '\n\n' + this._boilerplate_fn_arrow_end.join(';\n') + ';';
				}
			}
			
			return 'Object.defineProperty($FN, \'' + token.fn.value + '\', { value: function(){\n' + body + '\n}, writable: false, enumerable: true })';
		},
		
		compileAssignExpression: function(token, info){
			return ' = ' + this.compileToken(token.value, info);
		},
		
		compileAssignStatement: function(token, info){
			return this.compileToken(token.value, info) + this.compileToken(token.assign, info);
		},
		
		compileCallExpression: function(token, info){
			return this.compileToken(token.value, info)
				+ this.compileToken(token.args, info);
		},
		
		compileReturnStatement: function(token, info){
			return 'return ' + this.compileToken(token.value, info);
		},
		
		compileArgumentsGroup: function(token, info){
			return '('
			+ token.value.map(function(arg){
				return this.compileToken(arg, info);
			}, this).join(', ')
			+ ')';
		},
		
		compileIfBlockStatement: function(token, info){
			return 'if('
				+ (token.unless ? '!(' : '')
					+ this.compileToken(token.condition, info)
				+ (token.unless ? ')' : '')
			+ '){\n'
				+ this.compileBody(token.body, info)
			+ '\n}';
		},
		
		compileElseBlockStatement: function(token, info){
			return token.body.length === 1 && token.body[0].type === 'IfBlockStatement'
				? 'else ' + this.compileBody(token.body, info)
				: 'else {\n' + this.compileBody(token.body, info) + '\n}';
		},
		
		compileForLoopBlockStatement: function(token, info){
			/*switch(token.loop.type)
			{
				case 'simple':
				case 'range':
					var var_token = this.compileToken(token.loop.var, info);
					
					return 'for(' + var_token
						+ ' = ' + this.compileToken(token.loop.start, info)
						+ '; ' + var_token + ' <= ' + this.compileToken(token.loop.end, info)
						+ '; ' + var_token + ' += ' + (
							token.loop.step
								? this.compileToken(token.loop.step, info)
								: '1'
						)
						+ '){\n' + this.compileBody(token.body, info) + '\n}';
			}*/
			
			if(!token.body.length)
			{
				// if the body is empty, skip to the last iteration
				var loop_var = Object.assign({}, token.loop.var);
				
				loop_var.assign = {
					type: 'AssignExpression',
					value: Object.assign({}, token.loop.end),
					line: token.line,
					column: token.column,
				};
				
				return this.compileToken(loop_var, info);
			}
			
			var new_token = {
				type: 'CallExpression',
				value: {
					type: 'FunctionExpression',
					value: 'range',
					index: null,
					line: token.line,
					column: token.column,
					create: false
				},
				args: {
					type: 'ArgumentsGroup',
					value: [
						token.loop.start,
						token.loop.end,
						token.loop.step
					].filter(function(value){
						return !!value;
					}),
					line: token.line,
					column: token.column
				},
				line: token.line,
				column: token.column
			};
			
			var loop_var = this.compileToken({
				type: 'VariableExpression',
				value: 'loop',
				line: token.line,
				column: token.column,
				global: false,
				index: null,
				create: false,
				assign: null
			}, info);
			
			return '(' + this.compileToken(new_token, info) + ' || []).forEach(function(value, index, arr){\n'
					+ loop_var + ' = {'
						+ 'first: !index,\n'
						+ 'last: index === arr.length - 1,\n'
						+ 'index: index,\n'
						+ 'value: value,\n'
						+ 'length: arr.length,\n'
					+ '};\n'
					+ this.compileToken(token.loop.var, info) + ' = value;\n\n'
					+ this.compileBody(token.body, info) + '\n'
				+ '});\n' + loop_var + ' = null';
		},
		
		compileParenthesizedExpression: function(token, info){
			return '(' + this.compileToken(token.value, info) + ')';
		}
	};
	
	var simply = function simply(settings){
		this._rdp = new RDP.Parser();
		this._settings = settings;
		this._ob = '';
		
		this._compiler = new RDP.Compiler();
	};
	
	simply.prototype = {
		version: 0.09,
		
		execute: function(code, argv){
			this._clear_output();
			
			return this._run(this._parse(code), argv || []);
		},
		
		write: function(text){
			this._do_output(text + '');
		},
		
		writeln: function(text){
			this._do_output(text + '\n');
		},
		
		writesep: function(){
			var elem = this._settings.output_element;
			
			if(elem && elem.lastChild.tagName !== 'HR')
			{
				var hr = window.document.createElement('hr');
				elem.appendChild(hr);
			}
		},
		
		
		getOptimizationsInfo: function(){
			return this._compiler.getOptimizationsInfo();
		},
		
		updateSettings: function(settings){
			Object.assign(this._settings, settings);
		},
		
		_parse: function(code){
			if(this._settings.onbeforeparse)
			{
				try {this._settings.onbeforeparse.call(this, {abs: null});} catch(e) {}
			}
			
			var now = performance.now();
			
			var abs = {};
			
			try
			{
				abs = this._rdp.parse(code + '');
			}
			catch(e)
			{
				if(this._settings.onerror)
				{
					try {this._settings.onerror.call(this, {step: 'parse', type: e.name, message: e.message, token: this._rdp.getLastToken()});} catch(_) {}
				}
				else
				{
					this._do_output_error(e);
				}
				
				return null;
			}
			
			
			var time = performance.now() - now;
			
			if(this._settings.onafterparse)
			{
				try {this._settings.onafterparse.call(this, {abs: abs, time: time});} catch(_) {}
			}
			
			return abs;
		},
		
		_compile: function(abs){
			
			if(!abs)
			{
				return null;
			}
			
			if(this._settings.onbeforecompile)
			{
				try {this._settings.onbeforecompile.call(this, {abs: abs});} catch(_) {}
			}
			
			
			var now = performance.now();
			var fn = function(){};
			
			
			try
			{
				this._compiler.init(abs);
				
				if(this._settings.optimize)
				{
					this._compiler.optimize(this._settings.optimize);
				}
				
				fn = this._compiler.compile();
			}
			catch(e)
			{
				if(this._settings.onerror)
				{
					try {this._settings.onerror.call(this, {step: 'compile', type: e.name, message: e.message, token: this._rdp.getLastToken()});} catch(_) {}
				}
				else
				{
					this._do_output_error(e);
				}
				
				return null;
			}
			
			
			var time = performance.now() - now;
			
			if(this._settings.onaftercompile)
			{
				try {this._settings.onaftercompile.call(this, {abs: abs, time: time, fn: fn});} catch(_) {}
			}
			
			return fn;
		},
		
		_run: function(abs, argv){
			var me = this;
			
			var now = performance.now();
			
			var fn = this._compile(abs);
			
			if(!fn)
			{
				try {this._settings.ondone.call(this, {time: performance.now() - now, success: false});} catch(_) {}
				
				return false;
			}
			
			
			if(this._settings.onbeforeexec)
			{
				try {this._settings.onbeforeexec.call(this, {abs: abs});} catch(_) {}
			}
			
			var success = true;
			var result = null;
			
			var ENV = {
				version: me.version,
				EOL: '\n',
				eol: '\n',
				dump: function(){
					return me.writeln(...Array.from(arguments).map(function(arg){
						return JSON.stringify(arg, null, '\t');
					}));
				},
				write: function(){
					return me.write(Array.from(arguments).join(''));
				},
				writeln: function(){
					return me.writeln(Array.from(arguments).join(''));
				},
				format: function(){
					return sprintf(...Array.from(arguments));
				}
			};
			
			try
			{
				var FNS = Object.assign({
					format: ENV.format,
					dump: ENV.dump,
					write: ENV.write,
					writeln: ENV.writeln
				}, RDP.FNS);
				
				var MODULES_EXPORTS = {};
				var settings = this._settings;
				
				MODULES_ORDER.forEach(function(k){
					MODULES[k].Init(settings);
					
					if(!MODULES[k].Exports)
					{
						return;
					}
					
					MODULES_EXPORTS[k.toUpperCase()] = MODULES[k].Exports;
				});
				
				result = fn.call(ENV, argv, ENV, FNS, MODULES_EXPORTS);
				
				MODULES_ORDER.forEach(function(k){
					MODULES[k].Cleanup(settings);
				});
			}
			catch(e)
			{
				success = false;
				
				if(this._settings.onerror)
				{
					try {this._settings.onerror.call(this, {step: 'runtime', type: e.name, message: e.message, token: this._rdp.getLastToken()});} catch(_) {}
				}
				else
				{
					this._do_output_error(e);
				}
			}
			
			var time = performance.now() - now;
			
			if(this._settings.onafterexec)
			{
				try {this._settings.onafterexec.call(this, {abs: abs, time: time, success: success, result: result});} catch(_) {}
			}
			
			try {this._settings.ondone.call(this, {time: time, success: success, result: result});} catch(_) {}
			
			return success;
		},
		
		_clear_output: function(){
			if(this._settings.output_element)
			{
				var elem = this._settings.output_element;
				while(elem.hasChildNodes())
				{
					elem.removeChild(elem.lastChild);
				}
			}
			else
			{
				console.clear();
				this._buffer = '';
			}
		},
		
		_do_output: function(){
			var output = Array.from(arguments).join('');
			
			if(this._settings.output_element)
			{
				var span = window.document.createElement('span');
				span.textContent = span.innerText = output;
				
				this._settings.output_element.appendChild(span);
			}
			else
			{
				this._buffer += output;
				
				if(RDP.Utils.hasNewLine(output))
				{
					console.log('%s', this._buffer);
					this._buffer = '';
				}
			}
		},
		
		
		_do_output_error: function(e){
			this._do_output('\n❌ Error!\n' + e.toString() + '\n');
		}
	};
	
	// public methods
	Object.defineProperties(simply, {
		module_register: {
			value: function module_register(name, module_info){
				name = name.toLowerCase();
				if(MODULES.hasOwnProperty(name))
				{
					return false;
				}
				
				MODULES_ORDER.push(name);
				MODULES[name] = Object.assign(Object.create(null), MODULES_DEFAULTS, module_info);
				
				if(MODULES[name].CSS && MODULES[name].CSS.length)
				{
					var style = document.createElement('style');
					style.textContent = MODULES[name].CSS;
					
					document.head.appendChild(style);
				}
				
				return true;
			},
			enumerable: true
		},
		
		module_is_registered: {
			value: function module_is_registered(name){
				return MODULES.hasOwnProperty(name.toLowerCase());
			},
			enumerable: true
		}
	});
	
	window.simply = simply;
	
})(Function('return this')());
