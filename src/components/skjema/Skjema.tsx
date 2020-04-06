import React, {useState} from 'react';
import {Undertittel} from 'nav-frontend-typografi';
import {RadioPanelGruppe} from 'nav-frontend-skjema';
import {Hovedknapp} from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import {avbrytMetrikk} from "../util/frontendlogger";

export type Situasjon = 'PERMITTERT' | 'SKAL_I_JOBB' | 'MISTET_JOBB';

const PERMITTERT: Situasjon = 'PERMITTERT';
const SKAL_I_JOBB: Situasjon = 'SKAL_I_JOBB';
const MISTET_JOBB: Situasjon = 'MISTET_JOBB';

function situasjonTilTekst(situasjon: Situasjon): string {
    switch (situasjon) {
        case 'PERMITTERT':
            return 'Er permittert eller kommer til å bli permittert';
        case 'SKAL_I_JOBB':
            return 'Har fått beskjed fra arbeidsgiver når jeg kan komme tilbake i jobben';
        case 'MISTET_JOBB':
            return 'Har mistet jobben';
    }
}

const SPORSMAL = 'Hva er din situasjon nå?';

export default function Skjema() {

    // TODO bytt ut med post
    const [submitted, setSubmitted] = useState(false);
    // TODO
    const loading = false;

    function submit(value: string) {
        console.log('submitted ' + value);
        setSubmitted(true);
    }

    if (!submitted) {
        return <Sporsmal loading={loading} onSubmit={submit}/>
    } else {
        return <Bekreftelse />
    }
}

interface SporsmalProps {
    loading: boolean;
    onSubmit: (arg: string) => void;
}

function Sporsmal(props: SporsmalProps) {
    const [feilState, setFeil] = useState(false);
    const feil = feilState ? 'Velg ett alternativ' : undefined;
    const [value, setValue] = useState<string | undefined>(undefined);

    return(<div>
        <Undertittel>
            {SPORSMAL}
        </Undertittel>

        <RadioPanelGruppe
            className="spm-row"
            legend=""
            name=""
            radios={[
                {label: situasjonTilTekst(PERMITTERT), value: PERMITTERT},
                {label: situasjonTilTekst(SKAL_I_JOBB), value: SKAL_I_JOBB},
                {label: situasjonTilTekst(MISTET_JOBB), value: MISTET_JOBB},
            ]}
            checked={value}
            onChange={(_, val) => setValue(val)}
            feil={feil}
        />
        <Hovedknapp
            className="send-knapp"
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
        <Lenke href={`${process.env.PUBLIC_URL}/veientilarbeid`} onClick={() => avbrytMetrikk()}>
            Avbryt
        </Lenke>
    </div>);
}

function Bekreftelse() {

    return (<div>
        <Undertittel>
            Takk for tilbakemelding
        </Undertittel>
    </div>);
}
