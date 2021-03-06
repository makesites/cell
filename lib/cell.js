/**
 * @name {{name}}
 * {{description}}
 *
 * Version: {{version}} ({{build_date}})
 * Homepage: {{homepage}}
 *
 * @author {{author}}
 * Initiated by: Makis Tracend (@tracend)
 *
 * @cc_on Copyright © Makesites.org
 * @license {{#license licenses}}{{/license}}
 */

{{{lib}}}

(function(lib) {
	if (typeof define === 'function' && define.amd) {
		define("cell", [], lib);
	} else if (typeof exports === 'object') {
		module.exports = lib(require('ildb'));
	} else {
		window.Cell = lib(window.ILDB);
	}
})(function(ILDB) {

var db, queue,
	_queue = [];

var defaults = {
	"store": "cell.db"

};

var Cell = function( options ){
	// constructor
	var self = this;
	// - setting options
	options = options || {};
	this.options = defaults;
	Object.extend(this.options, options);
	// - setup DB
	db = new ILDB( this.options.store );
	// update the status on ready
	db.ready(function() {
		//return typeof db.clear === "function" ? db.clear(done) : void 0;
		self.status.ready = true;
		self._processQueue();
	});

	return this;
}

// Methods

Cell.prototype = {
	status: {
		ready: false
	},

	// temp data container
	_data: {

	},

	// Data interface

	set: function( data ){
		var self = this;

		for( var key in data ){
			// save data in memory
			this._data[key] = data[key];
			if( this.status.ready ){
				db.put(key, data[key], function(err) {
					if(err) console.log(err);
					// delete temp data
					//delete self._data[key];
					// callback?
				});
			} else {
				queue("set", arguments);
			}
		}
	},

	get: function( key, cb ){
		var self = this;

		if( this.status.ready ){
			db.get(key, function(err, val) {
				if(err) console.log(err);
				if( cb ) cb( val );
			});
		} else {
			queue("get", arguments);
		}

	},

	remove: function( key ){
		if( this.status.ready ){
			db.del(key, function(err) {
				if(err) console.log(err);
				// callback?
			});
		} else {
			queue("remove", arguments);
		}
	},

	all: function( cb ){
		db.getAll(function(err, all) {
			if(err) console.log(err);
			if( cb ) cb( all );
		});
	},

	// Logic

	// - define a single method
	define: function( name, method ){
		// validation?
		this[name] = method;
	},

	// - Extend with custom methods
	extend: function( methods ){
		// validation?
		for( var name in methods ){
			this[name] = methods[name];
		}
	},

	// - Checks the state of an item
	check: function( options ){
		options = options || {};
		// fallbacks
		var key = options.key || false;
		var value = options.value || false;
		var cb = options.cb || function(){};
		// prerequisite
		if( !key ) return;
		// if a value is provided
		this.get(key, function( stored ){
			// exit now if there's no value
			if( !stored ) return cb( false );
			// if value compare
			if( value ) return cb( (stored == value) );
			// return the timestamp of the stored item
			//...
		});
	},

	// Persistance

	// - Saves existing data is a separate DB
	save: function( name ){
		// fallback
		name = name || (new Date()).getTime();
		// set the store
		var store = "cell_"+ name;
		// create a separate cell instance
		var cell = new Cell({
			store: store
		});
		// get all data
		this.all(function( data ){
			// save in new store
			cell.set( data );
		});
		// keep a reference to the name
		return name;
	},

	// - Loads data from a persistant state
	load: function( name ){
		// fallback
		name = name || false;
		// prerequisite
		if( !name ) return;
		// set the store
		var store = "cell_"+ name;
		var cell = new Cell({
			store: store
		});
		// get all existing data
		cell.all(function( data ){
			// delete existing data first?
			// save in store
			this.set( data );
		});

	},

	// Internal methods

	_processQueue: function(){
		for(var i in _queue){
			var action = _queue[i].action;
			var args = _queue[i].args;
			this[action].apply(this, args);
		}
	}

};


// store methods
				/*
store = {
	put: function(key, value){

	},

	get: function(){

	},

	del: function(){

	}
}
*/

queue = function(action, args){
	_queue.push({
		action: action,
		args: args
	});
}


// Helpers

Object.extend = function(destination, source) {
	for (var property in source) {
		if (source[property] && source[property].constructor && source[property].constructor === Object) {
			destination[property] = destination[property] || {};
			arguments.callee(destination[property], source[property]);
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
};


return Cell;

});

