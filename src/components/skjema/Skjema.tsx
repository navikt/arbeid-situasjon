import React, {useEffect, useState} from 'react';
import {EtikettLiten, Normaltekst, Element, Undertittel} from 'nav-frontend-typografi';
import {RadioPanelGruppe} from 'nav-frontend-skjema';
import {Hovedknapp} from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import {AlertStripeSuksess} from "nav-frontend-alertstriper";
import NavFrontendSpinner from "nav-frontend-spinner";
import queryString from "query-string"
import {avbrytMetrikk, ferdigMetrikk, naMetrikk, svarMetrikk} from "../util/frontendlogger";
import styles from '../../App.module.less'
import {getSituasjon, postDialog, postSituasjon} from "../../api/api";
import {firstValueOfArrayOrValue} from "../util/utils";
import AlleredeSvart from "../alerts/AlleredeSvart";

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
    navarendeSituasjon?: string
}


//TODO: redo state management if more questions
export default function Skjema() {

    const [data, setData] = useState<SkjemaData>({});
    const [laster, setLaster] = useState(true);
    const [loading, setLoading] = useState(false);
    const initalPageId = firstValueOfArrayOrValue(queryString.parse(window.location.search)["pageId"]) ?? 0;
    const [pageId, setPageId] = useState(initalPageId);

    const dialogId = firstValueOfArrayOrValue(queryString.parse(window.location.search)["dialogId"]);

    useEffect(() => {
        const func = (event: any) => {
            setPageId(event.state.pageId)
        };

        window.addEventListener('popstate', func);
        return () => window.removeEventListener('popstate', func);
    },[setLaster, setPageId]);


    useEffect(() => {
            setLaster(true);
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

        const dialogPromise = postDialog({dialogId: dialogId, tekst: tekst, overskrift: 'Endring av situasjon'});
        const situasjonPromise = postSituasjon({svarId: value, svarTekst: situasjonTilTekst(value)});
        Promise.all([dialogPromise, situasjonPromise])
            .then(res => res[0])
            .then(dialogData => {
                setData(prev => {
                    return {...prev, navarendeSituasjon: value, dialogId: dialogData.id}
                });
                window.history.replaceState({pageId: 0}, 'Endring av min situasjon', `?dialogId=${dialogData.id}`);
                window.history.pushState({pageId: 1}, 'Endring av min situasjon', `?dialogId=${dialogData.id}&pageId=1`);
                setLoading(false);
                setPageId(1);
            });

        svarMetrikk(value);
    }

    if (laster) {
        return <NavFrontendSpinner type="XL"/>
    }

    if (pageId === 0) {
        return <Sporsmal tidligereSituasjon={data.tidligereSituasjon}
                         loading={loading}
                         dialogId={dialogId}
                         onSubmit={submit}/>
    } else {
        const situasjon = data.navarendeSituasjon ?? data.tidligereSituasjon ?? PERMITTERT;
        const finalDialogId = data.dialogId ?? dialogId;
        return <Bekreftelse dialogId={finalDialogId!} navarendeSituasjon={situasjon}/>
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
    dialogId?: string | null;
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
            <AlleredeSvart visible={!!props.dialogId} className={styles.row}/>
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
                href={`${process.env.PUBLIC_URL}/ditt-nav`} onClick={() => avbrytMetrikk()}>
                Avbryt
            </Lenke>
        </>
    );
}

function Bekreftelse(props: { dialogId: string, navarendeSituasjon: string }) {
    const href = `${process.env.PUBLIC_URL}/dialog/${props.dialogId}`;

    return (<>
        <BekreftelseManager href={href} navarendeSituasjon={props.navarendeSituasjon}/>
        <a className={"knapp knapp--flat " + styles.avbrytKnapp} href={`${process.env.PUBLIC_URL}/ditt-nav`}
           onClick={() => ferdigMetrikk()}>
            Ferdig
        </a>
    </>);
}

function BekreftelseManager(props: { navarendeSituasjon: string, href: string }){
    switch (props.navarendeSituasjon) {
        case 'PERMITTERT':
            return <BekreftelsePermittert href={props.href}/>;
        case 'SKAL_I_JOBB':
            return <BekreftelseTilbakeIJobb href={props.href}/>;
        case 'MISTET_JOBB':
            return <BekreftelseMistetJobb href={props.href}/>;
        default:
            return null;
    }
}

function BekreftelseMistetJobb(props: { href: string }) {
    return (<>
        <Undertittel className={styles.row}>
            Takk for oppdatert informasjon
        </Undertittel>
        <div className={styles.rowExtraMargin}>
            <AlertStripeSuksess>
                <Normaltekst>
                    Svaret er&nbsp;
                    <a href={props.href}>delt med veilederen din.</a>&nbsp;
                    som vil ta tak i ditt svar
                </Normaltekst>
            </AlertStripeSuksess>
        </div>
        <Undertittel className={styles.w100}>
            Dette anbefaler vi deg å gjøre nå
        </Undertittel>
        <ul>
            <li><Normaltekst>Sende ny dagpenge søknad</Normaltekst></li>
            <li><Normaltekst>Sjekk om du har oppdatert CV og jobbprofil på <a href="https://arbeidsplassen.nav.no/">arbeidsplassen.no</a></Normaltekst></li>
            <li><Normaltekst>Send meldekort hver 14. dag</Normaltekst></li>
        </ul>

    </>);
}

function BekreftelseTilbakeIJobb(props: { href: string }) {
    return (<>
        <Undertittel className={styles.row}>
            Gratulerer og takk for oppdatert informasjon
        </Undertittel>
        <div className={styles.rowExtraMargin}>
            <AlertStripeSuksess>
                <Normaltekst>
                    Svaret er&nbsp;
                    <a href={props.href}>delt med veilederen din.</a>&nbsp;
                </Normaltekst>
            </AlertStripeSuksess>
        </div>
        <Undertittel className={styles.row}>
            Dette anbefaler vi deg å gjøre nå
        </Undertittel>

        <Normaltekst>
            I løpet av de 2 neste ukene er det fint om du sender et siste
            meldekort slik at det viser der at du er tilbake i jobb
        </Normaltekst>
    </>);
}

function BekreftelsePermittert(props: { href: string }) {
    return (<>
        <Undertittel className={styles.row}>
            Takk for oppdatert informasjon
        </Undertittel>
        <div className={styles.rowExtraMargin}>
            <AlertStripeSuksess>
                <Normaltekst>
                    Svaret er&nbsp;
                    <a href={props.href}>delt med veilederen din.</a>&nbsp;
                    som vil ta tak i ditt svar
                </Normaltekst>
            </AlertStripeSuksess>
        </div>
        <Undertittel className={styles.row}>
            Dette anbefaler vi deg å gjøre nå
        </Undertittel>
        <Normaltekst className={styles.row}>
            Sjekk "dine saker" for å se om du har riktig pengestøtte
        </Normaltekst>
        <Normaltekst className={styles.row}>
            Hvis du har pengestøtte, fortsett å sende meldekort
        </Normaltekst>
    </>);
}