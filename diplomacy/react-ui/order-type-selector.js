class OrderTypeSelector extends React.Component {
    constructor(props) {
        super(props);
        console.assert(props.candidates.length !== 0);
        this.state = { tpe: props.candidates[0] };
    }
    render() {
        const options = this.props.candidates.map(function(tpe){
            const [key, name] = this.stringify(tpe);
            return React.createElement("option", { 
                key: key, 
                value: key 
            }, name);
        }, this);

        return React.createElement("select", { 
            key: "orderType", 
            className: "select-picker", 
            disabled: this.props.candidates.length <= 1, 
            onChange: function(){
                if (this.props.on) {
                    this.props.on();
                }
            }.bind(this),
            ref: function(selector){
                this.selector = selector; 
            }.bind(this) 
        }, options);
    }
    
    get() {
        return this.props.candidates[this.selector.selectedIndex];
    }

    stringify(tpe) {
        switch (tpe) {
            case "H"://OrderType.Hold:
                return ["H", "Hold"];
            case "M"://OrderType.Move:
                return ["M", String.fromCharCode(0x2192)];
            case "S"://OrderType.Support:
                return ["S", "Support"];
            case "C"://OrderType.Convoy:
                return ["C", "Convoy"];
            case "R"://OrderType.Retreat:
                return ["R", String.fromCharCode(0x2192)];
            case "D"://OrderType.Disband:
                return ["D", "Disband"];
            case "B"://OrderType.Build:
                return ["B", "Build"];
        }
    }
}