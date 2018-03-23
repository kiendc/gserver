class TodoApp extends React.Component {
    constructor(props) {
      super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = { items: [], text: '' };
    }

    render() {
        return React.createElement(
          'div',
          null,
          React.createElement(
            'h3',
            null,
            'TODO'
          ),
          React.createElement(TodoList, { items: this.state.items }),
          React.createElement(
            'form',
            { onSubmit: this.handleSubmit },
            React.createElement('input', { onChange: this.handleChange, value: this.state.text }),
            React.createElement(
              'button',
              null,
              'Add #' + (this.state.items.length + 1)
            )
          )
        );
    }

    handleChange(e) {
        this.setState({ text: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        var newItem = {
            text: this.state.text,
            id: Date.now()
        };
        this.setState(prevState => ({
            items: prevState.items.concat(newItem),
            text: ''
        }));
    }
}

class TodoList extends React.Component {
    render() {
        return React.createElement(
          'ul',
          null,
          this.props.items.map(item => React.createElement(
            'li',
            { key: item.id },
            item.text
          ))
        );
    }
}



class PowerPanel extends React.Component {
    constructor(props) {
        super(props);
        this.orders = new Map();
    }
    render() {
        let elems = [];
        /*
        var units = Array.from(this.props.board.units).filter(function(x){ 
            //console.log(this);
            return x.power === this.props.power
        },this);
        */
        var units = this.props.units;
        //console.log(units);
        switch (this.props.board.state.phase) {
            case 0: //Phase.Movement:
                {
                    elems = units.map(function(unit, index){
                        return React.createElement(OrderItem, { 
                            power: this.props.power, 
                            board: this.props.board, 
                            unit: {
                                location: unit.locationName,
                                militaryBranch: unit.militaryBranch
                            },
                            key: unit.locationName, 
                            on: function(order){
                                //console.log("On callback of OrderItem");
                                //console.log(order);
                                this.on(order);
                            }.bind(this), 
                            ref: function(selector){
                                this.orders.set(index, selector);
                            }.bind(this)
                        });
                    }, this);
                }         
                break;
            case 1: //Phase.Retreat:
                {
                    const us = units.filter(x => x.status !== undefined);
                    elems = us.map(function(unit, index){
                        return React.createElement(OrderItem, { 
                            power: this.props.power, 
                            board: this.props.board, 
                            location: unit.locationName, 
                            key: unit.location.toString(), 
                            on: function(order){
                                this.on(order);
                            }.bind(this), 
                            ref: function(selector){
                                this.orders.set(index, selector);
                            }.bind(this) 
                        });
                    });
                }
                break;
            case  2: //Phase.Build:
                num = numberOfBuildableUnits(this.props.board).get(this.props.power) || 0;
                for (let i = 0; i < Math.abs(num); i++) {
                    elems.push(React.createElement(OrderItem, { 
                        power: this.props.power, 
                        board: this.props.board, 
                        location: null, 
                        key: i, 
                        on: function(order){this.on(order);}, 
                        ref: function(selector){this.orders.set(i, selector);} 
                    }));
                }
                break;
        }

        var capStr = "";
        if (this.props.board.state.season == 0)
            capStr = "Spring " + this.props.board.state.year;
        else
            capStr = "Fall " + this.props.board.state.year;

        return React.createElement("div", { className: "panel panel-default" },
                    React.createElement("div", { className: "panel-heading" }, capStr),
                    React.createElement("div", { className: "panel-body" }, elems),
                    React.createElement("div", { className: "panel-footer"},
                        React.createElement("div",{ 
                            className: "input-group-btn",
                            id:"game-manipulation-playing-mode"},
                            React.createElement("button",{
                                className: "btn btn-default",
                                id: "btn-submit-orders",
                                onClick: onSubmitOrders.bind(this)
                            },
                                "Submit orders"))));

    }
    
    setOrders(orders) {
        this.orders.forEach(function(item){
            if (item) {
                item.setOrders(orders);
            }
        });
    }

    get() {
        var orders = [];
        this.orders.forEach(function(value, key){
            orders.push(value.get());
        });
        return orders;
    }

    on(order) {
        if (this.props.on) {
            this.props.on(this.get());
        }
    }
}

function initPowerPanel(gameState)
{

    ReactDOM.render(React.createElement(TodoApp, null), document.getElementById('to-do-list'));
    var myUnits = Array.from(gameState.units).filter(function(unit){
        return unit.power == userPower;
    });
    ReactDOM.render(React.createElement(PowerPanel, {
        board: {
            state: {
                phase: 0, //gameState.phase,
                season: gameState.season,
                year: gameState.year
            },
            units: gameState.units,
        },
        power: userPower,
        units: myUnits
    }),
    document.getElementById('power-panel'));
}