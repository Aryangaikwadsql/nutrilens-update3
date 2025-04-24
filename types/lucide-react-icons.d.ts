declare module 'lucide-react' {
  import { SVGProps } from 'react'
  export type Icon = (props: SVGProps<SVGSVGElement>) => JSX.Element
  export const Camera: Icon
  export const Upload: Icon
}
