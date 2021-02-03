'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Manage extends React.Component {

    constructor(props) {
        super(props);
        this.doCrashClient = this.doCrashClient.bind(this);
        this.doCrashServer = this.doCrashServer.bind(this);
        this.doBuy = this.doBuy.bind(this);
    }

    doCrashClient() {
        AppActions.crashClient(this.props.ctx);
    }

    doCrashServer() {
        AppActions.crash(this.props.ctx);
    }

    doBuy() {
        AppActions.buy(this.props.ctx);
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                   cE(rB.FormGroup, {controlId: 'buttonId', bsSize: 'large'},
                      cE(rB.Col, {sm:12, xs: 12},
                         cE(rB.ButtonGroup, null,
                            cE(rB.Button, {
                                bsStyle: 'primary',
                                onClick: this.doBuy
                            }, 'Buy!'),
                            cE(rB.Button, {
                                onClick: this.doCrashClient,
                                bsStyle: 'info'
                            }, 'Crash Client'),
                            cE(rB.Button, {
                                onClick: this.doCrashServer,
                                bsStyle: 'danger'
                            }, 'Crash Server')
                           )
                        )
                     )
                 );
    }
}

module.exports = Manage;
