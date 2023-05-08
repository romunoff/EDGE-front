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

export class SceneManager {
  private readonly scene: Scene;
  private readonly world: World;
  private readonly textureLoader: TextureLoader;
  private readonly cannonDebugger;
  private readonly socket;

  private readonly activePlayers = new Set<PlayerGeometry>();

  private playerBody?: Body;
  private playerGeometry?: Mesh;
  private finish?: Mesh;

  private isWinnerExists = false;

  constructor() {
    this.scene = new Scene();
    this.world = new World();
    this.textureLoader = new TextureLoader();
    this.world.gravity.set(0, -9.82, 0);
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
    light.position.set(-10, 10, 0);
    light.castShadow = true;
    this.scene.add(light);

    const lightHelper = new DirectionalLightHelper(light, 3);
    this.scene.add(lightHelper);

    const planeBody = new Body({
      type: Body.STATIC,
      shape: new Plane(),
    });
    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(planeBody);

    const plane = new Mesh(new PlaneGeometry(10, 10), new MeshLambertMaterial({ color: 'white', side: DoubleSide }));
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

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isWinnerExists && this.playerBody) {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.playerBody.position.x += 1;
          break;
        case 'a':
          this.playerBody.position.z -= 1;
          break;
        case 's':
          this.playerBody.position.x -= 1;
          break;
        case 'd':
          this.playerBody.position.z += 1;
          break;
      }

      this.socket.emit('setPlayer', this.playerBody.position);
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
        mass: 1,
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
        mass: 1,
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
            mass: 1,
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

    this.socket.on('getWinner', (id: string) => {
      this.isWinnerExists = true;

      // Create a new div
      const winnerDiv = document.createElement('div');
      winnerDiv.textContent = `Player ${id} win!`;
      winnerDiv.style.position = 'absolute';
      winnerDiv.style.top = '10px';
      winnerDiv.style.left = '10px';
      winnerDiv.style.padding = '10px';
      winnerDiv.style.backgroundColor = 'white';
      winnerDiv.style.border = '1px solid black';
      winnerDiv.style.zIndex = '1000'; // Ensure the div is on top of the scene

      document.body.appendChild(winnerDiv);
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
