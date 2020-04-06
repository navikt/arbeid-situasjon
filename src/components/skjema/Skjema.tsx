import React, {useEffect, useState} from 'react';
import {EtikettLiten, Normaltekst, Element, Undertittel} from 'nav-frontend-typografi';
import {RadioPanelGruppe} from 'nav-frontend-skjema';
import {Hovedknapp} from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import {avbrytMetrikk, ferdigMetrikk, naMetrikk, svarMetrikk} from "../util/frontendlogger";
import styles from '../../App.module.less'
import {AlertStripeSuksess} from "nav-frontend-alertstriper";
import {getSituasjon, postDialog, postSituasjon} from "../../api/api";
import NavFrontendSpinner from "nav-frontend-spinner";

export type Situasjon = 'PERMITTERT' | 'SKAL_I_JOBB' | 'MISTET_JOBB';

const PERMITTERT: Situasjon = 'PERMITTERT';
const SKAL_I_JOBB: Situasjon = 'SKAL_I_JOBB';
const MISTET_JOBB: Situasjon = 'MISTET_JOBB';

function situasjonTilTekst(situasjon: string): string {
    switch (situasjon) {
        case 'PERMITTERT':
            return 'Er permittert eller kommer til å bli permittert';
        case 'SKAL_I_JOBB':
            return 'Har fått beskjed fra arbeidsgiver når jeg kan komme tilbake i jobben';
        case 'MISTET_JOBB':
            return 'Har mistet jobben';
        default:
            return "Ugyldig svar";
    }
}

const SPORSMAL = 'Hva er din situasjon nå?';

interface SkjemaData {
    dialogId?: string;
    tidligereSituasjon?: string
}

export default function Skjema() {

    const [data, setData] = useState<SkjemaData>({});
    const [submitted, setSubmitted] = useState(false);
    const [laster, setLaster] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSituasjon().then(situasjon => {
                setData(prev => {
                    return {...prev, tidligereSituasjon: situasjon?.svarId}
                });
                setLaster(false);
            }
        )
    }, [setData, setLaster]);

    function submit(value: string) {
        const tekst = `Spørsmål fra NAV: ${SPORSMAL}\n Svaret mitt: ${situasjonTilTekst(value)}`;
        setLoading(true);

        const dialogPromise = postDialog({tekst: tekst, overskrift: 'Endring av situasjon'})
        const situasjonPromise = postSituasjon({svarId: value, svarTekst: situasjonTilTekst(value)});
        Promise.all([dialogPromise, situasjonPromise])
            .then(res => res[0])
            .then(dialogData => {
                setData(prev => {
                    return {...prev, dialogId: dialogData.id}
                });
                setSubmitted(true);
            });

        svarMetrikk(value);
    }

    if (laster) {
        return <NavFrontendSpinner type="XL"/>
    }

    if (!submitted) {
        return <Sporsmal tidligereSituasjon={data.tidligereSituasjon}
                         loading={loading}
                         onSubmit={submit}/>
    } else {
        return <Bekreftelse dialogId={data.dialogId!}/>
    }
}

function getRadioOptions(tidligereSituasjon: string) {
    const radios = [
        {label: situasjonTilTekst(PERMITTERT), value: PERMITTERT},
        {label: situasjonTilTekst(SKAL_I_JOBB), value: SKAL_I_JOBB},
        {label: situasjonTilTekst(MISTET_JOBB), value: MISTET_JOBB},
    ];

    return radios.filter(r => r.value !== tidligereSituasjon);
}

interface SporsmalProps {
    tidligereSituasjon?: string;
    loading: boolean;
    onSubmit: (arg: string) => void;
}

function Sporsmal(props: SporsmalProps) {
    const [feilState, setFeil] = useState(false);
    const feil = feilState ? 'Velg ett alternativ' : undefined;
    const [value, setValue] = useState<string | undefined>(undefined);

    const tidligereSituasjon = !!props.tidligereSituasjon ? props.tidligereSituasjon : PERMITTERT;

    useEffect(() => {
        naMetrikk(tidligereSituasjon);
    }, [tidligereSituasjon]);

    return (
        <>
            <div className={styles.row}>
                <EtikettLiten>
                    Din situasjon
                </EtikettLiten>
                <Element>
                    {situasjonTilTekst(tidligereSituasjon)}
                </Element>
            </div>

            <Undertittel className={styles.row}>
                {SPORSMAL}
            </Undertittel>
            <RadioPanelGruppe
                className={styles.row}
                legend=""
                name=""
                radios={getRadioOptions(tidligereSituasjon)}
                checked={value}
                onChange={(_, val) => setValue(val)}
                feil={feil}
            />
            <Hovedknapp
                className={styles.sendKnapp}
                spinner={props.loading}
                disabled={props.loading}
                onClick={() => {
                    if (value === undefined) {
                        setFeil(true);
                    } else {
                        setFeil(false);
                        props.onSubmit(value);
                    }
                }}
            >
                Send
            </Hovedknapp>
            <Lenke
                className={styles.avbrytKnapp}
                href={`${process.env.PUBLIC_URL}/veientilarbeid`} onClick={() => avbrytMetrikk()}>
                Avbryt
            </Lenke>
        </>
    );
}

function Bekreftelse(props: { dialogId: string }) {
    const href = `${process.env.PUBLIC_URL}/dialog/${props.dialogId}`;

    return (<>
        <Undertittel className={styles.row}>
            Takk for tilbakemelding
        </Undertittel>
        <div className={styles.row}>
            <AlertStripeSuksess>
                <Normaltekst>
                    Svarene er&nbsp;
                    <a href={`${href}`}>delt med veilederen din.</a>&nbsp;
                </Normaltekst>
                <Normaltekst>
                    Veilederen vil kontakte deg i løpet av noen dager.
                </Normaltekst>

            </AlertStripeSuksess>
        </div>
        <a className={styles.avbrytKnapp} href={`${process.env.PUBLIC_URL}/veientilarbeid`}
           onClick={() => ferdigMetrikk()}>
            Ferdig
        </a>
    </>);
}
