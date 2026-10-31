import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { MOUSE, TOUCH, Vector3, type Group } from "three";
import { AGENT_ROLES, type AgentRole, type Snapshot } from "@virtual-office/shared";
import { Island } from "./Island";
import {
  APPROACH,
  FLOOR_Y,
  ISLAND,
  ISLAND_AT,
  LOUNGE,
  ROBOT_COLOR,
  SEAT,
  SEAT_FACING,
  TOPICS_AT,
  WAYPOINTS,
} from "./layout";
import { Lounge } from "./Lounge";
import { Model } from "./Model";
import { Box, COLOR, Papers, Place } from "./props";
import { SCENE } from "./palette";
import { Robot } from "./Robot";
import { Workstation } from "./Workstation";

export type AnchorKey = AgentRole | "topics" | "lounge";
export type Anchors = MutableRefObject<Partial<Record<AnchorKey, HTMLElement | null>>>;

const layout = { approach: APPROACH, seat: SEAT, seatFacing: SEAT_FACING, waypoints: WAYPOINTS };
const CENTER = new Vector3(-1.5, 0.4, 1.0);
const HANDOFF_ANIM_S = 1.1;

/** Fits the whole office in view and keeps it fitted on resize. */
function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    // On narrow screens the office is wider than the view; a readable zoom wins and the User pans.
    camera.zoom = Math.max(26, Math.min(size.width / 33, size.height / 14));
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return (
    <OrbitControls
      makeDefault
      enableRotate={false}
      screenSpacePanning
      enableDamping
      minZoom={22}
      maxZoom={160}
      target={CENTER}
      mouseButtons={{ LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
      touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
    />
  );
}

const projected = new Vector3();

/** Moves the DOM chip for `key` so it hangs over the world point (x, y, z). */
function useAnchorProjector(anchors: Anchors) {
  const { camera, size } = useThree();
  return (key: AnchorKey, x: number, y: number, z: number) => {
    const el = anchors.current[key];
    if (!el) return;
    projected.set(x, y, z).project(camera);
    const px = (projected.x * 0.5 + 0.5) * size.width;
    const py = (-projected.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`;
    el.dataset.placed = "true";
  };
}

function Beacon({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current && active) ref.current.rotation.y += dt * 4;
  });
  return (
    <group ref={ref} position={position}>
      <Model name="warning-orange" scale={0.9} />
    </group>
  );
}

/** A plank between two rooms, along x or z. */
function Walkway({ at, along, from, to }: { at: number; along: "x" | "z"; from: number; to: number }) {
  const length = Math.abs(to - from) + 0.3;
  const mid = (from + to) / 2;
  return (
    <mesh position={along === "x" ? [mid, FLOOR_Y - 0.14, at] : [at, FLOOR_Y - 0.14, mid]} receiveShadow>
      <boxGeometry args={along === "x" ? [length, 0.14, 1.2] : [1.2, 0.14, length]} />
      <meshStandardMaterial color={SCENE.island.walkway} />
    </mesh>
  );
}

function Station({ role, working }: { role: AgentRole; working: boolean }) {
  const at = ISLAND_AT[role];
  return (
    <group position={[at.x, 0, at.z]}>
      <Island>
        <Workstation role={role} />
        <Beacon position={[-2.35, 0, 1.75]} active={working} />
      </Island>
    </group>
  );
}

function TopicsPad({ count }: { count: number }) {
  const boxes = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    x: (i % 5) * 0.52 - 1.04,
    z: Math.floor(i / 5) * 0.5 + 0.35,
    key: i,
  }));
  return (
    <group position={[TOPICS_AT.x, 0, TOPICS_AT.z]}>
      <Island w={3.4} d={3.4}>
        <group position={[0, 0, -1]}>
          <Model name="hopper-square" scale={0.95} />
        </group>
        <Place position={[1.25, 0, -1.2]}>
          <Box size={[0.5, 0.5, 0.5]} color={COLOR.blue} round={0.03} />
          <Papers position={[0, 0.5, 0]} sheets={5} />
        </Place>
        {boxes.map((b) => (
          <Model key={b.key} name="box-small" position={[b.x, 0, b.z]} scale={0.8} rotation={[0, (b.key % 3) * 0.2 - 0.2, 0]} />
        ))}
      </Island>
    </group>
  );
}

/** The document that moves from one station to the next while a Handoff is announced. */
function HandoffItem({ handoff }: { handoff: Snapshot["handoff"] }) {
  const ref = useRef<Group>(null);
  const startedAt = useRef(0);
  const key = handoff ? `${handoff.from}>${handoff.to}` : "";
  const from = handoff ? ISLAND_AT[handoff.from] : null;
  const to = handoff ? ISLAND_AT[handoff.to] : null;

  useEffect(() => {
    startedAt.current = performance.now();
  }, [key]);

  useFrame(() => {
    const g = ref.current;
    if (!g || !from || !to) return;
    const t = Math.min(1, (performance.now() - startedAt.current) / 1000 / HANDOFF_ANIM_S);
    const ease = t * t * (3 - 2 * t);
    g.position.set(from.x + (to.x - from.x) * ease, FLOOR_Y + 1.5 + Math.sin(t * Math.PI) * 1.1, from.z + (to.z - from.z) * ease);
    g.rotation.y += 0.05;
  });

  if (!handoff) return null;
  return (
    <group ref={ref}>
      <Model name="box-small" scale={0.55} />
    </group>
  );
}

function Office3D({ snapshot, anchors }: { snapshot: Snapshot; anchors: Anchors }) {
  const place = useAnchorProjector(anchors);
  const working = (role: AgentRole) => snapshot.agents.find((a) => a.role === role)?.status === "working";

  useFrame(() => {
    place("topics", TOPICS_AT.x, FLOOR_Y + 1.7, TOPICS_AT.z);
    place("lounge", LOUNGE.x, FLOOR_Y + 2.4, LOUNGE.z - 0.4);
  });

  return (
    <>
      <ambientLight intensity={SCENE.light.ambient} color={SCENE.light.ambientColor} />
      <hemisphereLight args={[SCENE.light.hemiSky, SCENE.light.hemiGround, SCENE.light.hemiIntensity]} />
      <directionalLight
        castShadow
        position={[9, 14, 7]}
        intensity={SCENE.light.sun}
        color={SCENE.light.sunColor}
        shadow-mapSize={[3072, 3072]}
        shadow-camera-left={-26}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-12}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
      />

      <Walkway along="x" at={0} from={TOPICS_AT.x + 1.7} to={ISLAND_AT.scout.x - ISLAND.w / 2} />
      <Walkway along="x" at={0} from={ISLAND_AT.scout.x + ISLAND.w / 2} to={ISLAND_AT.quill.x - ISLAND.w / 2} />
      <Walkway along="x" at={0} from={ISLAND_AT.quill.x + ISLAND.w / 2} to={ISLAND_AT.herald.x - ISLAND.w / 2} />
      <Walkway along="z" at={ISLAND_AT.quill.x} from={ISLAND.d / 2} to={LOUNGE.z - LOUNGE.d / 2} />
      <Walkway along="z" at={ISLAND_AT.scout.x + 1.6} from={ISLAND.d / 2} to={LOUNGE.z - LOUNGE.d / 2} />

      <TopicsPad count={snapshot.queue.length} />
      {AGENT_ROLES.map((role) => (
        <Station key={role} role={role} working={working(role)} />
      ))}
      <Lounge />

      {AGENT_ROLES.map((role, i) => (
        <Robot
          key={role}
          working={working(role)}
          origin={ISLAND_AT[role]}
          layout={layout}
          accent={ROBOT_COLOR[role]}
          seedOffset={i + 1}
          onHead={(x, y, z) => place(role, x, y, z)}
        />
      ))}

      <HandoffItem handoff={snapshot.handoff} />
    </>
  );
}

export default function Scene3D({ snapshot, anchors }: { snapshot: Snapshot; anchors: Anchors }) {
  const camera = useMemo(
    () => ({ position: [CENTER.x + 14, CENTER.y + 14, CENTER.z + 14] as [number, number, number], near: -100, far: 200, zoom: 60 }),
    [],
  );
  return (
    <Canvas flat orthographic shadows="soft" camera={camera} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
      <Rig />
      <Office3D snapshot={snapshot} anchors={anchors} />
    </Canvas>
  );
}

export type { ReactNode };
