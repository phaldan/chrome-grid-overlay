import * as types from '../constants/ActionTypes';

export default {};
export function updateGrid(grid) {
  return { type: types.UPDATE_GRID, grid };
}
