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
    middleware: MiddlewareUtils.combine(MiddlewareUtils.delayMiddleware(0), MiddlewareUtils.loggingMiddleware())
});

mock.post('/veilarbvedtakinfo/api/situasjon', ResponseUtils.statusCode(204));

export default mock;
