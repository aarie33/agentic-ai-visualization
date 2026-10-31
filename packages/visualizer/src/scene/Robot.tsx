import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { createRobot, stepRobot, type RobotLayout, type RobotState } from "./behavior";
import { FLOOR_Y } from "./layout";
import { SCENE } from "./palette";

export const ROBOT_SCALE = 1.9;
/** How far the hips drop when seated, in model units. */
const SIT_DROP = 0.15;


function Part({ children, position, rotation }: { children: ReactNode; position?: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  );
}

function Limb({ length, radius, color }: { length: number; radius: number; color: string }) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, Math.max(0.001, length - radius * 2), 4, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export interface RobotProps {
  working: boolean;
  /** Island centre in world space. */
  origin: { x: number; z: number };
  layout: RobotLayout;
  accent: string;
  /** Receives the robot's head position (world) every frame, for chip placement. */
  onHead?: (x: number, y: number, z: number) => void;
  seedOffset?: number;
}

/**
 * A little boxy robot built from primitives. While `working` it walks to its chair, sits and types;
 * otherwise it stands about and strolls around its island.
 */
export function Robot({ working, origin, layout, accent, onHead, seedOffset = 0 }: RobotProps) {
  const { body: WHITE, joint: ORANGE, visor: VISOR, eye: EYE, antenna: ANTENNA } = SCENE.robot;
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const hipL = useRef<Group>(null);
  const hipR = useRef<Group>(null);
  const kneeL = useRef<Group>(null);
  const kneeR = useRef<Group>(null);
  const shoulderL = useRef<Group>(null);
  const shoulderR = useRef<Group>(null);
  const elbowL = useRef<Group>(null);
  const elbowR = useRef<Group>(null);
  const workingRef = useRef(working);
  workingRef.current = working;

  const rand = useMemo(() => {
    let a = 0x9e3779b9 + seedOffset * 7919;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, [seedOffset]);
  const state = useRef<RobotState | null>(null);
  state.current ??= createRobot(layout.waypoints[seedOffset % layout.waypoints.length] ?? { x: 0, z: 1 }, rand);

  useFrame(({ clock }, rawDt) => {
    const s = state.current!;
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime + seedOffset * 3;
    stepRobot(s, workingRef.current, layout, dt, rand);
    const sit = s.sit;
    const stand = 1 - sit;
    const swing = Math.sin(s.phase);
    const walkAmt = s.walking ? 1 : 0;

    if (root.current) {
      root.current.position.set(origin.x + s.x, FLOOR_Y - SIT_DROP * ROBOT_SCALE * sit, origin.z + s.z);
      root.current.rotation.y = s.heading;
    }
    if (body.current) {
      const bob = s.walking ? Math.abs(Math.sin(s.phase)) * 0.03 : Math.sin(t * 1.6) * 0.008 * stand;
      body.current.position.y = bob;
      body.current.rotation.x = sit * 0.12;
    }
    if (head.current) {
      head.current.rotation.y = s.walking ? 0 : Math.sin(t * 0.6) * 0.5 * stand;
      head.current.rotation.x = sit * (0.18 + Math.sin(t * 3.2) * 0.05);
    }

    const legSwing = swing * 0.65 * walkAmt * stand;
    if (hipL.current) hipL.current.rotation.x = -Math.PI / 2 * sit + legSwing;
    if (hipR.current) hipR.current.rotation.x = -Math.PI / 2 * sit - legSwing;
    if (kneeL.current) kneeL.current.rotation.x = (Math.PI / 2) * sit + Math.max(0, -Math.cos(s.phase)) * 0.8 * walkAmt * stand;
    if (kneeR.current) kneeR.current.rotation.x = (Math.PI / 2) * sit + Math.max(0, Math.cos(s.phase)) * 0.8 * walkAmt * stand;

    const armSwing = swing * 0.55 * walkAmt * stand;
    const typeL = Math.sin(t * 13) * 0.07 * sit;
    const typeR = Math.sin(t * 13 + 2.1) * 0.07 * sit;
    if (shoulderL.current) shoulderL.current.rotation.x = -1.05 * sit + armSwing + typeL;
    if (shoulderR.current) shoulderR.current.rotation.x = -1.05 * sit - armSwing + typeR;
    if (elbowL.current) elbowL.current.rotation.x = -0.75 * sit + Math.sin(t * 17) * 0.16 * sit - (walkAmt ? 0.25 : 0);
    if (elbowR.current) elbowR.current.rotation.x = -0.75 * sit + Math.sin(t * 17 + 1.3) * 0.16 * sit - (walkAmt ? 0.25 : 0);

    if (onHead) onHead(origin.x + s.x, FLOOR_Y - SIT_DROP * ROBOT_SCALE * sit + 1.22 * ROBOT_SCALE, origin.z + s.z);
  });

  return (
    <group ref={root} scale={ROBOT_SCALE}>
      <group ref={body}>
        {/* torso */}
        <RoundedBox args={[0.34, 0.36, 0.22]} radius={0.06} position={[0, 0.48, 0]} castShadow>
          <meshStandardMaterial color={WHITE} />
        </RoundedBox>
        <mesh position={[0, 0.5, 0.115]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.02]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.3, 0.05, 0.2]} />
          <meshStandardMaterial color={ORANGE} />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, 0.7, 0]}>
          <RoundedBox args={[0.36, 0.28, 0.3]} radius={0.07} position={[0, 0.17, 0]} castShadow>
            <meshStandardMaterial color={WHITE} />
          </RoundedBox>
          <mesh position={[0, 0.17, 0.152]}>
            <boxGeometry args={[0.27, 0.15, 0.02]} />
            <meshStandardMaterial color={VISOR} />
          </mesh>
          <mesh position={[-0.058, 0.175, 0.166]}>
            <boxGeometry args={[0.045, 0.07, 0.01]} />
            <meshStandardMaterial color={EYE} emissive={EYE} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.058, 0.175, 0.166]}>
            <boxGeometry args={[0.045, 0.07, 0.01]} />
            <meshStandardMaterial color={EYE} emissive={EYE} emissiveIntensity={1.2} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.2, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.065, 0.065, 0.04, 14]} />
              <meshStandardMaterial color={ORANGE} />
            </mesh>
          ))}
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
            <meshStandardMaterial color={ANTENNA} />
          </mesh>
          <mesh position={[0, 0.43, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
          </mesh>
        </group>

        {/* arms */}
        {([-1, 1] as const).map((side) => (
          <Part key={side} position={[side * 0.23, 0.62, 0]}>
            <group ref={side === -1 ? shoulderL : shoulderR}>
              <mesh castShadow>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshStandardMaterial color={ORANGE} />
              </mesh>
              <Limb length={0.17} radius={0.04} color={WHITE} />
              <group position={[0, -0.17, 0]} ref={side === -1 ? elbowL : elbowR}>
                <Limb length={0.16} radius={0.036} color={ORANGE} />
                <mesh position={[0, -0.17, 0]} castShadow>
                  <sphereGeometry args={[0.052, 10, 10]} />
                  <meshStandardMaterial color={WHITE} />
                </mesh>
              </group>
            </group>
          </Part>
        ))}
      </group>

      {/* legs live outside the bobbing body so feet stay planted */}
      {([-1, 1] as const).map((side) => (
        <Part key={side} position={[side * 0.09, 0.3, 0]}>
          <group ref={side === -1 ? hipL : hipR}>
            <Limb length={0.15} radius={0.045} color={WHITE} />
            <group position={[0, -0.15, 0]} ref={side === -1 ? kneeL : kneeR}>
              <Limb length={0.15} radius={0.04} color={ORANGE} />
              <mesh position={[0, -0.16, 0.03]} castShadow>
                <boxGeometry args={[0.11, 0.05, 0.17]} />
                <meshStandardMaterial color={WHITE} />
              </mesh>
            </group>
          </group>
        </Part>
      ))}
    </group>
  );
}
