import { WebGLRenderer } from 'three';

const webGLRenderer = new WebGLRenderer();
webGLRenderer.setSize(window.innerWidth, window.innerHeight);
webGLRenderer.shadowMap.enabled = true;

export default webGLRenderer;
