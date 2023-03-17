import perspectiveCamera from './configs/config-cameras';
import webGLRenderer from './configs/config-renderers';
import './index.scss';
import { SceneManager } from './models/SceneManager/SceneManager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Body, Plane, Sphere, Vec3, World } from 'cannon-es';
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, SphereGeometry } from 'three';
import CannonDebugger from 'cannon-es-debugger';

const root = document.getElementById('root');
root?.appendChild(webGLRenderer.domElement);

const controls = new OrbitControls(perspectiveCamera, webGLRenderer.domElement);
const scene = new SceneManager();
scene.init();

const world = new World();
world.gravity.set(0, -9.82, 0);

const groundBody = new Body({
  type: Body.STATIC,
  shape: new Plane(),
});

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const sphereBody = new Body({
  mass: 1,
  shape: new Sphere(1),
});
sphereBody.position.set(0, 7, 0);
world.addBody(sphereBody);

const geometry = new SphereGeometry();
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const sphereMesh = new Mesh(geometry, material);
scene.add(sphereMesh);

const cannonDebugger = CannonDebugger(scene, world, {
  color: 0xff0000,
});

const animate = () => {
  requestAnimationFrame(animate);

  world.step(1 / 60);
  cannonDebugger.update();

  // sphereMesh.position.x = sphereBody.position.x;
  // sphereMesh.position.y = sphereBody.position.y;
  // sphereMesh.position.z = sphereBody.position.z;
  sphereMesh.position.copy(sphereBody.position as any);
  sphereMesh.quaternion.copy(sphereBody.quaternion as any);

  // sphereMesh.quaternion.x = sphereBody.quaternion.x;
  // sphereMesh.quaternion.y = sphereBody.quaternion.y;
  // sphereMesh.quaternion.z = sphereBody.quaternion.z;

  scene.update();
  controls.update();

  webGLRenderer.render(scene, perspectiveCamera);
};

animate();
