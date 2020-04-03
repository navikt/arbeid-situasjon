import React from 'react';
import './App.less';
import Banner from './components/banner/Banner';
import { visitMetrikk } from './components/util/frontendlogger';

function App() {
    visitMetrikk();
    return (
        <div className="app">
            <Banner />
        </div>
    );
}

export default App;
