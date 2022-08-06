(function(window, undefined){
	'use strict';
	
	if(!window.simply)
	{
		throw new Error('window.simply is required to use this module');
	}
	
	var SETTINGS_DEFAULT = {
		classTable: 'table table-striped table-hover table-bordered font-sans-serif',
		classCaption: '',
		classHeader: 'text-center fw-bold',
		classHeaderItems: 'py-1',
		classBody: 'fw-normal fst-normal',
		classBodyFirstRow: '',
		classBodyRow: '',
		classBodyFirstCol: 'py-1',
		classBodyCell: 'py-1'
	};
	
	var SETTINGS = {};
	
	function TableGenerator(settings){
		Object.defineProperties(this, {
			settings: {
				value: settings,
				writable: true
			},
			holder: {
				value: document.createElement('div')
			},
			table: {
				value: document.createElement('table')
			},
			caption: {
				value: document.createElement('caption')
			},
			header: {
				value: document.createElement('thead')
			},
			body: {
				value: document.createElement('tbody')
			}
		});
		
		
		
		this.table.className = this.settings.classTable;
		this.caption.className = this.settings.classCaption;
		this.header.className = this.settings.classHeader;
		this.body.className = this.settings.classBody;
		
		this.table.appendChild(this.header);
		this.table.appendChild(this.body);
		
		this.holder.className = 'table-responsive';
		this.holder.appendChild(this.table);
	}
	
	Object.defineProperties(TableGenerator.prototype, {
		setCaption: {
			value: Object.assign(function setCaption(caption){
				if(!this.caption.parentNode)
				{
					this.table.insertBefore(this.caption, this.table.firstChild);
				}
				
				this.caption.textContent = caption;
			}, {
				__doc__: [
					'Sets the caption text for the table',
					'All contents previously set will be deleted'
				]
			}),
			enumerable: true
		},
		
		setHeader: {
			value: Object.assign(function setHeader(){
				while(this.header.firstChild)
				{
					this.header.removeChild(this.header.firstChild);
				}
				
				var tr = document.createElement('tr');
				
				Array.from(arguments).flat(1).forEach(function(value){
					var th = document.createElement('th');
					th.textContent = value;
					th.className = this.settings.classHeaderItems;
					
					tr.appendChild(th);
				}, this);
				
				this.header.appendChild(tr);
			}, {
				__doc__: [
					'Takes all the arguments and sets them as headers for the table',
					'All contents previously set will be deleted'
				]
			}),
			enumerable: true
		},
		addHeader: {
			value: Object.assign(function addHeader(){
				if(!this.header.firstChild)
				{
					this.header.appendChild(document.createElement('tr'));
				}
				
				Array.from(arguments).flat(1).forEach(function(value){
					var th = document.createElement('th');
					th.textContent = value;
					th.className = this.settings.classHeaderItems;
					
					this.header.firstChild.appendChild(th);
				}, this);
			}, {
				__doc__: [
					'Adds all the passed arguments and adds them to the header',
					'All contents previously set will be kept'
				]
			}),
			enumerable: true
		},
		
		addRow: {
			value: Object.assign(function addRow(){
				var tr = document.createElement('tr');
				
				console.log(this.settings.classBodyRow);
				
				Array.from(arguments).flat(2).forEach(function(value, i){
					var td = document.createElement('td');
					td.textContent = value;
					td.className = i
						? this.settings.classBodyCell
						: this.settings.classBodyFirstCol;
					
					tr.appendChild(td);
				}, this);
				
				tr.className = this.body.firstChild
					? this.settings.classBodyRow
					: this.settings.classBodyFirstRow;
				
				this.body.appendChild(tr);
			}, {
				__doc__: 'Adds a row to the table'
			}),
			enumerable: true
		},
		addRows: {
			value: Object.assign(function addRows(){
				Array.from(arguments).forEach(function(row){
					this.addRow(row);
				}, this);
			}, {
				__doc__: 'Adds all the rows to the table'
			}),
			enumerable: true
		},
		
		addCell: {
			value: Object.assign(function addCell(value){
				if(!this.body.lastChild)
				{
					this.addRow(value);
					return;
				}
				
				var tr = this.body.lastChild;
				var td = document.createElement('td');
				td.textContent = value;
				td.className = tr.firstChild
					? this.settings.classBodyCell
					: this.settings.classBodyFirstCol;
				
				tr.appendChild(td);
			}, {
				__doc__: 'Adds a cell to the last row'
			}),
			enumerable: true
		},
		addCells: {
			value: Object.assign(function addCells(){
				Array.from(arguments).forEach(function(cell){
					this.addCell(cell);
				}, this);
			}, {
				__doc__: 'Adds multiple cells to the last row'
			}),
			enumerable: true
		},
		
		getSettings: {
			value: Object.assign(function getSettings(){
				return Object.assign({}, this.settings);
			}, {
				__doc__: 'Returns a copy of the settings'
			}),
			enumerable: true
		},
		updateSettings: {
			value: Object.assign(function getSettings(settings){
				this.settings = Object.assign({}, this.settings, settings);
			}, {
				__doc__: 'Updates the settings'
			}),
			enumerable: true
		},
		
		show: {
			value: Object.assign(function show(){
				this.hide();
				
				if(SETTINGS.output_element)
				{
					SETTINGS.output_element.appendChild(this.holder);
				}
				else
				{
					console.log(this.holder.innerHTML);
				}
			}, {
				__doc__: 'Shows the table'
			}),
			enumerable: true
		},
		hide: {
			value: Object.assign(function hide(){
				if(this.holder.parentNode)
				{
					this.holder.parentNode.removeChild(this.table);
				}
			}, {
				__doc__: 'Hides the table, if shown'
			}),
			enumerable: true
		}
	});
	
	simply.module_register('table', {
		Exports: {
			version: '1.0',
			create: Object.assign(function table_create(settings){
				settings = Object.assign({}, SETTINGS_DEFAULT, settings ? settings : {});
				
				var tg = new TableGenerator(settings);
				
				Object.defineProperty(tg, '__doc__', {
					value: [
						'Table module object',
						'All functions available: ' + Object.keys(tg).join('(), ') + '()'
					]
				});
				
				return tg;
			}, {
				__doc__: [
					'Creates a table to display tabular data',
					'Use $var->show() to display the table'
				]
			}),
			getDefaultSettings: Object.assign(function table_getDefaultSettings(){
				return Object.assign({}, SETTINGS_DEFAULT);
			}, {
				__doc__: [
					'Returns the default settings',
					'The value returned by this method can be used with !TABLE->create()'
				]
			}),
			__doc__: [
				'Table module',
				'Please run !TABLE->create($settings)',
				'Store the value on a variable for later use',
				'You can obtain a copy of the default settings by running !TABLE->getDefaultSettings()'
			]
		},
		Init: function(settings){
			Object.assign(SETTINGS, settings);
		}
	});
})(Function('return this')());
