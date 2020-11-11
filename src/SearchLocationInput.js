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
    // this.loadScript(
    //   `https://maps.googleapis.com/maps/api/js?key=AIzaSyBgo82RLpZphiLZPf6dma2F82UQWQinzVc&libraries=places`
    // )
    this.props.onRef(this)
  }

  render() {
    return (
      <div className="search-location-input">
        <input
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