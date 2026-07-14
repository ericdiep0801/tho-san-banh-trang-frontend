import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isCheckingOut: boolean = false;

  constructor(public cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  increase(id: string, current: number) {
    this.cartService.updateQuantity(id, current + 1);
  }

  decrease(id: string, current: number) {
    if (current > 1) this.cartService.updateQuantity(id, current - 1);
  }

  remove(id: string) {
    this.cartService.removeFromCart(id);
  }

  clearCart() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?')) {
      this.cartService.clearCart();
    }
  }

  checkout() {
    this.isCheckingOut = true;
    setTimeout(() => {
      this.isCheckingOut = false;
      this.router.navigate(['/checkout']);
    }, 500);
  }
}
