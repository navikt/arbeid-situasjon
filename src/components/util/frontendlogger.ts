export interface Frontendlogger {
    event: (name: string, fields: object, tags: object) => void;
}

export function frontendLogger(eventNavn: string, feltObjekt?: object, tagObjekt?: object) {
    const frontendlogger: Frontendlogger = (window as any).frontendlogger; // tslint:disable-line
    if (frontendlogger) {
        frontendlogger.event(eventNavn, feltObjekt || {}, tagObjekt || {});
    }
}

export function visitMetrikk() {
    frontendLogger('arbeid-situasjon.visit');
}

export function avbrytMetrikk() {
    frontendLogger('arbeid-situasjon.avbryt');
}

export function ferdigMetrikk() {
    frontendLogger('arbeid-situasjon.ferdig');
}

export function svarMetrikk(svar: string){
    frontendLogger('arbeid-situasjon.situasjon.svar', {}, {svar: svar});
}