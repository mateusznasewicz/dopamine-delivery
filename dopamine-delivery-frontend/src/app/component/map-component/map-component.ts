import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FillExtrusionLayerSpecification, Map } from 'maplibre-gl';

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

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
