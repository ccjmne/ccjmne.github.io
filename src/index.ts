import { Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  SphereBufferGeometry, BoxBufferGeometry, ConeBufferGeometry, TetrahedronBufferGeometry, TorusKnotBufferGeometry, Group, Color,
  MeshPhongMaterial, Vector2, DirectionalLight, HemisphereLight, Uniform } from 'three';
import { GUI } from 'dat.gui';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { PixelShader2 } from './PixelShader2/PixelShader2';
import { HexPixelShader } from './HexPixelShader/HexPixelShader';
// import { PixelShader } from 'three/examples/jsm/shaders/PixelShader';

let camera; let scene: Scene; let renderer; let gui; let composer; let controls;
let pixelPass; let params;
let fxaaPass: ShaderPass;

let container: HTMLElement;

let group;


init();
animate();

function updateGUI() {
  pixelPass.uniforms.pixelSize.value = params.pixelSize;
  pixelPass.uniforms.gapSize.value = params.gapSize;
}

function resize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);

  pixelPass.uniforms
    .resolution.value.set(container.offsetWidth, container.offsetHeight).multiplyScalar(window.devicePixelRatio);
  // (fxaaPass.material as any).uniforms
  //   .resolution.value.set(container.offsetWidth, container.offsetHeight).multiplyScalar(window.devicePixelRatio);
  (fxaaPass.material as any).uniforms.resolution.value.x = 1 / (container.offsetWidth * window.devicePixelRatio);
  (fxaaPass.material as any).uniforms.resolution.value.y = 1 / (container.offsetHeight * window.devicePixelRatio);
}

function init() {
  container = document.getElementById('container');
  renderer = new WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  camera = new PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 1, 10000);
  camera.position.set(0, 0, 30);
  controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2.0;
  controls.panSpeed = 0.8;
  controls.zoomSpeed = 1.5;

  scene = new Scene();

  const hemisphereLight = new HemisphereLight(0xfceafc, 0x000000, 0.8);
  scene.add(hemisphereLight);

  const dirLight = new DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(150, 75, 150);
  scene.add(dirLight);

  const dirLight2 = new DirectionalLight(0xffffff, 0.2);
  dirLight2.position.set(-150, 75, -150);
  scene.add(dirLight2);

  const dirLight3 = new DirectionalLight(0xffffff, 0.1);
  dirLight3.position.set(0, 125, 0);
  scene.add(dirLight3);

  const geometries = [
    new SphereBufferGeometry(1, 64, 64),
    new BoxBufferGeometry(1, 1, 1),
    new ConeBufferGeometry(1, 1, 32),
    new TetrahedronBufferGeometry(1),
    new TorusKnotBufferGeometry(1, 0.4),
  ];

  group = new Group();

  for (let i = 0; i < 25; i++) {
    const geom = geometries[Math.floor(Math.random() * geometries.length)];
    const color = new Color();
    color.setHSL(Math.random(), 0.7 + 0.2 * Math.random(), 0.5 + 0.1 * Math.random());
    const mat = new MeshPhongMaterial({ color, shininess: 200 });
    const mesh = new Mesh(geom, mat);
    const s = 4 + Math.random() * 10;
    mesh.scale.set(s, s, s);

    mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    mesh.position.multiplyScalar(Math.random() * 200);
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    group.add(mesh);
  }

  scene.add(group);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  pixelPass = new ShaderPass(HexPixelShader);
  pixelPass.uniforms.resolution.value = new Vector2(container.offsetWidth, container.offsetHeight);
  pixelPass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio);
  composer.addPass(pixelPass);

  fxaaPass = new ShaderPass(FXAAShader);
  // composer.addPass(fxaaPass);

  window.addEventListener('resize', resize);

  params = {
    pixelSize: 12,
    gapSize: 2,
    postprocessing: true,
  };
  gui = new GUI();
  gui.add(params, 'pixelSize').min(2).max(32).step(1);
  gui.add(params, 'gapSize').min(0).max(8).step(1);
  gui.add(params, 'postprocessing');
}

function update() {
  controls.update();
  updateGUI();

  group.rotation.y += 0.0015;
  group.rotation.z += 0.001;
}

function animate() {
  update();

  if (params.postprocessing) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

  window.requestAnimationFrame(animate);
}
