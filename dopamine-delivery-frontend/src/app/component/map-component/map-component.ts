import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AddLayerObject, Map, MercatorCoordinate } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-map-component',
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.css',
})
export class MapComponent implements OnInit, OnDestroy{
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map!: Map;

  ngOnInit(): void {
    this.initMap()
  }

  private initMap(): void {
    this.map = new Map({
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [17.0324, 51.1079],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: this.mapContainer.nativeElement,
      canvasContextAttributes: { antialias: true }
    });

    this.map.on('load', () => {
      this.setup3dBuidlingsLayer();
      const carLocation: [number, number] = [17.0324, 51.1079];
      this.setupCarLayer(carLocation);
    });
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

  private setupCarLayer(location: [number, number]): void {
   const modelAsMercator = MercatorCoordinate.fromLngLat(location, 0);

    const modelTransform = {
      translateX: modelAsMercator.x,
      translateY: modelAsMercator.y,
      translateZ: modelAsMercator.z,
      rotateX: Math.PI / 2,
      rotateY: Math.PI,
      rotateZ: 0,
      scale: modelAsMercator.meterInMercatorCoordinateUnits() * 5
    };

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
            console.log('Model autka załadowany pomyślnie!');
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% załadowano model');
          },
          (error) => {
            console.error('Wystąpił błąd podczas ładowania modelu 3D:', error);
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
        const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
        const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
        const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

        const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
        const l = new THREE.Matrix4()
          .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
          .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

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

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
