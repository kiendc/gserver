class OrderSelector extends React.Component {
    render() {
        console.log("Order Selector render()");
        console.log(this);
        const targetOptions = this.props.candidates.map(function (o){
            if (o === null) {
                return React.createElement("option", { key: "null" });
            }
            else {
                return React.createElement("option", { key: stringifyOrder(o) }, interpretOrder(o));
            }
        });

        return React.createElement("select", { 
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
        },
        targetOptions);
    }
    get() {
        return this.props.candidates[this.selector.selectedIndex];
    }

}
