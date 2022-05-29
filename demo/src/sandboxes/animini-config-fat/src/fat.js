/**!
 * @preserve FAT v0.6.8
 * Copyright 2019 Nextapps GmbH
 * Author: Thomas Wilkerling
 * Released under the Apache 2.0 Licence
 * https://github.com/nextapps-de/fat
 */

/** @define {boolean} */ const DEBUG = false
/** @define {boolean} */ const PROFILER = false
/** @define {boolean} */ const SUPPORT_COLOR = true
/** @define {boolean} */ const SUPPORT_CONTROL = true
/** @define {boolean} */ const SUPPORT_SEQUENCE = true
/** @define {boolean} */ const SUPPORT_TRANSFORM = true
/** @define {boolean} */ const SUPPORT_FILTER = true
/** @define {boolean} */ const SUPPORT_SCROLL = true
/** @define {boolean} */ const SUPPORT_RELATIVE = true
/** @define {boolean} */ const SUPPORT_CONCURRENCY = true
/** @define {boolean} */ const SUPPORT_PAINT = true
/** @define {boolean} */ const SUPPORT_EASING = true
/** @define {boolean} */ const SUPPORT_PRESET = true
/** @define {string} */ const SUPPORT_ENGINE = 'all'
/** @define {boolean} */ const SUPPORT_ANIMATE = SUPPORT_ENGINE === 'all' || SUPPORT_ENGINE === 'js'
/** @define {boolean} */ const SUPPORT_TRANSITION = SUPPORT_ENGINE === 'all' || SUPPORT_ENGINE === 'css'
/** @define {boolean} */ const SUPPORT_NATIVE =
  SUPPORT_ENGINE === 'all' || SUPPORT_ENGINE === 'native' || SUPPORT_ENGINE === 'waapi'

const res = Math.max(screen.width, screen.height)
const prefetch_resolution = res * (window.devicePixelRatio || 1) //10000
const prefetch = {}
const easing = {}
const profiles = []

let profile
let unique

let vendor
let prefix_transform, prefix_transform_js, prefix_transition, prefix_transition_js, prefix_filter, prefix_filter_js

if (SUPPORT_TRANSFORM || SUPPORT_TRANSITION || SUPPORT_FILTER) {
  document.addEventListener(
    'DOMContentLoaded',
    function () {
      vendor = (function () {
        const styles = getComputedStyle(document.body)

        if (is_undefined(styles['transform'])) {
          const vendors = ['webkit', 'moz', 'ms', 'o']

          for (let i = 0, tmp; i < vendors.length; i++) {
            if (!is_undefined(styles[(tmp = vendors[i]) + 'Transform'])) {
              return tmp
            }
          }
        } else {
          return ''
        }
      })()

      prefix_transform = vendor && vendor + 'Transform'
      prefix_transform_js = vendor && '-' + camel_to_snake(prefix_transform)
      prefix_transition = vendor && vendor + 'Transition'
      prefix_transition_js = vendor && '-' + camel_to_snake(prefix_transition)
      prefix_filter = vendor && vendor + 'Filter'
      prefix_filter_js = vendor && '-' + camel_to_snake(prefix_filter)
    },
    false
  )
}

const parse_float = parseFloat

let reset_style_id = -1
let id_counter = 0
let obj_counter = 0

/*
 * Penner equations
 * http://matthewlein.com/ceaser/
 */

const builtin_easing = {
  easeIn: [0.55, 0.085, 0.68, 0.53], // quadIn
  easeOut: [0.25, 0.46, 0.45, 0.94], // quadOut
  easeInOut: [0.455, 0.03, 0.515, 0.955], // quadInOut
  cubicIn: [0.55, 0.055, 0.675, 0.19],
  cubicOut: [0.215, 0.61, 0.355, 1],
  cubicInOut: [0.645, 0.045, 0.355, 1],
  quartIn: [0.895, 0.03, 0.685, 0.22],
  quartOut: [0.165, 0.84, 0.44, 1],
  quartInOut: [0.77, 0, 0.175, 1],
  quintIn: [0.755, 0.05, 0.855, 0.06],
  quintOut: [0.23, 1, 0.32, 1],
  quintInOut: [0.86, 0, 0.07, 1],
  expoIn: [0.95, 0.05, 0.795, 0.035],
  expoOut: [0.19, 1, 0.22, 1],
  expoInOut: [1, 0, 0, 1],
  circIn: [0.6, 0.04, 0.98, 0.335],
  circOut: [0.075, 0.82, 0.165, 1],
  circInOut: [0.785, 0.135, 0.15, 0.86],
  sineIn: [0.47, 0, 0.745, 0.715],
  sineOut: [0.39, 0.575, 0.565, 1],
  sineInOut: [0.445, 0.05, 0.55, 0.95],
  backIn: [0.6, -0.28, 0.735, 0.045],
  backOut: [0.175, 0.885, 0.32, 1.275],
  backInOut: [0.68, -0.55, 0.265, 1.55],
  snap: [0.1, 1, 0.1, 1]
}

// BezierEasing
// https://github.com/gre/bezier-easing
// https://github.com/Pomax/bezierjs

const easing_bezier = (function () {
  /**
   * @param mX1
   * @param mY1
   * @param mX2
   * @param mY2
   * @constructor
   */

  function BezierClass(mX1, mY1, mX2, mY2) {
    /** @private */
    this.mX1 = mX1
    /** @private */
    this.mY1 = mY1
    /** @private */
    this.mX2 = mX2
    /** @private */
    this.mY2 = mY2
  }

  /**
   * @param aA1
   * @param aA2
   * @private
   * @returns {number}
   */

  BezierClass.prototype.A = function (aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1
  }

  /**
   * @param aA1
   * @param aA2
   * @private
   * @returns {number}
   */

  BezierClass.prototype.B = function (aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1
  }

  /**
   * @param aA1
   * @private
   * @returns {number}
   */

  BezierClass.prototype.C = function (aA1) {
    return 3.0 * aA1
  }

  /**
   * @param aT
   * @param aA1
   * @param aA2
   * @private
   * @returns {number}
   */

  BezierClass.prototype.CalcBezier = function (aT, aA1, aA2) {
    return ((this.A(aA1, aA2) * aT + this.B(aA1, aA2)) * aT + this.C(aA1)) * aT
  }

  /**
   * @param aT
   * @param aA1
   * @param aA2
   * @private
   * @returns {number}
   */

  BezierClass.prototype.GetSlope = function (aT, aA1, aA2) {
    return 3.0 * this.A(aA1, aA2) * aT * aT + 2.0 * this.B(aA1, aA2) * aT + this.C(aA1)
  }

  /**
   * @param aX
   * @private
   * @returns {*}
   */

  BezierClass.prototype.GetTForX = function (aX) {
    let aGuessT = aX

    for (let i = 0; i < 4; ++i) {
      const currentSlope = this.GetSlope(aGuessT, this.mX1, this.mX2)

      if (currentSlope === 0) {
        return aGuessT
      }

      const currentX = this.CalcBezier(aGuessT, this.mX1, this.mX2) - aX

      aGuessT -= currentX / currentSlope
    }

    return aGuessT
  }

  /**
   * @param x
   * @private
   * @returns {*}
   */

  BezierClass.prototype.InitBezier = function (x) {
    if (x === 0 || x === 1 || (this.mX1 === this.mY1 && this.mX2 === this.mY2)) {
      return x
    }

    return this.CalcBezier(this.GetTForX(x), this.mY1, this.mY2)
  }

  if (SUPPORT_EASING && SUPPORT_ANIMATE) {
    return function (mX1, mY1, mX2, mY2) {
      const bezier = new BezierClass(mX1, mY1, mX2, mY2)

      return bezier.InitBezier.bind(bezier)
    }
  }
})()

/**
 * @dict
 * @const
 */

