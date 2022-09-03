(function(window, undefined){
	'use strict';
	
	if(!window.simply)
	{
		throw new Error('window.simply is required to use this module');
	}
	
	
	
	function RegexpGenerator(pattern, flags){
		Object.defineProperties(this, {
			regex: {
				value: new RegExp(pattern, flags)
			},
			error: {
				value: false,
				enumerable: true
			},
			pattern: {
				value: pattern,
				enumerable: true
			},
			flags: {
				value: flags,
				enumerable: true
			},
			__doc__: {
				value: [
					'Regex object, from the Regex module',
					'All functions available: ' + Object.keys(RegexpGenerator.prototype).join('(), ') + '()'
				]
			}
		});
	}
	
	Object.defineProperties(RegexpGenerator.prototype, {
		replace: {
			value: Object.assign(function replace(str, replacement, count){
				str = str.toString();
				replacement = replacement.toString();
				
				count = count === undefined || count === null
					? Number.MAX_SAFE_INTEGER
					: Math.min(+count, Number.MAX_SAFE_INTEGER);
				
				
				if(count < 1 || !str.length)
				{
					return '';
				}
				
				var current = 0;
				
				return count === Number.MAX_SAFE_INTEGER
					? str.replace(this.regex, replacement)
					: str.replace(this.regex, function(match){
						if(current >= count)
						{
							return match;
						}
						
						current++;
						
						return replacement;
					});
			}, {
				__doc__: [
					'Searches the $string and replaces all matches with the $replacement, up to $count times',
					'If $count is specified and is lower than 1, returns an empty string',
					'The value of $count will be limited to ' + Number.MAX_SAFE_INTEGER,
					'This will function somewhat like &str_replace'
				]
			}),
			enumerable: true
		},
		replace_fn: {
				value: Object.assign(function replace_fn(str, fn, count){
				if(typeof fn !== 'function')
				{
					return null;
				}
				
				str = str.toString();
				
				count = count === undefined || count === null
					? Number.MAX_SAFE_INTEGER
					: Math.min(+count, Number.MAX_SAFE_INTEGER);
				
				if(count < 1 || !str.length)
				{
					return '';
				}
				
				
				var current = 0;
				
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#making_a_generic_replacer
				var handle_fn = function(args){
					var match = args.shift();
					var groups = {};
					
					if(typeof args[args.length - 1] === 'object')
					{
						Object.assign(groups, args.pop());
					}
					
					var str = args.pop();
					var index = args.pop();
					
					Object.assign(groups, args);
					
					var result = fn(match, groups, index, str);
						
					return result === null || result === undefined ? '' : result.toString();
				};
				
				return count === Number.MAX_SAFE_INTEGER
					? str.replace(this.regex, function(){
						return handle_fn(Array.from(arguments));
					})
					: str.replace(this.regex, function(match){
						if(current >= count)
						{
							return match;
						}
						
						current++;
						
						return handle_fn(Array.from(arguments));
					});
			}, {
				__doc__: [
					'Searches the $string and runs the $fn function on each match, up to $count times',
					'The function in $fn must return the value to replace',
					'If $fn isn\'t a function, returns null',
					'The function will have the following arguments:',
					' • $match		The whole value that was found',
					' • $groups		Array with all the capture groups\' values, both numeric and named',
					' • $index		The 0-based index where $search was found',
					' • $string		The original string value',
					'The $fn should return a string, but, if no value is passed, it replaces with an empty string',
					'If $count is specified and is lower than 1, returns an empty string',
					'The value of $count will be limited to ' + Number.MAX_SAFE_INTEGER,
					'This will function somewhat like &str_replace_fn'
				]
			}),
			enumerable: true
		}
	});
	
	
	
	simply.module_register('regex', {
		Exports: {
			version: '1.0',
			create: Object.assign(function regex_create(pattern, flags){
				try {
					
					return new RegexpGenerator(
						pattern.toString(),
						(flags || '').toString()
					);
					
				} catch(e) {
					
					return {
						error: true,
						name: e.name,
						message: e.message,
						pattern: pattern,
						flags: flags,
						__doc__: [
							'Regex error object, from the Regex module',
							'Error message:' + e.name + ' - ' + e.message
						]
					};
					
				}
			}, {
				__doc__: [
					'Creates a regular expression object',
					'This allows to manipulate and/or match strings',
					'Warning: in case there\'s a syntax error, an error object will be returned, with the "error" property set to true'
				]
			})
		}
	});
})(Function('return this')());
