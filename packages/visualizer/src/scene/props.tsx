import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import { COLOR, SCENE } from "./palette";

export type V3 = [number, number, number];

export { COLOR } from "./palette";

interface PlaceProps {
  position?: V3;
  rotation?: V3;
  scale?: number | V3;
  children?: ReactNode;
}

/** Group with the position being the bottom centre of whatever is inside. */
export function Place({ position, rotation, scale, children }: PlaceProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {children}
    </group>
  );
}

interface BoxProps {
  size: V3;
  position?: V3;
  rotation?: V3;
  color: string;
  /** Corner radius; 0 gives a hard box. */
  round?: number;
  emissive?: number;
}

/** A box resting on `position` (bottom centre). */
export function Box({ size, position = [0, 0, 0], rotation, color, round = 0, emissive = 0 }: BoxProps) {
  const at: V3 = [position[0], position[1] + size[1] / 2, position[2]];
  return round > 0 ? (
    <RoundedBox args={size} radius={Math.min(round, Math.min(...size) / 2 - 0.001)} smoothness={3} position={at} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </RoundedBox>
  ) : (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={emissive ? color : "#000"} emissiveIntensity={emissive} />
    </mesh>
  );
}

export function Cylinder({ r, h, rTop, position = [0, 0, 0], color, segments = 20 }: { r: number; h: number; rTop?: number; position?: V3; color: string; segments?: number }) {
  return (
    <mesh position={[position[0], position[1] + h / 2, position[2]]} castShadow receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, segments]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Ball({ r, position = [0, 0, 0], scale, color }: { r: number; position?: V3; scale?: V3; color: string }) {
  return (
    <mesh position={[position[0], position[1] + r, position[2]]} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[r, 18, 14]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- desk things */

/** A neat stack of paper, a little skewed. */
export function Papers({ position, rotation = [0, 0, 0], sheets = 5 }: { position: V3; rotation?: V3; sheets?: number }) {
  return (
    <Place position={position} rotation={rotation}>
      {Array.from({ length: sheets }, (_, i) => (
        <Box key={i} size={[0.3, 0.012, 0.22]} position={[(i % 2) * 0.008, i * 0.012, ((i * 3) % 4) * 0.005]} rotation={[0, (i - sheets / 2) * 0.05, 0]} color={COLOR.paper} />
      ))}
      <Box size={[0.2, 0.002, 0.012]} position={[0, sheets * 0.012 + 0.001, -0.04]} color={COLOR.gray} />
      <Box size={[0.2, 0.002, 0.012]} position={[0, sheets * 0.012 + 0.001, 0]} color={COLOR.gray} />
    </Place>
  );
}

export function Book({ position, rotation, size = [0.22, 0.05, 0.3], color }: { position: V3; rotation?: V3; size?: V3; color: string }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={size} color={color} />
      <Box size={[size[0] - 0.02, size[1] - 0.012, size[2] + 0.006]} position={[0.01, 0.006, 0]} color={COLOR.paper} />
    </Place>
  );
}

export function BookStack({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <Place position={position} rotation={rotation}>
      <Book position={[0, 0, 0]} color={COLOR.blue} />
      <Book position={[0.01, 0.05, 0]} rotation={[0, 0.2, 0]} size={[0.2, 0.045, 0.27]} color={COLOR.orange} />
      <Book position={[-0.005, 0.095, 0.005]} rotation={[0, -0.15, 0]} size={[0.18, 0.04, 0.24]} color={COLOR.teal} />
    </Place>
  );
}

export function OpenBook({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[0.38, 0.02, 0.27]} color={COLOR.blue} />
      <Box size={[0.17, 0.018, 0.25]} position={[-0.09, 0.02, 0]} rotation={[0, 0, 0.06]} color={COLOR.paper} />
      <Box size={[0.17, 0.018, 0.25]} position={[0.09, 0.02, 0]} rotation={[0, 0, -0.06]} color={COLOR.paper} />
    </Place>
  );
}

export function Mug({ position, color = COLOR.orange }: { position: V3; color?: string }) {
  return (
    <Place position={position}>
      <Cylinder r={0.045} h={0.1} color={color} segments={16} />
      <mesh position={[0.055, 0.055, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.03, 0.009, 8, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Place>
  );
}

export function DeskLamp({ position, rotation, color = COLOR.mustard }: { position: V3; rotation?: V3; color?: string }) {
  return (
    <Place position={position} rotation={rotation}>
      <Cylinder r={0.08} h={0.025} color={COLOR.ink} />
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color={COLOR.gray} />
      </mesh>
      <mesh position={[-0.07, 0.4, 0]} rotation={[0, 0, 1.9]} castShadow>
        <coneGeometry args={[0.1, 0.16, 16, 1, true]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
      <Ball r={0.025} position={[-0.09, 0.36, 0]} color="#fff6c8" />
    </Place>
  );
}

export function Keyboard({ position }: { position: V3 }) {
  return (
    <Place position={position}>
      <Box size={[0.17, 0.025, 0.48]} color={COLOR.white} round={0.008} />
      <Box size={[0.13, 0.006, 0.42]} position={[0, 0.025, 0]} color={COLOR.gray} />
    </Place>
  );
}

export function Mouse({ position }: { position: V3 }) {
  return (
    <Place position={position}>
      <Ball r={0.05} scale={[0.9, 0.5, 0.65]} color={COLOR.white} />
    </Place>
  );
}

/** The desk itself, legs as two side panels so knees fit underneath. */
export function DeskFrame({ w, d, topY, accent }: { w: number; d: number; topY: number; accent: string }) {
  return (
    <Place>
      <Box size={[d, 0.06, w]} position={[0, topY - 0.06, 0]} color={COLOR.blue} round={0.012} />
      <Box size={[d + 0.002, 0.014, w + 0.002]} position={[0, topY - 0.074, 0]} color={accent} />
      {[-1, 1].map((side) => (
        <Box key={side} size={[d - 0.06, topY - 0.07, 0.06]} position={[0, 0, side * (w / 2 - 0.05)]} color={COLOR.orange} />
      ))}
      <Box size={[0.06, topY * 0.5, w - 0.2]} position={[d / 2 - 0.08, topY * 0.35, 0]} color={COLOR.orange} />
      {/* drawer unit */}
      <Box size={[d - 0.16, 0.5, 0.5]} position={[0, 0.02, -w / 2 + 0.38]} color={COLOR.woodDark} round={0.01} />
      <Box size={[0.01, 0.07, 0.2]} position={[(d - 0.16) / 2, 0.36, -w / 2 + 0.38]} color={COLOR.mustard} />
      <Box size={[0.01, 0.07, 0.2]} position={[(d - 0.16) / 2, 0.18, -w / 2 + 0.38]} color={COLOR.mustard} />
    </Place>
  );
}

/** An office chair; its front is +z. */
export function Chair({ color = COLOR.orange }: { color?: string }) {
  return (
    <Place>
      <Cylinder r={0.04} h={0.2} position={[0, 0.03, 0]} color={COLOR.ink} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} size={[0.05, 0.03, 0.3]} position={[Math.sin((i * Math.PI * 2) / 5) * 0.14, 0, Math.cos((i * Math.PI * 2) / 5) * 0.14]} rotation={[0, (i * Math.PI * 2) / 5, 0]} color={COLOR.ink} />
      ))}
      <Box size={[0.58, 0.09, 0.58]} position={[0, 0.2, 0]} color={color} round={0.035} />
      <Box size={[0.54, 0.46, 0.07]} position={[0, 0.3, -0.31]} color={color} round={0.03} />
    </Place>
  );
}

