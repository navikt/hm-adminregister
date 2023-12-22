import { IMAGE_PROXY_URL } from "../environments";

export type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

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

export const smallImageLoader = ({ src }: ImageLoaderProps) => imageLoader({ src, size: Size.SMALL })
export const mediumImageLoader = ({ src }: ImageLoaderProps) => imageLoader({ src, size: Size.MEDIUM })
export const largeImageLoader = ({ src }: ImageLoaderProps) => imageLoader({ src, size: Size.LARGE })
