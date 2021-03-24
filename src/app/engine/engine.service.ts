import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ElementRef, Injectable, NgZone, OnDestroy } from "@angular/core";

@Injectable({ providedIn: "root" })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private controls: OrbitControls;
  private loader: THREE.TextureLoader;

  private cube: THREE.Mesh;

  private frameId: number = null;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // SCENE
    this.scene = new THREE.Scene();

    // CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.scene.add(this.camera);

    // CONTROLS
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // LOADER
    this.loader = new THREE.TextureLoader();

    // UPDATE CAMERA POSITION
    this.camera.position.x = 0;
    this.camera.position.y = 10;
    this.camera.position.z = 30;
    this.controls.update();

    // SOFT WHITE LIGHT
    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    // CUBE
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.scene.add(this.cube);

    // PLANE
    // height map
    const heightMap = this.loader.load("/assets/height-map.png");
    // texture map
    const textureMap = this.loader.load("/assets/grass-texture.png");
    // plane
    const planeGeometry = new THREE.PlaneBufferGeometry(30, 30, 32, 32);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x556b2f,
      side: THREE.DoubleSide,
      wireframe: true,
      displacementMap: heightMap,
      displacementScale: 3,
      displacementBias: -3,
      map: textureMap,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    this.scene.add(plane);
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== "loading") {
        this.render();
      } else {
        window.addEventListener("DOMContentLoaded", () => {
          this.render();
        });
      }

      window.addEventListener("resize", () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    //this.cube.rotation.x += 0.01;
    //this.cube.rotation.y += 0.01;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
