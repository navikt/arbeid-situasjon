import React from 'react';
import './App.less';
import Banner from './components/banner/Banner';
import { visitMetrikk } from './components/util/frontendlogger';
import Skjema from "./components/skjema/Skjema";

function App() {
    visitMetrikk();
    return (
        <div className="app">
            <Banner />
            <Skjema />
        </div>
    );
}

export default App;
