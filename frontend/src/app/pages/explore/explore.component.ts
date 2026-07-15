import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

// Define the interface for our location data
export interface BanhTrangLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  rating: number;
  images: string[];
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent implements OnInit, AfterViewInit {
  private map: any; // Use any or specific Leaflet type
  private isBrowser: boolean;
  public searchId: string = '';
  private markerMap: Map<string, any> = new Map();
  public selectedLocation: BanhTrangLocation | null = null;
  public showPanel: boolean = false;
  
  public showAddLocationForm: boolean = false;
  public newLocation = {
    name: '',
    lat: null as number | null,
    lng: null as number | null,
    address: '',
    description: ''
  };
  public searchError: string = '';
  public errorMessage: string = '';

  public showPasswordPrompt: boolean = false;
  public adminPasswordInput: string = '';
  public passwordError: string = '';

  public locations: BanhTrangLocation[] = [];
  private apiUrl = 'https://tho-san-banh-trang-backend.onrender.com/api/locations';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private toastService: ToastService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.fetchLocations();
  }

  private async fetchLocations(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      this.locations = data;
      
      // If map is already initialized, refresh markers
      if (this.map) {
        this.refreshMarkers();
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to empty or could show an error message
    }
  }

  private refreshMarkers(): void {
    // Remove existing markers
    this.markerMap.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markerMap.clear();

    const L = (window as any).L;
    if (L) {
      this.addMarkers(L);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    const leafletModule = await import('leaflet');
    const L = leafletModule.default || leafletModule;
    (window as any).L = L;
    
    // Khởi tạo bản đồ, focus về khu vực TP.HCM
    this.map = L.map('map', {
      zoomControl: false, // Disable default zoom to add custom positioned one if needed
      attributionControl: false // Hide Leaflet attribution
    }).setView([10.762622, 106.681121], 13); // Tọa độ trung tâm TP.HCM

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);
    
    // Add zoom control manually at bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.addMarkers(L);
  }

  private addMarkers(L: any): void {
    this.locations.forEach((location, index) => {
      // Custom Icon for Banh Trang points with number
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-wrapper">
            <div class="marker-pin"></div>
            <div class="marker-number">${index + 1}</div>
          </div>
          <div class="marker-pulse"></div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(this.map);
      this.markerMap.set((index + 1).toString(), marker);
      
      marker.on('click', () => {
        this.ngZone.run(() => {
          this.closePanel(); // this also clears old highlights
          
          // Add highlight to current marker persistently
          const L = (window as any).L;
          if (L) {
            const newIcon = L.divIcon({
              className: 'custom-map-marker is-highlighted',
              html: `
                <div class="marker-wrapper">
                  <div class="marker-pin"></div>
                  <div class="marker-number">${index + 1}</div>
                </div>
                <div class="marker-pulse"></div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 36]
            });
            marker.setIcon(newIcon);
          }
          
          let targetLatLng = L.latLng(location.lat, location.lng);
          const targetZoom = 16;
          
          const targetPoint = this.map.project(targetLatLng, targetZoom);
          
          if (window.innerWidth <= 992) {
            // Mobile & Tablet (Bottom Sheet): Shift center DOWN by 25% of viewport height
            targetPoint.y += window.innerHeight * 0.25; 
          } else {
            // Desktop (Right Panel is 450px): Shift center RIGHT by 225px to center marker in remaining space
            targetPoint.x += 225;
          }
          
          targetLatLng = this.map.unproject(targetPoint, targetZoom);
          
          this.map.flyTo(targetLatLng, targetZoom, {
            animate: true,
            duration: 1.5
          });
          
          setTimeout(() => {
            this.ngZone.run(() => {
              this.openLocationDetails(location);
            });
          }, 800);
        });
      });
    });
  }

  public openLocationDetails(location: BanhTrangLocation): void {
    this.selectedLocation = location;
    this.showPanel = true;
  }

  public closePanel(): void {
    this.showPanel = false;
    
    // Clear all marker highlights and restore visibility
    this.markerMap.forEach((m, key) => {
      const L = (window as any).L;
      if (L) {
        const normalIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="marker-wrapper">
              <div class="marker-pin"></div>
              <div class="marker-number">${key}</div>
            </div>
            <div class="marker-pulse"></div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });
        m.setIcon(normalIcon);
      }
      
      // If marker was hidden during search, show it again
      if (!this.map.hasLayer(m)) {
        m.addTo(this.map);
      }
    });

    setTimeout(() => {
      this.selectedLocation = null;
    }, 300); // Wait for transition
  }

  public getDirections(): void {
    if (this.selectedLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.selectedLocation.lat},${this.selectedLocation.lng}`;
      window.open(url, '_blank');
    }
  }

  public onSearch(): void {
    this.searchError = '';
    if (!this.searchId) return;
    
    const searchStr = this.searchId.trim();
    const marker = this.markerMap.get(searchStr);
    
    // Reset all markers highlight
    this.markerMap.forEach((m, key) => {
      const L = (window as any).L;
      if (L) {
        const normalIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="marker-wrapper">
              <div class="marker-pin"></div>
              <div class="marker-number">${key}</div>
            </div>
            <div class="marker-pulse"></div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });
        m.setIcon(normalIcon);
      }
    });

    if (marker) {
      // Hide all other markers, ensure this one is visible
      this.markerMap.forEach(m => {
        if (m !== marker) {
          m.removeFrom(this.map);
        } else {
          if (!this.map.hasLayer(m)) m.addTo(this.map);
        }
      });

      const locIndex = parseInt(searchStr, 10) - 1;
      const location = this.locations[locIndex];

      if (location) {
        this.ngZone.run(() => {
          // Trigger the same animation flow as a marker click
          marker.fire('click');
        });
      }
    } else {
      this.searchError = 'Không tìm thấy địa điểm mang số thứ tự này!';
    }
  }

  public promptAdminPassword(): void {
    this.showPasswordPrompt = true;
    this.adminPasswordInput = '';
    this.passwordError = '';
  }

  public verifyPassword(): void {
    if (this.adminPasswordInput === '180700') {
      this.showPasswordPrompt = false;
      this.openAddLocationForm();
    } else {
      this.passwordError = 'Mật khẩu không chính xác!';
    }
  }

  public closePasswordPrompt(): void {
    this.showPasswordPrompt = false;
  }

  public openAddLocationForm(): void {
    this.showAddLocationForm = true;
  }

  public closeAddLocationForm(): void {
    this.showAddLocationForm = false;
    this.newLocation = { name: '', lat: null, lng: null, address: '', description: '' };
    this.errorMessage = '';
  }

  public async submitNewLocation(): Promise<void> {
    this.errorMessage = '';
    if (!this.newLocation.name || !this.newLocation.lat || !this.newLocation.lng || !this.newLocation.address) {
      this.errorMessage = 'Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Tọa độ, Địa chỉ)!';
      return;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.newLocation)
      });

      if (!response.ok) {
        throw new Error('Lỗi khi thêm vị trí');
      }

      const addedLocation = await response.json();
      this.locations.push(addedLocation);
      
      if (this.map) {
        this.refreshMarkers();
      }
      
      this.toastService.show('Đã thêm vị trí thành công!', 'success');
      this.closeAddLocationForm();
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Có lỗi xảy ra khi thêm vị trí!';
    }
  }

  public reloadMap(): void {
    this.fetchLocations();
    this.toastService.show('Đã tải lại bản đồ!', 'info');
  }
}
