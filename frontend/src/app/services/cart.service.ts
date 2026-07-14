import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next(this.cartItems);
      }
    }
  }

  private saveCart() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
    this.cartSubject.next(this.cartItems);
  }

  addToCart(product: any, quantity: number = 1) {
    const existing = this.cartItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      });
    }
    this.saveCart();
  }

  removeFromCart(id: string) {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.saveCart();
  }

  updateQuantity(id: string, quantity: number) {
    const item = this.cartItems.find(i => i.id === id);
    if (item && quantity > 0) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  get totalItems() {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalAmount() {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}
