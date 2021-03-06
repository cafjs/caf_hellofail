// Modifications copyright 2020 Caf.js Labs and contributors
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

'use strict';
const caf = require('caf_core');
const app = require('../public/js/app.js');
const util = require('util');

const MAX_CRASH_TIME = 5; // seconds
const MAX_PROCESSING_TIME = 2; // seconds

const setTimeoutPromise = util.promisify(setTimeout);

exports.methods = {
    async __ca_init__() {
        this.state.allCounters = {};
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.defaultSession = 'default';
        return [];
    },

    async __ca_pulse__() {
        this.$.log && this.$.log.debug('calling PULSE!!! ');
        this.$.react.render(app.main, [this.state]);
        return [];
    },

    async hello(key) {
        this.$.react.setCacheKey(key);
        return this.getState();
    },

    async begin() {
        const seId = this.$.session.getSessionId();
        const counters = this.state.allCounters[seId] || {};
        this.state.allCounters[seId] = counters;
        const res = this.$.session.begin();
        if (typeof res.memento !== 'number') {
            counters.next = 0;
        }
        this.$.log && this.$.log.trace('BEGIN id:' + seId +
                                       ' value:' + JSON.stringify(res) +
                                       ' next: ' + counters.next);
        return [null, res];
    },

    /*
     * nonce type is string
     * index is a number
     * item is a string
     */
    async buy(nonce, index, item) {
        const seId = this.$.session.getSessionId();
        const counters = this.state.allCounters[seId];
        if (index !== counters.next) {
            // duplicate, do no action
            this.$.log && this.$.log.debug('Ignoring index ' + index +
                                           ' expecting ' + counters.next);
            const err = new Error('Ignoring buy operation, out of order');
            err.index = index;
            err.item = item;
            err.next = counters.next;
            return [err];
        } else {
            const buyTime = Math.random() * MAX_PROCESSING_TIME * 1000;
            await setTimeoutPromise(buyTime);
            this.$.log && this.$.log.trace('REMEMBERING ' + index);
            if (this.$.session.remember(nonce, index)) {
                this.$.log && this.$.log.debug('Buying ' + item);
                counters.next = counters.next + 1;
                const count = counters[item] || 0;
                counters[item] = count + 1;
                return this.getState();
            } else {
                const err = new Error('Ignoring buy operation, bad nonce');
                err.index = index;
                err.item = item;
                return [err];
            }
        }
    },

    async end(nonce) {
        this.$.log && this.$.log.trace('END');
        return [null, this.$.session.end(nonce)];
    },

    async crash() {
        const nextCrashTime = Math.random() * MAX_CRASH_TIME * 1000;
        setTimeout(() => {
            this.$.log && this.$.log.debug('Forced crash');
            /* The node.js process is shared by many CAs, and killing it
             * will affect all co-located clients, creating the
             * illusion of random failures.
             *
             */
            process.exit(1);
            // process.kill(process.pid, 'SIGTERM');
        }, nextCrashTime);
        return this.getState();
    },

    async setDefaultSession(session) {
        this.state.defaultSession = session;
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    }
};

caf.init(module);
