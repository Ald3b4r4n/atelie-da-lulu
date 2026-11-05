import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const VANILLA = "#fff1dc";
const GOLD = "#e3af6d";
const PINK = "#ec9dc0";
const TAU = Math.PI * 2;
const ballGeometry = new THREE.SphereGeometry(1, 20, 14);
const material = (color, options) => new THREE.MeshStandardMaterial({ color, roughness: .56, ...options });
const point = (...xyz) => new THREE.Vector3(...xyz);
const tag = (id = "") => Array.from(id).reduce((sum, letter) => (sum * 31 + letter.charCodeAt(0)) >>> 0, 0);

function mesh(parent, geometry, surface, xyz = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, surface);
  object.position.set(...xyz);
  parent.add(object);
  return object;
}

function oval(parent, xyz, scale, surface, tilt = 0) {
  const object = mesh(parent, ballGeometry, surface, xyz);
  object.scale.set(...scale);
  object.rotation.z = tilt;
  return object;
}

function pipe(parent, points, width, surface) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => point(...p)));
  return mesh(parent, new THREE.TubeGeometry(curve, 26, width, 8), surface);
}

function ring(parent, xyz, radius, width, surface, aspect = 1) {
  const object = mesh(parent, new THREE.TorusGeometry(radius, width, 10, 36), surface, xyz);
  object.scale.y = aspect;
  return object;
}

function butterfly(parent, xyz, size, top, bottom, metal = material(GOLD)) {
  const body = new THREE.Group();
  parent.add(body);
  body.position.set(...xyz);
  const wings = [-1, 1].map(side => {
    const wing = new THREE.Group();
    body.add(wing);
    oval(wing, [side * size * .5, size * .18, 0], [size * .61, size * .38, size * .11], top, side * .5);
    oval(wing, [side * size * .36, -size * .2, 0], [size * .4, size * .29, size * .1], bottom, side * -.4);
    return wing;
  });
  oval(body, [0, 0, .015], [size * .1, size * .43, size * .12], metal);
  return { body, wings };
}

