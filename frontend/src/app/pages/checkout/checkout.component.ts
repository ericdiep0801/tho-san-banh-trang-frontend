import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  address: string = '';
  notes: string = '';
  isSubmitting = false;

  constructor(
    public cartService: CartService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.cartService.totalItems === 0) {
      this.router.navigate(['/cart']);
    }
  }

  placeOrder() {
    if (!this.authService.isLoggedIn) {
      alert('Vui lòng đăng nhập để đặt hàng và tích điểm!');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.address) {
      alert('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }

    this.isSubmitting = true;

    // We subscribe to cart$ synchronously to get items
    let items: any[] = [];
    this.cartService.cart$.subscribe(res => items = res).unsubscribe();

    const orderData = {
      items,
      totalAmount: this.cartService.totalAmount,
      shippingAddress: this.address,
      notes: this.notes
    };

    this.apiService.createOrder(orderData).subscribe({
      next: () => {
        alert('Đặt hàng thành công! Bạn đã được tích điểm.');
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      error: () => {
        alert('Có lỗi xảy ra, vui lòng thử lại.');
        this.isSubmitting = false;
      }
    });
  }
}
