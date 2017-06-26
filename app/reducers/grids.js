import * as ActionTypes from '../constants/ActionTypes';

const initialState = [];

const actionsMap = {
  [ActionTypes.UPDATE_GRID](state, action) {
    if (state.find(grid => grid.host === action.grid.host)) {
      return state.map(grid =>
        (grid.host === action.grid.host ? Object.assign({}, grid, action.grid) : grid)
      );
    }
    return [action.grid, ...state];
  }
};

export default function (state = initialState, action) {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
}
