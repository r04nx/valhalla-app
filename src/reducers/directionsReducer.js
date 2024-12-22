const initialState = {
  route: null,
  waypoints: [],
  distance: 0,
  duration: 0,
  error: null
}

export default function directionsReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_ROUTE_SUCCESS':
      return {
        ...state,
        route: action.payload.route,
        waypoints: action.payload.waypoints,
        distance: action.payload.distance,
        duration: action.payload.duration,
        error: null
      }
    case 'GET_ROUTE_ERROR':
      return {
        ...state,
        error: action.payload,
        route: null
      }
    default:
      return state
  }
} 