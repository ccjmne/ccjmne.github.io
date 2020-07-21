import { Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  DirectionalLight,
  AmbientLight,
  PointLight,
  FogExp2,
  TextureLoader,
  PlaneBufferGeometry,
  MeshLambertMaterial,
  Material,
  Vector2,
  Uniform } from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// import { EffectPass, TextureEffect, BlendFunction, KernelSize, BloomEffect, Effect } from 'postprocessing/build/postprocessing';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { EffectPass, TextureEffect, BlendFunction, KernelSize, BloomEffect, Effect } from '../../redstaplerclouds/postprocessing.min';

const container: HTMLElement = document.getElementById('container');

const loader = new TextureLoader();
let cloudGeo: PlaneBufferGeometry;
let cloudMaterial: MeshLambertMaterial;
loader.load('smoke.png', (texture) => {
  const scene: Scene = new Scene();
  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 1;
  camera.rotation.x = 1.16;
  camera.rotation.y = -0.12;
  camera.rotation.z = 0.27;

  const cloudParticles = [];

  const ambient = new AmbientLight(0x555555);
  scene.add(ambient);

  const directionalLight = new DirectionalLight(0x79163f);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);

  const orangeLight = new PointLight(0x056650, 50, 450, 1.7);
  orangeLight.position.set(200, 300, 100);
  scene.add(orangeLight);
  const redLight = new PointLight(0x0a483b, 50, 450, 1.7);
  redLight.position.set(100, 300, 100);
  scene.add(redLight);
  const blueLight = new PointLight(0x1d405d, 50, 450, 1.7);
  blueLight.position.set(300, 300, 200);
  scene.add(blueLight);

  const renderer: WebGLRenderer = new WebGLRenderer({ antialias: true, alpha: true });
  // const controls = new TrackballControls(camera, renderer.domElement);
  // controls.rotateSpeed = 0;
  // controls.panSpeed = 0;
  // controls.zoomSpeed = 0;

  const pixelEffect = new Effect('hex-pixel-effect', `
    uniform sampler2D tDiffuse;
    uniform float pixelSize;
    uniform float gapSize;
    uniform vec2 res;


    void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
      vec2 cartesianGridCellRatio = vec2(1, 3. / sqrt(3.));

      vec2 dXY = pixelSize / res * cartesianGridCellRatio;
      vec4 idx = floor(vec4(uv, uv - dXY / 2.) / dXY.xyxy);
      vec4 ctr = (idx + vec4(.5, .5, 1., 1.)) * dXY.xyxy;
      vec4 dst = (uv.xyxy - ctr) * res.xyxy;

      if(gapSize == 0.) {
        outputColor = texture2D(tDiffuse, length(dst.xy) < length(dst.zw) ? ctr.xy : ctr.zw);
      } else if(abs(length(dst.xy) - length(dst.zw)) > gapSize) { // oblique gaps
        if(length(dst.xy) < length(dst.zw)) {
          if(length(dot(dst.xy, vec2(1., 0.))) < (pixelSize - gapSize) / 2.) { // vertical gaps
            outputColor = texture2D(tDiffuse, ctr.xy);
          }
        } else if(length(dot(dst.zw, vec2(1., 0.))) < (pixelSize - gapSize) / 2.) { // vertical gaps
          outputColor = texture2D(tDiffuse, ctr.zw);
        }
      }
    }
  `, {
    uniforms: new Map([
      ['res', new Uniform(new Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio))],
      ['pixelSize', new Uniform(16.0)],
      ['gapSize', new Uniform(2.0)],
    ]),
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  const composer: EffectComposer = new EffectComposer(renderer);
  function render() {
    cloudParticles.forEach((p, i) => p.rotation.z -= (0.001 * i / 10));
    // camera.rotation.y += 0.01;
    // controls.update();
    composer.render(0.1);
    requestAnimationFrame(render);
  }

  container.appendChild(renderer.domElement);

  cloudGeo = new PlaneBufferGeometry(500, 500);
  cloudMaterial = new MeshLambertMaterial({
    map: texture,
    transparent: true,
  });

  for (let p = 0; p < 50; p++) {
    const cloud = new Mesh(cloudGeo, cloudMaterial);
    cloud.position.set(
      Math.random() * 800 - 400,
      500,
      Math.random() * 500 - 500,
    );
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 2 * Math.PI;
    (cloud.material as Material).opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }

  loader.load('stars.jpg', (tex2) => {
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.COLOR_DODGE,
      tex2,
    });
    textureEffect.blendMode.opacity.value = 0.2;

    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.COLOR_DODGE,
      kernelSize: KernelSize.SMALL,
      useLuminanceFilter: true,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.75,
    });
    bloomEffect.blendMode.opacity.value = 1.5;

    const effectPass = new EffectPass(
      camera,
      // bloomEffect,
      textureEffect,
      pixelEffect,
      // smaaEffect,
    );

    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(effectPass);

    window.addEventListener('resize', () => {
      pixelEffect.uniforms.get('res')
        .value = new Vector2(container.offsetWidth, container.offsetHeight).multiplyScalar(window.devicePixelRatio);
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    }, false);
    render();
  });
});
