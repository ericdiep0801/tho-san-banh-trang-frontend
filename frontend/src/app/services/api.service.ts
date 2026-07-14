import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const CATEGORIES = ['Cay nồng', 'Béo ngậy', 'Đặc biệt', 'Chua ngọt', 'Truyền thống'];
const IMAGES = ['assets/hero_bag.png', 'assets/cuon_bag.png'];

const MOCK_PRODUCTS = Array.from({ length: 120 }).map((_, i) => ({
  id: `p${i + 1}`,
  name: `Bánh Tráng ${CATEGORIES[i % CATEGORIES.length]} số ${i + 1}`,
  description: 'Mô tả ngon miệng cho bánh tráng siêu đỉnh, gia vị đậm đà hấp dẫn.',
  price: 15000 + (i % 5) * 5000,
  image: IMAGES[i % 2],
  category: CATEGORIES[i % CATEGORIES.length]
}));

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor() { }

  getProducts(params: { search?: string; category?: string; page?: number; limit?: number } = {}): Observable<any> {
    let products = MOCK_PRODUCTS;

    // Filter by search
    if (params.search) {
      const q = params.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Filter by category
    if (params.category && params.category !== 'All') {
      products = products.filter(p => p.category === params.category);
    }

    const total = products.length;

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = products.slice(startIndex, endIndex);

    return of({
      items: paginatedProducts,
      total: total,
      page: page,
      limit: limit
    }).pipe(delay(300)); // Simulate network
  }

  getProduct(id: string): Observable<any> {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return of(product).pipe(delay(300));
  }

  getOrders(): Observable<any[]> {
    if (typeof window !== 'undefined') {
      const savedOrders = localStorage.getItem('mock_orders');
      if (savedOrders) return of(JSON.parse(savedOrders)).pipe(delay(300));
    }
    return of([]).pipe(delay(300));
  }

  createOrder(orderData: any): Observable<any> {
    const newOrder = {
      id: 'ord_' + Date.now(),
      ...orderData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const savedOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      savedOrders.unshift(newOrder); // add to top
      localStorage.setItem('mock_orders', JSON.stringify(savedOrders));

      // Calculate points
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.points = (user.points || 0) + Math.floor(orderData.totalAmount * 0.05);
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    return of({ message: 'Order created', order: newOrder }).pipe(delay(500));
  }
}
