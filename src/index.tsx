import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

if (process.env.REACT_APP_MOCK === 'true') {
    require('./mock');
}

ReactDOM.render(<App />, document.getElementById('root'));
