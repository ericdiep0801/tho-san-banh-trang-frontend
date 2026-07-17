import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { ProfileModalComponent } from './components/profile-modal/profile-modal.component';
import { ToastService } from './services/toast.service';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, AuthModalComponent, ProfileModalComponent, GlobalLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Thợ Săn Bánh Tráng';
  isMenuOpen = false;
  showScrollToTop = false;

  showLoginModal = false;
  showProfileModal = false;

  totalItems = 0;
  searchQuery = '';
  toasts: { id: number, message: string, type: string }[] = [];

  constructor(
    public cartService: CartService, 
    public authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.cartService.cart$.subscribe(items => {
      this.totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    });

    this.toastService.toast$.subscribe(toast => {
      this.toasts = [...this.toasts, toast];
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== toast.id);
      }, 2000); // 2 seconds
    });
  }

  get isExploreRoute(): boolean {
    return this.router.url === '/explore';
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
      this.isMenuOpen = false; // close mobile menu if open
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollToTop = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
