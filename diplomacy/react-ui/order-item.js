

class OrderItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unit: null,
            orderType: null,
            orders: new Set(),
            movableLocations: null,
            supportableOrders: null,
            convoyableMoves: null,
        };
    }
    setStateElement(elem, value)
    {
        console.log("Set state." + elem + " = " + JSON.stringify(value));
        const state = this.state;
        state[elem] = value;
        this.setState(state);
    }

    getStateElement(elem)
    {
        if (this.state[elem] == null)
        {
            this.queryStateElement(elem, socket);  
        }
        return this.state[elem];
    }

    queryStateElement(elem, socket)
    {
        var inMsg = elem + '-of';
        var outMsg = 'get-' + elem + '-of';
        console.log("query " + outMsg + " " + JSON.stringify(this.state.unit));
        socket.off(inMsg);
        socket.on(inMsg, this.setStateElement.bind(this, elem));
        socket.emit(outMsg,{gameId: 0, unit: this.state.unit});
    }

    render() {
        console.log("OrderItem render()");
        //console.log(this);
        let locationCandidates = [];
        let orderTypeCandidates = [];
       
        switch (this.props.board.state.phase) {
            case 0:
                {
                    orderTypeCandidates = [
                        "H", //diplomacy.standardRule.Order.OrderType.Hold,
                        "M", //diplomacy.standardRule.Order.OrderType.Move,
                        "S", //diplomacy.standardRule.Order.OrderType.Support,                    
                    ];
                    if (this.props.unit.militaryBranch == 2)
                        orderTypeCandidates.push("C"); //diplomacy.standardRule.Order.OrderType.Convoy
                }
                break;
            case 1: //diplomacy.standardRule.Phase.Retreat:
                {
                    orderTypeCandidates = [
                        "D", //diplomacy.standardRule.Order.OrderType.Disband,
                        "R", //diplomacy.standardRule.Order.OrderType.Retreat
                    ];
                }
                break;
            case 2: //Phase.Build:
                {
                    const isBuildable = (Utils.numberOfBuildableUnits(this.props.board).get(this.props.power) || 0) > 0;
                    if (isBuildable) {
                        locationCandidates = Array.from(this.props.board.map.locations)
                            .filter((x) => {x.province.homeOf === this.props.power})
                            .filter((x) => {x.province.isSupplyCenter})
                            .filter(function(x){
                                const status = this.props.board.provinceStatuses.get(x.province);
                                return status && status.occupied === this.props.power;
                            });
                        locationCandidates.unshift(null);
                        orderTypeCandidates = [
                            "B", //diplomacy.standardRule.Order.OrderType.Build
                        ];
                    }
                    else {
                        locationCandidates = Array.from(this.props.board.units).filter(x => x.power === this.props.power)
                            .map(x => x.location);
                        locationCandidates.unshift(null);
                        orderTypeCandidates = [
                            "D" //diplomacy.standardRule.Order.OrderType.Disband
                        ];
                    }
                }
                break;
        }
        let destination = [];
        switch (this.state.orderType) {
            case "H": //OrderType.Hold:
            case "D": //OrderType.Disband:
                break;
            case "M": //OrderType.Move:
                {
                   
                    if (this.state.unit) {

                        var locations = this.getStateElement("movableLocations");
                        if (locations != null)
                        {
                            const candidates = Array.from(locations);
                            candidates.unshift(null);
                            destination = [
                                React.createElement(LocationSelector, {
                                    key: "location", 
                                    candidates: candidates, 
                                    on: function(){
                                        console.log("On callback of LocationSelector");
                                        this.on();
                                    }.bind(this), 
                                    ref: function(selector){ 
                                        this.destinationLocationSelector = selector; 
                                    }.bind(this)
                                })];
                            
                        }
                    }
                }
                break;
            case "S": //OrderType.Support:
                {
                    if (this.state.unit) {
                        var orders = this.getStateElement("supportableOrders");
                        if (orders != null)
                        {
                            const candidates = Array.from(orders); 
                            candidates.unshift(null);
                            destination = [
                                React.createElement(OrderSelector, { 
                                    key: "order", candidates: candidates, 
                                    on: function(){
                                        this.on();
                                    }.bind(this), 
                                    ref: function(selector){ 
                                        this.orderSelector = selector; 
                                    }.bind(this)
                                })
                            ];
                        }
                        
                    
                    }
                }
                break;
            case "C": //OrderType.Convoy:
                {
                    if (this.state.unit) {
                        var moves = this.getStateElement("convoyableMoves");
                        if (moves != null)
                        {
                            const candidates = Array.from(moves);
                            candidates.unshift(null);
                            destination = [
                                React.createElement(OrderSelector, { 
                                    key: "order", candidates: candidates, 
                                    on: function () {
                                        this.on();
                                    }.bind(this), 
                                    ref: function(selector) { 
                                        this.orderSelector = selector; 
                                    }.bind(this)
                                })];
                        }
                    }
                }
                break;
            case "R": //OrderType.Retreat:
                {
                    if (this.state.location) {
                        const u = $$.U(this.state.location).unit;
                        const status = this.props.board.unitStatuses.get(u);
                        if (status) {
                            const candidates = Array.from(Utils.locationsToRetreat(this.props.board, u, status.attackedFrom));
                            candidates.unshift(null);
                            destination = [
                                React.createElement(LocationSelector, { 
                                    key: "location", 
                                    candidates: candidates, 
                                    on: function(){this.on();}, 
                                    ref: function(selector){ this.destinationLocationSelector = selector; } 
                                })
                            ];
                        }
                    }
                }
                break;
            case "B": //OrderType.Build:
                if (this.state.location) {
                    const militaryBranches = Array.from(this.state.location.militaryBranches);
                    militaryBranches.unshift(null);
                    destination = [
                        React.createElement(MilitaryBranchSelector, {
                            key: "militaryBranch", candidates: militaryBranches, 
                            on: function(){this.on();}, 
                            ref: function(selector) { this.militaryBranchSelector = selector; } 
                        })
                    ];
                }
                break;
        }

        return React.createElement("li", { className: "list-group-item" },
           React.createElement(UnitSelector, { 
               unit: this.props.unit,
               ref: function(unitSelector){ 
                   this.unitSelector = unitSelector;
               }.bind(this)
           }),
           React.createElement(OrderTypeSelector, { 
               candidates: orderTypeCandidates, 
               on: function(){
                   this.on();
               }.bind(this), 
               ref: function(orderType){ 
                   this.orderTypeSelector = orderType; 
               }.bind(this) 
           }),
           destination);
        
    }
    
    setOrders(orders) {
        console.log("setOrder");
        this.setState({
            unit: this.unitSelector.get(),
            orderType: this.orderTypeSelector.get(),
            orders: orders
        });
    }
    get() {
        const u = this.unitSelector.get();
        const t = this.orderTypeSelector.get();
        console.log(u);
        console.log(t);
        var order = {
            unit: u,
            action: t
        };
        console.log(this);
        switch (t) {
            case "H": //OrderType.Hold:
            case "D"://OrderType.Disband:
                if (u) {
                    return order;
                }
                break;
            case "M": //OrderType.Move:
            case "R": //OrderType.Retreat:
                if (this.destinationLocationSelector) {
                    const l = this.destinationLocationSelector.get();
                    if (u && l) {
                        order.destination = l;
                        return order;
                    }
                }
                break;
            case "S": //OrderType.Support:
            case "C"://OrderType.Convoy:
                if (this.orderSelector) {
                    const o = this.orderSelector.get();
                    if (u && o) {
                        order.destination = o;
                        return order;
                    }
                }
                break; 
            case "B": //OrderType.Build:
                if (this.militaryBranchSelector) {
                    const m = this.militaryBranchSelector.get();
                    if (u && m) {
                        order.destination = m;
                        return order;
                    }
                }
                break;
        }
        return null;
    }

    on() {
        this.setState({
            unit: this.unitSelector.get(),
            orderType: this.orderTypeSelector.get(),
            orders: this.state.orders
        });
        if (this.props.on) {
            this.props.on(this.get());
        }
    }
}
