import {
  AxesHelper,
  BackSide,
  BoxGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  TextureLoader,
} from 'three';
import { Body, Box, Plane, Vec3, World } from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import io from 'socket.io-client';
import { PlayerGeometry } from '../../entities/Player/PlayerGeometry';
import { Player } from '../../entities/Player/Player';
import { Finish } from '../../entities/Finish/Finish';
import Galaxy from '../../../public/images/galaxy.png';
import { getWalls } from '../../utils/level-helpers';

export class SceneManager {
  private readonly scene: Scene;
  private readonly world: World;
  private readonly textureLoader: TextureLoader;
  private readonly cannonDebugger;
  private readonly socket;

  private readonly activePlayers = new Set<PlayerGeometry>();
  private readonly wallBodies = new Array<Body>();

  private playerBody?: Body;
  private playerGeometry?: Mesh;
  private finish?: Mesh;

  private isWinnerExists = false;

  constructor() {
    this.scene = new Scene();
    this.world = new World();
    this.textureLoader = new TextureLoader();
    this.world.gravity.set(0, -98.2, 0);
    this.cannonDebugger = CannonDebugger(this.scene, this.world, { color: 'grey' });
    this.socket = io('http://localhost:8080');
  }

  public getScene() {
    return this.scene;
  }

  public init(): void {
    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);

    const light = new DirectionalLight('white');
    light.position.set(-10, 25, 10);
    light.castShadow = true;
    light.shadow.camera.left = -12.5;
    light.shadow.camera.right = 12.5;
    light.shadow.camera.top = 12.5;
    light.shadow.camera.bottom = -12.5;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    this.scene.add(light);

    const lightHelper = new DirectionalLightHelper(light, 3);
    this.scene.add(lightHelper);

    const planeBody = new Body({
      type: Body.STATIC,
      shape: new Plane(),
    });
    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(planeBody);

    const plane = new Mesh(
      new PlaneGeometry(25, 25),
      new MeshLambertMaterial({ color: 'lightgrey', side: DoubleSide }),
    );
    plane.rotateX(-Math.PI / 2);
    plane.receiveShadow = true;
    this.scene.add(plane);

    const galaxyTexture = this.textureLoader.load(Galaxy);
    const galaxy = new Mesh(
      new SphereGeometry(100, 32, 32),
      new MeshBasicMaterial({
        map: galaxyTexture,
        side: BackSide,
      }),
    );
    this.scene.add(galaxy);