/* ---------------------------------------------------------------- room things */

export function Plant({ position, scale = 1, pot = COLOR.orange }: { position: V3; scale?: number; pot?: string }) {
  return (
    <Place position={position} scale={scale}>
      <Cylinder r={0.14} rTop={0.19} h={0.3} color={pot} />
      <Cylinder r={0.17} h={0.02} position={[0, 0.3, 0]} color="#5a4636" />
      <Ball r={0.2} position={[0, 0.3, 0]} scale={[1, 1.25, 1]} color={COLOR.green} />
      <Ball r={0.15} position={[0.13, 0.42, 0.05]} color={COLOR.greenDark} />
      <Ball r={0.14} position={[-0.12, 0.46, -0.06]} color={COLOR.green} />
      <Ball r={0.12} position={[0.02, 0.6, 0.02]} color={COLOR.greenDark} />
    </Place>
  );
}

/** A bookcase whose front is +z. Books get deterministic colours and heights. */
export function Bookshelf({ position, rotation, w = 1.5, h = 1.9, shelves = 4 }: { position: V3; rotation?: V3; w?: number; h?: number; shelves?: number }) {
  const gap = h / shelves;
  const hues = [COLOR.blue, COLOR.orange, COLOR.teal, COLOR.pink, COLOR.mustard, COLOR.navy, COLOR.blueSoft];
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[0.04, h, 0.42]} position={[-w / 2, 0, 0]} color={COLOR.wood} />
      <Box size={[0.04, h, 0.42]} position={[w / 2, 0, 0]} color={COLOR.wood} />
      <Box size={[w, h, 0.03]} position={[0, 0, -0.2]} color={COLOR.woodDark} />
      {Array.from({ length: shelves + 1 }, (_, s) => (
        <Box key={s} size={[w, 0.04, 0.42]} position={[0, s * gap - (s === shelves ? 0.04 : 0), 0]} color={COLOR.wood} />
      ))}
      {Array.from({ length: shelves }, (_, s) => {
        let x = -w / 2 + 0.1;
        const books: ReactNode[] = [];
        let i = 0;
        while (x < w / 2 - 0.12) {
          const seed = s * 13 + i * 7;
          const bw = 0.05 + ((seed * 3) % 5) * 0.012;
          const bh = gap * (0.55 + ((seed * 5) % 4) * 0.1);
          if ((seed + s) % 7 !== 0) books.push(<Box key={i} size={[bw, bh, 0.26]} position={[x + bw / 2, s * gap + 0.04, 0.02]} color={hues[seed % hues.length]!} />);
          x += bw + 0.008;
          i++;
        }
        return <Place key={s}>{books}</Place>;
      })}
    </Place>
  );
}

