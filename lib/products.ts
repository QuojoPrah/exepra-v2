export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  sale?: boolean;
  badge?: string;
  bestseller?: boolean;
};

export const products: Product[] = [
  // =========================================================
  // EXISTING PRODUCTS
  // =========================================================

  {
    id: 1,
    name: "Aria Ceramic Pour-Over Set",
    category: "Home & Living",
    price: 58,
    oldPrice: 72,
    image: "/images/products/coffee.jpg",
    rating: 4.8,
    reviews: 214,
    sale: true,
    badge: "SALE",
  },

  {
    id: 2,
    name: "Nimbus Wireless Charger",
    category: "Tech & Gadgets",
    price: 39,
    image: "/images/products/charger.jpg",
    rating: 4.6,
    reviews: 389,
  },

  {
    id: 3,
    name: "Resistance Band Set",
    category: "Fitness",
    price: 28,
    oldPrice: 34,
    image: "/images/products/shoes.jpg",
    rating: 4.7,
    reviews: 502,
    sale: true,
    badge: "SALE",
  },

  {
    id: 4,
    name: "Minimalist Desk Lamp",
    category: "Home & Living",
    price: 64,
    image: "/images/products/lamp.jpg",
    rating: 4.9,
    reviews: 167,
  },

  // =========================================================
  // BEST SELLERS
  // =========================================================

  {
    id: 5,
    name: "Bedside Lamp",
    category: "Home & Living",
    price: 249,
    image: "/images/products/item1.jpg",
    rating: 4.9,
    reviews: 128,
    badge: "NEW",
    bestseller: true,
  },

  {
    id: 6,
    name: "Cables Bag",
    category: "Tech & Gadgets",
    price: 179,
    image: "/images/products/item2.jpg",
    rating: 4.8,
    reviews: 214,
    badge: "POPULAR",
    bestseller: true,
  },

  {
    id: 7,
    name: "Smart Water Bottle",
    category: "Fitness",
    price: 59,
    image: "/images/products/item3.jpg",
    rating: 4.7,
    reviews: 563,
    badge: "TRENDING",
    bestseller: true,
  },

  {
    id: 8,
    name: "Wooden Ladle Set",
    category: "Kitchen",
    price: 119,
    image: "/images/products/item4.jpg",
    rating: 4.8,
    reviews: 186,
    badge: "LIMITED",
    bestseller: true,
  },

  {
    id: 9,
    name: "Soap Containers",
    category: "Elegant Bathroom",
    price: 89,
    image: "/images/products/item5.jpg",
    rating: 4.7,
    reviews: 143,
    badge: "NEW",
    bestseller: true,
  },

  {
    id: 10,
    name: "Premium Backpack",
    category: "Travel",
    price: 149,
    image: "/images/products/item6.jpg",
    rating: 4.9,
    reviews: 321,
    badge: "BEST",
    bestseller: true,
  },

  {
    id: 11,
    name: "Make-up Brush Set",
    category: "Beauty",
    price: 99,
    image: "/images/products/item7.jpg",
    rating: 4.8,
    reviews: 267,
    badge: "NEW",
    bestseller: true,
  },

  {
    id: 12,
    name: "Essential Organizer",
    category: "Lifestyle",
    price: 69,
    image: "/images/products/item8.jpg",
    rating: 4.7,
    reviews: 198,
    badge: "POPULAR",
    bestseller: true,
  },
];