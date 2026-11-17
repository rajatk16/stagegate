# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-bookworm-slim
ARG JAVA_IMAGE=eclipse-temurin:21-jdk-jammy

FROM ${JAVA_IMAGE} AS java

FROM ${NODE_IMAGE} AS firebase

ARG FIREBASE_TOOLS_VERSION=14.15.2

ENV NODE_ENV=development JAVA_HOME=/opt/java/openjdk HOME=/home/node CI=true

ENV PATH="${JAVA_HOME}/bin:${PATH}"

COPY --from=java /opt/java/openjdk /opt/java/openjdk

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libstdc++6 zlib1g && rm -rf /var/lib/apt/lists/*

RUN npm install --global "firebase-tools@${FIREBASE_TOOLS_VERSION}"

RUN mkdir -p /workspace /data /home/node/.cache/firebase/emulators && chown -R node:node /workspace /data /home/node

WORKDIR /workspace

COPY --chown=node:node infrastructure/firebase/firebase.docker.json infrastructure/firebase/.firebaserc infrastructure/firebase/firestore.rules infrastructure/firebase/firestore.indexes.json ./

COPY --chmod=755 infrastructure/docker/firebase/entrypoint.sh /usr/local/bin/firebase-entrypoint

USER node

RUN java -version && firebase --version && firebase setup:emulators:firestore

EXPOSE 9099 8080 4001 4400 4500

STOPSIGNAL SIGINT

ENTRYPOINT [ "/usr/local/bin/firebase-entrypoint" ]
