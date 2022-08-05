(function(window, undefined){
	var settings = {
		'wordWrap': false,
		'showLineNumbers': true
	};
	
	if(sessionStorage.length && sessionStorage.settings)
	{
		settings = Object.assign(settings, JSON.parse(sessionStorage.settings));
	}
	
	
	
	// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
	function fallbackCopyTextToClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		
		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";
	  
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
	  
		try {
		  var successful = document.execCommand('copy');
		  var msg = successful ? 'successful' : 'unsuccessful';
		  console.log('Fallback: Copying text command was ' + msg);
		} catch (err) {
		  console.error('Fallback: Oops, unable to copy', err);
		}
	  
		document.body.removeChild(textArea);
	  }
	  function copyTextToClipboard(text) {
		if (!navigator.clipboard) {
		  fallbackCopyTextToClipboard(text);
		  return;
		}
		
		try
		{
			navigator.clipboard.writeText(text).then(function() {
			}, function(err) {
				fallbackCopyTextToClipboard(text);
			});
		}
		catch(e)
		{
			fallbackCopyTextToClipboard(text);
		}
	  }
	
	
	
	

	window.jQuery(function($){
		var $pre = $('pre');
		var $code = $pre.find('code');
		
		$pre.attr('data-wordwrap', settings.wordWrap);
		
		$(window).on('storage', function(){
			if(sessionStorage.length && sessionStorage.settings)
			{
				settings = Object.assign(settings, JSON.parse(sessionStorage.settings));
			}
			
			$pre.attr('data-wordwrap', settings.wordWrap);
		});
		
		var $btn_copy = $('<button type="button" class="btn btn-primary btn-sm copy"><i class="bi bi-subtract"></i></button>');

		$btn_copy.on('click', function(){
			copyTextToClipboard($code.text());
		});
		
		$btn_copy.appendTo(document.body);
	});
})(Function('return this')());
