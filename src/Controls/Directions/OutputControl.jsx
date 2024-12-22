import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Segment, Button } from 'semantic-ui-react'

import { makeRequest } from 'actions/directionsActions'
import Summary from './Summary'
import Maneuvers from './Maneuvers'
import { VALHALLA_OSM_URL } from 'utils/valhalla'

class OutputControl extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    profile: PropTypes.string,
    activeTab: PropTypes.number,
    successful: PropTypes.bool,
    results: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const { results } = this.props
    const { data } = results[VALHALLA_OSM_URL]

    let alternates = []

    if (data.alternates) {
      alternates = data.alternates.map((_, i) => i)
    }

    this.state = {
      showResults: {
        '-1': false,
        ...alternates.reduce((acc, v) => ({ ...acc, [v]: false }), {}),
      },
    }
    this.showManeuvers = this.showManeuvers.bind(this)
  }

  // necessary to calculate new routes the tab was changed from isochrone tab
  // need to do this every time, because "profile" is global (otherwise we would
  // calculate new when the profile was changed while being on the iso tab)
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (nextProps.activeTab === 0 && this.props.activeTab === 1) {
      nextProps.dispatch(makeRequest())
    }
    return true
  }

  showManeuvers(idx) {
    this.setState({
      showResults: {
        ...this.state.showResults,
        [idx]: !this.state.showResults[idx],
      },
    })
  }

  render() {
    const { results, successful } = this.props

    const data = results[VALHALLA_OSM_URL].data

    let alternates = []
    if (data.alternates) {
      alternates = data.alternates.map((alternate, i) => {
        const legs = alternate.trip.legs
        return (
          <Segment
            key={`alternate_${i}`}
            style={{
              margin: '0 1rem 10px',
              display: successful ? 'block' : 'none',
            }}
          >
            <div className={'flex-column'}>
              <Summary
                header={`Alternate ${i + 1}`}
                idx={i}
                summary={alternate.trip.summary}
              />
              <div className={'flex justify-between'}>
                <Button
                  size="mini"
                  toggle
                  active={this.state.showResults[i]}
                  onClick={() => this.showManeuvers(i)}
                >
                  {this.state.showResults[i]
                    ? 'Hide Maneuvers'
                    : 'Show Maneuvers'}
                </Button>
              </div>

              {this.state.showResults[i] ? (
                <div className={'flex-column'}>
                  <Maneuvers legs={legs} idx={i} />
                </div>
              ) : null}
            </div>
          </Segment>
        )
      })
    }
    if (!data.trip) {
      return ''
    }
    return (
      <>
        <Segment
          style={{
            margin: '0 1rem 10px',
            display: successful ? 'block' : 'none',
          }}
        >
          <div className={'flex-column'}>
            <Summary
              header={'Directions'}
              summary={data.trip.summary}
              idx={-1}
            />
            <div className={'flex justify-between'}>
              <Button
                size="mini"
                toggle
                active={this.state.showResults[-1]}
                onClick={() => this.showManeuvers(-1)}
              >
                {this.state.showResults[-1]
                  ? 'Hide Maneuvers'
                  : 'Show Maneuvers'}
              </Button>
            </div>

            {this.state.showResults[-1] ? (
              <div className={'flex-column'}>
                <Maneuvers
                  legs={data.trip ? data.trip.legs : undefined}
                  idx={-1}
                />
              </div>
            ) : null}
          </div>
        </Segment>
        {alternates.length ? alternates : ''}
      </>
    )
  }
}

const mapStateToProps = (state) => {
  const { profile, activeTab } = state.common
  const { successful, results } = state.directions
  return {
    profile,
    activeTab,
    successful,
    results,
  }
}

export default connect(mapStateToProps)(OutputControl)