/** A free-standing cork board with sticky notes. Front is +z. */
export function Pinboard({ position, rotation, w = 1.5, h = 0.95, notes = 7 }: { position: V3; rotation?: V3; w?: number; h?: number; notes?: number }) {
  const tints = [COLOR.mustard, COLOR.pink, COLOR.blueSoft, COLOR.teal, COLOR.orange];
  return (
    <Place position={position} rotation={rotation}>
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.06, 0.55, 0.06]} position={[s * (w / 2 - 0.1), 0, 0]} color={COLOR.ink} />
      ))}
      <Box size={[w + 0.08, h + 0.08, 0.05]} position={[0, 0.55, 0]} color={COLOR.woodDark} />
      <Box size={[w, h, 0.03]} position={[0, 0.57, 0.03]} color={COLOR.cork} />
      {Array.from({ length: notes }, (_, i) => (
        <Box key={i} size={[0.2, 0.2, 0.006]} position={[-w / 2 + 0.18 + (i % 4) * 0.37 + (i > 3 ? 0.14 : 0), 0.66 + (i > 3 ? 0.28 : 0.04) + ((i * 7) % 3) * 0.04, 0.047]} rotation={[0, 0, ((i * 5) % 7) * 0.04 - 0.1]} color={tints[i % tints.length]!} />
      ))}
    </Place>
  );
}

