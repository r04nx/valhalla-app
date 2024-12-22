import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { toast } from 'react-toastify'
import DirectionsControl from './Directions'
import DirectionOutputControl from './Directions/OutputControl'
import { Segment, Button, Icon, Tab } from 'semantic-ui-react'
import {
  updateProfile,
  updatePermalink,
  zoomTo,
  resetSettings,
  toggleDirections,
} from 'actions/commonActions'
import { fetchReverseGeocodePerma } from 'actions/directionsActions'

const pairwise = (arr, func) => {
  let cnt = 0
  for (let i = 0; i < arr.length - 1; i += 2) {
    func(arr[i], arr[i + 1], cnt)
    cnt += 1
  }
}

class MainControl extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    message: PropTypes.object,
    activeDataset: PropTypes.string,
    showDirectionsPanel: PropTypes.bool,
  }

  componentDidMount = () => {
    const { dispatch } = this.props

    toast.success('Welcome to noUlez! Routing Service by Alesa.ai', {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

    const params = Object.fromEntries(new URL(document.location).searchParams)

    if ('profile' in params) {
      dispatch(updateProfile({ profile: params.profile }))
    }

    if ('wps' in params && params.wps.length > 0) {
      const coordinates = params.wps.split(',').map(Number)
      const processedCoords = []
      pairwise(coordinates, (current, next, i) => {
        const latLng = { lat: next, lng: current }
        const payload = {
          latLng,
          fromPerma: true,
          permaLast: i === coordinates.length / 2 - 1,
          index: i,
        }
        processedCoords.push([latLng.lat, latLng.lng])
        dispatch(fetchReverseGeocodePerma(payload))
      })
      dispatch(zoomTo(processedCoords))
      dispatch(resetSettings())
    }
  }

  componentDidUpdate = (prevProps) => {
    const { message } = this.props
    if (message.receivedAt > prevProps.message.receivedAt) {
      toast[message.type](message.description, {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    }
  }

  handleTabChange = (event, data) => {
    const { dispatch } = this.props
    const activeTab = data.activeIndex

    dispatch({ type: 'UPDATE_TAB', activeTab })
    dispatch(updatePermalink())
  }

  handleDirectionsToggle = (event, data) => {
    const { dispatch } = this.props
    const { showDirectionsPanel } = this.props
    if (!showDirectionsPanel) {
      document
        .getElementsByClassName('heightgraph-container')[0]
        .setAttribute('width', window.innerWidth * 0.75)
    } else {
      document
        .getElementsByClassName('heightgraph-container')[0]
        .setAttribute('width', window.innerWidth * 0.9)
    }
    dispatch(toggleDirections())
  }

  render() {
    const appPanes = [
      {
        menuItem: 'Directions',
        render: () => (
          <Tab.Pane style={{ padding: '0 0 0 0' }} attached={false}>
            <DirectionsControl />
          </Tab.Pane>
        ),
      },
    ]

    const ServiceTabs = () => (
      <>
        <Button
          icon
          style={{ float: 'right', marginLeft: '5px' }}
          onClick={this.handleDirectionsToggle}
          color="red"
        >
          <Icon name="close" />
        </Button>
        <Tab activeIndex={0} menu={{ pointing: true }} panes={appPanes} />
      </>
    )
    return (
      <>
        <Button
          style={{
            zIndex: 998,
            top: '10px',
            left: '10px',
            position: 'absolute',
            backgroundColor: '#4CAF50',
            color: 'white',
          }}
          onClick={this.handleDirectionsToggle}
        >
          <Icon name="map" style={{ marginRight: '8px' }} />
          Directions
        </Button>
        <Drawer
          enableOverlay={false}
          open={this.props.showDirectionsPanel}
          direction="left"
          size="400"
          style={{
            zIndex: 1000,
            overflow: 'auto',
          }}
        >
          <div
            className="directions-header-brand"
            style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src="/noulez-logo.png"
              alt="NoUlez Logo"
              className="noulez-logo"
              style={{
                width: '40px',
                height: '40px',
                marginRight: '12px',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
              }}
            />
            <h1
              style={{
                color: 'white',
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              NoUlez
            </h1>
          </div>
          <div>
            <Segment basic style={{ paddingBottom: 0 }}>
              <div>
                <ServiceTabs />
              </div>
            </Segment>
            <DirectionOutputControl />
          </div>
        </Drawer>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  const { message, activeTab, showDirectionsPanel } = state.common
  return {
    message,
    activeTab,
    showDirectionsPanel,
  }
}

export default connect(mapStateToProps)(MainControl)
