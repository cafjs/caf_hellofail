var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var AppSession = require('../session/AppSession');
var caf_cli =  require('caf_cli');
var caf_components = require('caf_components');
var myUtils = caf_components.myUtils;
var async = caf_components.async;

var ITEMS = [ 'camera', 'coat', 'flowers', 'hat', 'shirt', 'shoes'];

var DELAY = 1000;

var updateF = function(state) {
    var d = {
        actionType: AppConstants.APP_UPDATE,
        state: state
    };
    AppDispatcher.dispatch(d);
};


var errorF =  function(err) {
    var d = {
        actionType: AppConstants.APP_ERROR,
        error: err
    };
    AppDispatcher.dispatch(d);
};

var wsStatusF =  function(isClosed) {
    var d = {
        actionType: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    AppDispatcher.dispatch(d);
};

var buyQueue = async.queue(function(justFinish, cb) {
    var startIndex = 0;
    var nonce = null;
    async.series([
        function(cb1) {
            AppSession.begin(function(err, data) {
                if (err) {
                    cb1(err);
                } else {
                    nonce = data.nonce;
                    if (typeof data.memento === 'number') {
                        startIndex = data.memento + 1;
                    }
                    cb1(null);
                }
            });
        },
        function(cb1) {
            if (justFinish && (startIndex === 0)) {
                cb1(null);
            } else {
                async.forEachOfSeries(ITEMS.slice(startIndex), function(x, i,
                                                                        cb2) {
                    setTimeout(function() {
                        AppSession.buy(nonce, i + startIndex, x, cb2);
                        AppActions.getState();
                    }, DELAY);
                }, cb1);
            }
        },
        function(cb1) {
            AppSession.end(nonce, cb1);
        }
    ], cb);
}, 1); // serialized

var AppActions = {
    initServer: function(initialData) {
        updateF(myUtils.deepClone(initialData));
    },
    init: function(cb) {
        AppSession.hello(AppSession.getCacheKey(),
                         function(err, data) {
                             if (err) {
                                 errorF(err);
                             } else {
                                 updateF(data);
                                 AppActions.buy(true);
                             }
                             cb(err, data);
                         });
    },
    setLocalState: function(data) {
        updateF(data);
    },
    resetError: function() {
        errorF(null);
    },
    setError: function(err) {
        errorF(err);
    },
    buy: function(justFinish) {
        var self = this;
        buyQueue.push(justFinish, function(err) {
            if (err) {
                console.log(myUtils.errToPrettyStr(err));
                self.setError(err);
            }
        });
    }
};

['crash', 'setDefaultSession', 'getState']
    .forEach(function(x) {
        AppActions[x] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.push(function(err, data) {
                if (err) {
                    errorF(err);
                } else {
                    updateF(data);
                }
            });
            AppSession[x].apply(AppSession, args);
        };
    });


AppSession.onmessage = function(msg) {
    console.log('message:' + JSON.stringify(msg));
    AppActions.getState();
};

AppSession.onclose = function(err) {
    console.log('Closing:' + JSON.stringify(err));
    wsStatusF(true);
};


module.exports = AppActions;
