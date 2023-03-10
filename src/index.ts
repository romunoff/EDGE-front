import scene from './configs/config-scenes';
import perspectiveCamera from './configs/config-cameras';
import webGLRenderer from './configs/config-renderers';
import BasicCube from './models/BasicCube/BasicCube';
import './index.scss';

const root = document.getElementById('root');
root?.appendChild(webGLRenderer.domElement);

const animate = () => {
  requestAnimationFrame(animate);

  BasicCube.rotation.x += 0.01;
  BasicCube.rotation.y += 0.01;

  webGLRenderer.render(scene, perspectiveCamera);
};

animate();