    const wallPositions = getWalls();
    for (const position of wallPositions) {
      const wall = new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: 'grey' }));
      wall.position.copy(position);
      wall.castShadow = true;
      this.scene.add(wall);

      const wallBody = new Body({
        type: Body.STATIC,
        position: new Vec3(position.x, position.y, position.z),
        shape: new Box(new Vec3(0.5, 0.5, 0.5)),
      });
      this.wallBodies.push(wallBody);
      this.world.addBody(wallBody);
    }

    this.handleSocketConnection();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  public update() {
    this.world.step(1 / 60);
    this.cannonDebugger.update();

    this.activePlayers.forEach((activePlayer: PlayerGeometry) => {
      activePlayer.geometry?.position.copy(activePlayer.body?.position as any);
      activePlayer.geometry?.quaternion.copy(activePlayer.body?.quaternion as any);
    });

    this.playerGeometry?.position.copy(this.playerBody?.position as any);
    this.playerGeometry?.quaternion.copy(this.playerBody?.quaternion as any);
  }

  private checkWallCollision(newPosition: Vec3): boolean {
    for (let i = 0; i < this.wallBodies.length; i++) {
      if (newPosition.distanceTo(this.wallBodies[i].position) < 1) {
        return true;
      }
    }
    return false;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isWinnerExists && this.playerBody) {
      const newPosition: Vec3 = this.playerBody.position.clone();

      switch (event.key.toLowerCase()) {
        case 'w':
          newPosition.x += 1;
          break;
        case 'a':
          newPosition.z -= 1;
          break;
        case 's':
          newPosition.x -= 1;
          break;
        case 'd':
          newPosition.z += 1;
          break;
      }

      if (!this.checkWallCollision(newPosition)) {
        this.playerBody.position.copy(newPosition);
        this.socket.emit('setPlayer', this.playerBody.position);
      }
    }
  };

  private handleSocketConnection() {
    this.socket.on('getFinish', (finish: Finish) => {
      this.finish = new Mesh(
        new PlaneGeometry(1, 1),
        new MeshLambertMaterial({ color: finish.color, side: DoubleSide }),
      );
      this.finish.rotateX(-Math.PI / 2);
      this.finish.position.set(finish.position.x, finish.position.y, finish.position.z);
      this.scene.add(this.finish);
    });

    this.socket.on('getPlayer', (player: Player) => {
      this.playerBody = new Body({
        mass: 0,
        shape: new Box(new Vec3(0.5, 0.5, 0.5)),
        collisionFilterGroup: 2,
        collisionFilterMask: 1,
      });
      this.playerBody.position.set(player.position.x, player.position.y, player.position.z);
      (this.playerBody as any).name = player.id;
      this.world.addBody(this.playerBody);

      this.playerGeometry = new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: player.color }));
      this.playerGeometry.castShadow = true;
      this.playerGeometry.name = player.id;
      this.scene.add(this.playerGeometry);
    });

    this.socket.on('joinPlayer', (player: Player) => {
      const newPlayerBody = new Body({
        mass: 0,
        shape: new Box(new Vec3(0.5, 0.5, 0.5)),
        collisionFilterGroup: 2,
        collisionFilterMask: 1,
      });
      newPlayerBody.position.set(player.position.x, player.position.y, player.position.z);
      (newPlayerBody as any).name = player.id;
      this.world.addBody(newPlayerBody);

      const newPlayerGeometry = new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: player.color }));
      newPlayerGeometry.castShadow = true;
      newPlayerGeometry.name = player.id;
      this.scene.add(newPlayerGeometry);

      this.activePlayers.add({ id: player.id, body: newPlayerBody, geometry: newPlayerGeometry });
    });

    this.socket.on('getActivePlayers', (players: Player[]) => {
      players.forEach((player) => {
        if (player.id !== this.socket.id) {
          const newPlayerBody = new Body({
            mass: 0,
            shape: new Box(new Vec3(0.5, 0.5, 0.5)),
            collisionFilterGroup: 2,
            collisionFilterMask: 1,
          });
          newPlayerBody.position.set(player.position.x, player.position.y, player.position.z);
          (newPlayerBody as any).name = player.id;
          this.world.addBody(newPlayerBody);

          const newPlayerGeometry = new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: player.color }));
          newPlayerGeometry.castShadow = true;
          newPlayerGeometry.name = player.id;
          this.scene.add(newPlayerGeometry);

          this.activePlayers.add({ id: player.id, body: newPlayerBody, geometry: newPlayerGeometry });
        }
      });
    });

    this.socket.on('getPlayers', (players: Player[]) => {
      players.forEach((player) => {
        this.activePlayers.forEach((activePlayer) => {
          if (player.id === activePlayer.id) {
            activePlayer.body?.position.set(player.position.x, player.position.y, player.position.z);
          }
        });
      });
    });

    this.socket.on('getWinner', (name: string) => {
      this.isWinnerExists = true;

      const popup = document.createElement('div');
      popup.id = 'winnerDiv';
      popup.textContent = `${name} win!`;

      popup.style.position = 'fixed';
      popup.style.top = '-50px';
      popup.style.left = '0';
      popup.style.right = '0';
      popup.style.height = '50px';
      popup.style.padding = '10px';
      popup.style.textAlign = 'center';
      popup.style.backgroundColor = '#4caf50';
      popup.style.color = 'white';
      popup.style.border = '1px solid #4caf50';
      popup.style.boxShadow = '0px 2px 15px rgba(0,0,0,0.1)';
      popup.style.fontSize = '20px';
      popup.style.lineHeight = '50px';
      popup.style.zIndex = '1000';
      popup.style.transition = 'top 0.5s ease-in-out';

      document.body.appendChild(popup);

      setTimeout(() => {
        popup.style.top = '0';
      }, 100);
    });

    this.socket.on('disconnectPlayer', (id: string) => {
      this.activePlayers.forEach((activePlayer: PlayerGeometry) => {
        if (activePlayer.id === id) {
          activePlayer.body && this.world.removeBody(activePlayer.body);
          activePlayer.geometry && this.scene.remove(activePlayer.geometry);
          this.activePlayers.delete(activePlayer);
        }
      });
    });
  }
}
