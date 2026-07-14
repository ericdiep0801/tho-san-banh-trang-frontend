import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.scss'
})
export class ProfileModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() logoutSuccess = new EventEmitter<void>();

  user: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (data) => this.user = data,
      error: () => this.logout()
    });
  }

  viewOrders() {
    this.close.emit();
    this.router.navigate(['/orders']);
  }

  logout() {
    this.authService.logout();
    this.logoutSuccess.emit();
    this.close.emit();
  }
}