export function FilingCabinet({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[0.55, 1.05, 0.5]} color={COLOR.gray} round={0.02} />
      {[0, 1, 2].map((i) => (
        <Box key={i} size={[0.44, 0.26, 0.012]} position={[0, 0.07 + i * 0.33, 0.255]} color="#b5b7cc" />
      ))}
      {[0, 1, 2].map((i) => (
        <Box key={i} size={[0.14, 0.03, 0.02]} position={[0, 0.21 + i * 0.33, 0.27]} color={COLOR.ink} />
      ))}
      <Papers position={[0.05, 1.05, 0]} sheets={4} />
    </Place>
  );
}

export function Tray({ position, rotation, envelopes = 4 }: { position: V3; rotation?: V3; envelopes?: number }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[0.5, 0.02, 0.38]} color={COLOR.blue} />
      <Box size={[0.5, 0.1, 0.02]} position={[0, 0, 0.18]} color={COLOR.blue} />
      <Box size={[0.5, 0.1, 0.02]} position={[0, 0, -0.18]} color={COLOR.blue} />
      <Box size={[0.02, 0.1, 0.38]} position={[0.24, 0, 0]} color={COLOR.blue} />
      <Box size={[0.02, 0.1, 0.38]} position={[-0.24, 0, 0]} color={COLOR.blue} />
      {Array.from({ length: envelopes }, (_, i) => (
        <Box key={i} size={[0.3, 0.012, 0.2]} position={[(i - 1.5) * 0.02, 0.02 + i * 0.013, 0]} rotation={[0, (i - 1.5) * 0.12, 0]} color={i % 2 ? COLOR.paper : "#fff2d6"} />
      ))}
    </Place>
  );
}

export function Megaphone({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <Place position={position} rotation={rotation}>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.16, 0.34, 18, 1, true]} />
        <meshStandardMaterial color={COLOR.pink} side={2} />
      </mesh>
      <Cylinder r={0.05} h={0.14} position={[-0.2, 0.09, 0]} color={COLOR.ink} />
      <Box size={[0.05, 0.14, 0.04]} position={[-0.18, 0, 0]} color={COLOR.ink} />
    </Place>
  );
}

/** Four tiles in the Platforms' colours, like a "published" board. */
export function PublishBoard({ position, rotation }: { position: V3; rotation?: V3 }) {
  const tiles = ["#1d1f33", "#0a66c2", "#d62d86", "#14b8b8"];
  return (
    <Place position={position} rotation={rotation}>
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.06, 0.55, 0.06]} position={[s * 0.62, 0, 0]} color={COLOR.ink} />
      ))}
      <Box size={[1.46, 0.9, 0.05]} position={[0, 0.55, 0]} color={COLOR.white} round={0.03} />
      {tiles.map((c, i) => (
        <Box key={i} size={[0.3, 0.3, 0.02]} position={[-0.48 + i * 0.32, 0.9, 0.035]} color={c} round={0.04} emissive={0.12} />
      ))}
      {tiles.map((c, i) => (
        <Box key={i} size={[0.26, 0.04, 0.012]} position={[-0.48 + i * 0.32, 0.72, 0.035]} color={c} />
      ))}
      <Box size={[1.2, 0.04, 0.012]} position={[0, 0.62, 0.035]} color={COLOR.gray} />
    </Place>
  );
}

/* ---------------------------------------------------------------- lounge things */

