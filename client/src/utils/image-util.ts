//Todo: fix uten next-bibliotek

import { IMAGE_PROXY_URL } from "../environments";

enum Size {
  SMALL = '400',
  MEDIUM = '800',
  LARGE = '1600',
}

type ImageOptions = {
  src: string
  size: Size
}

const imageLoader = ({ src, size }: ImageOptions) => `${IMAGE_PROXY_URL}/${size}d/${src}`

export const smallImageLoader = ({ src }: any) => imageLoader({ src, size: Size.SMALL })
export const mediumImageLoader = ({ src }: any) => imageLoader({ src, size: Size.MEDIUM })
export const largeImageLoader = ({ src }: any) => imageLoader({ src, size: Size.LARGE })
