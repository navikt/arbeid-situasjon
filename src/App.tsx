import React, { useEffect } from 'react';
import Banner from './components/banner/Banner';
import Skjema from './components/skjema/Skjema';
import { visitMetrikk } from './components/util/frontendlogger';
import styles from './App.module.less';

function App() {
    useEffect(() => visitMetrikk(), []);
    return (
        <div className={styles.app}>
            <Banner />
            <div className={styles.container}>
                <Skjema />
            </div>
        </div>
    );
}

export default App;
