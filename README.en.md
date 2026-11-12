# Beams

A pixel art dodging game: a little robot must survive in a test room where emitters hidden in the walls fire beams. Last as long as you can.

*Version française : [README.md](README.md)*

## Controls

- **Arrows** or **WASD** (ZQSD too): move in 8 directions.
- **Shift** or **X**: dash, the robot zips away. The yellow gauge at the top shows when it is recharged.
- **Mouse** or **finger**: the robot follows the pointer while you press; two quick taps dash.
- **P** or **Esc**: pause.

## How it works

- **Every shot is announced**: a dotted line blinks, faster and faster, then the beam fires. The emitters in the walls light up.
- **Lines** cross the room from wall to wall. Later, some are twice as thick.
- **Grids** line up several beams: there is always a gap.
- **Crosses** aim where you are when the warning starts: move.
- **Sweeps** start from a wall and turn. The two warning lines show the angle they cover: get out of it.
- **Batteries** appear far from you: 50 points each. Every second survived gives 10 points.
- Beams come more and more often, with less warning, up to 100 seconds.

## Stats

The Records panel keeps your **best score**, the number of **games**, the **batteries** collected and the total **time survived**.

## Data and sync

Your best score and totals are saved by NeoDex, backed up and synced between your PCs if sync is on.

## Install

In NeoDex: **NeoStore → Discover → Beams → Install**.

Making a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
