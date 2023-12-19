# hm-brille-frontend

Front-end for registrering av brillekrav for autoriserte optikere.
Back-end for appen er [hm-brille-api](https://github.com/navikt/hm-brille-api)

## Om appen

Appen krever at bruker er innlogget via ID-Porten, samt at innlogget person er registrert som
autorisert optiker i Helsepersonellregisteret (HPR).

Før et krav registreres må optiker velge hvilket organisasjonsnr. kravet skal registreres på og
dette organisasjonsnummeret må ha inngått en avtale med NAV om direkteoppgjør for briller til barn.

Optiker registrerer hvilket barn kravet gjelder og relevant informasjon om barnet hentes fra PDL.

Optiker fyller så inn brilleseddel, bestillingsdato og pris på brillen og kravet vilkårsprøves basert
på dette. Dersom vilkårsprøving gir støtte så får optiker mulighet til å sende kravet inn til NAV.

### Overordnet dokumentasjon

Overordnet dokumentasjon av brillestøtte finnes [her](doc/%C3%98kosystem.md)

## Bygg og lokal kjøring

Appen bygges med Vite og kjøres lokalt med Vite dev server:

```npm install```

```npm run dev```

MockSeviceWorker brukes for å mocke API-kall lokalt og i labs, se [browser.ts](./client/src/mocks/browser.ts).

