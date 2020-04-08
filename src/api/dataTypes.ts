export interface NyDialogMeldingData {
    tekst: string;
    dialogId?: string | null;
    overskrift?: string;
}

export interface DialogMeldingData {
    tekst: string; // there is more, but we don't care about it for now
}

export interface DialogData {
    id: string;
    overskrift: string;
    henvendelser: DialogMeldingData[];
}

export interface SituasjonData {
    oprettet: string
    endretAv: string
    svarId: string
    svarTekst: string
}

export interface NySituasjonData {
    svarId: string
    svarTekst: string
}