import React from 'react'
import { connect } from 'react-redux'
import { Input, Button, Icon, Sidebar, Search, Segment, Label } from 'semantic-ui-react'
import PropTypes from 'prop-types'

class DirectionsPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    directions: PropTypes.object,
  }

  state = {
    origin: '',
    originCoords: null,
    destination: '',
    destCoords: null,
    visible: false,
    isMobile: window.innerWidth <= 768,
    mode: 'car',
    searchResults: [],
    isSearching: false,
  }

  transportModes = [
    { key: 'car', text: 'Car', icon: 'car' },
    { key: 'bicycle', text: 'Bicycle', icon: 'bicycle' },
    { key: 'walking', text: 'Walking', icon: 'walking' },
    { key: 'bus', text: 'Bus', icon: 'bus' },
  ]

  handleSearchChange = async (type, value) => {
    this.setState({ isSearching: true })
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
      )
      const data = await response.json()
      const results = data.map(item => ({
        title: item.display_name,
        description: `${item.type} in ${item.type}`,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
      }))
      
      this.setState({
        searchResults: results,
        isSearching: false
      })
    } catch (error) {
      console.error('Search error:', error)
      this.setState({ isSearching: false })
    }
  }

  handleResultSelect = (type, result) => {
    if (type === 'origin') {
      this.setState({
        origin: result.title,
        originCoords: result.coordinates
      })
    } else {
      this.setState({
        destination: result.title,
        destCoords: result.coordinates
      })
    }
  }

  handleRoute = () => {
    const { originCoords, destCoords, mode } = this.state
    if (!originCoords || !destCoords) return

    this.props.dispatch({
      type: 'GET_ROUTE',
      payload: {
        origin: originCoords,
        destination: destCoords,
        mode
      }
    })
  }

  setTransportMode = (mode) => {
    this.setState({ mode })
  }

  render() {
    const { visible, isMobile, mode, isSearching } = this.state
    const { directions } = this.props

    return (
      <>
        {/* Toggle Button */}
        <Button
          icon
          className="toggle-button"
          style={{
            position: 'fixed',
            top: 10,
            left: visible ? (isMobile ? '300px' : '400px') : 10,
            zIndex: 1001,
            transition: 'left 0.3s ease',
          }}
          onClick={this.toggleSidebar}
        >
          <Icon name={visible ? 'chevron left' : 'bars'} />
        </Button>

        <Sidebar
          as="div"
          animation="push"
          visible={visible}
          width={isMobile ? 'very wide' : 'wide'}
          style={{
            background: 'white',
            padding: '20px',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1000,
            width: isMobile ? '300px' : '400px',
          }}
        >
          <h2 style={{ margin: '0 0 20px 0' }}>
            <Icon name="map marker alternate" />
            noUlez App
          </h2>

          {/* Transport Mode Selection */}
          <div style={{ marginBottom: 20 }}>
            {this.transportModes.map(({ key, icon, text }) => (
              <Button
                key={key}
                icon
                active={mode === key}
                onClick={() => this.setTransportMode(key)}
                style={{ marginRight: 5 }}
              >
                <Icon name={icon} />
                {text}
              </Button>
            ))}
          </div>

          {/* Origin Search */}
          <div style={{ marginBottom: 15 }}>
            <Search
              fluid
              loading={isSearching}
              placeholder="Enter start location"
              onSearchChange={(e, { value }) => this.handleSearchChange('origin', value)}
              onResultSelect={(e, { result }) => this.handleResultSelect('origin', result)}
              results={this.state.searchResults}
            />
          </div>

          {/* Destination Search */}
          <div style={{ marginBottom: 15 }}>
            <Search
              fluid
              loading={isSearching}
              placeholder="Enter destination"
              onSearchChange={(e, { value }) => this.handleSearchChange('destination', value)}
              onResultSelect={(e, { result }) => this.handleResultSelect('destination', result)}
              results={this.state.searchResults}
            />
          </div>

          {/* Route Button */}
          <Button
            primary
            fluid
            onClick={this.handleRoute}
            disabled={!this.state.originCoords || !this.state.destCoords}
          >
            <Icon name="location arrow" />
            Get Directions
          </Button>

          {/* Route Details */}
          {directions && directions.route && (
            <Segment style={{ marginTop: 20 }}>
              <Label>
                <Icon name="clock" />
                Time: {Math.round(directions.duration / 60)} mins
              </Label>
              <Label>
                <Icon name="road" />
                Distance: {(directions.distance / 1000).toFixed(1)} km
              </Label>
            </Segment>
          )}
        </Sidebar>
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  directions: state.directions
})

export default connect(mapStateToProps)(DirectionsPanel)
