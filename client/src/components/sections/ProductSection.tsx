"use client";
import Image from "next/image";
import { Product } from "@/types";
import Link from "next/link";
import { useContext } from "react";
import { OrderContext } from "@/providers/OrderProvider";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useContext(OrderContext);

  const handleAddToCart = () => {
    // Add to cart with default first size/color if available
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast.success("Item added to cart");
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden shadow-sm border border-primary/20 hover:border-primary/80 transition-colors duration-200">
      <Link
        href={`/product/${product.slug}`}
        className="p-3 hover:p-1 hover:pb-0 transition-all"
      >
        <div className="relative w-full aspect-4/5 bg-gray-100 rounded-xl">
          <Image
            src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover rounded-xl border-2 border-primary"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="flex gap-2 items-center w-full p-3">
        <a href="#billing" onClick={handleAddToCart} className="w-full">
          <Button className="font-semibold bg-primary text-(--primary-text) text-sm md:text-base transition-colors duration-200 rounded-lg cursor-pointer w-full py-5">
            Order Now
          </Button>
        </a>
        <Button
          onClick={handleAddToCart}
          className="w-1/2 cursor-pointer font-bold py-5 bg-secondary text-(--secondary-text) hover:bg-secondary/80"
          // style={{ backgroundColor: "var(--tertiary-brand)" }}
        >
          <ShoppingCart />
        </Button>
      </div>
    </div>
  );
}

export default function ProductSection({ productsCaption, products }: { productsCaption: string, products: Product[] }) {
  return (
    <section className="py-10 px-4 max-w-5xl mx-auto">
      {/* Section title */}
      <div className="flex flex-col items-center mb-8">
        <div className="border border-gray-300 rounded-xl px-6 py-3 text-sm md:text-4xl font-bold mb-1">
          {productsCaption}
          <div className="flex items-center justify-center gap-3 pt-3">
            <div className="w-20 h-1 bg-linear-to-r from-black from-10% to-primary to-60% rounded-full" />
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