const presets = {
  fadeIn: { opacity: 1 },
  fadeOut: { opacity: 0 },
  fadeToggle: { opacity: '!=1' },

  slideInLeft: SUPPORT_TRANSFORM ? { translateX: 0 } : { left: 0 },
  slideOutLeft: SUPPORT_TRANSFORM ? { translateX: '-100%' } : { left: '-100%' },
  slideToggleLeft: SUPPORT_TRANSFORM ? { translateX: '!=-100%' } : { left: '!=-100%' },

  //"slideInRight": SUPPORT_TRANSFORM ? { "translateX": 0 } : { "left": 0 },
  slideOutRight: SUPPORT_TRANSFORM ? { translateX: '100%' } : { left: '100%' },
  slideToggleRight: SUPPORT_TRANSFORM ? { translateX: '!=100%' } : { left: '!=100%' },

  slideInTop: SUPPORT_TRANSFORM ? { translateY: 0 } : { top: 0 },
  slideOutTop: SUPPORT_TRANSFORM ? { translateY: '-100%' } : { top: '-100%' },
  slideToggleTop: SUPPORT_TRANSFORM ? { translateY: '!=-100%' } : { top: '!=-100%' },

  //"slideInBottom": SUPPORT_TRANSFORM ? { "translateY": 0 } : { "top": 0 },
  slideOutBottom: SUPPORT_TRANSFORM ? { translateY: '100%' } : { top: '100%' },
  slideToggleBottom: SUPPORT_TRANSFORM ? { translateY: '!=100%' } : { top: '!=100%' },

  zoomIn: SUPPORT_TRANSFORM ? { scaleX: 1, scaleY: 1 } : { width: '100%', height: '100%' },
  zoomOut: SUPPORT_TRANSFORM ? { scaleX: 0, scaleY: 0 } : { width: 0, height: 0 },
  zoomToggle: SUPPORT_TRANSFORM ? { scaleX: '!=1', scaleY: '!=1' } : { width: '!=100%', height: '!=100%' }
}

if (SUPPORT_PRESET) {
  presets['slideInBottom'] = presets['slideInTop']
  presets['slideInRight'] = presets['slideInLeft']
}

if (SUPPORT_TRANSFORM) {
  presets['rollInLeft'] = presets['rollInRight'] = { rotateZ: '0deg' }
  presets['rollOutRight'] = { rotateZ: '720deg' }
  presets['rollOutLeft'] = { rotateZ: '-720deg' }
  presets['rollToggleRight'] = { rotateZ: '!=720deg' }
  presets['rollToggleLeft'] = { rotateZ: '!=-720deg' }
}

if (SUPPORT_FILTER) {
  presets['blurIn'] = { blur: '0em' }
  presets['blurOut'] = { blur: '5em' }
  presets['blurToggle'] = { blur: '!=5em' }
}

if (SUPPORT_SCROLL) {
  presets['scrollUp'] = { scrollTop: 0 }
  presets['scrollDown'] = { scrollTop: '100%' }
  presets['scrollLeft'] = { scrollLeft: 0 }
  presets['scrollRight'] = { scrollLeft: '100%' }
}

/**
 * @param obj
 * @param style
 * @param job_id
 * @param from
 * @param to
 * @param unit
 * @param force
 * @param duration
 * @param ease_str
 * @param callback
 * @param step
 * @param {number|string} delay
 * @param {number=} loop
 * @param {string=} style_id
 * @param {string=} seq_id
 * @param {string=} filter
 * @param {string=} transform
 * @param {number=} color
 * @param {string=} style_group
 * @constructor
 * @final
 */

function Job(
  obj,
  style,
  job_id,
  from,
  to,
  unit,
  force,
  duration,
  ease_str,
  callback,
  step,
  delay,
  loop,
  style_id,
  seq_id,
  transform,
  filter,
  color,
  style_group
) {
  /** @private */
  this.obj = obj
  /** @private */
  this.css = obj._style
  /** @private */
  this.style = style
  /** @private */
  this.style_js = camel_to_snake(style)
  /** @private */
  this.from = from
  /** @private */
  this.to = to
  /** @private */
  this.current = from
  /** @private */
  this.unit = unit
  /** @private */
  this.force = force
  /** @private */
  this.duration = duration
  /** @private */
  this.ease_str = ease_str
  /** @private */
  this.ease = init_easing(ease_str)
  /** @private */
  this.time = 0
  /** @private */
  this.callback = callback
  /** @private */
  this.step = step
  /** @private */
  this.job_id = job_id
  /** @private */
  this.delay = delay
  /** @private */
  this.loop = loop
  /** @private */
  this.float = SUPPORT_COLOR && color ? unit === '%' || style.indexOf('A') !== -1 : unit !== 'px'

  if (SUPPORT_SEQUENCE) {
    /** @private */
    this.seq_id = seq_id
    /** @private */
    this.seq_count = seq_id + '_c'
  }

  if (SUPPORT_CONCURRENCY) {
    /** @private */
    this.style_id = style_id
  }

  if (SUPPORT_COLOR) {
    if (color) {
      /** @private */
      this.color = color
      /** @private */
      this.style_group = style_group
    }
  }

  if (SUPPORT_TRANSFORM) {
    if (transform) {
      /** @private */
      this.transform = transform
    }
  }

  if (SUPPORT_FILTER) {
    if (filter) {
      /** @private */
      this.filter = filter
    }
  }
}

const JobPrototype = Job.prototype

if (SUPPORT_ANIMATE) {
  /**
   * @param {number} now
   * @param {number=} last
   * @param {number=} ratio
   * @param {boolean=} direction
   * @private
   */

  JobPrototype.animate = function (now, last, ratio, direction) {
    if (PROFILER) {
      profile_start('job.handle')
    }

    const from = this.from
    const to = this.to
    const duration = this.duration
    const obj = this.obj

    const style_id = SUPPORT_CONCURRENCY && this.style_id
    const bypass = from === to || (style_id && unique[style_id])
    const delta = SUPPORT_CONTROL ? ratio * (direction ? 1 : -1) : 1
    const reverse = delta < 0

    if (reverse && this.time === 0) {
      this.time = duration
    }

    let stamp = (this.time += (now - (last || now)) * delta)
    const complete = reverse ? stamp <= 0 : stamp >= duration
    let current_value

    if (!bypass) {
      if (style_id) {
        unique[style_id] = 1
      }

      if (complete) {
        current_value = reverse ? from : to

        if (DEBUG) {
          console.log('Job finished', this)
        }
      } else {
        let ease

        if ((ease = this.ease)) {
          if (ease.length) {
            current_value = ((to - from) * ease[((res / duration) * stamp + 0.5) >> 0]) / prefetch_resolution
          } else {
            // linear (default)
            current_value = ((to - from) * stamp) / duration
          }
        } else if ((ease = this.ease_str)) {
          if (ease.length === 1) {
            // fn(x)
            current_value = ease(stamp / duration)
          } else {
            // fn(current, from, to, total)
            current_value = ease(stamp, from, to, duration)
          }
        }

        current_value = from + current_value

        current_value = this.float // --> 0.0 - 1.0, %, deg, em
          ? ((current_value * res + 0.5) >> 0) / res
          : (current_value + 0.5) >> 0
      }
    }

    if (PROFILER) {
      profile_end('job.handle')
      profile_start('job.draw')
    }

    const style = this.style

    if (!bypass && this.current !== current_value) {
      this.current = current_value

      if (SUPPORT_TRANSFORM && this.transform) {
        obj._transform[style] = current_value + this.unit
      } else if (SUPPORT_FILTER && this.filter) {
        obj._filter[style] = current_value + this.unit
      } else if (SUPPORT_COLOR && this.color) {
        obj['_' + this.style_group][style] = current_value
      } else {
        current_value += this.unit

        if (style !== 'custom') {
          if (!obj.nodeType) {
            obj[style] = current_value
          } else {
            this.animate_job(style, current_value)
          }
        }
      }
    }

    if (SUPPORT_TRANSFORM && style === this.transform) {
      current_value = this.transform_job()
    } else if (SUPPORT_FILTER && style === this.filter) {
      current_value = this.filter_job()
    } else if (SUPPORT_COLOR && style === this.color) {
      current_value = this.color_job(this.style_group)
    }

    if (PROFILER) {
      profile_end('job.draw')
    }

    if (this.step) {
      if (PROFILER) {
        profile_start('job.step')
      }

      this.step.call(obj, complete ? (reverse ? 0 : 1) : stamp / duration, current_value)

      if (PROFILER) {
        profile_end('job.step')
      }
    }

    if (complete) {
      /* CHECK AGAINST SELF LOOPING */

      this.time = -1

      if (this.callback) {
        if (SUPPORT_SEQUENCE) {
          const sequences = obj[this.seq_id]

          if (sequences) {
            if (this.loop--) {
              let current = reverse ? --obj[this.seq_count] : ++obj[this.seq_count]

              const length = sequences.length

              if (current < 0 || current >= length) {
                obj[this.seq_count] = current = reverse ? length - 1 : 0

                if (current < length) {
                  return
                }
              }
            } else {
              obj[this.seq_id] = null
            }
          }
        }

        if (PROFILER) {
          profile_start('job.callback')
        }

        this.callback.call(obj)

        if (PROFILER) {
          profile_end('job.callback')
        }
      }
    }
  }

  /** @private */

  JobPrototype.render_job = function (fat, now) {
    if (this.time === -1) {
      if (SUPPORT_SEQUENCE && this.callback) {
        const current_obj = this.obj
        const sequences = current_obj[this.seq_id]

        if (sequences) {
          fat.animate(current_obj, sequences[current_obj[this.seq_count]], {
            duration: this.duration,
            ease: this.ease_str,
            callback: this.callback,
            step: this.step,
            force: this.force,
            loop: this.loop
          })

          if (DEBUG) {
            console.log('Keyframe', sequences[current_obj[this.seq_count]])
          }

          if (this.time === 0) {
            return true
          }
        }
      }

      if (!SUPPORT_CONCURRENCY || !this.style_id) {
        this.obj[this.job_id] = null
      }

      return
    } else {
      const elapsed = now - fat.last_update

      if (this.delay) {
        if (this.delay === 'view') {
          if (is_visible(this.obj)) {
            this.delay = 0
          } else {
            return true
          }
        } else if ((this.delay -= elapsed) > 0) {
          return true
        } else {
          this.delay = 0
        }
      }

      if (SUPPORT_CONTROL) {
        if (!fat.playing) {
          fat.last_update += elapsed
          return true
        }

        this.animate(now, fat.last_update, fat.ratio, fat.direction)
      } else {
        this.animate(now, fat.last_update)
      }
    }

    return true
  }
}

