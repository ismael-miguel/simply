(function(window, undefined){
	var console = window.document.getElementById('output-code');
	
	
	window.simply.defineModule({
		name: 'dom',
		spec: [
			[/^#[^#\s]+/i, 'ID'],
			[/^\.[^\.\s]+/i, 'CLASS'],
			[/^<[a-z][a-z\d\-]+>/i, 'TAG'],
			[/^\$\([^\)]+\)/i, 'SELECTOR']
		],
		parse: function(){
			
		},
		compile_boilerplate: [
			
		],
		before_compile: function(){
			var iframe = window.document.createElement('iframe');
			iframe.width = '100%';
			iframe.height = '50%';
			iframe.src = '';
			
			console.appendChild(iframe);
		},
		compile: function(token, buffer){
			
		}
	});
})(Function('return this')());
