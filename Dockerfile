FROM node:16.15.0-alpine as client-builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    echo '//npm.pkg.github.com/:_authToken='$(cat /run/secrets/NODE_AUTH_TOKEN) >> .npmrc
RUN npm ci
COPY client .

ARG CLUSTER
ENV CLUSTER ${CLUSTER}

RUN if [ "$CLUSTER" = "dev-gcp" ] ; then \
       npm run && npm run build:dev ; \
    elif [ "$CLUSTER" = "prod-gcp" ]; then \
       npm run && npm run build:prod ; \
    else \
        echo "No valid cluster specified"; \
    fi

FROM node:16.15.0-alpine as server-builder
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) \
    npm ci
COPY server .
RUN npm run && npm run build

FROM node:16.15.0-alpine as server-dependencies
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs:16 as runtime

WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

COPY --from=client-builder /app/dist ./client/dist
COPY --from=server-builder /app/dist ./server/dist

WORKDIR /app/server

COPY --from=server-dependencies /app/node_modules ./node_modules

CMD [ "dist/server.js" ]
