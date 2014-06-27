declare var Config: any;

declare module deCarta {

  export module Core {
    export class BoundingBox {
      constructor(positions: Position[]);
      topLeftPoint: Position;
      btmRightPoint: Position;
      getIdealCenterAndZoom(map: Map): IdealCenterAndZoom;
    }
    export class Circle extends Shape {
      constructor(options: any);
      getRadius(): number;
      setRadius(r: number): void;
    }
    export module Configuration {
      export var AppKey: string;
    }
    export class Distance {
      getMiles(): number;
      getKm(): number;
      getDegrees(): number;
    }
    export module EventManager {
      export function listen(event: string, callback: (e: any) => void, self?: any): any;
      export function trigger(event: string, params: Object, self?: any): void;
      export function stopListening(event: string, handle: any): void;
    }
    export class IdealCenterAndZoom {
      zoom: number;
      center: Position;
    }
    export class Image extends OverlayObject {
      constructor(options: any);
    }
    export class InfoWindow {
      constructor(map: Map);
      options: any;
      show(options: {
        target: Pin;
        content: any;
        onClose?: Function;
        cssClass?: string;
        autoReorient?: boolean;
      }): any;  // return domElement;
      hide(): void;

      updateText(text: any): void;
      getElement(): any;
    }
    export class Map {
      constructor(options: any);
      addLayer(layer: MapOverlay): void;
      centerOn(center: Position): void;
      getCenter(): Position;
      isResizeable(): boolean;
      pan(where: string, howMuch: number): void;
      render(): void;
      resize(): void;
      zoomTo(level: number): void;
    }
    export class MapOverlay {
      constructor(options: any);
      addObject(object: OverlayObject): string;
      clear(): void;
      removeObject(object: OverlayObject, dontRefresh: boolean): void;
    }
    export class OverlayObject {
    }
    export class Pin extends OverlayObject {
      constructor(options: any);
      domElement: HTMLElement;
      options: any;
      getCenter(): Position;
      getInfoWindow(): InfoWindow;
      hideText(): void;
      setImage(image: HTMLElement, xOffset: number, yOffset: number): void;
      setImageSrc(imageSrc: string, xOffset: number, yOffset: number): void;
      showText(): void;
    }
    export class Polygon extends Shape {
      constructor(options: any);
      options: any;
    }
    export class Polyline extends Shape {
      constructor(options: any);
      options: any;
      getBoundingBox(): BoundingBox;
    }
    export class Position {
      constructor(lat: number, lon: number);
      getLat(): number;
      getLon(): number;

      clone(): Position;
      equals(another: Position): boolean;
      distanceFrom(another: Position): Distance;
    }
    export class Shape extends OverlayObject {
      constructor(options: any);
      options: any;
    }
  }

  export var UI: any;
}
