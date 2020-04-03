FROM docker.pkg.github.com/navikt/pus-decorator/pus-decorator

ENV APPLICATION_NAME=arbeid-situasjon
ENV GZIP_ENABLED=true
COPY /build /app

ADD decorator.yaml /decorator.yaml
