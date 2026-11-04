type Point = [number, number, number];
type Point2 = [number, number];

/** Original faceted B: a spine and two hollow octagonal lobes, with bevel rings. */
export function buildBPrism() {
  const vertices: number[] = [];
  function face(a: Point, b: Point, c: Point, material: number) {
    const u = b.map((v, i) => v - a[i]); const v = c.map((value, i) => value - a[i]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const length = Math.hypot(...n) || 1;
    for (const p of [a, b, c]) vertices.push(...p, ...n.map(value => value / length), material);
  }
  function quad(a: Point, b: Point, c: Point, d: Point, material: number) { face(a, b, c, material); face(a, c, d, material); }
  const point = (p: Point2, z: number): Point => [p[0], p[1], z];
  function ring(outer: Point2[], inner: Point2[], center: Point2) {
    const inset = (p: Point2, amount: number): Point2 => [p[0] + (center[0] - p[0]) * amount, p[1] + (center[1] - p[1]) * amount];
    for (let i = 0; i < outer.length; i++) {
      const j = (i + 1) % outer.length;
      const a = outer[i], b = outer[j], c = inner[j], d = inner[i];
      const ai = inset(a, 0.065), bi = inset(b, 0.065), ci = inset(c, -0.12), di = inset(d, -0.12);
      quad(point(ai, .24), point(bi, .24), point(ci, .24), point(di, .24), 0);
      quad(point(a, .17), point(b, .17), point(bi, .24), point(ai, .24), 1);
      quad(point(di, .24), point(ci, .24), point(c, .17), point(d, .17), 1);
      quad(point(a, -.24), point(b, -.24), point(b, .17), point(a, .17), 2);
      quad(point(c, -.24), point(d, -.24), point(d, .17), point(c, .17), 2);
      quad(point(d, -.24), point(c, -.24), point(b, -.24), point(a, -.24), 0);
    }
  }
  const octagon = (x0: number, x1: number, y0: number, y1: number, cut: number): Point2[] => [
    [x0, y1], [x1 - cut, y1], [x1, y1 - cut], [x1, y0 + cut], [x1 - cut, y0], [x0, y0], [x0, y0 + cut], [x0, y1 - cut],
  ];
  ring(octagon(-.51, .63, .02, 1.18, .23), octagon(-.11, .27, .38, .83, .10), [.05, .60]);
  ring(octagon(-.51, .76, -1.18, .04, .25), octagon(-.11, .37, -.83, -.32, .11), [.1, -.57]);
  // Solid left stem. A bevelled rectangular prism keeps the silhouette clearly B.
  const stem: Point2[] = [[-.78, 1.18], [-.47, 1.18], [-.47, -1.18], [-.78, -1.18]];
  quad(point(stem[0], .245), point(stem[1], .245), point(stem[2], .245), point(stem[3], .245), 0);
  quad(point(stem[3], -.24), point(stem[2], -.24), point(stem[1], -.24), point(stem[0], -.24), 0);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(point(stem[i], -.24), point(stem[j], -.24), point(stem[j], .245), point(stem[i], .245), 1); }
  return new Float32Array(vertices);
}
