import type { AgentRole } from "@virtual-office/shared";
import { Model } from "./Model";
import { DESK, ROBOT_COLOR, SEAT } from "./layout";
import {
  Book,
  BookStack,
  Box,
  Bookshelf,
  Chair,
  COLOR,
  DeskFrame,
  DeskLamp,
  FilingCabinet,
  Keyboard,
  Megaphone,
  Mouse,
  Mug,
  OpenBook,
  Papers,
  Pinboard,
  Place,
  Plant,
  PublishBoard,
  Tray,
  type V3,
} from "./props";

const TOP = DESK.topY;

/** A small table for the odd-job props of each room. */
function SideTable({ position, rotation, children }: { position: V3; rotation?: V3; children?: React.ReactNode }) {
  return (
    <Place position={position} rotation={rotation}>
      <Box size={[0.7, 0.05, 0.7]} position={[0, 0.55, 0]} color={COLOR.wood} round={0.02} />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
        <Box key={i} size={[0.05, 0.55, 0.05]} position={[a! * 0.28, 0, b! * 0.28]} color={COLOR.woodDark} />
      ))}
      <Place position={[0, 0.6, 0]}>{children}</Place>
    </Place>
  );
}

/**
 * Desk, chair and the things on them, laid out around the seat: the robot sits at SEAT facing +x, its hands
 * land on the keyboard, and the monitor stands behind the keyboard facing back at the robot.
 */
function Desk({ role }: { role: AgentRole }) {
  return (
    <Place>
      <Place position={[DESK.x, 0, DESK.z]}>
        <DeskFrame w={DESK.w} d={DESK.d} topY={TOP} accent={ROBOT_COLOR[role]} />
      </Place>

      {/* the monitor looks toward -x, at whoever sits in the chair */}
      <Place position={[DESK.x + 0.28, TOP, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Model name="screen-wide" scale={0.72} />
      </Place>

      <Keyboard position={[SEAT.x + 0.66, TOP, 0]} />
      <Mouse position={[SEAT.x + 0.68, TOP, 0.42]} />
      <Papers position={[DESK.x + 0.05, TOP, -0.52]} rotation={[0, 0.25, 0]} sheets={6} />
      <BookStack position={[DESK.x + 0.3, TOP, -0.74]} rotation={[0, 0.4, 0]} />
      <Mug position={[SEAT.x + 0.92, TOP, 0.68]} />
      <DeskLamp position={[DESK.x + 0.36, TOP, 0.78]} rotation={[0, Math.PI, 0]} />

      <Place position={[SEAT.x, 0, SEAT.z]} rotation={[0, Math.PI / 2, 0]}>
        <Chair color={ROBOT_COLOR[role]} />
      </Place>
    </Place>
  );
}

/** What makes each room its own: Bambang researches, Karjo writes, Tejo publishes. */
function Decor({ role }: { role: AgentRole }) {
  switch (role) {
    case "scout":
      return (
        <>
          <Pinboard position={[-1.15, 0, -1.85]} />
          <FilingCabinet position={[-2.35, 0, -1.35]} rotation={[0, Math.PI / 2, 0]} />
          <Place position={[2.25, 0, -1.45]} rotation={[0, -Math.PI / 2, 0]}>
            <Model name="scanner-low" scale={0.75} />
          </Place>
          <SideTable position={[-2.15, 0, 1.0]}>
            <OpenBook position={[0, 0, 0]} rotation={[0, 0.4, 0]} />
            <Mug position={[0.2, 0, 0.18]} color={COLOR.teal} />
          </SideTable>
          <Place position={[-2.35, 0, 0.0]}>
            <Model name="box-small" scale={0.6} />
          </Place>
          <Plant position={[2.3, 0, 1.7]} />
        </>
      );
    case "quill":
      return (
        <>
          <Bookshelf position={[-0.9, 0, -1.95]} w={1.9} h={1.9} />
          <Place position={[2.2, 0, -1.5]} rotation={[0, -0.5, 0]}>
            <Model name="machine" scale={0.55} />
          </Place>
          <SideTable position={[-2.15, 0, 1.0]}>
            <Papers position={[-0.05, 0, 0.0]} rotation={[0, 0.3, 0]} sheets={9} />
            <Book position={[0.15, 0.1, 0.1]} rotation={[0, -0.3, 0]} color={COLOR.pink} />
            <Mug position={[-0.2, 0, -0.2]} color={COLOR.mustard} />
          </SideTable>
          <BookStack position={[-2.3, 0, -0.1]} rotation={[0, 0.5, 0]} />
          <Plant position={[2.3, 0, 1.7]} pot={COLOR.teal} />
        </>
      );
    case "herald":
      return (
        <>
          <PublishBoard position={[-1.15, 0, -1.85]} />
          <Place position={[2.2, 0, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
            <Model name="robot-arm-a" scale={0.9} />
          </Place>
          <SideTable position={[-2.15, 0, 1.0]}>
            <Tray position={[0, 0, 0]} rotation={[0, 0.2, 0]} envelopes={5} />
            <Megaphone position={[0.2, 0.0, 0.2]} rotation={[0, -0.6, 0]} />
          </SideTable>
          <Place position={[-2.3, 0, -0.1]}>
            <Model name="box-small" scale={0.55} />
          </Place>
          <Plant position={[2.3, 0, 1.7]} pot={COLOR.pink} />
        </>
      );
  }
}

export function Workstation({ role }: { role: AgentRole }) {
  return (
    <>
      <Desk role={role} />
      <Decor role={role} />
    </>
  );
}

