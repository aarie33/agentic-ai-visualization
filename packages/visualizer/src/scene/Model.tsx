import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { TextureLoader, type Material, type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { PALETTE } from "./palette";

const MODELS = [
  "screen-wide", "screen-flat", "screen-panel-wide", "screen-small", "scanner-low", "machine", "robot-arm-a",
  "hopper-square", "conveyor-long", "conveyor", "box-small", "box-large", "box-long", "warning-orange", "cog-a",
  "top-large-checkerboard", "structure-short", "button-floor-round",
] as const;
export type ModelName = (typeof MODELS)[number];

const url = (name: ModelName) => `/models/${name}.glb`;
MODELS.forEach((m) => useGLTF.preload(url(m)));

export interface ModelProps {
  name: ModelName;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

/** A copy of the material whose colour map shows `image`; texture settings stay as the glTF loader set them. */
function retexture(material: Material | Material[], image: unknown): Material | Material[] {
  if (Array.isArray(material)) return material.map((m) => retexture(m, image) as Material);
  const source = material as MeshStandardMaterial;
  if (!source.map) return material;
  const copy = source.clone();
  copy.map = source.map.clone();
  copy.map.image = image as HTMLImageElement;
  copy.map.needsUpdate = true;
  return copy;
}

/** One Kenney Factory Kit model (CC0), cloned so it can be placed many times. */
export function Model({ name, position, rotation, scale = 1 }: ModelProps) {
  const { scene } = useGLTF(url(name));
  // Every Kenney model is painted from one colour map; each theme brings its own recoloured copy of it.
  const themed = useLoader(TextureLoader, PALETTE.texture);
  const clone = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((o: Object3D) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = retexture(mesh.material as MeshStandardMaterial, themed.image);
    });
    return copy;
  }, [scene, themed]);
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
}