function cloth(parent, rings, surface, folds = 0, phase = 0) {
  const segments = 72;
  const positions = [];
  const indices = [];
  for (const [height, width, depth, wave = 0] of rings) {
    for (let i = 0; i <= segments; i++) {
      const theta = i / segments * TAU;
      const pleat = 1 + folds * Math.cos(theta * 18 + phase);
      positions.push(width * pleat * Math.cos(theta), height + wave * Math.cos(theta * 18 + phase), depth * pleat * Math.sin(theta));
    }
  }
  for (let row = 0; row < rings.length - 1; row++) {
    for (let col = 0; col < segments; col++) {
      const a = row * (segments + 1) + col;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return mesh(parent, geometry, surface);
}

function artColor(id, catalog, fallback) {
  const colors = catalog[id]?.art().match(/#[0-9a-f]{6}\b/gi);
  return colors?.find(hex => {
    const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16));
    return Math.max(...channels) - Math.min(...channels) > 25 && Math.max(...channels) > 135;
  }) || colors?.[0] || fallback;
}

function skirt(parent, id, surface, decoration, dress) {
  const variant = tag(id);
  const long = ["borboleta", "princesa", "longa", "noite"].includes(id);
  const hem = long ? .46 : .78 + (variant % 4) * .065;
  const width = long ? .68 : id === "lapis" ? .285 : .43 + (variant % 5) * .028;
  const depth = width * .64;
  const fullness = id === "lapis" ? .02 : .045 + (variant % 5) * .009;
  const waist = dress ? 1.64 : 1.58;
  const profile = [[hem, width, depth, .023], [hem + .11, width * .99, depth * .99, .02],
    [(hem + waist) / 2, width * .77, depth * .81, .011], [waist - .14, .32, .216, 0], [waist, .265, .216, 0]];
  const section = height => {
    const index = profile.findIndex(([level]) => level > height);
    const upperIndex = index === -1 ? profile.length - 1 : index;
    const lower = profile[upperIndex - 1], upper = profile[upperIndex];
    const progress = (height - lower[0]) / (upper[0] - lower[0]);
    return [height, ...lower.slice(1).map((value, i) => THREE.MathUtils.lerp(value, upper[i + 1], progress))];
  };
  if (id.includes("arco")) {
    const stripes = ["#f296c4", "#b49be4", "#93c9ec", "#9bd9bf", "#f5d87c", "#f7a7a1"];
    stripes.forEach((color, i) => {
      const from = THREE.MathUtils.lerp(hem, waist, i / stripes.length);
      const to = THREE.MathUtils.lerp(hem, waist, (i + 1) / stripes.length);
      const interior = profile.filter(([height]) => height > from && height < to);
      cloth(parent, [section(from), ...interior, section(to)], material(color, { side: THREE.DoubleSide }), fullness);
    });
  } else {
    cloth(parent, profile, surface, fullness);
  }
  cloth(parent, [[hem - .012, width + .012, depth + .012, .023], [hem + .044, width + .012, depth + .012, .023]],
    decoration, fullness);
  cloth(parent, [[waist - .07, .28, .23], [waist, .275, .226]], decoration, .013);

  if (["borboleta", "flores", "coracao", "noite", "rodado"].includes(id)) {
    const top = material(id === "coracao" ? "#e15592" : id === "flores" ? "#e196c0" : "#fdf0fa");
    const bottom = material(id === "noite" || id === "rodado" ? "#ffe5a0" : "#c3e8ff");
    const metal = id === "borboleta" ? material(GOLD) : null;
    const heart = new THREE.Shape();
    heart.moveTo(0, -.045);
    heart.bezierCurveTo(-.09, .018, -.039, .073, 0, .031);
    heart.bezierCurveTo(.039, .073, .09, .018, 0, -.045);
    for (let row = 0; row < 4; row++) {
      const y = hem + .12 + row * (waist - hem - .26) / 3.6;
      const [, spread, front] = section(y);
      for (let i = 0; i < 11; i++) {
        const angle = (i + row * .46) / 11 * TAU;
        const fold = 1 + fullness * Math.cos((Math.PI / 2 - angle) * 18);
        const xyz = [(spread * fold + .031) * Math.sin(angle), y, (front * fold + .036) * Math.cos(angle)];
        if (id === "borboleta") {
          const { body } = butterfly(parent, xyz, .045 + ((i + row) % 3) * .009, top, bottom, metal);
          body.rotation.y = angle;
          body.rotation.z = (i % 3 - 1) * .31;
        } else if (id === "coracao") {
          mesh(parent, new THREE.ShapeGeometry(heart), i % 3 ? top : bottom, xyz).rotation.y = angle;
        } else if (id === "flores") {
          const bloom = new THREE.Group();
          bloom.position.set(...xyz);
          bloom.rotation.y = angle;
          parent.add(bloom);
          for (let j = 0; j < 5; j++) {
            const a = j * TAU / 5;
            oval(bloom, [.026 * Math.cos(a), .026 * Math.sin(a), 0], [.018, .018, .01], i % 2 ? top : bottom);
          }
        } else {
          const gem = mesh(parent, new THREE.OctahedronGeometry(id === "noite" ? .031 : .024), bottom, xyz);
          gem.scale.set(1, 1.2, .48);
          gem.rotation.y = angle;
        }
      }
    }
  } else if (["tule", "princesa"].includes(id)) {
    cloth(parent, [[hem + .18, width * .98, depth * .98, .024], [hem + .27, width * .88, depth * .88, .022],
      [waist - .09, .295, .225], [waist, .269, .22]], decoration, fullness, .14);
  }
}

function outfit(parent, st, catalogs, slot) {
  const id = st.dress || st.top;
  const variant = tag(id || "");
  const dressColors = { borboleta: "#ed91b9", noite: "#43376f", flores: "#ffe7c9", arcoIris: "#f8d9cb" };
  const mainColor = dressColors[id] || artColor(id, st.dress ? catalogs.dresses : catalogs.tops, PINK);
  const silk = material(mainColor, { side: THREE.DoubleSide });
  const trim = material(st.dress === "borboleta" ? "#f7c4df" : new THREE.Color(mainColor).lerp(new THREE.Color(VANILLA), .39),
    { side: THREE.DoubleSide });
  const straps = ["borboleta", "flores", "regata", "ombro"].includes(id);
  if (slot === "dress" || slot === "top") {
    cloth(parent, [[1.42, .273, .217], [1.57, .279, .225], [1.77, .306, .218],
    [straps ? 1.90 : 1.97, .266, .178], [straps ? 1.91 : 2.04, straps ? .235 : .131, .139]],
    st.dress || st.top ? silk : material("#fff1dc", { side: THREE.DoubleSide }), st.dress === "borboleta" ? .025 : .007);
    for (const side of [-1, 1]) {
      if (straps) {
        pipe(parent, [[side * .165, 1.83, .173], [side * .205, 2.022, .076],
          [side * .211, 2.02, -.06], [side * .165, 1.83, -.17]], .033, trim);
      } else if (id) {
        oval(parent, [side * .278, 1.881 - variant % 3 * .022, .003],
          [.128, .126 + variant % 3 * .026, .105], silk, side * -.45);
      }
    }
    if (["blusa", "festa", "ombro"].includes(st.top)) butterfly(parent, [0, 1.77, .223], .082, trim, material("#fff1dc"));
  }
  if (st.dress) {
    skirt(parent, id, silk, trim, true);
    butterfly(parent, [0, 1.64, .243], .115, trim, material("#fff1dc"));
  } else if (slot === "bottom") {
    const lower = material(artColor(st.bottom, catalogs.bottoms, "#c6aeea"), { side: THREE.DoubleSide });
    if (st.bottom && !/short|cal[cç]a|bermuda|jeans|legging|moletom/.test(st.bottom)) {
      skirt(parent, st.bottom, lower, trim, false);
    } else {
      const hem = !st.bottom || /short|bermuda/.test(st.bottom) ? 1.105 : .37;
      oval(parent, [0, 1.4, -.019], [.276, .207, .222], lower);
      for (const side of [-1, 1]) {
        const trouser = cloth(parent, [[hem, .127, .129], [hem + .075, .133, .143], [1.36, .15, .174]], lower, .016);
        trouser.position.x = side * .139;
      }
    }
  }

  if (slot === "shoe") {
    const shoe = material(artColor(st.shoe, catalogs.shoes, "#f6b4cc"), { roughness: .32 });
    const sole = material(VANILLA);
    for (const side of [-1, 1]) {
      const x = side * .177;
      oval(parent, [x, .212, .09], [.121, .052, .182], sole);
      if (/sandalia|chinelo/.test(st.shoe)) {
        pipe(parent, [[x - .1, .25, .156], [x, .345, .151], [x + .1, .25, .156]], .025, shoe);
        pipe(parent, [[x - .095, .26, .027], [x, .35, .036], [x + .095, .26, .027]], .021, shoe);
      } else {
        oval(parent, [x, .267, .089], [.118, .082, .174], shoe);
        if (/bota|galocha/.test(st.shoe)) oval(parent, [x, .381, .013], [.113, .163, .123], shoe);
        else butterfly(parent, [x, .342, .137], .043, sole, sole).body.rotation.x = -.82;
      }
    }
  }
}

// Authoring entry point. The browser uses the resulting Blender-exported models.
export function buildWardrobe(catalogs) {
  const wardrobe = new THREE.Group();
  const slots = { dress: "dresses", top: "tops", bottom: "bottoms", shoe: "shoes" };
  for (const [slot, catalog] of Object.entries(slots)) {
    const ids = Object.keys(catalogs[catalog]);
    if (slot === "top" || slot === "bottom") ids.push("base");
    for (const id of ids) {
      const piece = new THREE.Group();
      piece.name = slot + "_" + id;
      wardrobe.add(piece);
      outfit(piece, { [slot]: id === "base" ? null : id }, catalogs, slot);
    }
  }
  return wardrobe;
}

function accessories(parent, st, catalogs) {
  const gold = material(GOLD, { metalness: .42, roughness: .28 });
  const { pulseira, colar, brinco, oculos, extras } = st.acc;
  if (pulseira) {
    const bead = material(artColor(pulseira, catalogs.bracelets, PINK));
    for (let i = 0; i < 10; i++) {
      const a = i * TAU / 10;
      oval(parent, [.49 + .065 * Math.cos(a), 1.505 + .037 * Math.cos(a), .064 + .074 * Math.sin(a)],
        [.023, .023, .023], i % 2 ? bead : gold);
    }
  }
  if (colar) {
    pipe(parent, [[-.132, 2.078, .075], [-.122, 1.978, .152], [0, 1.926, .194],
      [.122, 1.978, .152], [.132, 2.078, .075]], .011, gold);
    butterfly(parent, [0, 1.917, .208], .062, material(artColor(colar, catalogs.necklaces, PINK)), gold);
  }
  if (brinco) {
    const gem = material(artColor(brinco, catalogs.earrings, "#f5bae1"));
    for (const side of [-1, 1]) {
      ring(parent, [side * .474, 2.437, .086], .043, .011, gold, 1.21);
      oval(parent, [side * .478, 2.391, .091], [.035, .048, .031], gem);
    }
  }
  if (oculos) {
    const color = material(artColor(oculos, catalogs.glasses, "#ed9cbd"));
    for (const side of [-1, 1]) {
      ring(parent, [side * .165, 2.583, .439], .129, .018, color, .79);
      pipe(parent, [[side * .289, 2.6, .435], [side * .388, 2.61, .322],
        [side * .478, 2.60, .08]], .013, color);
    }
    pipe(parent, [[-.038, 2.583, .443], [0, 2.613, .449], [.038, 2.583, .443]], .015, color);
  }
  for (const extra of extras) {
    const pink = material(PINK);
    if (extra === "laco") butterfly(parent, [-.29, 2.95, .28], .15, pink, material("#f4c2de"));
    if (extra === "tiara") {
      pipe(parent, [[-.439, 2.76, .18], [-.34, 3.015, .19], [0, 3.103, .17],
        [.34, 3.015, .19], [.439, 2.76, .18]], .024, gold);
      for (let i = -2; i <= 2; i++) oval(parent, [i * .11, 3.12 - Math.abs(i) * .027, .185],
        [.036, .044, .03], pink);
    }
    if (extra === "chapeu") {
      oval(parent, [0, 3.003, .022], [.611, .057, .468], material("#e6bb87"), .11);
      oval(parent, [0, 3.074, .003], [.384, .182, .336], material("#f1d0a2"), .11);
      butterfly(parent, [-.26, 3.063, .295], .105, pink, gold);
    }
    if (extra === "orelhas") {
      for (const side of [-1, 1]) {
        oval(parent, [side * .33, 3.06, .052], [.121, .179, .085], material("#735064"), -side * .42);
        oval(parent, [side * .337, 3.084, .112], [.071, .114, .042], pink, -side * .42);
      }
    }
  }
}

function hairstyle(parent, lulu, st, catalog) {
  const longHair = lulu.getObjectByName("HairLong");
  const order = Object.keys(catalog).indexOf(st.hair);
  const isLong = /longo|ondulado|repicado|presilhas|franja/.test(st.hair);
  longHair.visible = isLong;
  longHair.scale.set(1 + order % 3 * .039, 1, 1 + order % 2 * .12);
  longHair.position.y = order % 3 * .027;
  const surface = material(st.hairColor, { roughness: .4 });
  if (/coque|rabo|pigtail|tranca|maria/.test(st.hair)) {
    const two = /coques|pigtail|maria/.test(st.hair);
    for (const side of two ? [-1, 1] : [order % 2 ? -1 : 1]) {
      const high = /coque/.test(st.hair);
      const y = high ? 2.982 : 2.68;
      oval(parent, [side * (two ? .38 : .25), y, -.185], [.214, .208, .197], surface);
      if (!high) {
        for (let i = 0; i < 5; i++) {
          oval(parent, [side * (.398 + i * .017), y - .16 - i * .107, -.17],
            [.134 - i * .012, .155 - i * .009, .132 - i * .013], surface, side * .32);
        }
        ring(parent, [side * .411, y - .06, -.082], .104, .024, material(PINK), .56);
      }
    }
  } else if (/afro|cache|crespo/.test(st.hair)) {
    for (let i = 0; i < 16; i++) {
      const a = i * TAU / 16;
      oval(parent, [Math.cos(a) * .42, 2.77 + Math.sin(a) * .37, -.09 + .083 * Math.sin(i * 4)],
        [.167, .164, .164], surface);
    }
  } else if (!isLong) {
    oval(parent, [0, 2.63, -.17], [.468, .355 + order % 5 * .039, .269], surface);
    for (const side of [-1, 1]) {
      oval(parent, [side * .403, 2.58 - order % 5 * .038, -.028],
        [.107, .185 + order % 4 * .048, .156], surface, side * -.14);
    }
  }
  if (/presilha|franja/.test(st.hair)) {
    butterfly(parent, [.35, 2.83, .293], .074, material("#b9ddf4"), material(PINK));
  }
}

function batchMeshes(group) {
  group.updateMatrixWorld(true);
  const local = group.matrixWorld.clone().invert();
  const byMaterial = new Map();
  group.traverse(object => {
    if (!object.isMesh) return;
    if (!byMaterial.has(object.material)) byMaterial.set(object.material, []);
    byMaterial.get(object.material).push(object);
  });
  for (const [surface, objects] of byMaterial) {
    if (objects.length < 2) continue;
    const geometries = objects.map(object => {
      const buffer = new THREE.BufferGeometry();
      for (const name of ["position", "normal"]) {
        buffer.setAttribute(name, object.geometry.getAttribute(name).clone());
      }
      const index = object.geometry.getIndex();
      if (index) buffer.setIndex(index.clone());
      const transformed = buffer.index ? buffer.toNonIndexed() : buffer;
      if (transformed !== buffer) buffer.dispose();
      return transformed.applyMatrix4(new THREE.Matrix4().multiplyMatrices(local, object.matrixWorld));
    });
    const merged = mergeGeometries(geometries);
    for (const geometry of geometries) geometry.dispose();
    if (!merged) continue;
    const replaced = new Set(objects.map(object => object.geometry));
    for (const object of objects) object.removeFromParent();
    for (const geometry of replaced) {
      if (geometry !== ballGeometry) geometry.dispose();
    }
    mesh(group, merged, surface);
  }
}

function disposeParts(group) {
  const materials = new Set();
  group.traverse(object => {
    if (!object.isMesh) return;
    if (object.geometry !== ballGeometry) object.geometry.dispose();
    materials.add(object.material);
  });
  for (const surface of materials) surface.dispose();
  group.clear();
}

function lightStudio(scene) {
  scene.add(new THREE.HemisphereLight("#fff3fb", "#ac84a3", 1.89));
  for (const [color, power, xyz] of [
    ["#fff0dc", 3.2, [-3.6, 6.8, 5]], ["#cadbff", 1.15, [4.5, 4.1, 2.4]], ["#ffc6eb", 1.85, [1, 5, -4]]
  ]) {
    const light = new THREE.DirectionalLight(color, power);
    light.position.set(...xyz);
    scene.add(light);
  }
}

function makeThumbnails(wardrobe, toneMapping, exposure) {
  const cache = new Map();
  let renderer, scene, camera;
  return (slot, id) => {
    const key = slot + "_" + id;
    if (cache.has(key)) return cache.get(key);
    const original = wardrobe.getObjectByName(key);
    if (!original) return null;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(156, 156, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = toneMapping;
      renderer.toneMappingExposure = exposure;
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .01, 20);
      lightStudio(scene);
    }
    const garment = original.clone();
    scene.add(garment);
    const bounds = new THREE.Box3().setFromObject(garment);
    const center = bounds.getCenter(point());
    const size = bounds.getSize(point());
    const half = Math.max(size.x, size.y, size.z) * .61;
    camera.left = camera.bottom = -half;
    camera.right = camera.top = half;
    camera.position.copy(center).add(point(slot === "shoe" ? .63 : .30, slot === "shoe" ? 1.13 : .34, 4));
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    scene.remove(garment);
    const src = renderer.domElement.toDataURL("image/png");
    cache.set(key, src);
    return src;
  };
}

