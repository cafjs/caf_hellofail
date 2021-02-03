'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class ClientSession extends React.Component {

    constructor(props) {
        super(props);
        this.handleSession = this.handleSession.bind(this);
        this.launchSession = this.launchSession.bind(this);
        this.doUpdateSession = this.doUpdateSession.bind(this);
    }

    handleSession(e) {
        AppActions.setLocalState(this.props.ctx, {
            localSessionName: e.target.value
        });
    }

    launchSession(ev) {
        if (ev.key === 'Enter') {
            this.doUpdateSession();
        }
    }

    doUpdateSession() {
        const sesName = this.props.localSessionName;
        if (sesName) {
            AppActions.setDefaultSession(this.props.ctx, sesName);
        } else {
            const error = new Error('No session name');
            AppActions.setError(this.props.ctx, error);
        }
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'currId'},
                     cE(rB.Col, {sm: 4, xs: 6},
                        cE(rB.ControlLabel, null, 'Current')
                       ),
                     cE(rB.Col, {sm: 4, xs: 6},
                        cE(rB.FormControl, {
                            type: 'text',
                            value: this.props.defaultSession,
                            readOnly: true
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'sessId'},
                     cE(rB.Col, {sm: 4, xs: 6},
                        cE(rB.ControlLabel, null, 'New')
                       ),
                     cE(rB.Col, {sm: 4, xs: 6},
                        cE(rB.FormControl, {
                            type: 'text',
                            value: this.props.localSessionName,
                            placeholder: '',
                            onChange: this.handleSession,
                            onKeyDown: this.launchSession
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'buttoId'},
                     cE(rB.Col, {smOffset: 4, sm: 4, xs: 12},
                        cE(rB.Button, {
                            onClick: this.doUpdateSession,
                            bsStyle: 'primary'
                        }, 'Update')
                       )
                    )
                 );
    }
}

module.exports = ClientSession;
