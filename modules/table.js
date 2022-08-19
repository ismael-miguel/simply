(function(window, undefined){
	'use strict';
	
	if(!window.simply)
	{
		throw new Error('window.simply is required to use this module');
	}
	
	var SETTINGS_DEFAULT = {
		classTable: 'table table-striped table-hover table-bordered font-sans-serif caption-top',
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
	
	
	
	function TableChild(child){
		Object.defineProperties(this, {
			child: {
				value: child
			},
			__doc__: {
				value: [
					'TableChild object, from the Table module',
					'All functions available: ' + Object.keys(TableChild.prototype).join('(), ') + '()'
				]
			}
		});
	};
	
	Object.defineProperties(TableChild.prototype, {
		setText: {
			value: Object.assign(function setText(text){
				this.child.textContent = text === null || text === undefined ? '' : text.toString();
			}, {
				__doc__: 'Sets a new text'
			}),
			enumerable: true
		},
		addText: {
			value: Object.assign(function addText(text){
				if(text === null || text === undefined)
				{
					return;
				}
				
				this.child.textContent += text.toString();
			}, {
				__doc__: 'Adds text'
			}),
			enumerable: true
		},
		getText: {
			value: Object.assign(function getText(){
				return this.child.textContent;
			}, {
				__doc__: 'Gets the text'
			}),
			enumerable: true
		},
		
		setClasses: {
			value: Object.assign(function setClasses(names){
				this.child.className = names === null || names === undefined ? '' : names.toString();
			}, {
				__doc__: 'Sets all the classes, separated by a space'
			}),
			enumerable: true
		},
		getClasses: {
			value: Object.assign(function getClasses(){
				return this.child.className;
			}, {
				__doc__: 'Gets all the classes, separated by a space'
			}),
			enumerable: true
		},
		addClass: {
			value: Object.assign(function addClass(name){
				return this.child.classList.add(name);
			}, {
				__doc__: 'Adds a single class'
			}),
			enumerable: true
		},
		removeClass: {
			value: Object.assign(function removeClass(name){
				return this.child.classList.remove(name);
			}, {
				__doc__: 'Removes a single class'
			}),
			enumerable: true
		},
		hasClass: {
			value: Object.assign(function hasClass(name){
				return this.child.classList.contains(name);
			}, {
				__doc__: 'Verifies if contains the specified class'
			}),
			enumerable: true
		},
		
		remove: {
			value: Object.assign(function remove(){
				if(!this.child.parentNode)
				{
					return;
				}
				
				this.child.parentNode.removeChild(this.child);
			}, {
				__doc__: 'Removes the element'
			}),
			enumerable: true
		}
	});
	
	
	
	function TableCell(cell){
		Object.defineProperties(this, {
			child: {
				value: cell
			},
			__doc__: {
				value: [
					'TableCell object, from the Table module',
					'All functions available: ' + Object.keys(TableCell.prototype).join('(), ') + '()'
				]
			}
		});
	}
	
	TableCell.prototype = Object.create(TableChild.prototype, {
		isFirstCol: {
			value: Object.assign(function isFirstCol(){
				return this.child.parentNode
					? this.child.parentNode.firstChild === this.child
					: null;
			}, {
				__doc__: 'Checks if the cell is in the first column'
			}),
			enumerable: true
		},
		isLastCol: {
			value: Object.assign(function isLastCol(){
				return this.child.parentNode
					? this.child.parentNode.lastChild === this.child
					: null;
			}, {
				__doc__: 'Checks if the cell is in the last column'
			}),
			enumerable: true
		},
		getColumn: {
			value: Object.assign(function getColumn(){
				return this.child.parentNode
					? Array.from(this.child.parentNode.children).indexOf(this.child)
					: null;
			}, {
				__doc__: [
					'Gets the column number where the cell is',
					'The value is 0-based, which means, the first cell is on column 0'
				]
			}),
			enumerable: true
		},
		getRow: {
			value: Object.assign(function getRow(){
				return this.child.parentNode && this.child.parentNode.parentNode
					? Array.from(this.child.parentNode.parentNode.children).indexOf(this.child.parentNode)
					: null;
			}, {
				__doc__: [
					'Gets the row number where the cell is',
					'The value is 0-based, which means, the first cell is on row 0'
				]
			}),
			enumerable: true
		}
	});
	
	
	
	
	function TableHeaderCell(cell){
		Object.defineProperties(this, {
			child: {
				value: cell
			},
			__doc__: {
				value: [
					'TableHeaderCell object, from the Table module',
					'All functions available: ' + Object.keys(TableHeaderCell.prototype).join('(), ') + '()'
				]
			}
		});
	}
	
	TableHeaderCell.prototype = Object.create(TableCell.prototype, {
		getRow: {
			value: Object.assign(function getRow(){
				return 0;
			}, {
				__doc__: [
					'Gets the row number where the cell is',
					'The value is 0-based, which means, the first cell is on row 0'
				]
			}),
			enumerable: true
		}
	});
	
	
	
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
		removeCaption: {
			value: Object.assign(function removeCaption(){
				if(this.caption.parentNode)
				{
					this.caption.parentNode.removeChild(this.caption);
				}
				
				this.caption.textContent = '';
			}, {
				__doc__: [
					'Removes the caption text for the table',
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
					'Takes all the passed arguments and adds them to the header',
					'All contents previously set will be kept'
				]
			}),
			enumerable: true
		},
		getHeader: {
			value: Object.assign(function getHeader(column){
				column = +column;
				
				if(
					!this.header.firstChild
					&& !this.header.firstChild.children[column]
				)
				{
					return null;
				}
				
				return new TableHeaderCell(this.header.firstChild.children[column]);
			}, {
				__doc__: 'Gets the cell at $row, $column'
			}),
			enumerable: true
		},
		
		addRow: {
			value: Object.assign(function addRow(){
				var tr = document.createElement('tr');
				
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
		getCell: {
			value: Object.assign(function getCell(row, column){
				row = +row;
				column = +column;
				
				var tr = this.body.children[row];
				
				if(!tr)
				{
					return null;
				}
				
				if(!tr.children[column])
				{
					return null;
				}
				
				return new TableCell(tr.children[column]);
			}, {
				__doc__: 'Gets the cell at $row, $column'
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
		},
		
		onclick: {
			value: Object.assign(function onclick(fn){
				var me = this;
				
				if(fn === null)
				{
					me.body.onclick = null;
					return;
				}
				
				if(!fn || (typeof fn !== 'function'))
				{
					return false;
				}
				
				var handle_click = function(e){
					var td = e.target;
					
					var data = {
						trusted: e.isTrusted,
						button: e.button,
						alt: e.altKey,
						meta: e.metaKey,
						shift: e.shiftKey,
						ctrl: e.ctrlKey,
						column: Array.from(td.parentNode.children).indexOf(td),
						row: Array.from(td.parentNode.parentNode.children).indexOf(td.parentNode)
					};
					
					fn(data, me);
				};
				
				me.body.onclick = function(e){
					if(e.target && e.target.tagName !== 'TD')
					{
						return;
					}
					
					handle_click(e);
				};
				
				/*if('ontouchstart' in me.body && 'ontouchend' in me.body && 'ontouchmove' in me.body)
				{
					var start_touch = null;
						
					var do_cleanup = function(){
						start_touch = null;
						
						me.body.ontouchend = null;
						me.body.ontouchmove = null;
					};
					
					me.body.ontouchstart = function(e){
						if(start_touch)
						{
							return;
						}
						
						start_touch = e.touches[0] || e.changedTouches[0];
						
						var handle_stop = function(e){
							var touch = e.touches[0] || e.changedTouches[0];
							
							if(touch.screenX !== start_touch.screenX || touch.screenY !== start_touch.screenY)
							{
								return;
							}
							
							do_cleanup();
							
							handle_click(e);
						};
						
						var handle_move = function(e){
							var touch = e.touches[0] || e.changedTouches[0];
							
							if(touch.screenX !== start_touch.screenX || touch.screenY !== start_touch.screenY)
							{
								do_cleanup();
							}
						};
						
						me.body.ontouchend = handle_stop;
						me.body.ontouchmove = handle_move;
					};
				}*/
				
				return true;
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