if (SUPPORT_ANIMATE) {
  /** @private */

  JobPrototype.animate_job = function (style, value) {
    if (SUPPORT_SCROLL && scroll_keys[style]) {
      this.obj[style] = value
    } else {
      set_style(this.css, this.style_js, value, this.force)
    }
  }
}

if (SUPPORT_CONTROL) {
  /** @private */

  JobPrototype.update = function (value, force) {
    // TODO:
    //if(SUPPORT_TRANSFORM){}
    //if(SUPPORT_COLOR){}
    //if(SUPPORT_FILTER){}

    if (this.current !== value) {
      if (is_string(value)) {
        value = parse_float(value)
      } else if (is_undefined(value)) {
        value = this.from
      }

      if (this.time !== -1) {
        this.from = value
      }

      this.current = value
      this.force = force

      /*
                  if(this.unit){

                      value += this.unit;
                  }
                  */

      return true
    }
  }
}

/**
 * @const
 * @dict
 */

const color_keys = SUPPORT_COLOR
  ? (function (obj) {
      function construct(suffix, index) {
        obj[suffix] = -index
        obj[suffix + 'R'] = index
        obj[suffix + 'G'] = index
        obj[suffix + 'B'] = index
        obj[suffix + 'A'] = index

        obj[suffix + 'H'] = index
        obj[suffix + 'S'] = index
        obj[suffix + 'L'] = index
      }

      construct('color', 1)
      construct('backgroundColor', 2)
      construct('borderColor', 3)
      // TODO:
      // construct("borderLeftColor", 3);
      // construct("borderTopColor", 3);
      // construct("borderRightColor", 3);
      // construct("borderBottomColor", 3);
      // construct("textShadowColor", 4);
      // construct("boxShadowColor", 5);

      return obj
    })({})
  : null

/**
 * @const
 * @dict
 */

const transform_keys = SUPPORT_TRANSFORM
  ? (function (obj) {
      function construct(suffix, index) {
        obj[suffix] = index
        obj[suffix + 'X'] = index
        obj[suffix + 'Y'] = index
        obj[suffix + 'Z'] = index
        obj[suffix + '3d'] = index
      }

      construct('translate', 1)
      construct('scale', 2)
      construct('rotate', 3)
      construct('skew', 4)

      return obj
    })({})
  : null

/**
 * @const
 * @dict
 */

const matrix2d_index = {
  scaleX: 0,
  skewY: 1,
  skewX: 2,
  scaleY: 3,
  translateX: 4,
  translateY: 5
}

/**
 * Note: value + 1
 * @const
 * @dict
 */

const filter_default_values = {
  blur: 1,
  brightness: 2,
  contrast: 2,
  grayscale: 1,
  'hue-rotate': 1,
  invert: 1,
  saturate: 2,
  sepia: 1
}

/*
          aqua: "#00ffff",
          black: "#000000",
          blue: "#0000ff",
          fuchsia: "#ff00ff",
          gray: "#808080",
          green: "#008000",
          lime: "#00ff00",
          maroon: "#800000",
          navy: "#000080",
          olive: "#808000",
          purple: "#800080",
          red: "#ff0000",
          silver: "#c0c0c0",
          teal: "#008080",
          white: "#ffffff",
          yellow: "#ffff00",
          transparent: [ null, null, null, 0 ],
      */

/**
 * @const
 * @dict
 */

const scroll_keys = SUPPORT_SCROLL
  ? {
      scrollTop: 1,
      scrollLeft: 2,
      scroll: 3
    }
  : null

let hex_to_int_table
let int_to_hex_table

if (SUPPORT_COLOR) {
  hex_to_int_table = {}
  int_to_hex_table = new Array(255)

  for (let i = 0; i < 256; i++) {
    let hex = i.toString(16)

    if (hex.length % 2) {
      hex = '0' + hex
    }

    hex_to_int_table[hex] = i
    int_to_hex_table[i] = hex
  }
}

if (SUPPORT_TRANSFORM) {
  /** @private */

  JobPrototype.transform_job = function () {
    const transform = this.obj._transform
    const order = this.obj._transform_order

    set_style(this.css, prefix_transform_js || 'transform', merge_transform(transform, order), this.force)

    return transform
  }
}

if (SUPPORT_FILTER) {
  /** @private */

  JobPrototype.filter_job = function () {
    const filter = this.obj._filter
    const order = this.obj._filter_order

    set_style(this.css, prefix_filter_js || 'filter', merge_filter(filter, order), this.force)

    return filter
  }
}

if (SUPPORT_COLOR) {
  /** @private */

  JobPrototype.color_job = function (style_group) {
    const color = this.obj['_' + style_group]

    set_style(this.css, style_group.replace('C', '-c'), merge_color(color, style_group, this.unit), this.force)

    return color
  }
}

/**
 * @param hex_or_rgba
 * @param key
 * @param {number=} default_alpha
 * @returns {Object<string, number>}
 */

function parse_color(hex_or_rgba, key, default_alpha) {
  let r,
    g,
    b,
    a = default_alpha || -1,
    tmp

  if (hex_or_rgba[0] === '#') {
    hex_or_rgba = hex_or_rgba.toLowerCase()

    if (hex_or_rgba.length === 4) {
      r = hex_to_int_table[(tmp = hex_or_rgba[1]) + tmp]
      g = hex_to_int_table[(tmp = hex_or_rgba[2]) + tmp]
      b = hex_to_int_table[(tmp = hex_or_rgba[3]) + tmp]
    } else {
      r = hex_to_int_table[hex_or_rgba[1] + hex_or_rgba[2]]
      g = hex_to_int_table[hex_or_rgba[3] + hex_or_rgba[4]]
      b = hex_to_int_table[hex_or_rgba[5] + hex_or_rgba[6]]
    }
  } else {
    tmp = substring_match(hex_or_rgba, '(', ')').split(',')

    r = parseInt(tmp[0], 10)
    g = parseInt(tmp[1], 10)
    b = parseInt(tmp[2], 10)

    if (tmp.length > 3) {
      a = parse_float(tmp[3])
    }

    if (hex_or_rgba.indexOf('hsl') !== -1) {
      const rgb = hsl_to_rgb(r, g, b)

      r = rgb.r
      g = rgb.g
      b = rgb.b
    }
  }

  const obj = {}

  obj[key + 'R'] = r
  obj[key + 'G'] = g
  obj[key + 'B'] = b

  if (a !== -1) {
    obj[key + 'A'] = a
  }

  return obj
}

/**
 * http://en.wikipedia.org/wiki/HSL_color_space
 *
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @return {Object<string, number>}
 */

