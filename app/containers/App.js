import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MainSection from '../components/MainSection';
import * as GridActions from '../actions/grids';
import style from './App.css';

@connect(
  state => ({
    grids: state.grids
  }),
  dispatch => ({
    actions: bindActionCreators(GridActions, dispatch)
  })
)
export default class App extends Component {

  static propTypes = {
    grids: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  render() {
    const { grids, actions } = this.props;
    return (
      <div className={style.normal}>
        <header>
          <h1>Grid Overlay</h1>
        </header>
        <MainSection grids={grids} {...actions} />
        <footer />
      </div>
    );
  }
}
