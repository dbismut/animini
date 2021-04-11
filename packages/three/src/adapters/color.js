function parse(str) {
  if (str.indexOf('rgb') === 0) {
    const [r, g, b] = str.match(/\d+/g)
    return { r: r / 255, g: g / 255, b: b / 255 }
  }
  if (str.indexOf('#') === 0) {
    const [r = 0, g = 0, b = 0] = str
      .substr(1)
      .replace('#', '')
      .match(/.{1,2}/g)
    return { r: parseInt(r, 16) / 255, g: parseInt(g, 16) / 255, b: parseInt(b, 16) / 255 }
  }
}

export const color = { parse }
