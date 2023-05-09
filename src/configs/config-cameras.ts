import { PerspectiveCamera } from 'three';

const perspectiveCamera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
perspectiveCamera.position.x = -10;
perspectiveCamera.position.y = 25;

export default perspectiveCamera;
