import perspectiveCamera from './configs/config-cameras';
import webGLRenderer from './configs/config-renderers';
import './index.scss';
import { SceneManager } from './models/SceneManager/SceneManager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';

const root = document.getElementById('root');
root?.appendChild(webGLRenderer.domElement);

const controls = new OrbitControls(perspectiveCamera, webGLRenderer.domElement);
const scene = new SceneManager();
scene.init();

const socket = io('http://localhost:8080');

socket.on('connect', () => {
  socket.emit('join', socket.id);

  socket.on('getSocketId', (data) => {
    // eslint-disable-next-line no-console
    console.log(data);
  });
});

const animate = () => {
  requestAnimationFrame(animate);

  scene.update();
  controls.update();

  webGLRenderer.render(scene, perspectiveCamera);
};

animate();
