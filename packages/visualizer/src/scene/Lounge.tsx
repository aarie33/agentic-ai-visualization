import { Island } from "./Island";
import { LOUNGE } from "./layout";
import { SCENE } from "./palette";
import {
  BarStool,
  BeanBag,
  Bookshelf,
  CoffeeTable,
  COLOR,
  FloorLamp,
  Pantry,
  PingPongTable,
  Place,
  Plant,
  Rug,
  Sofa,
  Television,
} from "./props";

/** The big break room: sofas and a TV, a pantry, a ping-pong table, bean bags and plants. */
export function Lounge() {
  return (
    <Place position={[LOUNGE.x, 0, LOUNGE.z]}>
      <Island w={LOUNGE.w} d={LOUNGE.d} floor={SCENE.island.loungeFloor}>
        <Rug position={[-0.8, 0, 0.1]} w={4.8} d={3.1} />

        <Sofa position={[-0.8, 0, -2.2]} length={3.0} />
        <Sofa position={[-3.85, 0, -0.35]} rotation={[0, Math.PI / 2, 0]} length={2.1} color={COLOR.orange} cushion={COLOR.blue} />
        <CoffeeTable position={[-0.8, 0, -0.75]} />
        <FloorLamp position={[-2.55, 0, -2.3]} />

        <Television position={[-0.8, 0, 2.45]} rotation={[0, Math.PI, 0]} />

        <BeanBag position={[2.3, 0, 1.15]} color={COLOR.pink} />
        <BeanBag position={[3.2, 0, 0.25]} color={COLOR.teal} />

        <Pantry position={[2.45, 0, -2.55]} />
        {[1.65, 2.45, 3.25].map((x) => (
          <BarStool key={x} position={[x, 0, -1.75]} />
        ))}

        <Bookshelf position={[-3.55, 0, -2.7]} w={1.7} h={1.8} />
        <PingPongTable position={[-3.3, 0, 1.95]} />

        <Plant position={[4.25, 0, 2.4]} scale={1.5} />
        <Plant position={[4.25, 0, -0.85]} scale={1.3} pot={COLOR.teal} />
        <Plant position={[-4.25, 0, 2.6]} scale={1.2} pot={COLOR.white} />
      </Island>
    </Place>
  );
}
