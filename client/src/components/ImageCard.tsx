
import { VStack, Label } from '@navikt/ds-react'
import { useState } from 'react'
import classNames from 'classnames'
import { MoreMenu } from './MoreMenu'
import { MediaInfo } from "../utils/response-types";

interface Props {
  mediaInfo: MediaInfo
  handleDeleteFile: (uri: string) => void
}

export const ImageCard = ({ mediaInfo, handleDeleteFile }: Props) => {
  return (
    <li className="image-card">
      <VStack gap="2">
        <ImageContainer uri={mediaInfo.uri} text={mediaInfo.text} />
        <VStack gap="1" align="center">
          <Label>Tittel</Label> <span>{mediaInfo.text ?? 'OBS mangler beskrivelse'}</span>
        </VStack>
      </VStack>
      <div className="image-card__more-menu-container">
        <MoreMenu mediaInfo={mediaInfo} handleDeleteFile={handleDeleteFile} fileType="image" />
      </div>
    </li>
  )
}

export const ImageContainer = ({ uri, text, size }: { uri?: string; text?: string | null; size?: string }) => {
  const [imageLoadingError, setImageLoadingError] = useState(false)

  return (
    <div className={classNames('image-container', { 'image-container--xsmall': size == 'xsmall' })}>
      <div className="image">
        {imageLoadingError || !uri ? (
            // todo: Next/image had some stuff img does not
          <img
            src={'/adminregister/assets/image-error.png'}
            alt="Produktbilde"
            style={{ padding: '10px' }}
            sizes="50vw"
          />
        ) : (
          <img
            src={uri}
            onError={() => {
              setImageLoadingError(true)
            }}
            alt={text ?? 'OBS mangler alt-tekst'}
            style={{ padding: '10px', objectFit: 'contain' }}
            sizes="50vw"
          />
        )}
      </div>
    </div>
  )
}
