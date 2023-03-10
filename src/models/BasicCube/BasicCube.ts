import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

const BasicCube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: 0x00ff00 }));

export default BasicCube;
