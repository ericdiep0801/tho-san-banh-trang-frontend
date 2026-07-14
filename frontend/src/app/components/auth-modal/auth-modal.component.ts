import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  phone: string = '';
  otp: string = '';
  step: 1 | 2 = 1;
  error: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  sendOtp() {
    if (!this.phone) return;
    this.isLoading = true;
    this.error = '';
    this.authService.sendOtp(this.phone).subscribe({
      next: (res: any) => {
        this.step = 2;
        this.otp = res.mockOtp;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Có lỗi xảy ra';
        this.isLoading = false;
      }
    });
  }

  verifyOtp() {
    if (!this.otp) return;
    this.isLoading = true;
    this.error = '';
    this.authService.verifyOtp(this.phone, this.otp).subscribe({
      next: () => {
        this.success.emit();
        this.close.emit();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Mã OTP không hợp lệ';
        this.isLoading = false;
      }
    });
  }
}
