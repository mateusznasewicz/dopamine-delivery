import { Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AddLayerObject, FlyToOptions, Map, MercatorCoordinate } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebSocketService } from '../../service/web-socket-service';
import { CarState } from '../../model/car-state';
import { GuestService } from '../../service/guest-service';

@Component({
  selector: 'app-map-component',
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.css',
})
export class MapComponent implements OnInit, OnDestroy{

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map!: Map;

  private guestService = inject(GuestService);
  private webSocketService = inject(WebSocketService);
  
  selectedCar = signal<CarState | null>(null);
  isFollowing = signal<boolean>(false);
  private isAnimationLoopRunning = false;

  private car3DModel: THREE.Group | null = null;
  cars = this.webSocketService.cars

  ngOnInit(): void {
    this.initMap();
  }

  constructor() {
    effect(() => {
      const activeCars = this.cars();

      if (activeCars.length > 0 && !this.isAnimationLoopRunning) {
        this.isAnimationLoopRunning = true;
        this.drawCars();
      }

      if (activeCars.length > 0 && !this.selectedCar()) {
        this.selectedCar.set(activeCars[0]);
        this.toggleFollow();
      }
    });

  }

  toggleFollow() {
    this.isFollowing.update(value => !value);
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
      this.setupCarLayer();
    });
  }

  navigateCar(direction: 'next' | 'prev'): void {
    const activeCars = this.cars();

    const currentId = this.selectedCar()!.id;
    const currentIndex = activeCars.findIndex(car => car.id === currentId);
    
    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % activeCars.length;
    } else {
      newIndex = (currentIndex - 1 + activeCars.length) % activeCars.length;
    }

    const newCar = activeCars[newIndex];
    if (newCar) {
      this.selectedCar.set(newCar);
      this.centerMapOn(newCar.localLat, newCar.localLng, newCar.rotationZ);
    }
  }

  private drawCars(){
    let lastFrameTime = performance.now();

    const drawLoop = (currentTime: number) => {
      const elapsedTime = (currentTime - lastFrameTime) / 1000;
      
      if (!this.cars() || this.cars().length === 0) {
        this.isAnimationLoopRunning = false;
        return;
      }

      this.cars().forEach(car => {
        const desync  = this.calculateDistance([car.localLng, car.localLat], [car.lng, car.lat]);
        if(desync > 30){
          car.localLat = car.lat;
          car.localLng = car.lng;
          return;
        }

        const start: [number,number] = [car.localLng, car.localLat];
        const end: [number,number] = [car.destinationLng, car.destinationLat];
        const remainingDistance = this.calculateDistance(start, end);
        const speedMS = car.speed / 3.6;
        const distanceTraveledInThisFrame = speedMS * elapsedTime;
        
        if(distanceTraveledInThisFrame >= remainingDistance ) {
          car.localLng = car.destinationLng;
          car.localLat = car.destinationLat;
        } else {
          const progress = Math.min(distanceTraveledInThisFrame / remainingDistance, 1);
          car.localLng = car.localLng + (car.destinationLng - car.localLng) * progress;
          car.localLat = car.localLat + (car.destinationLat - car.localLat) * progress;
        }
        
        if (this.isFollowing() && car.id == this.selectedCar()!.id) {
          this.followCar(car.localLng, car.localLat, car.rotationZ);
        }

      });
      
      lastFrameTime = currentTime;
      if (this.map) {
        this.map.triggerRepaint();
      }
      requestAnimationFrame(drawLoop);
    }

    requestAnimationFrame(drawLoop);
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

  private setupCarLayer(): void {
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
            this.car3DModel = gltf.scene;
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
        if (!this.car3DModel) return;
        renderer.resetState();

        this.cars().forEach( car => {
          const mercator = MercatorCoordinate.fromLngLat([car.localLng, car.localLat], 0);
          const scale = mercator.meterInMercatorCoordinateUnits() * 5;

          const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
          const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.PI);
          const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), car.rotationZ);

          const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
          const l = new THREE.Matrix4()
            .makeTranslation(mercator.x, mercator.y, mercator.z)
            .scale(new THREE.Vector3(scale, -scale, scale))
            .multiply(rotationZ)
            .multiply(rotationX)
            .multiply(rotationY);
    
          camera.projectionMatrix = m.multiply(l);
          scene.add(this.car3DModel!);
          renderer.render(scene, camera);
          scene.remove(this.car3DModel!);
        });
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

  centerMapOn(lat: number, lon: number, rotationZ: number, zoomLevel: number = 17): void {
    if (!this.map) return;
    const bearingInDegrees = rotationZ * (180 / -Math.PI);
    const options: FlyToOptions = {
      center: [lon, lat],
      zoom: zoomLevel,
      pitch: 45,
      bearing: bearingInDegrees,
      speed: 0.8,
      curve: 1,
      essential: true
    }

    this.map.flyTo(options);
  }

  private followCar(lng: number, lat: number, rotationZ: number): void {
    if (!this.map) return;
    const bearingInDegrees = rotationZ * (180 / -Math.PI);
    this.map.easeTo({
      center: [lng, lat],
      duration: 0,
      essential: true,
      zoom: 17,
      bearing: bearingInDegrees
    });
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
  }
}
