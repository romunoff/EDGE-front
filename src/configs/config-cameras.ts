import { PerspectiveCamera } from 'three';

const perspectiveCamera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
perspectiveCamera.position.z = 20;
perspectiveCamera.position.x = -20;
perspectiveCamera.position.y = 20;

export default perspectiveCamera;
