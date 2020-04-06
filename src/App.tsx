import React, { useEffect } from 'react';
import './App.less';
import Banner from './components/banner/Banner';
import { visitMetrikk } from './components/util/frontendlogger';
import Skjema from './components/skjema/Skjema';

function App() {
    useEffect(() => visitMetrikk(), []);
    return (
        <div className="app">
            <Banner />
            <Skjema />
        </div>
    );
}

export default App;
