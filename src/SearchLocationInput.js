import React, { PureComponent } from "react";

let autoComplete;

class SearchLocationInput extends PureComponent{
  constructor(props) {
    super(props)
    this.autoCompleteRef = React.createRef()
    this.state = {
      query: ''
    }
  }
  
  handleScriptLoad = () => {
    autoComplete = new window.google.maps.places.Autocomplete(
      this.autoCompleteRef.current
    );
    autoComplete.setFields(["address_components", "formatted_address", "geometry"]);
    autoComplete.addListener("place_changed", () =>
      this.handlePlaceSelect()
    );
  }
  
  handlePlaceSelect = () => {
    const addressObject = autoComplete.getPlace();
    const query = addressObject.formatted_address;
    this.setQuery(query)
    const lat = addressObject.geometry.location.lat()
    const lng = addressObject.geometry.location.lng()
    console.log(lat, lng)
    this.props.callback(lat, lng)
  }

  setQuery = (value) => {
    this.setState({ query: value })
  }

  componentDidMount() {
    this.props.onRef(this)
  }

  render() {
    return (
      <div className="search-location-input">
        <input className="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search"
          ref={this.autoCompleteRef}
          onChange={event => this.setQuery(event.target.value)}
          placeholder="Enter a location"
          value={this.state.query}          
        />
      </div>
    );
  }
}

export default SearchLocationInput;