function hsl_to_rgb(h, s, l) {
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s

    const p = 2 * l - q

    r = hue_to_rgb(p, q, h + 1 / 3)
    g = hue_to_rgb(p, q, h)
    b = hue_to_rgb(p, q, h - 1 / 3)
  }

  return {
    r: (r * 255 + 0.5) >> 0,
    g: (g * 255 + 0.5) >> 0,
    b: (b * 255 + 0.5) >> 0
  }
}

function hue_to_rgb(p, q, t) {
  if (t < 0) t += 1
  else if (t > 1) t -= 1

  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6

  return p
}

/**
 * http://en.wikipedia.org/wiki/HSL_color_space
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @return {Object<string, number>}
 */

/*
      function rgb_to_hsl(r, g, b){

          r /= 255;
          g /= 255;
          b /= 255;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const l = (max + min) / 2;

          let h, s;

          if(max === min){

              h = s = 0;
          }
          else{

              const d = max - min;

              s = (

                  l > 0.5 ?

                      d / (2 - max - min)
                  :
                      d / (max + min)
              );

                   if(max === r) h = (g - b) / d + (g < b ? 6 : 0);
              else if(max === g) h = (b - r) / d + 2;
              else if(max === b) h = (r - g) / d + 4;

              h /= 6;
          }

          return {

              h: h,
              s: s,
              l: l
          };
      }
      */

/**
 * @param {Object<string, number|boolean>=} config
 * @constructor
 * @final
 */

function Fat(config) {
  if (PROFILER) {
    profile = profiles[id_counter] || (profiles[id_counter] = {})

    /** @export */
    this.stats = profile
  }

  if (SUPPORT_ANIMATE) {
    /** @export */
    this.id = id_counter++
    /** @private */
    this.stack = []
    /** @private */
    this.render = render_frames.bind(this)
    /** @private */
    this.last_update = 0
    /** @private */
    this.exec = 0

    if (SUPPORT_PAINT) {
      /** @private */
      this.paint_stack = []
    }

    if (SUPPORT_CONTROL) {
      /** @export */
      this.fps = config && config['fps']
      /** @export */
      this.playing = !config || config['start'] !== false
      /** @export */
      this.direction = true
      /** @export */
      this.ratio = 1
    }
  }

  if (DEBUG) {
    console.log('Scene created', this)
  }
}

/**
 * @param progress
 * @param {number=} shift
 */

function seek(progress, shift) {
  if (PROFILER) {
    profile_start('control.seek')
  }

  const stack = this.stack
  const no_shift = is_undefined(shift)
  const direction = this.direction

  for (let i = 0, len = stack.length; i < len; i++) {
    const job = stack[i]

    job.time = no_shift
      ? (direction ? progress : 1 - progress) * job.duration
      : direction
      ? shift
      : job.duration - shift
  }

  if (PROFILER) {
    profile_end('control.seek')
  }

  return this
}

/**
 * TODO: Removing specific properties actually breaks the callback chain
 * @param obj
 */

function remove(obj /*, style*/) {
  if (PROFILER) {
    profile_start('scene.remove')
  }

  const stack = this.stack
  const stack_length = stack.length

  obj = get_nodes(obj)

  for (let a = 0, len = obj.length; a < len; a++) {
    //if(!style || is_string(style)){

    for (let i = 0; i < stack_length; i++) {
      const job = stack[i]

      if (job.obj === obj /*&& (!style || (job.style === style))*/) {
        obj['_fat_' + job.style + this.id] = null
        stack[i] = null

        // if(style){
        //
        //     break;
        // }
      }
    }
    // }
    // else{
    //
    //     const styles_length = style.length;
    //
    //     for(let i = 0; i < styles_length; i++){
    //
    //         this.remove(obj[a], style[i]);
    //     }
    // }
  }

  if (PROFILER) {
    profile_end('scene.remove')
  }

  return this
}

/**
 * @param {CSSStyleDeclaration} css
 * @param {string} key
 * @param {string} value
 * @param {boolean=} force
 */

function set_style(css, key, value, force) {
  if (PROFILER) {
    profile_start('style.set')
  }

  if (force) {
    css.setProperty(key, value, 'important')
  } else {
    css.setProperty(key, value)
  }

  if (PROFILER) {
    profile_end('style.set')
  }

  // Note: Edge actually do not apply style changes when passing void 0:
  // css.setProperty(key, value, force ? "important" : void 0);
}

/**
 * @param {string} string
 * @returns {string}
 */

function camel_to_snake(string) {
  return string.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function get_nodes(obj) {
  if (is_string(obj)) {
    obj = document.querySelectorAll(/** @type {string} */ (obj))
  } else if (!is_array(obj)) {
    obj = [obj]
  }

  return obj
}

/**
 * @param obj
 * @param style
 * @param value
 * @param {boolean=} force
 */

function set(obj, style, value, force) {
  obj = get_nodes(obj)

  if (is_string(style)) {
    if (PROFILER) {
      profile_start('scene.set')
    }

    for (let i = 0, len = obj.length; i < len; i++) {
      const cur_obj = obj[i]
      const cur_job = cur_obj['_fat_' + style + this.id]

      let found = true

      if (cur_job) {
        found = cur_job.update(value, force)
      } else if (get_style(cur_obj, style) === value) {
        found = false
      }

      if (found) {
        const css = cur_obj._style || (cur_obj._style = cur_obj.style)

        set_style(css, camel_to_snake(style), value, force)
      }
    }

    if (PROFILER) {
      profile_end('scene.set')
    }
  } else {
    const keys = Object.keys(style)

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i]

      this.set(obj, key, style[key], /* force: */ value)
    }
  }

  return this
}

function destroy() {
  if (this.exec) {
    //cancelAnimationFrame(this.exec);

    this.exec = 0
    this.stack = []
    this.last_update = 0

    if (SUPPORT_PAINT) {
      this.paint_stack = []
    }

    if (SUPPORT_CONCURRENCY && obj_counter && reset_style_id === this.id) {
      reset_style_id = -1
    }

    if (DEBUG) {
      console.log('Scene destroyed', this)
    }
  }

  return this
}

/**
 * @const
 * @param {string=} ease
 * @return {Array<number>}
 */

function init_easing(ease) {
  return is_string(ease)
    ? SUPPORT_EASING && ease
      ? prefetch[ease] || (prefetch[ease] = prefetch_ease(ease))
      : []
    : null
}

/**
 * @const
 * @param {string=} ease
 * @return {Array<number>|Int16Array<number>}
 */

function prefetch_ease(ease) {
  let fn_ease =
    easing[ease] || (SUPPORT_EASING && (easing[ease] = easing_bezier.apply(easing_bezier, builtin_easing[ease])))

  if (!fn_ease) {
    return []
  }

  if (PROFILER) {
    profile_start('ease.prefetch')
  }

  /**
   * @constructor
   */

  const Arr_class = Int16Array || Array

  /**
   * @type {Array<number>|Int16Array<number>}
   * @const
   */

  const arr = new Arr_class(res)

  for (let i = 0; i < res; i++) {
    arr[i] = (fn_ease(i / res) * prefetch_resolution + 0.5) >> 0
  }

  if (PROFILER) {
    profile_end('ease.prefetch')
  }

  return arr
}

function render_frames(time) {
  if (PROFILER) {
    profile = profiles[this.id]
  }

  const stack = this.stack
  const paint_stack = this.paint_stack
  const len = stack.length
  const len_paint = SUPPORT_PAINT && paint_stack.length

  if (len || len_paint) {
    this.exec = requestAnimationFrame(this.render)

    const last_update = this.last_update || (this.last_update = time)

    if (SUPPORT_CONTROL && this.fps) {
      if (time - last_update + 1 < 1000 / this.fps) {
        return
      }
    }

    let in_progress = false

    if (len) {
      if (SUPPORT_CONCURRENCY && obj_counter) {
        if (reset_style_id < 0) {
          unique = {}
          reset_style_id = this.id
        } else if (reset_style_id === this.id) {
          unique = {}
        }
      }

      if (PROFILER) {
        profile_start('scene.draw')
      }

      for (let i = 0; i < len; i++) {
        const current_job = stack[i]

        if (current_job) {
          in_progress = true

          if (!current_job.render_job(this, time)) {
            stack[i] = null
          }
        }
      }

      if (PROFILER) {
        profile_end('scene.draw')
      }
    }

    if (len_paint) {
      if (PROFILER) {
        profile_start('scene.paint')
      }

      for (let i = 0; i < len_paint; i++) {
        const current_paint = paint_stack[i]

        if (current_paint) {
          in_progress = true

          if (!current_paint._delay || (current_paint._delay -= time - last_update) <= 0) {
            if (!current_paint(time)) {
              paint_stack[i] = null
            }
          }
        }
      }

      if (PROFILER) {
        profile_end('scene.paint')
      }
    }

    this.last_update = time

    if (!in_progress) {
      this.destroy()
    }
  }
}

