import { AxesHelper, CameraHelper, DirectionalLight, DirectionalLightHelper, PerspectiveCamera, Scene } from 'three';
import BasicCube from '../BasicCube/BasicCube';
import perspectiveCamera from '../../configs/config-cameras';

export class SceneManager extends Scene {
  // private readonly camera: PerspectiveCamera;
  private readonly keyDown = new Set<string>();
  // { up, down, left, right }

  constructor() {
    super();
  }

  init() {
    const axesHelper = new AxesHelper(5);
    this.add(axesHelper);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 0);
    this.add(light);

    // this.add(BasicCube);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  update() {
    this.updateInput();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // switch (event.key) {
    //   case 'w':
    //     break;
    // }
    this.keyDown.add(event.key.toLowerCase());
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keyDown.delete(event.key.toLowerCase());
  };

  private updateInput() {
    if (this.keyDown.has('w')) {
      BasicCube.position.x += 1;
    }

    if (this.keyDown.has('s')) {
      BasicCube.position.x -= 1;
    }

    if (this.keyDown.has('a')) {
      BasicCube.position.z -= 1;
    }

    if (this.keyDown.has('d')) {
      BasicCube.position.z += 1;
    }
  }
}
