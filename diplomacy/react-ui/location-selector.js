class LocationSelector extends React.Component {
    render() {
        const targetOptions = this.props.candidates.map(function(l){
            if (l === null) {
                return React.createElement("option", { key: "null" });
            }
            else {
                return React.createElement("option", { key: l.toString() }, l.toString());
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