function blobDownload(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

export async function mountStudio(container, catalogs, onTap, initialLook, onWorldError) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2cced");
  const camera = new THREE.OrthographicCamera();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  const draco = new DRACOLoader().setDecoderPath("assets/draco/");
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let atelier, doll, wardrobe;
  try {
    [atelier, doll, wardrobe] = await Promise.all([
      loader.loadAsync("assets/atelie.glb"), loader.loadAsync("assets/lulu-3d.glb"), loader.loadAsync("assets/wardrobe.glb")
    ]);
  } catch (error) {
    draco.dispose();
    renderer.dispose();
    throw error;
  }
  draco.dispose();
  const lulu = doll.scene.getObjectByName("Lulu");
  lulu.position.set(0, .31, .55);
  scene.add(atelier.scene, doll.scene);
  batchMeshes(atelier.scene);
  const worn = new THREE.Group();
  const decoration = new THREE.Group();
  const hairstyleParts = new THREE.Group();
  lulu.add(worn, decoration, hairstyleParts);
  lightStudio(scene);
  const thumbnail = makeThumbnails(wardrobe.scene, renderer.toneMapping, renderer.toneMappingExposure);

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d");
  const falloff = ctx.createRadialGradient(64, 64, 0, 64, 64, 63);
  falloff.addColorStop(0, "rgba(80,39,80,.34)");
  falloff.addColorStop(.52, "rgba(80,39,80,.18)");
  falloff.addColorStop(1, "rgba(80,39,80,0)");
  ctx.fillStyle = falloff;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;
  const shadowSurface = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  for (const [x, y, z, width, depth] of [[0, .488, .52, 1.5, .97], [-2.35, .272, -.64, 2.25, 1.7],
    [2.42, .272, -1.03, 2.68, 1.4], [-2.7, .272, 1.28, 1.1, .9], [2.7, .272, 1.15, 1.1, .9]]) {
    const parent = y > .4 ? scene : atelier.scene;
    mesh(parent, new THREE.PlaneGeometry(width, depth), shadowSurface, [x, y, z]).rotation.x = -Math.PI / 2;
  }

  const worlds = new Map([["quarto", Promise.resolve({ group: atelier.scene, sky: "#e2cced" })]]);
  const fog = new THREE.Fog("#e2cced", 14, 21.6);
  let worldRequest = "quarto";
  let activeWorld = atelier.scene;
  container.dataset.world = "quarto";

  async function showWorld(id) {
    if (worldRequest === id) return;
    worldRequest = id;
    container.classList.add("world-loading");
    if (!worlds.has(id)) {
      const pending = loader.loadAsync("assets/worlds/" + id + ".glb").then(({ scene: group }) => {
        const sky = group.getObjectByName("World_" + id)?.userData.sky || "#e2cced";
        batchMeshes(group);
        return { group, sky };
      }).catch(error => {
        worlds.delete(id);
        throw error;
      });
      worlds.set(id, pending);
    }
    try {
      const { group, sky } = await worlds.get(id);
      if (worldRequest !== id) return;
      scene.remove(activeWorld);
      scene.add(group);
      activeWorld = group;
      scene.background.set(sky);
      fog.color.set(sky);
      scene.fog = id === "quarto" ? null : fog;
      container.dataset.world = id;
    } catch (error) {
      if (worldRequest !== id) return;
      worldRequest = container.dataset.world;
      onWorldError(error);
    } finally {
      if (worldRequest === id || worldRequest === container.dataset.world) container.classList.remove("world-loading");
    }
  }
  const butterflies = [-1, 1].map((side, i) => butterfly(scene, [side * 1.5, 2.74, .15], .15 + i * .027,
    material(i ? "#bce2fd" : "#f6a9d0"), material(i ? "#d8bdf3" : "#fee2ae")));
  const sparkleMaterial = new THREE.MeshBasicMaterial({ color: "#fff1d1", transparent: true, opacity: .82 });
  const sparkles = Array.from({ length: 17 }, (_, i) => mesh(scene,
    new THREE.OctahedronGeometry(.024 + i % 4 * .009), sparkleMaterial,
    [Math.sin(i * 4.2) * 3.16, .69 + (i * .631) % 3.18, -1.15 + (i * .527) % 2.75]));

  const skinMap = {
    "Skin": st => st.skin, "Hair": st => st.hairColor,
    "Hair sheen": st => new THREE.Color(st.hairColor).lerp(new THREE.Color("#f2b997"), .19),
    "Iris color": st => st.eye, "Lips": st => st.lip,
    "Blush": st => st.blush || new THREE.Color(st.skin).lerp(new THREE.Color("#e28885"), .13)
  };
  const faceSurfaces = new Set();
  lulu.traverse(object => {
    if (object.isMesh && Object.hasOwn(skinMap, object.material.name)) faceSurfaces.add(object.material);
  });
  const faceGroups = { eyes: "eyeShape", nose: "noseShape", mouth: "mouthShape" };
  const faceParts = lulu.children.flatMap(object => {
    const [group, id] = object.name.split("_");
    return faceGroups[group] ? [{ object, property: faceGroups[group], id }] : [];
  });
  let currentOutfit, currentAccessories, currentHair;
  function update(st) {
    for (const surface of faceSurfaces) surface.color.set(skinMap[surface.name](st));
    for (const { object, property, id } of faceParts) object.visible = st[property] === id;
    const outfitKey = JSON.stringify([st.top, st.bottom, st.dress, st.shoe]);
    if (outfitKey !== currentOutfit) {
      currentOutfit = outfitKey;
      worn.clear();
      const pieces = st.dress ? ["dress_" + st.dress] : ["top_" + (st.top || "base"), "bottom_" + (st.bottom || "base")];
      if (st.shoe) pieces.push("shoe_" + st.shoe);
      for (const key of pieces) {
        const piece = wardrobe.scene.getObjectByName(key);
        if (piece) worn.add(piece.clone());
      }
    }
    const accessoryKey = JSON.stringify([st.acc, st.shadow]);
    if (accessoryKey !== currentAccessories) {
      currentAccessories = accessoryKey;
      disposeParts(decoration);
      accessories(decoration, st, catalogs);
      if (st.shadow) {
        const shadow = material(st.shadow);
        for (const side of [-1, 1]) {
          oval(decoration, [side * .168, 2.665, .376], [.09, .026, .024], shadow, -side * .12);
        }
      }
      batchMeshes(decoration);
    }
    const hairKey = st.hair + st.hairColor;
    if (hairKey !== currentHair) {
      currentHair = hairKey;
      disposeParts(hairstyleParts);
      hairstyle(hairstyleParts, lulu, st, catalogs.hair);
    }
    showWorld(st.bg);
  }

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-label", "Lulu e seu ateliê em 3D");
  container.prepend(canvas);
  container.classList.add("has-3d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let targetAngle = 0, targetView = 0, angle = 0, view = 0, drag;
  let active = true;
  function resize() {
    const width = container.clientWidth, height = container.clientHeight;
    if (width < 1 || height < 1) return;
    const ratio = width / height;
    const halfHeight = ratio > .97 && width > 560 ? THREE.MathUtils.clamp(3.67 / ratio, 2.56, 3.24) : 2.38;
    camera.left = -halfHeight * ratio;
    camera.right = halfHeight * ratio;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  new ResizeObserver(resize).observe(container);
  canvas.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { x: event.clientX, angle: targetAngle };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (drag && event.isPrimary) targetAngle = drag.angle + (event.clientX - drag.x) * .018;
  });
  canvas.addEventListener("pointerup", event => {
    if (!drag || !event.isPrimary) return;
    if (Math.abs(event.clientX - drag.x) < 5) onTap();
    drag = undefined;
  });
  canvas.addEventListener("lostpointercapture", () => { drag = undefined; });

  function draw(time) {
    angle = THREE.MathUtils.lerp(angle, targetAngle, reduceMotion.matches ? 1 : .14);
    view = THREE.MathUtils.lerp(view, targetView, reduceMotion.matches ? 1 : .095);
    const t = reduceMotion.matches ? 0 : time * .001;
    lulu.rotation.y = angle + Math.sin(t * 1.4) * .035;
    lulu.rotation.z = Math.sin(t * 1.19) * .009;
    camera.position.set(.69 * (1 - Math.min(view, 1)), 4.64 - .37 * view, 10.8);
    camera.zoom = 1 + .22 * view + .87 * Math.max(0, view - 1);
    camera.lookAt(0, 1.91 + 1.12 * Math.max(0, view - 1), .14);
    const world = container.dataset.world;
    const butterfliesVisible = ["quarto", "jardim", "floresta", "fazenda"].includes(world);
    camera.updateProjectionMatrix();
    butterflies.forEach(({ body, wings }, i) => {
      body.visible = butterfliesVisible;
      const side = i === 0 ? -1 : 1;
      body.position.x = side * (1.22 + .31 * Math.cos(t * .63 + i));
      body.position.y = 2.5 + .32 * Math.sin(t * 1.34 + i * 1.4);
      body.position.z = .56 + .2 * Math.cos(t * .86 + i);
      body.rotation.z = side * .18 + .17 * Math.sin(t + i);
      wings[0].rotation.y = Math.sin(t * 11 + i) * .71;
      wings[1].rotation.y = -wings[0].rotation.y;
    });
    sparkles.forEach((sparkle, i) => {
      sparkle.rotation.y = t + i;
      sparkle.scale.setScalar(.45 + .55 * Math.sin(t * 1.8 + i * 1.2) ** 2);
    });
    renderer.render(scene, camera);
  }

  update(initialLook);
  resize();
  draw(performance.now());
  renderer.setAnimationLoop(draw);
  return {
    update,
    rotate: radians => { targetAngle += radians; },
    frame(mode) {
      targetView = mode === "face" ? 2 : mode ? 1 : 0;
      if (mode === "face") targetAngle = Math.round(targetAngle / TAU) * TAU;
    },
    thumbnail,
    setActive(next) {
      active = next;
      container.classList.toggle("has-3d", active);
      renderer.setAnimationLoop(active ? draw : null);
      if (active) resize();
    },
    capture() {
      if (!active || renderer.getContext().isContextLost()) return Promise.resolve(null);
      draw(performance.now());
      return blobDownload(canvas);
    }
  };
}
