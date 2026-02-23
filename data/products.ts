export type Product = {
  id: number
  name: string
  price: number
  image: string
  taxe: string
}

export const products: Product[] = [
  {
    id: 1,
    name: "Richse Silk Dress",
    price: 290,
    image: "/G11.png",
    taxe: "Intensive brightening & lift",
  },
  {
    id: 2,
    name: "Richse Serum",
    price: 279,
    image: "/G12.png",
    taxe: "24-hour moisture lock",
  },
  {
    id: 3,
    name: "Richse Blazer",
    price: 269,
    image: "/G13.png",
    taxe: "Cellular renewal formula",
  },
  {
    id: 4,
    name: "Richse Luxury Bag",
    price: 299,
    image: "/G14.png",
    taxe: "pH-balanced purity",
  },
]