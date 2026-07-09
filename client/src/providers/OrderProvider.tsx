"use client";

import { createContext, ReactNode, useState, useEffect } from "react";
import { CartItem, Product, ProductVariant } from "@/types";
import { toast } from "sonner";

interface OrderContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number, size?: string, color?: string, variant?: ProductVariant) => void;
    removeFromCart: (productId: string, size?: string, color?: string) => void;
    updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
    updateItemSize: (productId: string, oldSize: string | undefined, color: string | undefined, newSize: string) => void;
    updateItemColor: (productId: string, size: string | undefined, oldColor: string | undefined, newColor: string) => void;
    clearCart: () => void;
}

export const OrderContext = createContext<OrderContextType>({
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    updateItemSize: () => { },
    updateItemColor: () => { },
    clearCart: () => { },
});

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load from local storage
    useEffect(() => {
        const stored = localStorage.getItem("manbazar-cart");
        if (stored) {
            try {
                setCartItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("manbazar-cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity = 1, size?: string, color?: string, variant?: ProductVariant) => {
        let matchedVariant = variant;
        if (!matchedVariant && color && product.variants) {
            matchedVariant = product.variants.find(v => v.color.name === color);
        }
        const availableStock = matchedVariant ? (matchedVariant.stock ?? 0) : (product.stock ?? 0);

        setCartItems(prev => {
            const existingIndex = prev.findIndex(item =>
                item.product._id === product._id && item.size === size && item.color === color
            );
            const totalQtyInCartForStockPool = prev
                .filter(item => {
                    if (item.product._id !== product._id) return false;
                    if (product.variants && product.variants.length > 0) {
                        return item.color === color;
                    }
                    return true;
                })
                .reduce((sum, item) => sum + item.quantity, 0);

            const newTotalPoolQty = totalQtyInCartForStockPool + quantity;

            if (newTotalPoolQty > availableStock) {
                toast.error(`Only ${availableStock} items available in stock. Cannot add more.`);
                return prev;
            }

            if (existingIndex >= 0) {
                const newItems = [...prev];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: prev[existingIndex].quantity + quantity
                };
                toast.success("Cart updated!");
                return newItems;
            }
            toast.success("Added to cart!");
            return [...prev, { product, quantity, size, color, variant: matchedVariant }];
        });
    };

    const removeFromCart = (productId: string, size?: string, color?: string) => {
        setCartItems(prev => prev.filter(item =>
            !(item.product._id === productId && item.size === size && item.color === color)
        ));
    };

    const updateQuantity = (productId: string, size: string | undefined, color: string | undefined, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(item => item.product._id === productId && item.size === size && item.color === color);
            if (idx >= 0) {
                const item = newItems[idx];
                let matchedVariant = item.variant;
                if (!matchedVariant && item.color && item.product.variants) {
                    matchedVariant = item.product.variants.find(v => v.color.name === item.color);
                }
                const availableStock = matchedVariant ? (matchedVariant.stock ?? 0) : (item.product.stock ?? 0);

                const otherItemsInPoolQty = prev
                    .filter((cartItem, i) => {
                        if (i === idx) return false;
                        if (cartItem.product._id !== productId) return false;
                        if (cartItem.product.variants && cartItem.product.variants.length > 0) {
                            return cartItem.color === item.color;
                        }
                        return true;
                    })
                    .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

                const newTotalPoolQty = otherItemsInPoolQty + quantity;

                if (newTotalPoolQty > availableStock) {
                    toast.error(`Only ${availableStock} items available in stock.`);
                    return prev;
                }

                newItems[idx] = {
                    ...item,
                    quantity: quantity
                };
            }
            return newItems;
        });
    };

    const updateItemSize = (productId: string, oldSize: string | undefined, color: string | undefined, newSize: string) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(item => item.product._id === productId && item.size === oldSize && item.color === color);
            if (idx >= 0) {
                newItems[idx] = {
                    ...newItems[idx],
                    size: newSize
                };
            }
            return newItems;
        });
    };

    const updateItemColor = (productId: string, size: string | undefined, oldColor: string | undefined, newColor: string) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(item => item.product._id === productId && item.size === size && item.color === oldColor);
            if (idx >= 0) {
                newItems[idx] = {
                    ...newItems[idx],
                    color: newColor
                };
            }
            return newItems;
        });
    };

    const clearCart = () => setCartItems([]);

    return (
        <OrderContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateItemSize,
                updateItemColor,
                clearCart
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};