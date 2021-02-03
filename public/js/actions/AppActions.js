const AppConstants = require('../constants/AppConstants');
const json_rpc = require('caf_transport').json_rpc;
const caf_components = require('caf_components');
const myUtils = caf_components.myUtils;
const async = caf_components.async;

const ITEMS = [ 'camera', 'coat', 'flowers', 'hat', 'shirt', 'shoes'];

const DELAY = 1000;

const updateF = function(store, state) {
    const d = {
        type: AppConstants.APP_UPDATE,
        state: state
    };
    store.dispatch(d);
};

const errorF =  function(store, err) {
    const d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

const notifyF = function(store, message) {
    const getNotifData = function(msg) {
        return json_rpc.getMethodArgs(msg)[0];
    };
    const d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

const wsStatusF =  function(store, isClosed) {
    const d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};


const buyQueue = async.queue(function({ctx, justFinish}, cb) {
    var startIndex = 0;
    var nonce = null;
    // TO DO: clean up using async/await instead of callbacks
    async.series([
        function(cb1) {
            ctx.session.begin(function(err, data) {
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
                        ctx.session.buy(nonce, i + startIndex, x, cb2);
                        AppActions.getState(ctx);
                    }, DELAY);
                }, cb1);
            }
        },
        function(cb1) {
            ctx.session.end(nonce, cb1);
        }
    ], cb);
}, 1); // serialized

const AppActions = {
    initServer(ctx, initialData) {
        updateF(ctx.store, myUtils.deepClone(initialData));
    },
    async init(ctx) {
        try {
            const data = await ctx.session.hello(ctx.session.getCacheKey())
                    .getPromise();
            updateF(ctx.store, data);
            AppActions.buy(ctx, true);
        } catch (err) {
            errorF(ctx.store, err);
        }
    },
    message(ctx, msg) {
        console.log('message:' + JSON.stringify(msg));
        notifyF(ctx.store, msg);
    },
    closing(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    },
    setLocalState(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError(ctx) {
        errorF(ctx.store, null);
    },
    setError(ctx, err) {
        errorF(ctx.store, err);
    },
    buy(ctx, justFinish) {
        buyQueue.push({ctx, justFinish}, (err) => {
            if (err) {
                console.log(myUtils.errToPrettyStr(err));
                AppActions.setError(ctx, err);
            }
        });
    },
    crashClient(ctx) {
        window.location.replace('crash.html');
    }
};

['crash', 'setDefaultSession', 'getState'].forEach(function(x) {
    AppActions[x] = async function() {
        const args = Array.prototype.slice.call(arguments);
        const ctx = args.shift();
        try {
            const data = await ctx.session[x].apply(ctx.session, args)
                  .getPromise();
            updateF(ctx.store, data);
        } catch (err) {
            errorF(ctx.store, err);
        }
    };
});

module.exports = AppActions;
