import { exec } from 'child_process'
import nb from '../resources/nb_translation.json'
import nn from '../resources/nn_translation.json'

describe('i18n', () => {
  test('Ingen translation keys mangler', async () => {
    exec(`grep "t(\'.*\'" --include \*.tsx --include \*.ts -ohrw './src'`, (_, stdout) => {
      const bokmaal = Object.keys(nb)
      const nynorsk = Object.keys(nn)

      const allTranslationsUsed = stdout.split('t(').map((item) => {
        return item
          .replace(/'([^']*)'.*/, '$1')
          .replace(/(\n)/, '')
          .replace(/'/g, '')
      })

      allTranslationsUsed.shift()

      for (let i = 0; i < allTranslationsUsed.length; i += 1) {
        expect(bokmaal).toContainEqual(allTranslationsUsed[i])
      }

      for (let i = 0; i < allTranslationsUsed.length; i += 1) {
        expect(nynorsk).toContainEqual(allTranslationsUsed[i])
      }
    })
  })

  test('There should not be unused keys (norsk bokmål)', async () => {
    const translationKeys = Object.keys(nb)
    let everyStringsAreUsed = true
    for (let i = 0; i < translationKeys.length; i += 1) {
      exec(`bash -c "grep --include=\*.{tsx,ts} -e '${translationKeys[i]}' -rnw './src'"`, (err, stdout) => {
        if (err) {
          console.log(err)
        }

        if (everyStringsAreUsed) {
          everyStringsAreUsed = !(stdout === '')
        }

        if (stdout === '') {
          console.warn(`[I18n] Could not find '${translationKeys[i]}' in use in any ts or tsx file`)
        }
      })
    }
    expect(everyStringsAreUsed).toBeTruthy()
  })

  test('There should not be unused keys (nynorsk)', async () => {
    const translationKeys = Object.keys(nn)
    let everyStringsAreUsed = true
    for (let i = 0; i < translationKeys.length; i += 1) {
      exec(`bash -c "grep --include=\*.{tsx,ts} -e '${translationKeys[i]}' -rnw './src'"`, (err, stdout) => {
        if (err) {
          console.log(err)
        }

        if (everyStringsAreUsed) {
          everyStringsAreUsed = !(stdout === '')
        }

        if (stdout === '') {
          console.warn(`[I18n] Could not find '${translationKeys[i]}' in use in any ts or tsx file`)
        }
      })
    }
    expect(everyStringsAreUsed).toBeTruthy()
  })
})
