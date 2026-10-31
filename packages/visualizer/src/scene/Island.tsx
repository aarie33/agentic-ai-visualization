import { ISLAND } from "./layout";
import { SCENE } from "./palette";

/** A floating white platform, like one room of the office. */
export function Island({ w = ISLAND.w, d = ISLAND.d, h = ISLAND.h, floor = SCENE.island.top, children }: { w?: number; d?: number; h?: number; floor?: string; children?: React.ReactNode }) {
  return (
    <group>
      <mesh position={[0, h / 2 - 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={SCENE.island.side} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[w - 0.2, 0.12, d - 0.2]} />
        <meshStandardMaterial color={SCENE.island.base} />
      </mesh>
      <mesh position={[0, h + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.5, d - 0.5]} />
        <meshStandardMaterial color={floor} />
      </mesh>
      <group position={[0, h, 0]}>{children}</group>
    </group>
  );
}