/** A sofa with its front toward +z. `length` is the width along x. */
export function Sofa({ position, rotation, length = 2.6, color = COLOR.blue, cushion = COLOR.mustard }: { position: V3; rotation?: V3; length?: number; color?: string; cushion?: string }) {
  const seats = Math.max(2, Math.round(length / 0.85));
  const seatW = (length - 0.5) / seats;
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[length, 0.28, 0.95]} position={[0, 0.06, 0]} color={color} round={0.06} />
      <Box size={[length, 0.7, 0.28]} position={[0, 0.2, -0.34]} color={color} round={0.08} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.26, 0.55, 0.95]} position={[s * (length / 2 - 0.13), 0.06, 0]} color={color} round={0.07} />
      ))}
      {Array.from({ length: seats }, (_, i) => (
        <Box key={i} size={[seatW - 0.03, 0.14, 0.62]} position={[-length / 2 + 0.25 + seatW * (i + 0.5), 0.34, 0.1]} color="#4b50cc" round={0.05} />
      ))}
      <Box size={[0.36, 0.34, 0.12]} position={[-length / 2 + 0.55, 0.46, -0.05]} rotation={[0.2, 0.3, 0.1]} color={cushion} round={0.05} />
      <Box size={[0.34, 0.32, 0.12]} position={[length / 2 - 0.6, 0.46, -0.05]} rotation={[0.2, -0.25, -0.1]} color={COLOR.pink} round={0.05} />
      {[-1, 1].map((s) => (
        <Cylinder key={s} r={0.04} h={0.07} position={[s * (length / 2 - 0.15), 0, 0.35]} color={COLOR.ink} />
      ))}
    </Place>
  );
}

export function CoffeeTable({ position, rotation, w = 1.3, d = 0.7 }: { position: V3; rotation?: V3; w?: number; d?: number }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[w, 0.05, d]} position={[0, 0.34, 0]} color={COLOR.wood} round={0.02} />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
        <Box key={i} size={[0.05, 0.34, 0.05]} position={[a! * (w / 2 - 0.08), 0, b! * (d / 2 - 0.08)]} color={COLOR.woodDark} />
      ))}
      <OpenBook position={[-0.3, 0.39, 0.05]} rotation={[0, 0.3, 0]} />
      <Mug position={[0.3, 0.39, -0.1]} color={COLOR.teal} />
      <Mug position={[0.45, 0.39, 0.12]} color={COLOR.pink} />
      <Plant position={[0.05, 0.39, -0.18]} scale={0.32} pot={COLOR.white} />
    </Place>
  );
}

export function Rug({ position, w, d, color = SCENE.island.rug, border = SCENE.island.rugBorder }: { position: V3; w: number; d: number; color?: string; border?: string }) {
  return (
    <Place position={position}>
      <Box size={[w, 0.012, d]} color={border} round={0.004} />
      <Box size={[w - 0.3, 0.016, d - 0.3]} color={color} />
    </Place>
  );
}

/** A flat-screen TV seen from either side; its screen faces +z. */
export function Television({ position, rotation, w = 1.9 }: { position: V3; rotation?: V3; w?: number }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[w + 0.3, 0.45, 0.5]} color={COLOR.wood} round={0.03} />
      <Box size={[w, 0.06, 0.2]} position={[0, 0.45, 0]} color={COLOR.ink} />
      <Box size={[w, 1.05, 0.07]} position={[0, 0.5, 0]} color="#15162b" round={0.02} />
      <Box size={[w - 0.14, 0.9, 0.02]} position={[0, 0.58, 0.04]} color="#3a3f9e" emissive={0.55} />
      <Box size={[0.5, 0.05, 0.02]} position={[-0.3, 0.9, 0.056]} color="#9ea3ff" />
      <Box size={[0.8, 0.04, 0.02]} position={[-0.15, 0.78, 0.056]} color="#7076e0" />
    </Place>
  );
}

export function BeanBag({ position, color = COLOR.pink }: { position: V3; color?: string }) {
  return (
    <Place position={position}>
      <Ball r={0.45} scale={[1, 0.62, 1]} color={color} />
      <Ball r={0.3} position={[-0.1, 0.24, -0.12]} scale={[1, 0.75, 1]} color={color} />
    </Place>
  );
}

export function FloorLamp({ position }: { position: V3 }) {
  return (
    <Place position={position}>
      <Cylinder r={0.17} h={0.03} color={COLOR.ink} />
      <Cylinder r={0.018} h={1.5} color={COLOR.gray} />
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.26, 0.3, 20, 1, true]} />
        <meshStandardMaterial color="#fff2c9" side={2} emissive="#ffe9a6" emissiveIntensity={0.45} />
      </mesh>
    </Place>
  );
}

