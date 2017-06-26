import React, { Component } from 'react';
import { render } from 'react-dom';
import * as MessageActions from '../../app/constants/MessageActions';

class InjectApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      columns: this._createArray(12),
      maxWidth: '200vw',
      gutter: '10px',
    };
  }

  componentDidMount = () => {
    chrome.runtime.onMessage.addListener(this._handleChromeEvent);
  };

  componentWillUnmount = () => {
    chrome.runtime.onMessage.removeListener(this._handleChromeEvent);
  };

  _pxFallback = (value) => {
    const stringValue = `${parseInt(value, 10)}`;
    return (stringValue === value) ? `${value}px` : value;
  };

  _createArray = (count) => {
    const arrays = new Array(count);
    return new Array(...arrays);
  };

  _handleChromeEvent = ({ action, data }, sender, sendResponse) => {
    switch (action) {
      case MessageActions.INITIATE_GRID: {
        const initialData = Object.assign({}, data);
        initialData.columns = this._createArray(parseInt(data.columns, 10));
        this.setState(initialData);
        sendResponse({ success: true });
        break;
      }
      case MessageActions.SHOW_GRID: {
        this.setState({ isVisible: true });
        break;
      }
      case MessageActions.HIDE_GRID: {
        this.setState({ isVisible: false });
        break;
      }
      case MessageActions.UPDATE_COLUMNS: {
        this.setState({ columns: this._createArray(data) });
        break;
      }
      case MessageActions.UPDATE_GUTTER: {
        this.setState({ gutter: data });
        break;
      }
      case MessageActions.UPDATE_MAX_WIDTH: {
        this.setState({ maxWidth: data });
        break;
      }
      default: {
        console.warn('Unknown action:', action);
      }
    }
  };

  render() {
    const { maxWidth, gutter, columns, isVisible } = this.state;

    if (!isVisible) {
      return null;
    }

    const styleContainer = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      maxWidth: this._pxFallback(maxWidth),
      zIndex: 2147483647,
      margin: '0 auto',
    };
    const styleRow = {
      marginLeft: `-${this._pxFallback(gutter)}`,
      marginRight: `-${this._pxFallback(gutter)}`,
      height: '100%',
    };
    const styleGutter = {
      height: '100%',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      float: 'left',
      width: `${(100 / columns.length).toFixed(4)}%`,
      backgroundColor: 'rgba(0, 109, 115, 0.1)',
      paddingLeft: this._pxFallback(gutter),
      paddingRight: this._pxFallback(gutter),
    };
    const styleColumn = {
      height: '100%',
      pointerEvents: 'none',
      backgroundColor: 'rgba(107,186,195,0.4)',
    };
    return (
      <div style={styleContainer}>
        <div style={styleRow}>
          {this.state.columns.map((value, i) => (
            <div key={i} style={styleGutter}>
              <div style={styleColumn} />
            </div>
          ), this)}
        </div>
      </div>
    );
  }
}

window.addEventListener('load', () => {
  const injectDOM = document.createElement('div');
  document.body.appendChild(injectDOM);
  render(<InjectApp />, injectDOM);
});