/**
 * @param {*} val
 * @returns {boolean}
 */

function is_string(val) {
  return typeof val === 'string'
}

/**
 * @param {*} val
 * @returns {boolean}
 */

function is_array(val) {
  return val.constructor === Array
}

/**
 * @param {*} val
 * @returns {boolean}
 */

function is_object(val) {
  return val.constructor === Object
}

/**
 * @param {*} val
 * @returns {boolean}
 */

function is_undefined(val) {
  return typeof val === 'undefined'
}

if (SUPPORT_ANIMATE) {
  /**
   * @param {string|number} from
   * @param {string|number} to
   * @param {boolean} force
   * @param {number|string|Function} duration
   * @param {string} ease_str
   * @param {Function} callback
   * @param {Function} step
   * @param {number} delay
   * @param {string=} transform
   * @param {string=} filter
   * @param {string=} color
   * @param {string=} style_group
   * @private
   */

  JobPrototype.update_job = function (
    from,
    to,
    /*unit,*/ force,
    duration,
    ease_str,
    callback,
    step,
    delay,
    transform,
    filter,
    color,
    style_group
  ) {
    if (PROFILER) {
      profile_start('job.update')
    }

    if (is_undefined(from)) {
      from = this.current
    } else {
      from = parse_float(from)
    }

    if (is_string(to)) {
      if (SUPPORT_RELATIVE && to[1] === '=') {
        to = parse_relative_value(from, to.substring(2), to[0])
      } else {
        to = parse_float(to)
      }
    }

    this.from = from
    this.to = to
    this.duration = duration
    this.time = 0
    this.force = force

    if (this.ease_str !== ease_str) {
      this.ease = init_easing(ease_str)
      this.ease_str = ease_str
    }

    this.callback = callback
    this.step = step
    this.delay = delay

    // TODO:
    /*
              if(!is_undefined(unit)){

                  this.unit = unit;
              }
              */

    if (SUPPORT_TRANSFORM) {
      if (transform) {
        this.transform = transform
      }
    }

    if (SUPPORT_COLOR) {
      if (color) {
        this.color = color
        this.style_group = style_group
      }
    }

    if (SUPPORT_FILTER) {
      if (filter) {
        this.filter = filter
      }
    }

    if (PROFILER) {
      profile_end('job.update')
    }

    if (DEBUG) {
      console.log('Job updated', this)
    }
  }
}

/**
 * @param {HTMLElement} obj
 * @param {string} style
 * @param {string} job_id
 * @param {string|number} from
 * @param {string|number} to
 * @param {string} unit
 * @param {boolean} force
 * @param {number|string|Function} duration
 * @param {string} ease_str
 * @param {Function} callback
 * @param {Function} step
 * @param {number} delay
 * @param {number=} loop
 * @param {string=} style_id
 * @param {string=} seq_id
 * @param {string=} transform
 * @param {string=} filter
 * @param {number=} color
 * @param {string=} style_group
 */

function create_job(
  obj,
  style,
  job_id,
  from,
  to,
  unit,
  force,
  duration,
  ease_str,
  callback,
  step,
  delay,
  loop,
  style_id,
  seq_id,
  transform,
  filter,
  color,
  style_group
) {
  if (PROFILER) {
    profile_start('job.create')
  }

  let style_from =
    '' +
    (SUPPORT_TRANSFORM && transform
      ? get_transform
      : SUPPORT_FILTER && filter
      ? get_filter
      : SUPPORT_COLOR && color
      ? get_color
      : get_style)(obj, style, from, style_group)

  if (style_from === 'auto') {
    style_from = '0'
  }

  from = parse_float(style_from)

  if (is_string(to)) {
    let style_to = to

    if (SUPPORT_RELATIVE && to[1] === '=') {
      to = parse_relative_value(from, (style_to = to.substring(2)), to[0])
    } else {
      to = parse_float(to)
    }

    if (!unit) {
      unit = style_to.substring(('' + to).length)
    }

    if (SUPPORT_SCROLL && unit === '%') {
      const scroll_index = scroll_keys[style]

      if (scroll_index === 1) {
        to *= (obj.scrollHeight - obj.clientHeight) / 100
        unit = ''
      } else if (scroll_index === 2) {
        to *= (obj.scrollWidth - obj.clientWidth) / 100
        unit = ''
      }
    }
  }

  if (!unit) {
    unit = style_from.substring(('' + from).length)
  }

  const job =
    SUPPORT_TRANSFORM || SUPPORT_COLOR || SUPPORT_FILTER
      ? new Job(
          obj,
          style,
          job_id,
          from,
          to,
          unit,
          force,
          duration,
          ease_str,
          callback,
          step,
          delay,
          loop,
          style_id,
          seq_id,
          transform,
          filter,
          color,
          style_group
        )
      : new Job(
          obj,
          style,
          job_id,
          from,
          to,
          unit,
          force,
          duration,
          ease_str,
          callback,
          step,
          delay,
          loop,
          style_id,
          seq_id
        )

  this.stack[this.stack.length] = job

  if (!style_id) {
    obj[job_id] = job
  }

  if (PROFILER) {
    profile_end('job.create')
  }

  if (DEBUG) {
    console.log('Job created', job)
  }
}

/**
 * @param from
 * @param to
 * @param operator
 * @returns {number}
 */

function parse_relative_value(from, to, operator) {
  to = parse_float(to)

  if (operator === '+') {
    return from + to
  } else if (operator === '-') {
    return from - to
  } else if (operator === '*') {
    return from * to
  } else if (operator === '/') {
    return from / to
  } else if (operator === '!') {
    return from === to ? 0 : to
  }

  return to
}

/**
 * @param obj
 * @param style
 * @param {string|number=} from
 * @returns {string|number}
 */

function get_style(obj, style, from) {
  if (style === 'custom') {
    return from || 0
  } else if (!obj.nodeType || (SUPPORT_SCROLL && scroll_keys[style])) {
    return is_undefined(from) ? obj[style] : from
  }

  if (PROFILER) {
    profile_start('style.get')
  }

  const css = obj._style || (obj._style = obj.style)
  const value =
    (is_undefined(from) ? css[style] : from) || (obj._style_comp || (obj._style_comp = getComputedStyle(obj)))[style]

  if (PROFILER) {
    profile_end('style.get')
  }

  return value
}

/**
 * @param style
 * @param style_value
 * @param style_prop
 * @param {Array<string>=} style_order
 * @returns {Object}
 */

function parse_transform(style, style_value, style_prop, style_order) {
  if (style_value === 'none') {
    const transform_group = style.substring(0, style.length - 1)

    style_prop[style] = transform_group === 'scale' ? 1 : 0

    if (style_order) {
      if (!style_prop[transform_group]) {
        style_order[style_order.length] = transform_group
        style_prop[transform_group] = 1
      }
    }

    return style_prop
  } else if (style_value.indexOf('matrix') !== -1) {
    style_value = style + '(' + get_transform_matrix(style_value, style) + ')'
  }

  const parts = style_value.replace(/, /g, ',').split(' ')
  const has_prop = {}

  let style_order_len = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    let prop = substring_match(part, '(')

    if (prop) {
      const values = substring_match(part, '(', ')').split(',')
      const len = values.length

      if (len > 2) {
        prop = prop.replace('3d', '')
        style_prop[prop + 'Z'] = values[2]
      }

      if (len > 1) {
        style_prop[prop + 'X'] = values[0]
        style_prop[prop + 'Y'] = values[1]
      } else {
        style_prop[prop] = values[0]
        prop = prop.substring(0, prop.length - 1)
      }

      if (!has_prop[prop]) {
        if (style_order) {
          style_order[style_order_len++] = prop
        }

        has_prop[prop] = 1
      }
    }
  }

  return style_prop
}

/**
 * @param style
 * @param style_value
 * @param style_prop
 * @param {Array<string>=} style_order
 * @returns {Object}
 */

