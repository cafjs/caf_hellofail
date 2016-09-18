/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
var caf = require('caf_core');
var app = require('../public/js/app.js');

var MAX_CRASH_TIME = 5; // seconds
var MAX_PROCESSING_TIME = 2; // seconds

exports.methods = {
    '__ca_init__' : function(cb) {
        this.state.allCounters = {};
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.defaultSession = 'default';
         cb(null);
    },

    '__ca_pulse__' : function(cb) {
        this.$.log && this.$.log.debug('calling PULSE!!! ');
        this.$.react.render(app.main, [this.state]);
        cb(null, null);
    },

    'hello' : function(key, cb) {
        this.$.react.setCacheKey(key);
        this.getState(cb);
    },

    'begin' : function(cb) {
        var seId = this.$.session.getSessionId();
        var counters = this.state.allCounters[seId] || {};
        this.state.allCounters[seId] = counters;
        var res =  this.$.session.begin();
        if (typeof res.memento !== 'number') {
            counters.next = 0;
        }
        this.$.log && this.$.log.trace('BEGIN id:' + seId +
                                       ' value:' + JSON.stringify(res) +
                                       ' next: ' + counters.next);
        cb(null, res);
    },

    /*
     * nonce type is string
     * index is a number
     * item is a string
     */
    'buy' : function(nonce, index, item, cb) {
        var self = this;
        var seId = this.$.session.getSessionId();
        var counters = this.state.allCounters[seId];
        if (index !== counters.next) {
            // duplicate, do no action
            this.$.log && this.$.log.debug('Ignoring index ' + index +
                                           ' expecting ' + counters.next);
            var err = new Error('Ignoring buy operation, out of order');
            err.index = index;
            err.item = item;
            err.next = counters.next;
            cb(err);
        } else {
            var buyTime = Math.random() * MAX_PROCESSING_TIME * 1000;
            setTimeout(function() {
                self.$.log && self.$.log.trace('REMEMBERING ' + index);
                if (self.$.session.remember(nonce, index)) {
                    self.$.log && self.$.log.debug('Buying ' + item);
                    counters.next = counters.next + 1;
                    var count = counters[item] || 0;
                    counters[item] = count + 1;
                    self.getState(cb);
                } else {
                    var err = new Error('Ignoring buy operation, bad nonce');
                    err.index = index;
                    err.item = item;
                    cb(err);
                }
            }, buyTime);
        }
    },

    'end' : function(nonce, cb) {
        this.$.log && this.$.log.trace('END');
        cb(null, this.$.session.end(nonce));
    },

    'crash' : function(cb) {
        var self = this;
        var nextCrashTime = Math.random() * MAX_CRASH_TIME * 1000;
        setTimeout(function() {
            self.$.log && self.$.log.debug('Forced crash');
            /* The node.js process is shared by many CAs, and killing it
             *  will affect all co-located clients, creating the
             * illusion of random failures.
             *
             */
            process.exit(1);
            // process.kill(process.pid, 'SIGTERM');
        }, nextCrashTime);
        this.getState(cb);
    },

    'setDefaultSession' : function(session, cb) {
        this.state.defaultSession = session;
        this.getState(cb);
    },

    'getState' : function(cb) {
        this.$.react.coin();
        cb(null, this.state);
    }
};

caf.init(module);
