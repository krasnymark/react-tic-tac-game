export class Utils {
  static random(n) {
    return Math.floor(Math.random() * n);
  }
  static shuffle(arr) {
    const a = [...arr];
    // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Move from point p in direction d by n and return new point
  static move(p, d, n = 1) {
    return {x: p.x + d.x * n, y: p.y + d.y * n};
  }
  // Reverse direction
  static reverse(d) {
    return {x: -d.x, y: -d.y};
  }
  // Trim in place
  static trim(line) {
    while (line.pattern.charAt(0) === '_' && line.pattern.charAt(1) === '_') {
      line.pattern = line.pattern.slice(1);
      line.shift++;
    }
    while (line.pattern.charAt(line.pattern.length - 1) === '_' && line.pattern.charAt(line.pattern.length - 2) === '_') {
      line.pattern = line.pattern.slice(0, line.pattern.length - 1);
    }
  }
}
