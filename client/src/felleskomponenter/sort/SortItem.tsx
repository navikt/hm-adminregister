import { ProductImageCard } from 'products/files/images/ProductImageCard'
import { ProductMediaCard } from 'products/videos/ProductMediaCard'
import { MediaInfoDTO } from 'utils/types/response-types'

interface Props {
  handleDeleteFile: (uri: string) => void
  handleEditFile?: (uri: string) => void
  imagesArr: MediaInfoDTO[]
  index: number
  isEditable: boolean
}

export const SortItem = ({ handleDeleteFile, handleEditFile, imagesArr, index, isEditable }: Props) => {
  return (
    <>
      {imagesArr[index].type === 'IMAGE' && (
        <ProductImageCard
          handleDeleteFile={handleDeleteFile}
          imagesArr={imagesArr}
          index={index}
          isEditable={isEditable}
        />
      )}
      {imagesArr[index].type === 'VIDEO' && (
        <ProductMediaCard
          handleDeleteFile={handleDeleteFile}
          handleEditFile={handleEditFile}
          mediaArr={imagesArr}
          index={index}
          isEditable={isEditable}
        />
      )}
    </>
  )
}
