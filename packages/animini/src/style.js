const TRANSFORM_KEYS = { scale: 1, x: 1, y: 1 }

export function setStyle(rawStyle, el) {
  const { x, y, scale, ...rest } = rawStyle
  for (let key in rest) {
    el.style[key] = rawStyle[key] + 'px'
  }
  if (x === undefined && y === undefined && scale === undefined) return
  if (!x && !y && scale === 1) el.style.removeProperty('transform')
  el.style.transform = `matrix(${scale || 1}, 0, 0, ${scale || 1}, ${x || 0}, ${y || 0})`
}

export function getStyleValue(style, key) {
  if (TRANSFORM_KEYS[key]) {
    return getTranslateValues(style)[key]
  }
  return parseFloat(style[key])
}

function getTranslateValues(style) {
  const matrix = style.transform || style.webkitTransform || style.mozTransform

  // No transform property. Simply return 0 values.
  if (matrix === 'none' || typeof matrix === 'undefined') {
    return { scale: 1, x: 0, y: 0, z: 0 }
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes('3d') ? '3d' : '2d'
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')

  if (matrixType === '2d') {
    return { scale: matrixValues[0], x: matrixValues[4], y: matrixValues[5], z: 0 }
  }

  if (matrixType === '3d') {
    return { scale: matrixValues[0], x: matrixValues[12], y: matrixValues[13], z: matrixValues[14] }
  }
}
