'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const AppStatus = require('./AppStatus');
const ShoppingList = require('./ShoppingList');
const DisplayError = require('./DisplayError');
const Manage = require('./Manage');
const ClientSession = require('./ClientSession');

const cE = React.createElement;

class MyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.ctx.store.getState();
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    render() {
        if (this.state.defaultSession && this.props.ctx.session)  {
            this.props.ctx.session.changeSessionId(
                this.state.defaultSession
            );
        }
        return cE('div', {className: 'container-fluid'},
                  cE(DisplayError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(rB.Panel, null,
                     cE(rB.Panel.Heading, null,
                        cE(rB.Panel.Title, null,
                           cE(rB.Grid, {fluid: true},
                              cE(rB.Row, null,
                                 cE(rB.Col, {sm:1, xs:1},
                                    cE(AppStatus, {
                                        isClosed: this.state.isClosed
                                    })
                                   ),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:10,
                                     className: 'text-right'
                                 }, 'Recovery Example'),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:11,
                                     className: 'text-right'
                                 }, this.state.fullName)
                                )
                             )
                          )
                       ),
                     cE(rB.Panel.Body, null,
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Break Things!')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(Manage, {
                                  ctx: this.props.ctx
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Client Session')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(ClientSession, {
                                  ctx: this.props.ctx,
                                  localSessionName: this.state.localSessionName,
                                  defaultSession: this.state.defaultSession
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Shopping')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(ShoppingList, {
                                  defaultSession: this.state.defaultSession,
                                  allCounters: this.state.allCounters
                              })
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = MyApp;
