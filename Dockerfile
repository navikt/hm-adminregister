FROM node:20-alpine as client-builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./
# Install dependencies
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    echo '//npm.pkg.github.com/:_authToken='$(cat /run/secrets/NODE_AUTH_TOKEN) >> .npmrc
RUN npm ci
COPY client .

ARG CLUSTER
ENV CLUSTER ${CLUSTER}

RUN npm run && npm run build

FROM node:20-alpine as server-builder
WORKDIR /app
COPY server/package.json server/package-lock.json ./
# Install dependencies
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    echo '//npm.pkg.github.com/:_authToken='$(cat /run/secrets/NODE_AUTH_TOKEN) >> .npmrc
RUN npm ci
COPY server .
RUN npm run && npm run build

FROM node:20-alpine as server-dependencies
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs20-debian12 as runtime

WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

COPY --from=client-builder /app/dist ./client/dist
COPY --from=server-builder /app/dist ./server/dist

WORKDIR /app/server

COPY --from=server-dependencies /app/node_modules ./node_modules

CMD [ "dist/server.js" ]
