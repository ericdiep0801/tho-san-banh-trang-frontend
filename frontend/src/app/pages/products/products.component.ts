import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  isLoading: boolean = true;
  skeletonArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // State for pagination & filtering
  searchQuery: string = '';
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Cay nồng', 'Béo ngậy', 'Đặc biệt', 'Chua ngọt', 'Truyền thống'];
  
  currentPage: number = 1;
  pageSize: number = 50;
  totalItems: number = 0;
  pageSizeOptions: number[] = [20, 50, 100];
  Math = Math; // to use Math.ceil in template

  constructor(private apiService: ApiService, private cartService: CartService, private toastService: ToastService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    const params = {
      search: this.searchQuery,
      category: this.selectedCategory,
      page: this.currentPage,
      limit: this.pageSize
    };

    this.apiService.getProducts(params).subscribe(data => {
      this.products = data.items;
      this.totalItems = data.total;
      this.isLoading = false;
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.currentPage = 1; // reset to first page when changing filter
    this.loadProducts();
  }

  changePage(page: number) {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  changeLimit(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
    this.loadProducts();
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
    this.toastService.show(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
  }
}