function parse_filter(style, style_value, style_prop, style_order) {
  if (style_value === 'none') {
    style_prop[style] = filter_default_values[style] - 1

    if (style_order) {
      style_order[style_order.length] = style
    }

    return style_prop
  } else if (('' + style_value).length < 8) {
    style_prop[style] = style_value

    if (style_order) {
      style_order[style_order.length] = style
    }

    return style_prop
  }

  const parts = style_value.split(' ')
  const has_prop = {}

  let style_order_len = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    let prop = substring_match(part, '(')

    if (prop) {
      style_prop[prop] = substring_match(part, '(', ')')
      prop = prop.substring(0, prop.length)

      if (!has_prop[prop]) {
        if (style_order) {
          style_order[style_order_len++] = prop
        }

        has_prop[prop] = 1
      }
    }
  }

  return style_prop
}

function get_transform(obj, style, from) {
  let style_prop = obj._transform
  let style_order

  if (!style_prop) {
    obj._transform = style_prop = {}
    obj._transform_order = style_order = []
  } else {
    style_order = obj._transform_order
  }

  if (!style_prop || is_undefined(style_prop[style])) {
    let style_value = from || get_style(obj, prefix_transform || 'transform')

    parse_transform(style, style_value, style_prop, style_order)
  }

  return style_prop[style]
}

function get_filter(obj, style, from) {
  let style_prop = obj._filter
  let style_order

  if (!style_prop) {
    obj._filter = style_prop = {}
    obj._filter_order = style_order = []
  } else {
    style_order = obj._filter_order
  }

  if (!style_prop || is_undefined(style_prop[style])) {
    const style_value = from || get_style(obj, prefix_filter || 'filter')

    parse_filter(style, style_value, style_prop, style_order)
  }

  return style_prop[style] || filter_default_values[style] - 1
}

/**
 * @param {Element} obj
 * @param {string} style
 *  @param {string} from
 * @param {string=} style_group
 * @returns {Object<string, number>}
 */

function get_color(obj, style, from, style_group) {
  const key = '_' + style_group
  let style_prop = obj[key]

  if (!style_prop) {
    const style_value = from || get_style(obj, style_group)

    obj[key] = style_prop = parse_color(style_value, style_group, /* default_alpha: */ 1)
  }

  return style_prop[style]
}

/**
 * @param {Object<string, string|number>} transform
 * @param {Array<string>} order
 * @returns {string}
 */

function merge_transform(transform, order) {
  let str = ''

  for (let i = 0, len = order.length; i < len; i++) {
    const prop = order[i]
    const default_value = prop === 'scale' ? 1 : 0

    const x = transform[prop + 'X']
    const y = transform[prop + 'Y']
    const z = transform[prop + 'Z']

    if (x || y || z) {
      if (prop === 'rotate') {
        if (x) str += prop + 'X(' + (x || default_value) + ') '
        if (y) str += prop + 'Y(' + (y || default_value) + ') '
      }

      if (z && parse_float(z) !== default_value) {
        if (prop === 'rotate') {
          str += prop + 'Z(' + (z || default_value) + ') '
        } else {
          str += prop + '3d(' + (x || default_value) + ',' + (y || default_value) + ',' + z + ') '
        }
      } else {
        if (prop !== 'rotate') {
          str += prop + '(' + (x || default_value) + ',' + (y || default_value) + ') '
        }
      }
    }
  }

  return str
}

/**
 * @param {Object<string, string|number>} filter
 * @param {Array<string>} order
 * @returns {string}
 */

function merge_filter(filter, order) {
  let str = ''

  for (let i = 0, len = order.length; i < len; i++) {
    const prop = order[i]
    const default_value = (filter_default_values[prop] || 1) - 1
    const value = filter[prop]

    if (value && value !== default_value) {
      str += prop + '(' + value + ') '
    }
  }

  return str
}

/**
 * @param {Object<string, number>} color
 * @param {string} prop
 * @param {string} unit
 * @returns {string}
 */

function merge_color(color, prop, unit) {
  let r = color[prop + 'R'] || 0
  let g = color[prop + 'G'] || 0
  let b = color[prop + 'B'] || 0
  let a = color[prop + 'A']

  if (unit === '%') {
    r = (2.55 * r + 0.5) >> 0
    g = (2.55 * g + 0.5) >> 0
    b = (2.55 * b + 0.5) >> 0

    if (a) {
      a /= 100
    }
  }

  return a === 1 || is_undefined(a)
    ? '#' + int_to_hex_table[r] + int_to_hex_table[g] + int_to_hex_table[b]
    : 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}

/*
      function merge_arrays_at(first, second, pos){

          const second_length = second.length;
          const first_length = first.length;
          const result = new Array(first_length + second_length);
          
          for(let i = 0; i < pos; i++){

              result[i] = first[i];
          }

          for(let i = 0; i < second_length; i++){

              result[i + pos] = second[i];
          }

          for(let i = pos; i < first_length; i++){

              result[i + second_length] = first[i];
          }

          return result;
      }
      */

function is_visible(obj) {
  const bounds = obj.getBoundingClientRect()

  return bounds.top >= 0 && bounds.bottom <= window.innerHeight
}

/**
 * @param {string} str
 * @param {string} from
 * @param {string=} to
 * @returns {string}
 */

function substring_match(str, from, to) {
  const pos = str.indexOf(from)

  if (pos !== -1) {
    if (to) {
      return str.substring(pos + from.length, str.indexOf(to))
    } else {
      return str.substring(0, pos)
    }
  }

  return ''
}

function parse_bezier(config_ease) {
  if (config_ease) {
    let bezier
    let values

    if (is_string(config_ease)) {
      if ((bezier = substring_match(config_ease, 'bezier(', ')'))) {
        bezier = bezier.replace(/ /g, '')
        values = bezier.split(',')
      }
    } else if (is_array(config_ease)) {
      bezier = config_ease.join(',')
      values = config_ease
    }

    if (bezier) {
      easing[bezier] || (easing[bezier] = easing_bezier.apply(easing_bezier, values))
      config_ease = bezier
    }
  }

  return config_ease
}

function get_transform_matrix(style_matrix, style) {
  // var values = matrix.split('(')[1].split(')')[0].split(','),
  //     pi = Math.PI,
  //     sinB = parseFloat(values[8]),
  //     b = Math.round(Math.asin(sinB) * 180 / pi),
  //     cosB = Math.cos(b * pi / 180),
  //     matrixVal10 = parseFloat(values[9]),
  //     a = Math.round(Math.asin(-matrixVal10 / cosB) * 180 / pi),
  //     matrixVal1 = parseFloat(values[0]),
  //     c = Math.round(Math.acos(matrixVal1 / cosB) * 180 / pi);
  // rotateX = a;
  // rotateY = b;
  // rotateZ = c;

  const values = substring_match(style_matrix, '(', ')').split(',')

  return parseFloat(values[matrix2d_index[style]]) || 0
}

function parse_keyframes(styles, style_keys, style_length, config_duration) {
  const sequences = new Array(style_length)

  for (let i = 0; i < style_length; i++) {
    const key = style_keys[i]

    const position = parseInt(key, 10)
    const position_last = i > 0 ? parseInt(style_keys[i - 1], 10) : 0
    const interval = position - position_last
    const style = styles[key]

    const inner_style_keys = Object.keys(style)
    const inner_style_length = inner_style_keys.length

    for (let a = 0; a < inner_style_length; a++) {
      const inner_key = inner_style_keys[a]
      let inner_style = style[inner_key]

      if (is_undefined(inner_style['to'])) {
        style[inner_key] = inner_style = {
          to: inner_style
        }
      }

      inner_style['duration'] = ((config_duration / 100) * interval + 1) >> 0
    }

    sequences[i] = style
  }

  return sequences
}

// TODO:
// dynamic values { style: function() }
// convert units (support getting styles in desired unit)
// support easing steps { ease: 5 }

/**
 * @param {Array<(Node|null)>|Node|NodeList|string|null} obj
 * @param {Object<string, number|string|Object>|Array<Object>|string|Array<string>} styles
 * @param {Object<string, number|string|boolean>|Function=} config
 * @param {Function=} callback
 */

