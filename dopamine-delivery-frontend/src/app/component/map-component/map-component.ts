import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AddLayerObject, FlyToOptions, Map, MercatorCoordinate } from 'maplibre-gl';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DeliveryService } from '../../service/delivery-service';

@Component({
  selector: 'app-map-component',
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.css',
})
export class MapComponent implements OnInit, OnDestroy{
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map!: Map;

  private routeSubscription!: Subscription;
  private deliveryService = inject(DeliveryService);
  isFollowing = signal<boolean>(true);
  isRouteActive = signal<boolean>(false);

  private carModel: THREE.Group | null = null;
  private carTransform = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: Math.PI / 2,
    rotateY: Math.PI,
    rotateZ: 0,
    scale: 0
  };

  ngOnInit(): void {
    this.initMap()
    this.routeSubscription = this.deliveryService.routeCoordinates$.subscribe(points => {
      const lat = points[0][1];
      const lon = points[0][0];

      this.centerMapOn(lat, lon);
      this.setupRouteLayer(points)
      this.setupCarLayer(points[0], points[1]);
      this.animateRoute(points);
    });  
  }

  private initMap(): void {
    this.map = new Map({
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [17.0324, 51.1079],
      zoom: 16,
      pitch: 45,
      bearing: -17.6,
      container: this.mapContainer.nativeElement,
      canvasContextAttributes: { antialias: true }
    });

    this.map.on('load', () => {
      this.setup3dBuidlingsLayer();
    });
  }

  private async animateRoute(points: [number, number][]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isRouteActive.set(true);
    this.isFollowing.set(true);

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      this.rotateCarTowards(start, end);
      await this.moveCar(start, end, 50);
    }
    this.isRouteActive.set(false);
    this.isFollowing.set(false);
  }

  private moveCar(start: [number, number], end: [number, number], speed: number): Promise<void> {
    const speedMS = speed / 3.6;
    const distanceInMeters = this.calculateDistance(start, end);
    const duration = (distanceInMeters / speedMS) * 1000;

    return new Promise((resolve) => {
      const startTime = performance.now();

      const updatePosition = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentLng = start[0] + (end[0] - start[0]) * progress;
        const currentLat = start[1] + (end[1] - start[1]) * progress;
        if (this.isFollowing()) {
          this.followCar(currentLng, currentLat);
        }

        const currentAsMercator = MercatorCoordinate.fromLngLat([currentLng, currentLat], 0);

        this.carTransform.translateX = currentAsMercator.x;
        this.carTransform.translateY = currentAsMercator.y;
        this.carTransform.translateZ = currentAsMercator.z;

        this.map.triggerRepaint();

        if (progress < 1) {
          requestAnimationFrame(updatePosition);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(updatePosition);
    });
  }

  private rotateCarTowards(start: [number, number], end: [number, number]): void {
    const startM = MercatorCoordinate.fromLngLat(start, 0);
    const endM = MercatorCoordinate.fromLngLat(end, 0);

    const dx = endM.x - startM.x;
    const dy = endM.y - startM.y;

    const angleRad = Math.atan2(dx, dy);
    this.carTransform.rotateZ = angleRad - Math.PI;
  }

  private setup3dBuidlingsLayer(): void {
    const layers = this.map.getStyle().layers;

    let labelLayerId: string | undefined;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout) {
        labelLayerId = layer.id;
        break;
      }
    }

    if (!this.map.getSource('openfreemap')) {
      this.map.addSource('openfreemap', {
        url: 'https://tiles.openfreemap.org/planet',
        type: 'vector',
      });
    }

    this.map.addLayer(
      {
        'id': '3d-buildings',
        'source': 'openfreemap',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 15,
        'filter': ['!=', ['get', 'hide_3d'], true],
        'paint': {
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
            ],
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                16,
                ['get', 'render_height']
            ],
            'fill-extrusion-base': ['case',
                ['>=', ['get', 'zoom'], 16],
                ['get', 'render_min_height'], 0
            ]
        }
      },
      labelLayerId
    );
  }

  private setupCarLayer(location: [number, number], direction: [number, number]): void {
    const modelAsMercator = MercatorCoordinate.fromLngLat(location, 0);

    this.carTransform.translateX = modelAsMercator.x;
    this.carTransform.translateY = modelAsMercator.y;
    this.carTransform.translateZ = modelAsMercator.z;
    this.carTransform.scale = modelAsMercator.meterInMercatorCoordinateUnits() * 5;

    this.rotateCarTowards(location, direction);

    let camera: THREE.Camera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;

    const carLayer: AddLayerObject =  {
      id: 'threejs-car-layer',
      type: 'custom',
      renderingMode: '3d',
      
      onAdd: (mapInstance, gl) => {
        camera = new THREE.Camera();
        scene = new THREE.Scene();

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, -70, 100).normalize();
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(
          'sedan-sports.glb',
          (gltf) => {
            scene.add(gltf.scene);
            
            this.map.triggerRepaint();
          }
        );

        renderer = new THREE.WebGLRenderer({
          canvas: mapInstance.getCanvas(),
          context: gl,
          antialias: true
        });

        renderer.autoClear = false;
      },

      render: (gl, args) => {
        const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.carTransform.rotateX);
        const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.carTransform.rotateY);
        const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.carTransform.rotateZ);

        const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
        const l = new THREE.Matrix4()
          .makeTranslation(this.carTransform.translateX, this.carTransform.translateY, this.carTransform.translateZ)
          .scale(new THREE.Vector3(this.carTransform.scale, -this.carTransform.scale, this.carTransform.scale))
          .multiply(rotationZ)
          .multiply(rotationX)
          .multiply(rotationY);

        camera.projectionMatrix = m.multiply(l);
        
        renderer.resetState();
        renderer.render(scene, camera);
        this.map.triggerRepaint();
      }
    };

    this.map.addLayer(carLayer);
  }

  private setupRouteLayer(coordinates: [number, number][]): void {
    const routeGeoJson = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: coordinates
      }
    };

    if (this.map.getSource('route-source')) {
      const source = this.map.getSource('route-source') as any;
      source.setData(routeGeoJson);
      return;
    }

    this.map.addSource('route-source', {
      type: 'geojson',
      data: routeGeoJson
    });

    this.map.addLayer({
      id: 'route-layer',
      type: 'line',
      source: 'route-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff0000',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });
  }

  centerMapOn(lat: number, lon: number, zoomLevel: number = 17): void {
    if (!this.map) return;
    
    const options: FlyToOptions = {
      center: [lon, lat],
      zoom: zoomLevel,
      pitch: 45,
      bearing: -17.6,
      speed: 0.8,
      curve: 1,
      essential: true
    }

    this.map.flyTo(options);
  }

  private followCar(lng: number, lat: number): void {
    if (!this.map) return;
    const bearingInDegrees = this.carTransform.rotateZ * (180 / -Math.PI);
    this.map.easeTo({
      center: [lng, lat],
      duration: 0,
      essential: true,
      zoom: 17,
      bearing: bearingInDegrees
    });
  }

  toggleFollow(): void {
    this.isFollowing.set(!this.isFollowing());
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371000;
    const lat1 = point1[1] * Math.PI / 180;
    const lat2 = point2[1] * Math.PI / 180;
    const deltaLat = (point2[1] - point1[1]) * Math.PI / 180;
    const deltaLng = (point2[0] - point1[0]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }

    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
