import perspectiveCamera from './configs/config-cameras';
import webGLRenderer from './configs/config-renderers';
import './index.scss';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SceneManager } from './features/SceneManager/SceneManager';

const root = document.getElementById('root');
root?.appendChild(webGLRenderer.domElement);

const controls = new OrbitControls(perspectiveCamera, webGLRenderer.domElement);
const sceneManger = new SceneManager();
sceneManger.init();

const animate = () => {
  requestAnimationFrame(animate);

  sceneManger.update();
  controls.update();

  webGLRenderer.render(sceneManger.getScene(), perspectiveCamera);
};

animate();
