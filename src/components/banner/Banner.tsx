import * as React from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import styles from './Banner.module.less';

function Banner() {
    return (
        <div className={styles.banner}>
            <Systemtittel tag="h1">Endring av min situasjon</Systemtittel>
        </div>
    );
}

export default Banner;
