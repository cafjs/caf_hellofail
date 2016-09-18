var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var ShoppingList = {
    render: function() {
        var counters = this.props.allCounters[this.props.defaultSession] || {};
        delete counters.next;
        var keys = Object.keys(counters).sort();
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:2}, 'Item'),
                        cE('th', {key:3}, 'Count')
                       )
                    ),
                  cE('tbody', {key:8}, keys.map(function(x, i) {
                      return cE('tr', {key:10*i +1000},
                                cE('td', {key:10*i+1001}, x),
                                cE('td', {key:10*i+1002}, counters[x])
                               );
                  }))
                 );
    }
};


module.exports = React.createClass(ShoppingList);
