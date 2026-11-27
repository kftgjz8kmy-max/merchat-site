import {
  Box3, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial, OrthographicCamera, Quaternion,
  Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export async function loadSneaker(canvas: HTMLCanvasElement, data: ArrayBuffer) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setSize(canvas.width, canvas.height, false);
  let model;
  try {
    ({ scene: model } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(data, ""));
  } catch (error) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }

  const scene = new Scene();
  const pivot = new Group();
  const bounds = new Box3().setFromObject(model);
  model.position.sub(bounds.getCenter(new Vector3()));
  pivot.add(model);
  scene.add(pivot, new HemisphereLight(0xffffff, 0xd2cada, 2.15));
  const key = new DirectionalLight(0xffffff, 2.1);
  key.position.set(2, 4, 4);
  scene.add(key);

  const size = bounds.getSize(new Vector3());
  const halfWidth = Math.max(size.x, size.z) * .63;
  const halfHeight = halfWidth * canvas.height / canvas.width;
  const camera = new OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, .01, 30);
  camera.position.set(-1.63, 1.65, -3.65);
  camera.lookAt(0, 0, 0);

  const up = new Vector3(0, 1, 0);
  const cameraRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const tilt = new Quaternion();
  const radians = Math.PI / 180;

  return {
    draw(yaw: number, pitch: number) {
      pivot.quaternion.setFromAxisAngle(up, yaw * radians);
      pivot.quaternion.premultiply(tilt.setFromAxisAngle(cameraRight, pitch * radians));
      renderer.render(scene, camera);
    },
    dispose() {
      model.traverse(object => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material instanceof MeshStandardMaterial) material.map?.dispose();
          material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
