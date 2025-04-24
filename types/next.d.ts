declare module 'next/link' {
  import { ComponentType } from 'react'
  const Link: ComponentType<{
    href: string
    as?: string
    replace?: boolean
    scroll?: boolean
    shallow?: boolean
    passHref?: boolean
    prefetch?: boolean
    locale?: string | false
    legacyBehavior?: boolean
    children?: React.ReactNode
  }>
  export default Link
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (href: string) => void
    replace: (href: string) => void
    prefetch: (href: string) => void
    back: () => void
    forward: () => void
    refresh: () => void
  }
  export function usePathname(): string
  export function useSearchParams(): URLSearchParams
}

declare module 'next/image' {
  import { ComponentProps } from 'react'
  const Image: React.FC<ComponentProps<'img'> & {
    src: string
    alt: string
    width?: number
    height?: number
    loader?: (props: { src: string; width: number; quality?: number }) => string
    quality?: number
    priority?: boolean
    loading?: 'eager' | 'lazy'
    unoptimized?: boolean
  }>
  export default Image
}
