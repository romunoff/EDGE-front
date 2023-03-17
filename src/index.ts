import perspectiveCamera from './configs/config-cameras';
import webGLRenderer from './configs/config-renderers';
import './index.scss';
import { SceneManager } from './models/SceneManager/SceneManager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const root = document.getElementById('root');
root?.appendChild(webGLRenderer.domElement);

const controls = new OrbitControls(perspectiveCamera, webGLRenderer.domElement);
const scene = new SceneManager();
scene.init();

const animate = () => {
  requestAnimationFrame(animate);

  scene.update();
  controls.update();

  webGLRenderer.render(scene, perspectiveCamera);
};

animate();
