// tslint:disable
import FetchMock, { MiddlewareUtils, ResponseUtils } from 'yet-another-fetch-mock';

(window as any).frontendlogger = {
    info: function () {},
    warn: function () {},
    error: function () {},
    event: function () {
        console.log('event-triggered', arguments);
    }
};

const mock = FetchMock.configure({
    enableFallback: false,
    middleware: MiddlewareUtils.combine(MiddlewareUtils.delayMiddleware(500), MiddlewareUtils.loggingMiddleware())
});

const data = {stuff: null};

mock.get('/veilarbvedtakinfo/api/situasjon', () => data.stuff);
mock.post('/veilarbvedtakinfo/api/situasjon', ResponseUtils.combine(ResponseUtils.statusCode(204),
    ({body}) => {
        data.stuff = body;
        return null;
    }
    ));
mock.post('/veilarbdialog/api/dialog', ({ body }): any => {return {id: '123'}});


export default mock;
