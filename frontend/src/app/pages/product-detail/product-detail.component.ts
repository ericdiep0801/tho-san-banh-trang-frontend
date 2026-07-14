import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: any;
  quantity: number = 1;
  isLoading: boolean = true;
  isAddingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getProduct(id).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
        },
        error: () => this.router.navigate(['/products'])
      });
    }
  }

  increase() {
    this.quantity++;
  }

  decrease() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    this.isAddingToCart = true;
    this.cartService.addToCart(this.product, this.quantity);
    setTimeout(() => {
      this.isAddingToCart = false;
      this.toastService.show('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }, 400); // Simulate network delay for better UX
  }
}
