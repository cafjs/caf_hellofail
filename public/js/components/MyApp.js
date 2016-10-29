var React = require('react');
var rB = require('react-bootstrap');
var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var AppSession = require('../session/AppSession');
var ShoppingList = require('./ShoppingList');
var AppStatus = require('./AppStatus');
var DisplayError = require('./DisplayError');

var cE = React.createElement;

var MyApp = {
    getInitialState: function() {
        return AppStore.getState();
    },
    componentDidMount: function() {
        AppStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },
    _onChange : function(ev) {
        this.setState(AppStore.getState());
    },

    doCrashClient: function() {
        window.location.replace('crash.html');
    },

    doCrashServer: function() {
        AppActions.crash();
    },

    doBuy: function() {
        AppActions.buy();
    },

    handleSession: function() {
        var sesName = this.refs.session.getValue();
        AppActions.setLocalState({localSessionName: sesName});
    },

    launchSession: function(ev) {
        if (ev.key === 'Enter') {
            this.doUpdateSession();
        }
    },

    doUpdateSession: function() {
        var sesName = this.refs.session.getValue();
        if (sesName) {
            AppSession.changeSessionId(sesName);
            AppActions.setDefaultSession(sesName);
        } else {
            var error = new Error('No session name');
            AppActions.setError(error);
        }
    },

    render: function() {
        if (this.state.defaultSession && AppSession.changeSessionId) {
            AppSession.changeSessionId(this.state.defaultSession);
        }
        return cE("div", {className: "container-fluid"},
                  cE(DisplayError, {
                      error: this.state.error
                  }),
                  cE(rB.Panel, {
                      header: cE(rB.Grid, {fluid: true},
                                 cE(rB.Row, null,
                                    cE(rB.Col, {sm:1, xs:1},
                                       cE(AppStatus, {
                                           isClosed:
                                           this.state.isClosed
                                       })
                                      ),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:10,
                                        className: 'text-right'
                                    },
                                       "Recovery Example"
                                      ),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:11,
                                        className: 'text-right'
                                    },
                                       this.state.fullName
                                      )
                                   )
                                )
                  }, cE(rB.Panel, {header: "Break Things!"},
                        cE(rB.Grid, {fluid: true},
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:12, sm:3},
                                 cE(rB.Button, {onClick: this.doBuy,
                                                bsStyle: 'primary'},
                                    'Buy!')
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Button, {onClick: this.doCrashClient,
                                                bsStyle: 'danger'},
                                    'Crash Client')
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Button, {onClick: this.doCrashServer,
                                                bsStyle: 'danger'},
                                    'Crash Server')
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {
                         header: 'Client Session'
                     }, cE(rB.Grid, {fluid: true},
                           cE(rB.Row, null,
                              cE(rB.Col, {xs:6, sm:3},
                                 cE(rB.Input, {
                                     type: 'text',
                                     ref: 'session',
                                     value: this.state.localSessionName,
                                     onChange: this.handleSession,
                                     onKeyDown: this.launchSession,
                                     placeholder: 'New Session name'
                                 })
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Button, {onClick: this.doUpdateSession,
                                                bsStyle: 'primary'},
                                    'Update')
                                )
                             ),
                           cE(rB.Row, null,
                              cE(rB.Col, {xs:6, sm:3},
                                 cE(rB.Input, {
                                     type: 'text',
                                     label: 'Current',
                                     readOnly: true,
                                     value: this.state.defaultSession
                                 })
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {header: "Shopping"},
                        cE(ShoppingList, {
                            defaultSession: this.state.defaultSession,
                            allCounters: this.state.allCounters
                        })
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
