import { expect } from 'chai';
import * as types from '../../../app/constants/ActionTypes';
import * as actions from '../../../app/actions/grids';

describe('actions grid', () => {
  it('addTodo should create ADD_TODO action', () => {
    expect(actions.updateGrid('Use Redux')).to.eql({
      type: types.UPDATE_GRID,
      grid: 'Use Redux'
    });
  });
});
