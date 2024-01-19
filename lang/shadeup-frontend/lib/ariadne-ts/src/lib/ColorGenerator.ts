
import { ColorFn, Fixed } from "./Color"
import { clamp, range, wrapping_add_usize } from "../utils"

/// A type that can generate distinct 8-bit colors.
export class ColorGenerator {
  constructor(
    public state: [number, number, number],
    public min_brightness: number,
  ) {}

  /// Create a new [`ColorGenerator`] with the given pre-chosen state.
  ///
  /// The minimum brightness can be used to control the colour brightness (0.0 - 1.0). The default is 0.5.
  static from_state(state: [number, number, number], min_brightness: number): ColorGenerator {
    return new ColorGenerator(state, clamp(min_brightness, 0.0, 1.0))
  }

  /// Create a new [`ColorGenerator`] with the default state.
  static new(): ColorGenerator {
    return ColorGenerator.default()
  }

  /// Generate the next colour in the sequence.
  next(out?: [number, ColorFn][]): ColorFn {
    for (let i of range(0, 3)) {
      // magic constant, one of only two that have this property!
      const rhs = 40503 * (i * 4 + 1130)
      const c = wrapping_add_usize(this.state[i], rhs)
      const u16 = parseInt(`${c.toString(2).slice(-16)}`, 2)
      this.state[i] = u16;
    }

    const value = Math.floor(16
      + ((this.state[2] / 65535.0 * (1.0 - this.min_brightness) + this.min_brightness) * 5.0
       + (this.state[1] / 65535.0 * (1.0 - this.min_brightness) + this.min_brightness) * 30.0
       + (this.state[0] / 65535.0 * (1.0 - this.min_brightness) + this.min_brightness) * 180.0) % 256)

    const colorFn = Fixed(value);
    out?.push([value, colorFn])
    return colorFn
  }

  static default(): ColorGenerator {
    return new ColorGenerator([30000, 15000, 35000], 0.5)
  }
}
