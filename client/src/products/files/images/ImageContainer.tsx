import { useState } from 'react'
import { smallImageLoader } from 'utils/image-util'

import { FileImageIcon } from '@navikt/aksel-icons'
import { HStack } from '@navikt/ds-react'

import styles from './ImageContainer.module.scss'

export const ImageContainer = ({ uri, text, size }: { uri?: string; text?: string | null; size?: string }) => {
  const [imageLoadingError, setImageLoadingError] = useState(false)

  return (
    <div className={styles.container}>
      <div className={size === 'xsmall' ? styles.imageXsmall : styles.image}>
        {imageLoadingError || !uri ? (
          <HStack height="100%" justify="center" align="center">
            <FileImageIcon title="Produkt mangler bilde" fontSize="2rem" />
          </HStack>
        ) : (
          <img
            src={smallImageLoader({ src: uri, width: 400 })}
            onError={() => {
              setImageLoadingError(true)
            }}
            alt={text ?? 'OBS mangler alt-tekst'}
            draggable="false"
            sizes="50vw"
          />
        )}
      </div>
    </div>
  )
}
