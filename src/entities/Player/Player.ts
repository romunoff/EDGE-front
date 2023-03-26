import { Body } from 'cannon-es';
import { Mesh } from 'three';

export interface Player {
  id: string;
  body?: Body;
  geometry?: Mesh;
}
