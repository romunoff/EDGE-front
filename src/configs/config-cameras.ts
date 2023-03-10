import { PerspectiveCamera } from 'three';

const perspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight);
perspectiveCamera.position.z = 5;
export default perspectiveCamera;