export function BarStool({ position }: { position: V3 }) {
  return (
    <Place position={position}>
      <Cylinder r={0.02} h={0.62} color={COLOR.gray} />
      <Cylinder r={0.19} h={0.07} position={[0, 0.58, 0]} color={COLOR.orange} />
      <Cylinder r={0.17} h={0.025} color={COLOR.ink} />
    </Place>
  );
}

/** Counter with an espresso machine, cups and a little fridge. Front is +z. */
export function Pantry({ position, rotation, w = 2.6 }: { position: V3; rotation?: V3; w?: number }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[w, 0.82, 0.62]} color={COLOR.white} round={0.03} />
      <Box size={[w + 0.06, 0.05, 0.68]} position={[0, 0.82, 0]} color={COLOR.woodDark} round={0.015} />
      {[0, 1, 2].map((i) => (
        <Box key={i} size={[w / 3 - 0.08, 0.5, 0.012]} position={[-w / 3 + i * (w / 3), 0.14, 0.316]} color="#e3e0f2" />
      ))}
      {/* espresso machine */}
      <Box size={[0.5, 0.42, 0.34]} position={[-0.7, 0.87, -0.05]} color={COLOR.navy} round={0.04} />
      <Box size={[0.4, 0.06, 0.02]} position={[-0.7, 1.12, 0.125]} color={COLOR.orange} emissive={0.4} />
      <Box size={[0.1, 0.06, 0.1]} position={[-0.7, 0.92, 0.16]} color={COLOR.gray} />
      <Mug position={[-0.7, 0.87, 0.2]} color={COLOR.white} />
      <Mug position={[-0.15, 0.87, 0.05]} color={COLOR.mustard} />
      <Mug position={[0.0, 0.87, 0.12]} color={COLOR.teal} />
      <Ball r={0.12} position={[0.5, 0.87, -0.05]} scale={[1, 1.2, 1]} color={COLOR.mustard} />
      <Plant position={[0.9, 0.87, 0]} scale={0.4} pot={COLOR.white} />
      {/* shelf above */}
      <Box size={[w - 0.4, 0.04, 0.26]} position={[0, 1.7, -0.18]} color={COLOR.wood} />
      <Mug position={[-0.5, 1.74, -0.18]} color={COLOR.blue} />
      <Mug position={[-0.35, 1.74, -0.18]} color={COLOR.pink} />
      <Mug position={[-0.2, 1.74, -0.18]} color={COLOR.white} />
      <Book position={[0.3, 1.74, -0.18]} size={[0.2, 0.28, 0.04]} color={COLOR.orange} />
      <Book position={[0.5, 1.74, -0.18]} size={[0.2, 0.24, 0.04]} color={COLOR.teal} />
    </Place>
  );
}

export function PingPongTable({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[2.1, 0.06, 1.2]} position={[0, 0.62, 0]} color="#2a7f6a" round={0.015} />
      <Box size={[2.1, 0.008, 0.02]} position={[0, 0.68, 0]} color={COLOR.white} />
      <Box size={[0.02, 0.008, 1.2]} position={[0, 0.68, 0]} color={COLOR.white} />
      <Box size={[0.02, 0.15, 1.3]} position={[0, 0.68, 0]} color="#e9eaf6" emissive={0.1} />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
        <Box key={i} size={[0.07, 0.62, 0.07]} position={[a! * 0.95, 0, b! * 0.5]} color={COLOR.ink} />
      ))}
      <Ball r={0.03} position={[0.5, 0.68, 0.2]} color={COLOR.orange} />
    </Place>
  );
}

export function WallClock({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <Place position={position} rotation={rotation}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 28]} />
        <meshStandardMaterial color={COLOR.white} />
      </mesh>
      <Box size={[0.015, 0.16, 0.01]} position={[0, 0, 0.025]} color={COLOR.ink} />
      <Box size={[0.12, 0.015, 0.01]} position={[0.05, 0.12, 0.025]} color={COLOR.ink} />
    </Place>
  );
}
