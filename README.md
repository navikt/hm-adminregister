# hm-adminregister

Front-end for å administrere rammeavtaler og produkter i hjelpemiddeldatabasen.

Brukere er leverandører med produkter på rammeavtale og NAV-ansatte som forvalter rammeavtaler og produkter. 

## Lokal utvikling

Lokal utvikling krever per nå at bakenforliggende apper kjører lokalt: 

## Kjøre bakenforliggende apper lokalt

Sett opp [grunndata-register](https://github.com/navikt/hm-grunndata-register).

Etter det er satt opp kan man kjøre opp backend i hm-grunndata-register mappa:

```
gcloud auth login

docker-compose up
```

For at henting av ISO skal funke må dette kjøres i ett annet terminal vindu (samtidig som docker compose):

```
kubectl port-forward $(kubectl get pods -l app=hm-grunndata-db -o custom-columns=:metadata.name) 8083:8080
```

## Når backend kjører lokalt startes frontend med:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Testbrukere

 ```
 finnadmin@finnhjelpemidler.no
 E*V*P*
 finnhans@finnhjelpemidler.no
 E*V*P*
 ```

Open [http://localhost:5173/](http://localhost:5173/) with your browser to see the result.

## Generate OpenApi-typescript schema

schema.d.ts is updated by running hm-grunndata-register locally and running the following command:

```
npx openapi-typescript http://localhost:8080/admreg/swagger/hjelpemiddel-registrering-api-0.1.yml -o ./client/src/utils/schema.d.ts
```

Read more about [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript?activeTab=readme)

## Backend (Grunndata admin)

Sett opp [grunndata-register](https://github.com/navikt/hm-grunndata-register).

Etter det er satt opp kan man kjøre opp backend i hm-grunndata-register mappa:

```
gcloud auth login

docker-compose up
```

For at henting av ISO skal funke må dette kjøres i ett annet terminal vindu (samtidig som docker compose):

```
kubectl port-forward $(kubectl get pods -l app=hm-grunndata-db -o custom-columns=:metadata.name) 8083:8080
```
