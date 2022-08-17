(function(window, undefined){
	window.jQuery(function($){
		var $form = $('#form-code');
		var $form_code = $form.find('#form-code-area');
		var $form_input = $form.find('#form-input-area');
		var $form_btn = $form.find('button[type="submit"]');
		
		var $output = $('#output-code');
		var $output_tab = $('#output-tab-text');
		var $output_tab_spinner = $output_tab.find('.spinner-border');
		var $output_json = $('#output-json');
		var $output_js = $('#output-js');
		
		var $optimize_form = $('#optimize-drop-form');
		var $settings_form = $('#settings-drop-form');
		
		var beautify_settings = {
			indent_with_tabs: true,
			preserve_newlines: true,
			brace_style: 'end-expand,preserve-inline'
		};
		
		var optimize_settings = {
			reduceRepeatedArray: 10,
			collapseConsecutiveOutput: true,
			shrinkDataForOutput: true,
			convertUselessFormatOutput: true,
			removeComments: true,
			removeEmptyOutput: true,
			removeDeadCode: false
		};
		
		var settings = {
			wordWrap: false,
			showLineNumbers: true
		};
		var settings_attr = {
			wordWrap: 'data-wordwrap',
			showLineNumbers: 'data-show-ln'
		};
		
		var simply = new window.simply({
			output_element: $output[0],
			optimize: optimize_settings,
			onbeforeparse: function(info){
				$output_json.text('Parsing...');
				$output_js.text('Parsing...');
				
				this.writeln('Starting the code');
				this.write('Parsing the code... ');
			},
			onafterparse: function(info){
				this.writeln('took ' + info.time.toFixed(2) + ' msec(s)');
				this.writesep();
				
				$output_json.text(JSON.stringify(info.abs, null, '\t'));
			},
			onaftercompile: function(info){
				var fn_text = info.fn.toString()
					.replace(/^function\s*(?:anonymous\s*)?\(\s*\)\s*\{\s*(?:['"]use\s*strict['"]\s*\;?\s*)?/, '')
					.replace(/\s*\}\s*\;?\s*$/, '');
				
				$output_js.text(js_beautify(fn_text, beautify_settings));
				$output_json.text(JSON.stringify(info.abs, null, '\t'));
				
				if(window.hljs)
				{
					hljs.highlightElement($output_js[0]);
					hljs.highlightElement($output_json[0]);
					
					if(hljs.lineNumbersBlock)
					{
						hljs.lineNumbersBlock($output_js[0]);
						hljs.lineNumbersBlock($output_json[0]);
					}
				}
			},
			onerror: function(info){
				var text = '❌ Error on ' + info.step + ':\n'
					+ info.type + ' - ' + info.message
					+ ' on line ' + info.token.line
					+ ' on column ' + info.token.column;
				
				$output_json.text($output_json.text() + '\r\n\r\n' + text);
				$output_js.text($output_js.text() + '\r\n\r\n' + text);
				this.writeln(text);
			},
			ondone: function(info){
				this.writesep();
				
				if(info.success)
				{
					this.writeln('✔️ Done! - Took ' + info.time.toFixed(2) + ' msec(s)');
				}
				else
				{
					this.writeln('❌ Error while running - Took ' + info.time.toFixed(2) + ' msec(s)');
				}
				
				$form_btn.removeAttr('disabled');
				$output_tab_spinner.addClass('d-none');
			}
		});
		
		//  autocapitalize="none" autocorrect="off" autocomplete="off"
		$form.find('textarea').each(function(){
			this.setAttribute('autocapitalize', 'none');
			this.setAttribute('autocorrect', 'off');
			this.setAttribute('autocomplete', 'off');
			this.setAttribute('spellcheck', 'false');
		});
		
		$form.on('submit', function(e){
			e.preventDefault();
			
			$form_btn.attr('disabled', 'disabled');
			$output_tab_spinner.removeClass('d-none');
			
			var input = $form_input.val();
			if(input.length)
			{
				try
				{
					input = JSON.parse(input);
				}
				catch(e)
				{
					input = [input];
				}
			}
			else
			{
				input = null;
			}
			
			simply.execute($form_code.val(), input);
			
			$form_btn.removeAttr('disabled');
			$output_tab_spinner.addClass('d-none');
		});
		
		$form_code.on('keydown', function(e){
			// https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event#ignoring_keydown_during_ime_composition
			if (e.isComposing || e.keyCode === 229)
			{
				return;
			}
			
			// modified version of: https://stackoverflow.com/a/6637396  |  https://stackoverflow.com/a/14166052
			if (e.keyCode === 9 || e.which === 9)
			{
				e.preventDefault();
				var start = this.selectionStart;
				var end = this.selectionEnd;
				
				if (e.shiftKey)
				{
					var left_text = this.value.substring(0, start);
					
					var last_line = left_text.split(/\r\n|[\r\n]/).slice(-1)[0];
					
					left_text = left_text.substring(0, left_text.length - last_line.length) + last_line.replace(/^\t/, '');
					
					this.value = left_text + this.value.substring(start);
					
					this.selectionStart = start - 1;
					this.selectionEnd = end - 1;
				}
				else
				{
					// set textarea value to: text before caret + tab + text after caret
					this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
				
					// put caret at right position again
					this.selectionStart = this.selectionEnd = start + 1;
				}
			}
			else if (e.keyCode === 13 || e.which === 13)
			{
				if(e.ctrlKey)
				{
					e.preventDefault();
					$form.submit();
				}
				else
				{
					var start = this.selectionStart;
					var end = this.selectionEnd;
					
					var left_text = this.value.substring(0, start);
					var last_line = left_text.split(/\r\n|[\r\n]/).slice(-1)[0];
					
					var match = last_line.match(/^\t+/);
					
					if(match)
					{
						e.preventDefault();
							
						this.value = left_text + '\r\n' + match[0] + this.value.substring(end);
						
						this.selectionStart = this.selectionEnd = start + match[0].length + 1;
					}
				}
			}
		});
		
		if(window.sessionStorage)
		{
			$form_code.on('input', function(){
				sessionStorage.code = this.value;
				sessionStorage.codeSelStart = this.selectionStart;
				sessionStorage.codeSelEnd = this.selectionEnd;
			}).on('mouseup', function(){
				sessionStorage.codeSelStart = this.selectionStart;
				sessionStorage.codeSelEnd = this.selectionEnd;
			});
			
			$form_input.on('input', function(){
				sessionStorage.input = this.value;
			});
			
			if(sessionStorage.code)
			{
				$form_code.val(sessionStorage.code)
					.focus()
					.prop('selectionStart', sessionStorage.codeSelStart)
					.prop('selectionEnd', sessionStorage.codeSelEnd);
			}
			
			if(sessionStorage.input)
			{
				$form_input.val(sessionStorage.input);
			}
			
			if(sessionStorage.optimize_settings)
			{
				try
				{
					Object.assign(optimize_settings, JSON.parse(sessionStorage.optimize_settings));
					
					simply.updateSettings({optimize: optimize_settings});
				}
				catch(e)
				{
					sessionStorage.optimize_settings = JSON.stringify(optimize_settings);
				}
			}
			else
			{
				sessionStorage.optimize_settings = JSON.stringify(optimize_settings);
			}
			
			if(sessionStorage.settings)
			{
				try
				{
					Object.assign(settings, JSON.parse(sessionStorage.settings));
				}
				catch(e)
				{
					sessionStorage.settings = JSON.stringify(settings);
				}
			}
			else
			{
				sessionStorage.settings = JSON.stringify(settings);
			}
		}
		
		// console.log(simply.getOptimizationsInfo());
		
		Object.values(simply.getOptimizationsInfo()).forEach(function(option, i, array){
			var html = array.length === i + 1 ? '<div>' : '<div class="mb-3">';
			var status = optimize_settings[option.name];
			
			//html += '<label>' + option.title + '</label>';
			
			if(~option.types.indexOf('bool'))
			{
				html += '<div class="form-check form-switch">'
					+ '<input type="checkbox" name="' + option.name + '" class="form-check-input" data-type="bool"' + (status ? ' checked="checked"' : '') + '>'
					+ '<label class="form-check-label" data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="text-start" title="' + option.desc.join('<br>').replace(/&/g, '&amp;') + '">' + option.title + '</label>'
				+ '</div>';
			}
			
			html += option.types.map(function(type){
				var datatype = typeof type === 'string' ? type : type.type;
				
				switch(datatype)
				{
					case 'bool':
						return '';
					
					case 'number':
						return '<input type="range" name="' + option.name + '"'
							+ (type.hasOwnProperty('max') ? ' max="' + type.max + '"' : '')
							+ (type.hasOwnProperty('min') ? ' min="' + type.min + '"' : '')
							+ ' value="'
							+ (status
								? (typeof status !== 'number'
									? (type.min || '0')
									: status
								)
								: (type.default || type.min || '0')
							) + '"'
							+ ' class="form-range" data-type="number">';
					
					default:
						return '';
				}
			}).join('');
			
			var $elem = $(html + '</div>');
			
			$elem.find('input[type="range"]').on('change', function(){
				this.setAttribute('title', this.value);
			});
			
			$optimize_form.append($elem);
		});
		
		$optimize_form.on('change', function(){
			var $inputs = $optimize_form.find('input');
			
			$inputs.filter('[type="checkbox"]').each(function(){
				optimize_settings[this.name] = this.checked;
			});
			
			$inputs.not('[type="checkbox"]').each(function(){
				if(optimize_settings[this.name])
				{
					switch(this.getAttribute('data-type'))
					{
						case 'number':
							optimize_settings[this.name] = +this.value;
							break;
					}
				}
			});
			
			simply.updateSettings({optimize: optimize_settings});
			sessionStorage.optimize_settings = JSON.stringify(optimize_settings);
			
		});
		
		$settings_form.find('input').filter('[type="checkbox"]').each(function(){
			this.checked = settings[this.name];
				
			$output_js.attr(settings_attr[this.name], this.checked.toString());
			$output_json.attr(settings_attr[this.name], this.checked.toString());
		});
		$settings_form.on('change', function(){
			var $inputs = $settings_form.find('input');
			
			$inputs.filter('[type="checkbox"]').each(function(){
				settings[this.name] = this.checked;
				
				$output_js.attr(settings_attr[this.name], this.checked.toString());
				$output_json.attr(settings_attr[this.name], this.checked.toString());
			});
			
			sessionStorage.settings = JSON.stringify(settings);
		});
		
		[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(elem){
			return new bootstrap.Tooltip(elem);
		});
		
	});
})(Function('return this')());
