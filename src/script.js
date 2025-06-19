// index.js
import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createEarth } from "./earth";

// Base Setup
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const gui = new GUI();
gui.close();

// Texture Loaders
const textureLoader = new THREE.TextureLoader();
const cubeLoader = new THREE.CubeTextureLoader();

// Environment Map
const environmentMap = cubeLoader.load([
  "./EnvironmentMap/px.png",
  "./EnvironmentMap/nx.png",
  "./EnvironmentMap/py.png",
  "./EnvironmentMap/ny.png",
  "./EnvironmentMap/pz.png",
  "./EnvironmentMap/nz.png",
]);
environmentMap.mapping = THREE.CubeReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;
environmentMap.anisotropy = 8;
// Enable mipmaps for smoother visuals
environmentMap.generateMipmaps = true;
environmentMap.magFilter = THREE.LinearFilter;
environmentMap.minFilter = THREE.LinearMipmapLinearFilter;
scene.background = environmentMap;
scene.environment = environmentMap;

// Planet Textures
const sunTexture = textureLoader.load("./textures/sun.jpg");
sunTexture.colorSpace = THREE.SRGBColorSpace;
sunTexture.anisotropy = 8;
const mercuryTexture = textureLoader.load("./textures/mercury.jpg");
mercuryTexture.colorSpace = THREE.SRGBColorSpace;
mercuryTexture.anisotropy = 8;
const venusTexture = textureLoader.load("./textures/venus.jpg");
venusTexture.colorSpace = THREE.SRGBColorSpace;
venusTexture.anisotropy = 8;
const marsTexture = textureLoader.load("./textures/mars.jpg");
marsTexture.colorSpace = THREE.SRGBColorSpace;
marsTexture.anisotropy = 8;
const moonTexture = textureLoader.load("./textures/moon.jpg");
moonTexture.colorSpace = THREE.SRGBColorSpace;
moonTexture.anisotropy = 8;
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

// Sun Direction
const sunDirection = new THREE.Vector3();
sunDirection.setFromSpherical(new THREE.Spherical(1, Math.PI / 2, 0));

// Earth Material from `earth.js`
const { earthMaterial, atmosphereMaterial } = createEarth(
  textureLoader,
  sunDirection,
  gui,
  moonMaterial
);

// Geometry
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// Sun
const sun = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
sun.scale.setScalar(5);
sun.position.copy(sunDirection);
scene.add(sun);

// Debug Sun
const DebugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
);
DebugSun.position.copy(sunDirection);
scene.add(DebugSun);

// Standard Materials
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });

// Planets Config
const planets = [
  {
    name: "Mercury",
    radius: 1.2,
    distance: 10,
    speed: 0.01,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Venus",
    radius: 1.5,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Earth",
    radius: 1.9,
    distance: 22,
    speed: 0.005,
    material: earthMaterial,
    moons: [{ name: "Moon", radius: 0.3, distance: 2, speed: 0.015 }],
  },
  {
    name: "Mars",
    radius: 1,
    distance: 27,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      { name: "Phobos", radius: 0.6, distance: 2, speed: 0.02 },
      { name: "Deimos", radius: 0.3, distance: 3, speed: 0.015 },
    ],
  },
];

// Helpers
const createPlanet = (planet) => {
  const mesh = new THREE.Mesh(sphereGeometry, planet.material);
  mesh.scale.setScalar(planet.radius);
  mesh.position.x = planet.distance;
  return mesh;
};

const createMoon = (moon) => {
  const mesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  mesh.scale.setScalar(moon.radius);
  mesh.position.x = moon.distance;
  return mesh;
};

// Add Planets
const planetPivots = [];

planets.forEach((planet) => {
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const planetMesh = createPlanet(planet);
  pivot.add(planetMesh);

  if (planet.name === "Earth") {
    const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.04, 1.04, 1.04);
    planetMesh.add(atmosphere);
  }

  planet.moons.forEach((moon) => {
    const moonPivot = new THREE.Object3D();
    planetMesh.add(moonPivot);
    const moonMesh = createMoon(moon);
    moonPivot.add(moonMesh);
    moon.pivot = moonPivot;
  });

  planet.pivot = pivot;
  planet.mesh = planetMesh;
  planetPivots.push(planet);
});

// Lights
scene.add(new THREE.PointLight(0xffffff, 400));
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Camera
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  20,
  sizes.width / sizes.height,
  0.1,
  500
);
camera.position.set(0, 20, 80);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// Resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  planetPivots.forEach((planet) => {
    planet.pivot.rotation.y += planet.speed;
    planet.moons.forEach((moon) => {
      moon.pivot.rotation.y += moon.speed;
    });
  });

  const earth = planets.find((p) => p.name === "Earth");
  if (earth) {
    earth.mesh.rotation.y += 0.01;

    const earthPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthPos);

    const sunPos = new THREE.Vector3();
    sun.getWorldPosition(sunPos);

    const sunDir = sunPos.clone().sub(earthPos).normalize();

    earthMaterial.uniforms.uSunDirection.value.copy(sunDir);
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDir);
  }

  const Mercury = planets.find((p) => p.name === "Mercury");
  if (Mercury) {
    Mercury.mesh.rotation.y += 0.02;
  }
  const Venus = planets.find((p) => p.name === "Venus");
  if (Venus) {
    Venus.mesh.rotation.y += 0.015;
  }
  const Mars = planets.find((p) => p.name === "Mars");
  if (Mars) {
    Mars.mesh.rotation.y += 0.01;
  }
  // Rotate the sun
  sun.rotation.y += 0.005;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
