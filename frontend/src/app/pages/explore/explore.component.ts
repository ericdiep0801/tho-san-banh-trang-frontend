import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Mock data for places you've eaten Banh Trang Tron
  public locations: BanhTrangLocation[] = [
    {
      id: '1',
      name: 'Bánh Tráng Trộn Chú Viên',
      lat: 10.762622,
      lng: 106.681121,
      address: '38 Nguyễn Thượng Hiền, Phường 5, Quận 3, TP. HCM',
      description: 'Huyền thoại bánh tráng trộn Sài Gòn. Nước bò cực đỉnh, topping ngập tràn, xoài chua vừa tới. Xứng đáng chờ đợi dù hơi đông!',
      rating: 4.8,
      images: [
        'https://images.unsplash.com/photo-1594921671911-c918a5f0391f?q=80&w=600&auto=format&fit=crop', // Placeholder for street food
        'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
      id: '2',
      name: 'Bánh Tráng Trộn Cô Long',
      lat: 10.761502,
      lng: 106.680012,
      address: '34 Nguyễn Thượng Hiền, Phường 5, Quận 3, TP. HCM',
      description: 'Nằm ngay đối diện Chú Viên. Vị êm hơn, ít cay hơn, thích hợp cho ai không ăn cay được nhiều. Bánh tráng mềm dẻo rất ngon.',
      rating: 4.5,
      images: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
      id: '3',
      name: 'Bánh Tráng Cuốn Trứng Cút - Hồ Con Rùa',
      lat: 10.782807,
      lng: 106.695392,
      address: 'Vòng xoay Công Trường Quốc Tế, Quận 3, TP. HCM',
      description: 'Ngồi hồ hóng gió và thưởng thức cuốn bánh tráng trứng cút bơ siêu béo ngậy. Tuyệt vời cho những buổi chiều rảnh rỗi.',
      rating: 4.6,
      images: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
      id: '4',
      name: 'Bánh Tráng Trộn Dì Hồng',
      lat: 10.755255,
      lng: 106.666991,
      address: 'Đường Tôn Đản, Quận 4, TP. HCM',
      description: 'Nổi tiếng với mỡ hành siêu thơm và tóp mỡ giòn rụm. Vị mặn mặn ngọt ngọt cực kỳ cuốn. Ăn là ghiền!',
      rating: 4.7,
      images: [
        'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop'
      ]
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Generate 100 mock locations for testing
    for (let i = 5; i <= 104; i++) {
      const latOffset = (Math.random() - 0.5) * 0.15; // roughly 15km spread around HCMC
      const lngOffset = (Math.random() - 0.5) * 0.15;

      this.locations.push({
        id: i.toString(),
        name: `Tiệm Bánh Tráng Trộn Số ${i}`,
        lat: 10.762622 + latOffset,
        lng: 106.681121 + lngOffset,
        address: `Hẻm ${i} Góc Phố Sài Gòn, TP. HCM`,
        description: `Quán bánh tráng trộn ngẫu nhiên số ${i} mang hương vị đặc biệt. Tuyệt vời để thưởng thức cùng bạn bè!`,
        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0
        images: [
          'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&auto=format&fit=crop'
        ]
      });
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
      alert('Không tìm thấy địa điểm mang số thứ tự này!');
    }
  }
}
