import { forwardRef } from 'react'

import { MoreMenu } from 'felleskomponenter/MoreMenu'
import { MediaContainer } from 'products/videos/MediaContainer'
import { MediaInfoDTO } from 'utils/types/response-types'

import { Link, VStack } from '@navikt/ds-react'

import productStyles from '../ProductPage.module.scss'

import styles from './ProductMediaCard.module.scss'

interface Props {
  handleDeleteFile: (uri: string) => void
  mediaArr: MediaInfoDTO[]
  index: number
  isEditable: boolean
}

export const ProductMediaCard = forwardRef<HTMLDivElement, Props>(function MediaCard(
  { handleDeleteFile, mediaArr, index, isEditable }: Props,
  ref
) {
  return (
    <>
      <div className={styles.mediaCard} ref={ref}>
        <VStack gap="space-8">
          <Link target="_blank" title={mediaArr[index].uri} href={mediaArr[index].uri}>
            {mediaArr[index].text || mediaArr[index].uri}
          </Link>
          <MediaContainer uri={mediaArr[index].uri} text={mediaArr[index].text} />
        </VStack>
        {isEditable && (
          <div className={productStyles.moreMenuContainer}>
            <MoreMenu mediaInfo={mediaArr[index]} handleDeleteFile={handleDeleteFile} />
          </div>
        )}
      </div>
    </>
  )
})
