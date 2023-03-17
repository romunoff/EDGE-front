import { AxesHelper, DirectionalLight, Scene } from 'three';
import BasicCube from '../BasicCube/BasicCube';
import { Body, Box, Plane, Vec3, World } from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

export class SceneManager extends Scene {
  private readonly world: World;
  private readonly cannonDebugger;
  // private readonly camera: PerspectiveCamera;
  private readonly keyDown = new Set<string>();
  // { up, down, left, right }

  constructor() {
    super();

    this.world = new World();
    this.world.gravity.set(0, -9.82, 0);

    this.cannonDebugger = CannonDebugger(this, this.world, {
      color: 0xff0000,
    });
  }

  private getBox() {
    const boxBody = new Body({
      mass: 1,
      shape: new Box(new Vec3(0.5, 0.5, 0.5)),
    });
    boxBody.position.set(0, 7, 0);

    return boxBody;
  }

  init() {
    const axesHelper = new AxesHelper(5);
    this.add(axesHelper);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 0);
    this.add(light);

    // Add Plane
    const groundBody = new Body({
      type: Body.STATIC,
      shape: new Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // Add Box physics
    this.world.addBody(this.getBox());

    // Add Box
    this.add(BasicCube);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  update() {
    this.world.step(1 / 60);
    this.cannonDebugger.update();
    this.updateInput();

    BasicCube.position.copy(this.world.getBodyById(1).position as any);
    BasicCube.quaternion.copy(this.world.getBodyById(1).quaternion as any);
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
      this.world.getBodyById(1).position.x += 1;
    }

    if (this.keyDown.has('s')) {
      this.world.getBodyById(1).position.x -= 1;
    }

    if (this.keyDown.has('a')) {
      this.world.getBodyById(1).position.z -= 1;
    }

    if (this.keyDown.has('d')) {
      this.world.getBodyById(1).position.z += 1;
    }
  }
}