function animate(obj, styles, config, callback) {
  if (PROFILER) {
    profile_start('scene.init')
  }

  if (DEBUG) {
    if (!obj) {
      console.error('Element not found', obj)
    }

    if (!styles) {
      console.error('Styles not found', styles)
    }
  }

  let sequences

  if (SUPPORT_SEQUENCE) {
    if (is_array(styles)) {
      sequences = styles
      styles = styles[0]
    }
  }

  if (SUPPORT_PRESET && is_string(styles)) {
    if (styles.indexOf(' ') === -1) {
      if (DEBUG && !presets[styles]) {
        console.error('Effect not found: ' + styles)
      }

      styles = presets[styles]
    } else {
      styles = styles.split(' ')

      const merged = {}

      for (let i = 0, len = styles.length; i < len; i++) {
        if (DEBUG && !presets[styles[i]]) {
          console.error('Effect not found: ' + styles[i])
        }

        const effect = presets[styles[i]]
        const keys = Object.keys(effect)

        for (let a = 0; a < keys.length; a++) {
          merged[keys[a]] = effect[keys[a]]
        }
      }

      styles = merged
    }
  }

  if (config) {
    if (typeof config === 'function') {
      callback = config
      config = {}
    } else {
      const config_engine = config['engine']

      if (SUPPORT_TRANSITION && config_engine === 'css') {
        return this.transition(obj, styles, config)
      }

      if (SUPPORT_NATIVE && config_engine === 'native') {
        return this.native(obj, styles, config)
      }

      if (DEBUG && config_engine) {
        console.error('Engine not found: ' + config_engine)
      }
    }
  } else {
    config = {}
  }

  obj = get_nodes(obj)

  let config_delay = config['delay']
  let config_duration = config['duration'] || 400
  let config_ease = (SUPPORT_EASING ? parse_bezier(config['ease']) : config['ease']) || ''

  let style_keys = Object.keys(styles)
  let style_length = style_keys.length

  if (SUPPORT_SEQUENCE && style_length) {
    let key = style_keys[0]

    if (key[key.length - 1] === '%') {
      sequences = parse_keyframes(styles, style_keys, style_length, config_duration)

      styles = sequences[0]
      style_keys = Object.keys(styles)
      style_length = style_keys.length
    }
  }

  const config_callback =
    callback ||
    config['callback'] ||
    (SUPPORT_SEQUENCE &&
      sequences &&
      function () {
        /* TODO: mark last style */
      })
  const config_step = config['step']
  const config_force = config['force']
  const config_strict = SUPPORT_CONCURRENCY && config['strict']
  const config_init = config['init']
  const config_loop = SUPPORT_SEQUENCE && (config['loop'] || 1)

  let last_transform
  let last_filter
  let last_color
  let last_color_background
  let last_color_border

  if (SUPPORT_TRANSFORM || SUPPORT_COLOR || SUPPORT_FILTER) {
    for (let k = style_length; k-- > 0; ) {
      let key = style_keys[k]

      if (SUPPORT_TRANSFORM) {
        if (key === 'transform') {
          const props = parse_transform(key, styles[key], {})
          const prop_keys = Object.keys(/** @type {!Object} */ (props))

          for (let i = 0, len = prop_keys.length; i < len; i++) {
            const tmp = prop_keys[i]

            style_keys[style_length++] = tmp
            styles[tmp] = props[tmp]
          }

          last_transform = prop_keys[prop_keys.length - 1]

          if (SUPPORT_COLOR || SUPPORT_FILTER) {
            continue
          } else {
            break
          }
        }

        if (!last_transform && transform_keys[key]) {
          last_transform = key

          if (SUPPORT_COLOR || SUPPORT_FILTER) {
            continue
          } else {
            break
          }
        }
      }

      if (SUPPORT_FILTER) {
        if (key === 'filter') {
          const props = parse_filter(key, styles[key], {})
          const prop_keys = Object.keys(/** @type {!Object} */ (props))

          for (let i = 0; i < prop_keys.length; i++) {
            let tmp = prop_keys[i]

            if (tmp === 'hue') {
              tmp = 'hue-rotate'
            }

            style_keys[style_length++] = tmp
            styles[tmp] = props[tmp]
            last_filter = tmp
          }

          if (SUPPORT_COLOR) {
            continue
          } else {
            break
          }
        }

        if (key === 'hue') {
          key = 'hue-rotate'
        }

        if (!last_filter && filter_default_values[key]) {
          last_filter = key

          if (SUPPORT_COLOR) {
            continue
          } else {
            break
          }
        }
      }

      if (SUPPORT_COLOR) {
        let color_type = color_keys[key]

        if (color_type) {
          if (color_type < 0) {
            let value = styles[key]

            if (typeof value === 'object') {
              value = value['to']
            }

            const color = parse_color(value, key)
            let tmp, val

            style_keys[style_length++] = tmp = key + 'R'
            styles[tmp] = color[tmp]

            style_keys[style_length++] = tmp = key + 'G'
            styles[tmp] = color[tmp]

            style_keys[style_length++] = tmp = key + 'B'
            styles[tmp] = color[tmp]

            const has_alpha = !is_undefined((val = color[(tmp = key + 'A')]))

            if (has_alpha) {
              style_keys[style_length++] = tmp
              styles[tmp] = val
              key = tmp
            } else {
              key = key + 'B'
            }

            color_type *= -1
          }

          if (!last_color && color_type === 1) {
            last_color = key
          } else if (!last_color_background && color_type === 2) {
            last_color_background = key
          } else if (!last_color_border && color_type === 3) {
            last_color_border = key
          }
        }
      }
    }
  }

  const seq_id = SUPPORT_SEQUENCE && '_seq_' + this.id

  if (PROFILER) {
    profile_end('scene.init')
    profile_start('scene.handle')
  }

  /* Create Jobs */

  for (let k = 0; k < style_length; k++) {
    let has_transform
    let has_filter
    let has_color
    let has_color_background
    let has_color_border
    let style_group

    let key = style_keys[k]
    let value = styles[key]
    let from
    let unit

    if (SUPPORT_TRANSFORM) {
      if (key === 'transform') {
        continue
      }

      has_transform = transform_keys[key] && last_transform
    }

    if (SUPPORT_FILTER) {
      if (key === 'filter') {
        continue
      }

      if (key === 'hue') {
        key = 'hue-rotate'
      }

      has_filter = filter_default_values[key] && last_filter
    }

    if (SUPPORT_COLOR) {
      const color_type = color_keys[key]

      if (color_type) {
        if (color_type < 0) {
          continue
        }

        if (color_type === 1) {
          has_color = last_color
          style_group = 'color'
        } else if (color_type === 2) {
          has_color_background = last_color_background
          style_group = 'backgroundColor'
        } else if (color_type === 3) {
          has_color_border = last_color_border
          style_group = 'borderColor'
        }
      }
    }

    if (SUPPORT_SCROLL) {
      if (key === 'scroll') {
        let tmp

        style_keys[style_length++] = tmp = 'scrollLeft'
        styles[tmp] = value[0]

        style_keys[style_length++] = tmp = 'scrollTop'
        styles[tmp] = value[1]

        continue
      }
    }

    if (is_array(value)) {
      from = value[0]
      unit = value[2]
      value = value[1]
    } else if (typeof value === 'object') {
      config_delay = value['delay'] || config_delay
      config_duration = value['duration'] || config_duration
      config_ease = value['ease'] || config_ease
      from = value['from']
      unit = value['unit']
      value = value['to']
    }

    const last = k === style_length - 1
    const job_id = '_fat_' + key + this.id

    for (let i = 0, len = obj.length; i < len; i++) {
      const current_obj = obj[i]
      const style_id = config_strict && key + (current_obj['_id'] || (current_obj['_id'] = obj_counter++))

      if (last && sequences) {
        current_obj[seq_id] = sequences
        current_obj[seq_id + '_c'] = 0
      }

      if (config_init) {
        if (k === 0) {
          current_obj._style_comp = null

          if (last_transform) {
            current_obj._transform = null
          } else if (last_color) {
            current_obj._color = null
          } else if (last_color_background) {
            current_obj._backgroundColor = null
          } else if (last_color_border) {
            current_obj._borderColor = null
          } else if (last_filter) {
            current_obj._filter = null
          }
        }
      }

      /**
       * @type Job
       */

      const cur_job = !config_init && (!SUPPORT_CONCURRENCY || !style_id) && current_obj[job_id]

      if (cur_job) {
        if (SUPPORT_TRANSFORM || SUPPORT_COLOR || SUPPORT_FILTER) {
          cur_job.update_job(
            from,
            value,
            //unit,
            config_force,
            config_duration,
            config_ease,
            last && config_callback,
            last && config_step,
            config_delay,
            has_transform,
            has_filter,
            has_color || has_color_background || has_color_border,
            style_group
          )
        } else {
          cur_job.update_job(
            from,
            value,
            //unit,
            config_force,
            config_duration,
            config_ease,
            last && config_callback,
            last && config_step,
            config_delay
          )
        }
      } else {
        if (SUPPORT_TRANSFORM || SUPPORT_COLOR || SUPPORT_FILTER) {
          this.create_job(
            current_obj,
            key,
            job_id,
            from,
            value,
            unit,
            config_force,
            config_duration,
            config_ease,
            last && config_callback,
            last && config_step,
            config_delay,
            config_loop,
            style_id,
            seq_id,
            has_transform,
            has_filter,
            has_color || has_color_background || has_color_border,
            style_group
          )
        } else {
          this.create_job(
            current_obj,
            key,
            job_id,
            from,
            value,
            unit,
            config_force,
            config_duration,
            config_ease,
            last && config_callback,
            last && config_step,
            config_delay,
            config_loop,
            style_id,
            seq_id
          )
        }
      }
    }
  }

  if (!this.exec) {
    this.exec = requestAnimationFrame(this.render)
  }

  if (PROFILER) {
    profile_end('scene.handle')
  }

  return this
}

