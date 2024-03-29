ARG NODE_IMAGE
FROM dig-grid-artifactory.apps.ge.com/smallworld-docker-snapshot/${NODE_IMAGE}-bullseye-slim

COPY . .

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

RUN chown -R appuser ./dist

EXPOSE 4000

USER appuser

ENTRYPOINT ./start-server.sh
