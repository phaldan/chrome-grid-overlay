import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChromePromise from 'chrome-promise';
import * as MessageActions from '../constants/MessageActions';

const chromep = new ChromePromise();

export default class MainSection extends Component {

  static propTypes = {
    grids: PropTypes.array.isRequired,
    updateGrid: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      columns: 12,
      maxWidth: '200vw',
      gutter: '10px',
    };
    this.getActiveTab().then((tab) => {
      const url = new URL(tab.url);
      this.loadStoredConfiguration(url.host);
      this.setState({ host: url.host });
    });
  }

  getActiveTab = () => chromep.tabs.query({ active: true }).then(tabs => tabs.shift());

  setStoredConfiguration = (data) => {
    const grid = this.state;
    this.props.updateGrid(Object.assign(grid, data));
  };

  getStoredConfiguration = host => this.props.grids.find(grid => grid.host === host);

  toggleGrid = () => {
    const { isVisible } = this.state;
    this.sendMessage(isVisible ? MessageActions.HIDE_GRID : MessageActions.SHOW_GRID);
    this.updateGrid({ isVisible: !isVisible });
  };

  loadStoredConfiguration = (host) => {
    const storedConfiguration = this.getStoredConfiguration(host);
    if (storedConfiguration) {
      this.setState(storedConfiguration);
    }
  };

  updateGrid = (state) => {
    this.setState(state);
    this.setStoredConfiguration(state);
  };

  updateColumnCount = async(event) => {
    const value = event.target.value;
    const columns = Math.max(parseInt(value, 10) || 0, 1);
    this.sendMessage(MessageActions.UPDATE_COLUMNS, columns);
    this.updateGrid({ columns });
  };

  updateMaxWidth = async(event) => {
    const value = event.target.value;
    this.sendMessage(MessageActions.UPDATE_MAX_WIDTH, value);
    this.updateGrid({ maxWidth: value });
  };

  updateGutter = async(event) => {
    const value = event.target.value;
    this.sendMessage(MessageActions.UPDATE_GUTTER, value);
    this.updateGrid({ gutter: value });
  };

  sendMessage = async(action, data = null) => {
    const tab = await this.getActiveTab();
    chrome.tabs.sendMessage(tab.id, { action, data });
  };

  render() {
    const grid = this.state;
    const text = grid.isVisible ? 'Hide' : 'Show';
    return (
      <section>
        <div>
          <label htmlFor="column_count">Columns: </label>
          <input type="text" name="column_count" value={grid.columns} onChange={this.updateColumnCount} />
        </div>
        <div>
          <label htmlFor="max_width">Max. Width:</label>
          <input type="text" name="max_width" value={grid.maxWidth} onChange={this.updateMaxWidth} />
        </div>
        <div>
          <label htmlFor="gutter_width">Gutter:</label>
          <input type="text" name="gutter_width" value={grid.gutter} onChange={this.updateGutter} />
        </div>
        <button onClick={this.toggleGrid}>{text}</button>
      </section>
    );
  }
}
