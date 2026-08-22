import { Bagel_Fat_One, Poppins } from 'next/font/google'

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-poppins',
})

export const bagelFatOne = Bagel_Fat_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bagel-fat-one',
})
