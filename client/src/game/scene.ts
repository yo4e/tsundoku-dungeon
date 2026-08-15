import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "./GameWorld";
import type { GameAction, GameSnapshot } from "./types";

export type GameHandle = {
  scene: Scene;
  act: (action: GameAction) => void;
  dispose: () => void;
};

export async function createGameScene(
  engine: Engine,
  _canvas: HTMLCanvasElement,
  onSnapshot: (snapshot: GameSnapshot) => void,
): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.037, 0.075, 1);

  const camera = new ArcRotateCamera("shelf-camera", -Math.PI / 2, 0.015, 12, Vector3.Zero(), scene);
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.lowerBetaLimit = 0.015;
  camera.upperBetaLimit = 0.015;
  camera.lowerRadiusLimit = 12;
  camera.upperRadiusLimit = 12;
  const sizeCamera = () => {
    const height = 9.35;
    const aspect = Math.max(0.65, engine.getRenderWidth() / Math.max(1, engine.getRenderHeight()));
    camera.orthoTop = height / 2;
    camera.orthoBottom = -height / 2;
    camera.orthoLeft = (-height * aspect) / 2;
    camera.orthoRight = (height * aspect) / 2;
  };
  sizeCamera();

  const ambient = new HemisphericLight("library-ambient", new Vector3(0.1, 1, 0.15), scene);
  ambient.intensity = 0.85;
  ambient.diffuse = Color3.FromHexString("#f7e7c4");
  ambient.groundColor = Color3.FromHexString("#16172d");

  const world = new GameWorld(scene, onSnapshot);
  world.initialize();
  scene.onBeforeRenderObservable.add(() => {
    sizeCamera();
    world.update(scene.getEngine().getDeltaTime() / 1000);
  });

  return {
    scene,
    act: (action) => world.act(action),
    dispose: () => world.dispose(),
  };
}
