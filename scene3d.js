/* ============================================================
   scene3d.js — a tiny, dependency-free WebGL engine.
   Draws floating 3D shapes (crystals, torus, torus-knots, wireframes)
   and depth-lit particles behind the whole page. It reacts to scroll
   speed and mouse movement. No libraries, works offline.

   You normally do NOT need to edit this file.
   To tweak shapes, edit the OBJECTS list below.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- palette (A = lit side, B = shaded side) ---------- */
  var ROSE   = { a: [1.0, 0.58, 0.69],  b: [0.64, 0.10, 0.31] };
  var INDIGO = { a: [0.64, 0.68, 1.0],  b: [0.22, 0.26, 0.80] };
  var PEACH  = { a: [1.0, 0.82, 0.64],  b: [0.96, 0.45, 0.28] };
  var VIOLET = { a: [0.87, 0.68, 1.0],  b: [0.44, 0.24, 0.80] };
  var MINT   = { a: [0.66, 0.96, 0.88], b: [0.08, 0.56, 0.56] };

  /* ---------- the floating objects ----------
     x  : -1..1 of the visible width at that depth (desktop)
     nx : same, on narrow/mobile screens (default: pushed to the edge)
     y  : 0..1 down the whole page
     z  : depth (negative = further away = slower parallax)
     s  : size, ph : animation phase, sp : spin speeds [x,y,z]
     m  : also show on mobile                                          */
  var OBJECTS = [
    { g: "knot",  x: 0.50, nx: 0.0,  y: 0.045, ny: 0.028, z: -5.5, s: 2.1, c: ROSE,   sp: [0.20, 0.32, 0.10], ph: 0.0, m: true },
    { g: "wire",  x: 0.50, nx: 0.0,  y: 0.050, ny: 0.030, z: -1.5, s: 2.9, c: INDIGO, sp: [0.12, -0.18, 0.06], ph: 1.0, m: true },
    { g: "icosa", x: -0.88, y: 0.11, z: 0.5,  s: 0.95, c: INDIGO, sp: [0.30, 0.40, 0.12], ph: 2.0, m: true },
    { g: "torus", x: 0.90,  y: 0.20, z: 1.5,  s: 0.85, c: PEACH,  sp: [0.50, 0.22, 0.30], ph: 3.1, m: true },
    { g: "octa",  x: -0.92, y: 0.30, z: -1.0, s: 1.10, c: VIOLET, sp: [0.22, 0.45, 0.18], ph: 4.2 },
    { g: "knot",  x: 0.90,  y: 0.41, z: -0.5, s: 0.85, c: MINT,   sp: [0.26, 0.30, 0.20], ph: 5.0, m: true },
    { g: "icosa", x: -0.90, y: 0.52, z: 1.0,  s: 0.80, c: ROSE,   sp: [0.35, 0.28, 0.22], ph: 0.7, m: true },
    { g: "wire",  x: 0.92,  y: 0.60, z: -1.0, s: 1.60, c: VIOLET, sp: [0.18, 0.24, 0.10], ph: 1.8 },
    { g: "torus", x: -0.92, y: 0.70, z: -0.5, s: 1.00, c: INDIGO, sp: [0.30, 0.50, 0.12], ph: 2.7, m: true },
    { g: "octa",  x: 0.90,  y: 0.79, z: 0.5,  s: 0.95, c: PEACH,  sp: [0.24, 0.38, 0.20], ph: 3.9, m: true },
    { g: "knot",  x: -0.88, y: 0.88, z: -2.0, s: 1.35, c: VIOLET, sp: [0.20, 0.34, 0.12], ph: 4.8 },
    { g: "icosa", x: 0.88,  y: 0.95, z: 1.0,  s: 0.85, c: MINT,   sp: [0.32, 0.26, 0.16], ph: 5.6, m: true }
  ];

  /* ---------- tiny matrix helpers (column-major) ---------- */
  function perspective(o, fovy, aspect, n, f) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    o[0] = t / aspect; o[1] = 0; o[2] = 0; o[3] = 0;
    o[4] = 0; o[5] = t; o[6] = 0; o[7] = 0;
    o[8] = 0; o[9] = 0; o[10] = (f + n) * nf; o[11] = -1;
    o[12] = 0; o[13] = 0; o[14] = 2 * f * n * nf; o[15] = 0;
  }
  function translation(o, x, y, z) {
    o[0] = 1; o[1] = 0; o[2] = 0; o[3] = 0;
    o[4] = 0; o[5] = 1; o[6] = 0; o[7] = 0;
    o[8] = 0; o[9] = 0; o[10] = 1; o[11] = 0;
    o[12] = x; o[13] = y; o[14] = z; o[15] = 1;
  }
  /* R = Ry * Rx * Rz */
  function rotation(o, x, y, z) {
    var cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
    var r00 = cy * cz + sy * sx * sz, r01 = -cy * sz + sy * sx * cz, r02 = sy * cx;
    var r10 = cx * sz,                r11 = cx * cz,                 r12 = -sx;
    var r20 = -sy * cz + cy * sx * sz, r21 = sy * sz + cy * sx * cz, r22 = cy * cx;
    o[0] = r00; o[1] = r10; o[2] = r20; o[3] = 0;
    o[4] = r01; o[5] = r11; o[6] = r21; o[7] = 0;
    o[8] = r02; o[9] = r12; o[10] = r22; o[11] = 0;
    o[12] = 0; o[13] = 0; o[14] = 0; o[15] = 1;
  }

  /* ---------- geometry ---------- */
  function flatGeo(V, F) {
    var out = [];
    F.forEach(function (f) {
      var a = V[f[0]], b = V[f[1]], c = V[f[2]];
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      var vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= l; ny /= l; nz /= l;
      var mx = a[0] + b[0] + c[0], my = a[1] + b[1] + c[1], mz = a[2] + b[2] + c[2];
      if (nx * mx + ny * my + nz * mz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      [a, b, c].forEach(function (p) { out.push(p[0], p[1], p[2], nx, ny, nz); });
    });
    return new Float32Array(out);
  }

  function icosaData() {
    var t = (1 + Math.sqrt(5)) / 2;
    var raw = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
    var V = raw.map(function (v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / l, v[1] / l, v[2] / l]; });
    var F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
             [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    return { V: V, F: F };
  }
  function icosaGeo() { var d = icosaData(); return flatGeo(d.V, d.F); }
  function wireGeo() {
    var d = icosaData(), seen = {}, out = [];
    d.F.forEach(function (f) {
      for (var i = 0; i < 3; i++) {
        var a = f[i], b = f[(i + 1) % 3], k = a < b ? a + "_" + b : b + "_" + a;
        if (seen[k]) continue; seen[k] = 1;
        out.push(d.V[a][0], d.V[a][1], d.V[a][2], d.V[b][0], d.V[b][1], d.V[b][2]);
      }
    });
    return new Float32Array(out);
  }
  function octaGeo() {
    var V = [[1, 0, 0], [-1, 0, 0], [0, 1.45, 0], [0, -1.45, 0], [0, 0, 1], [0, 0, -1]], F = [];
    for (var x = 0; x < 2; x++) for (var y = 2; y < 4; y++) for (var z = 4; z < 6; z++) F.push([x, y, z]);
    return flatGeo(V, F);
  }
  /* parametric surface -> smooth-shaded triangle list */
  function surface(nu, nv, fn) {
    var pts = [], i, j;
    for (i = 0; i <= nu; i++) { pts[i] = []; for (j = 0; j <= nv; j++) pts[i][j] = fn(i / nu, j / nv); }
    var out = [];
    function push(p) { out.push(p[0], p[1], p[2], p[3], p[4], p[5]); }
    for (i = 0; i < nu; i++) for (j = 0; j < nv; j++) {
      var a = pts[i][j], b = pts[i + 1][j], c = pts[i + 1][j + 1], d = pts[i][j + 1];
      push(a); push(b); push(c); push(a); push(c); push(d);
    }
    return new Float32Array(out);
  }
  function torusGeo() {
    var R = 1, r = 0.4, TAU = Math.PI * 2;
    return surface(44, 22, function (u, v) {
      var a = u * TAU, b = v * TAU, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      return [(R + r * cb) * ca, (R + r * cb) * sa, r * sb, cb * ca, cb * sa, sb];
    });
  }
  function knotGeo() {
    var p = 2, q = 3, tube = 0.3, TAU = Math.PI * 2;
    function curve(u) {
      var qp = q / p * u, cs = Math.cos(qp);
      return [(2 + cs) * 0.5 * Math.cos(u) * 1.15, (2 + cs) * 0.5 * Math.sin(u) * 1.15, Math.sin(qp) * 0.5 * 1.15];
    }
    return surface(140, 14, function (u, v) {
      var uu = u * p * TAU, P = curve(uu), P2 = curve(uu + 0.01);
      var T = [P2[0] - P[0], P2[1] - P[1], P2[2] - P[2]], N = [P2[0] + P[0], P2[1] + P[1], P2[2] + P[2]];
      var B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
      N = [B[1] * T[2] - B[2] * T[1], B[2] * T[0] - B[0] * T[2], B[0] * T[1] - B[1] * T[0]];
      var ln = Math.sqrt(N[0] * N[0] + N[1] * N[1] + N[2] * N[2]) || 1, lb = Math.sqrt(B[0] * B[0] + B[1] * B[1] + B[2] * B[2]) || 1;
      N = [N[0] / ln, N[1] / ln, N[2] / ln]; B = [B[0] / lb, B[1] / lb, B[2] / lb];
      var vv = v * TAU, cx = -Math.cos(vv), cy = Math.sin(vv);
      var nx = cx * N[0] + cy * B[0], ny = cx * N[1] + cy * B[1], nz = cx * N[2] + cy * B[2];
      return [P[0] + tube * nx, P[1] + tube * ny, P[2] + tube * nz, nx, ny, nz];
    });
  }

  /* ---------- shaders ---------- */
  var MESH_VS =
    "attribute vec3 aPos; attribute vec3 aNor;" +
    "uniform mat4 uProj, uView, uModel; uniform mat3 uNorm;" +
    "varying vec3 vN; varying vec3 vW;" +
    "void main(){ vec4 w = uModel * vec4(aPos,1.0); vW = w.xyz; vN = uNorm * aNor; gl_Position = uProj * uView * w; }";

  var PREC = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n";

  var MESH_FS = PREC +
    "varying vec3 vN; varying vec3 vW;" +
    "uniform vec3 uCam, uA, uB, uFog; uniform float uTime, uFade;" +
    "void main(){" +
    "  vec3 n = normalize(vN); vec3 v = normalize(uCam - vW);" +
    "  vec3 L = normalize(vec3(-0.45, 0.8, 0.75));" +
    "  float d = dot(n, L) * 0.5 + 0.5;" +
    "  vec3 base = mix(uB, uA, smoothstep(0.08, 0.95, d));" +
    "  float f = pow(1.0 - max(dot(n, v), 0.0), 2.6);" +
    "  vec3 h = normalize(L + v);" +
    "  float s = pow(max(dot(n, h), 0.0), 56.0);" +
    "  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + f * 0.9 + uTime * 0.04));" +
    "  vec3 col = base + f * mix(vec3(1.0), irid, 0.6) * 0.5 + s * 0.75;" +
    "  float dist = length(uCam - vW);" +
    "  float fog = clamp((dist - 13.0) / 14.0, 0.0, 0.62);" +
    "  col = mix(col, uFog, max(fog, uFade));" +
    "  gl_FragColor = vec4(col, 1.0);" +
    "}";

  var WIRE_VS =
    "attribute vec3 aPos; uniform mat4 uProj, uView, uModel;" +
    "void main(){ gl_Position = uProj * uView * uModel * vec4(aPos,1.0); }";
  var WIRE_FS = PREC + "uniform vec4 uCol; void main(){ gl_FragColor = vec4(uCol.rgb * uCol.a, uCol.a); }";

  var PT_VS =
    "attribute vec4 aP; uniform mat4 uProj, uView; uniform vec3 uSpan; uniform float uTime, uPx;" +
    "varying vec3 vC; varying float vA;" +
    "void main(){" +
    "  float s = aP.w;" +
    "  vec3 p = vec3(aP.x * uSpan.x, -(aP.y * 0.5 + 0.5) * uSpan.y, aP.z * uSpan.z - 2.0);" +
    "  p.x += sin(uTime * 0.25 + s * 40.0) * 0.4; p.y += cos(uTime * 0.2 + s * 55.0) * 0.4;" +
    "  vec4 v = uView * vec4(p, 1.0);" +
    "  gl_Position = uProj * v;" +
    "  gl_PointSize = clamp(uPx * (0.45 + s) / (-v.z), 1.5, 18.0);" +
    "  vC = mix(mix(vec3(0.69, 0.13, 0.31), vec3(0.26, 0.29, 0.88), step(0.33, s)), vec3(1.0, 0.54, 0.36), step(0.66, s));" +
    "  vA = 0.55;" +
    "}";
  var PT_FS = PREC +
    "varying vec3 vC; varying float vA;" +
    "void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.25, d) * vA; gl_FragColor = vec4(vC * a, a); }";

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (global.console) console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function program(gl, vs, fs) {
    var v = compile(gl, gl.VERTEX_SHADER, vs), f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    return p;
  }
  function uniforms(gl, p, names) {
    var o = {}; names.forEach(function (n) { o[n] = gl.getUniformLocation(p, n); }); return o;
  }

  /* ---------- engine ---------- */
  function create(canvas, opts) {
    opts = opts || {};
    var gl = null;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "high-performance" }) ||
           canvas.getContext("experimental-webgl");
    } catch (e) { gl = null; }
    if (!gl) return null;

    var pMesh = program(gl, MESH_VS, MESH_FS), pWire = program(gl, WIRE_VS, WIRE_FS), pPt = program(gl, PT_VS, PT_FS);
    if (!pMesh || !pWire || !pPt) return null;

    var uM = uniforms(gl, pMesh, ["uProj", "uView", "uModel", "uNorm", "uCam", "uA", "uB", "uFog", "uTime", "uFade"]);
    var uW = uniforms(gl, pWire, ["uProj", "uView", "uModel", "uCol"]);
    var uP = uniforms(gl, pPt, ["uProj", "uView", "uSpan", "uTime", "uPx"]);
    var aM = { pos: gl.getAttribLocation(pMesh, "aPos"), nor: gl.getAttribLocation(pMesh, "aNor") };
    var aW = gl.getAttribLocation(pWire, "aPos");
    var aPt = gl.getAttribLocation(pPt, "aP");

    function buf(data) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; }
    var geo = {};
    [["icosa", icosaGeo()], ["octa", octaGeo()], ["torus", torusGeo()], ["knot", knotGeo()]].forEach(function (g) {
      geo[g[0]] = { b: buf(g[1]), n: g[1].length / 6 };
    });
    var wire = wireGeo(); geo.wire = { b: buf(wire), n: wire.length / 3 };

    var PT_MAX = opts.particles == null ? 220 : opts.particles;
    var ptData = new Float32Array(PT_MAX * 4);
    for (var i = 0; i < PT_MAX; i++) {
      ptData[i * 4] = Math.random() * 2 - 1; ptData[i * 4 + 1] = Math.random() * 2 - 1;
      ptData[i * 4 + 2] = Math.random() * 2 - 1; ptData[i * 4 + 3] = Math.random();
    }
    var ptBuf = buf(ptData);

    var proj = new Float32Array(16), view = new Float32Array(16), model = new Float32Array(16), R = new Float32Array(16);
    var nm = new Float32Array(9);
    var FOV = Math.PI / 4, CAM_Z = 14, TAN = Math.tan(FOV / 2);
    var spin = 0, quality = 1, dpr = 1, cw = 0, ch = 0, lost = false;
    var BG = [0.969, 0.957, 0.937];

    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); lost = true; canvas.style.display = "none"; });

    function baseDpr(narrow) {
      var d = global.devicePixelRatio || 1;
      return quality === 0 ? 1 : Math.min(d, narrow ? 1.5 : 2);
    }
    function resize(w, h) {
      dpr = baseDpr(w < 760);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      cw = w; ch = h;
    }

    function bindMesh(g) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g.b);
      gl.enableVertexAttribArray(aM.pos); gl.vertexAttribPointer(aM.pos, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(aM.nor); gl.vertexAttribPointer(aM.nor, 3, gl.FLOAT, false, 24, 12);
    }

    function render(t, dt, st) {
      if (lost) return;
      var w = st.w, h = st.h;
      if (w !== cw || h !== ch) resize(w, h);
      var aspect = w / h, narrow = w < 760;
      var k = 2 * TAN * CAM_Z / h;                       /* world units per pixel at z = 0 */
      spin += dt * (1 + Math.min(Math.abs(st.vel) * 0.9, 6));

      var cx = st.mx * 0.9, cy = -(st.scroll + h * 0.5) * k - st.my * 0.4;
      perspective(proj, FOV, aspect, 0.1, 90);
      translation(view, -cx, -cy, -CAM_Z);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.BLEND); gl.depthMask(true);

      /* solid meshes */
      gl.useProgram(pMesh);
      gl.uniformMatrix4fv(uM.uProj, false, proj); gl.uniformMatrix4fv(uM.uView, false, view);
      gl.uniform3f(uM.uCam, cx, cy, CAM_Z); gl.uniform3f(uM.uFog, BG[0], BG[1], BG[2]);
      gl.uniform1f(uM.uTime, t); gl.uniform1f(uM.uFade, narrow ? 0.38 : 0.0);

      var drawn = [], o, idx;
      for (idx = 0; idx < OBJECTS.length; idx++) {
        o = OBJECTS[idx];
        if (narrow && !o.m) continue;
        var depth = CAM_Z - o.z, halfW = TAN * depth * aspect;
        var xf = narrow ? (o.nx !== undefined ? o.nx : (o.x < 0 ? -1.08 : 1.08)) : o.x;
        var sc = o.s * (narrow ? 0.72 : 1);
        var px = xf * halfW + Math.sin(t * 0.6 + o.ph) * 0.18 + st.mx * o.z * -0.08;
        var yf = (narrow && o.ny !== undefined) ? o.ny : o.y;
        var py = -(yf * st.pageH) * k + Math.cos(t * 0.5 + o.ph) * 0.24;
        var rx = o.sp[0] * spin + o.ph, ry = o.sp[1] * spin + st.mx * 0.25, rz = o.sp[2] * spin;
        rotation(R, rx, ry, rz);
        var cull = Math.abs(py - cy);
        if (cull > TAN * depth * 1.4 + sc * 2.2) continue;   /* far off-screen: skip */
        drawn.push({ o: o, px: px, py: py, sc: sc, rx: rx, ry: ry, rz: rz });
      }

      for (idx = 0; idx < drawn.length; idx++) {
        var d = drawn[idx]; o = d.o;
        if (o.g === "wire") continue;
        rotation(R, d.rx, d.ry, d.rz);
        for (var c = 0; c < 3; c++) { model[c * 4] = R[c * 4] * d.sc; model[c * 4 + 1] = R[c * 4 + 1] * d.sc; model[c * 4 + 2] = R[c * 4 + 2] * d.sc; model[c * 4 + 3] = 0; }
        model[12] = d.px; model[13] = d.py; model[14] = o.z; model[15] = 1;
        nm[0] = R[0]; nm[1] = R[1]; nm[2] = R[2]; nm[3] = R[4]; nm[4] = R[5]; nm[5] = R[6]; nm[6] = R[8]; nm[7] = R[9]; nm[8] = R[10];
        gl.uniformMatrix4fv(uM.uModel, false, model); gl.uniformMatrix3fv(uM.uNorm, false, nm);
        gl.uniform3fv(uM.uA, o.c.a); gl.uniform3fv(uM.uB, o.c.b);
        var g = geo[o.g]; bindMesh(g); gl.drawArrays(gl.TRIANGLES, 0, g.n);
      }

      /* blended layers: wireframes + particles (premultiplied alpha) */
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);

      gl.useProgram(pWire);
      gl.uniformMatrix4fv(uW.uProj, false, proj); gl.uniformMatrix4fv(uW.uView, false, view);
      gl.bindBuffer(gl.ARRAY_BUFFER, geo.wire.b);
      gl.enableVertexAttribArray(aW); gl.vertexAttribPointer(aW, 3, gl.FLOAT, false, 12, 0);
      for (idx = 0; idx < drawn.length; idx++) {
        d = drawn[idx]; o = d.o;
        if (o.g !== "wire") continue;
        rotation(R, d.rx, d.ry, d.rz);
        for (c = 0; c < 3; c++) { model[c * 4] = R[c * 4] * d.sc; model[c * 4 + 1] = R[c * 4 + 1] * d.sc; model[c * 4 + 2] = R[c * 4 + 2] * d.sc; model[c * 4 + 3] = 0; }
        model[12] = d.px; model[13] = d.py; model[14] = o.z; model[15] = 1;
        gl.uniformMatrix4fv(uW.uModel, false, model);
        gl.uniform4f(uW.uCol, o.c.b[0], o.c.b[1], o.c.b[2], narrow ? 0.4 : 0.65);
        gl.drawArrays(gl.LINES, 0, geo.wire.n);
      }

      var nPts = quality === 0 ? Math.floor(PT_MAX * 0.4) : (narrow ? Math.floor(PT_MAX * 0.55) : PT_MAX);
      if (nPts > 0) {
        gl.useProgram(pPt);
        gl.uniformMatrix4fv(uP.uProj, false, proj); gl.uniformMatrix4fv(uP.uView, false, view);
        gl.uniform3f(uP.uSpan, TAN * (CAM_Z + 2) * aspect * 1.15, st.pageH * k + 8.0, 6.0);
        gl.uniform1f(uP.uTime, t); gl.uniform1f(uP.uPx, 62 * dpr);
        gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
        gl.enableVertexAttribArray(aPt); gl.vertexAttribPointer(aPt, 4, gl.FLOAT, false, 16, 0);
        gl.drawArrays(gl.POINTS, 0, nPts);
      }
    }

    return {
      render: render,
      setQuality: function (q) { quality = q; cw = 0; ch = 0; },   /* 0 = light, 1 = full */
      isLost: function () { return lost; }
    };
  }

  global.Scene3D = { create: create };
})(window);
