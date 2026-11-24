# Beams

A pixel art dodging game: a little robot must survive in a test room where emitters hidden in the walls fire beams. Last as long as you can.

*Version française : [README.md](README.md)*


## Room bosses (new in 1.2.0)

At 45 seconds, then every minute, a boss takes over the room for 20 seconds (a bar in the bottom wall shows the time left):

- **the Projector**, at the top, fires beams aimed at the robot and sometimes a cross;
- **the Prism**, in the centre, spins three beams one way then the other (touching it costs a lot);
- **the Clock** chains alternating grids, always with a gap.

Hold on to the end and the boss explodes for 250 points, then 500, 750…

## Controls

- **Arrows** or **WASD** (ZQSD too): move in 8 directions.
- **Shift** or **X**: dash, the robot zips away. The yellow gauge at the top shows when it is recharged.
- **Mouse** or **finger**: the robot follows the pointer while you press; two quick taps dash.
- **P** or **Esc**: pause.
- **Full screen**: the button of the same name; Esc to leave it.

## How it works

- **Every shot is announced**: a dotted line blinks, faster and faster, then the beam fires. The emitters in the walls light up.
- **Lines** cross the room from wall to wall. Later, some are twice as thick.
- **Grids** line up several beams: there is always a gap.
- **Crosses** aim where you are when the warning starts: move.
- **Sweeps** start from a wall and turn. The two warning lines show the angle they cover: get out of it.
- **Batteries** appear far from you: 50 points each. Every second survived gives 10 points.
- **Power-ups** appear every 10 to 16 seconds and stay 8 seconds (they blink before leaving):
  - the **blue bubble**: a shield surrounds the robot and takes the next beam, then it blinks for a moment, safe from everything;
  - the **purple hourglass**: for 5 seconds, beams (warnings, shots and sweeps) run at half speed, but you don't. The room turns purple and a gauge under the hourglass shows the time left.
- Beams come more and more often, with less warning, up to 100 seconds.

## Stats

The Records panel keeps your **best score**, the number of **games**, the **batteries** collected and the total **time survived**.

## Data and sync

Your best score and totals are saved by NeoDex, backed up and synced between your PCs if sync is on.

## Install

In NeoDex: **NeoStore → Discover → Beams → Install**.

Making a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