/**
 * @param fn
 * @param {number=} delay
 * @return {number}
 */

function paint(fn, delay) {
  if (delay) {
    fn._delay = delay
  }

  const len = this.paint_stack.length

  this.paint_stack[len] = fn

  if (!this.exec) {
    this.exec = requestAnimationFrame(this.render)
  }

  return len
}

/**
 * @param {number=} id
 */

function cancel(id) {
  this.paint_stack[id] = null
}

const FatPrototype = Fat.prototype

if (SUPPORT_ANIMATE) {
  FatPrototype.create_job = create_job
  /** @export */
  FatPrototype.animate = animate
  /** @export */
  FatPrototype.destroy = destroy
  //FatPrototype.init = init;
  /** @export */
  FatPrototype.create = function (config) {
    return new Fat(config)
  }

  if (SUPPORT_PAINT) {
    /** @export */
    FatPrototype.paint = paint
    /** @export */
    FatPrototype.cancel = cancel
  }

  if (SUPPORT_EASING) {
    /** @export */
    FatPrototype.ease = easing
  }

  if (SUPPORT_PRESET) {
    /** @export */
    FatPrototype.preset = presets
  }

  if (SUPPORT_TRANSFORM) {
    /** @export */
    FatPrototype.transform = function (obj, styles, config, callback) {
      if (is_string(styles)) {
        styles = {
          transform: styles
        }
      }

      return this.animate(obj, styles, config, callback)
    }
  }

  if (SUPPORT_FILTER) {
    /** @export */
    FatPrototype.filter = function (obj, styles, config, callback) {
      if (is_string(styles)) {
        styles = {
          filter: styles
        }
      }

      return this.animate(obj, styles, config, callback)
    }
  }

  if (SUPPORT_CONTROL) {
    /** @export */
    FatPrototype.set = set

    /** @export */
    FatPrototype.seek = seek

    /** @export */
    FatPrototype.remove = remove

    /** @export */
    FatPrototype.shift = function (ms) {
      return this.seek(0, ms)
    }

    /** @export */
    FatPrototype.pause = function (toggle) {
      this.playing = is_undefined(toggle) ? false : toggle
      return this
    }

    /** @export */
    FatPrototype.start = function (toggle) {
      this.playing = is_undefined(toggle) ? true : toggle
      return this
    }

    /** @export */
    FatPrototype.speed = function (ratio) {
      this.ratio = ratio
      return this
    }

    /** @export */
    FatPrototype.reset = function () {
      this.ratio = 1
      this.direction = true
      return this.seek(0)
    }

    /** @export */
    FatPrototype.finish = function () {
      return this.seek(1)
    }

    /** @export */
    FatPrototype.reverse = function (toggle) {
      this.direction = is_undefined(toggle) ? !this.direction : !toggle
      return this
    }
  }
}

if (SUPPORT_TRANSITION) {
  /** @export */
  FatPrototype.transition = transition
}

if (SUPPORT_NATIVE) {
  /** @export */
  FatPrototype.native = native
}

/**
 * @param {Array<(Node|null)>|Node|NodeList|string|null} obj
 * @param {!Object} styles
 * @param {Object} config
 */

function transition(obj, styles, config) {
  if (DEBUG) {
    if (!obj) {
      console.error('Element not found', obj)
    }

    if (!styles) {
      console.error('Styles not found', styles)
    }
  }

  config || (config = {})

  obj = get_nodes(obj)

  const style_keys = Object.keys(styles)
  const style_length = style_keys.length
  const config_duration = (config['duration'] || 400) + 'ms'
  const config_ease = config['ease'] || 'linear'
  const config_callback = config['callback'] || false
  // TODO:
  //const config_step = config["step"] || false;
  const config_delay = (config['delay'] || 0) + 'ms'
  const config_force = config['force']

  for (let i = 0; i < style_length; i++) {
    const current_style = style_keys[i]

    if (prefix_transform && current_style === 'transform') {
      styles[prefix_transform] = styles[current_style]
      style_keys[i] = prefix_transform
    } else {
      const snake_val = camel_to_snake(current_style)

      styles[snake_val] = styles[current_style]
      style_keys[i] = snake_val
    }
  }

  const event = prefix_transition ? prefix_transition + 'End' : 'transitionend'

  for (let i = 0, len = obj.length; i < len; i++) {
    const current_obj = obj[i]
    const current_listener = current_obj.current_listener

    const transition_str = ' ' + config_duration + ' ' + config_ease + ' ' + config_delay
    const props_str = style_keys.join(transition_str + ',') + transition_str
    const current_style = current_obj._style || (current_obj._style = current_obj.style)

    set_style(current_style, prefix_transition_js || 'transition', props_str, config_force)

    if (!config_callback || config_callback !== current_listener) {
      if (current_listener) {
        current_obj.removeEventListener(event, current_listener, false)
        current_obj.current_listener = null
      }

      if (config_callback) {
        current_obj.current_listener = config_callback
        current_obj.addEventListener(event, config_callback, false)
      }
    }

    requestAnimationFrame(function () {
      for (let k = 0; k < style_length; k++) {
        const key = style_keys[k]

        set_style(current_style, key, styles[key], config_force)
      }
    })
  }

  return this
}

/**
 * @param {Array<(Node|null)>|Node|NodeList|string|null} obj
 * @param {!Object} styles
 * @param {Object} config
 */

function native(obj, styles, config) {
  if (DEBUG) {
    if (!obj) {
      console.error('Element not found', obj)
    }

    if (!styles) {
      console.error('Styles not found', styles)
    }
  }

  config || (config = {})

  const style_keys = Object.keys(styles)

  obj = get_nodes(obj)

  const config_duration = config['duration'] || 400
  const config_ease = config['ease'] || 'linear'
  const config_callback = config['callback']
  // TODO:
  //const config_step = config["step"];
  //const config_cancel = config["cancel"];
  const config_delay = config['delay'] || 0
  const style_length = style_keys.length

  for (let i = 0, len = obj.length; i < len; i++) {
    const current_obj = obj[i]
    const styles_arr = {}

    for (let k = 0; k < style_length; k++) {
      const key = style_keys[k]

      styles_arr[key] = [get_style(current_obj, key), styles[key]]
    }

    current_obj.animate(styles_arr, {
      delay: config_delay,
      duration: config_duration,
      ease: config_ease
    }).onfinish = function () {
      for (let k = 0; k < style_length; k++) {
        const key = style_keys[k]

        set_style(current_obj._style, key, styles[key])
      }

      if (config_callback) {
        config_callback.call(current_obj)
      }
    }
  }

  return this
}

if (PROFILER) {
  /** @export */
  window.stats = profiles
}

function profile_start(key) {
  ;(
    profile[key] ||
    (profile[key] = {
      /** @export */ time: 0,
      /** @export */ count: 0,
      /** @export */ ops: 0,
      /** @export */ nano: 0
    })
  ).ops = (performance || Date).now()
}

function profile_end(key) {
  const current = profile[key]

  current.time += (performance || Date).now() - current.ops
  current.count++
  current.ops = (1000 / current.time) * current.count
  current.nano = (current.time / current.count) * 1000
}

export default new Fat()
