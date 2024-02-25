import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";

let checkbox = document.getElementById("materialSwitch");

const mobile = window.matchMedia("(max-width: 480px)").matches;
const canvas = document.querySelector("#c");

const scene = new THREE.Scene();

const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function (url, loaded, total) {
  document.querySelector("#loadingDiv").style.display = "block";
};

loadingManager.onLoad = function () {
  document.querySelector("#loadingDiv").style.display = "none";
};
let radius = mobile ? 0.8 : 1;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/*
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
        Cameras
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*= 
*/
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(-5, 1, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);
// car model

// const geometry = new THREE.BoxGeometry();

const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
  },

  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShader").textContent,
});
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const gltfLoader = new GLTFLoader(loadingManager);

let objectmaterials = {};
let model;
gltfLoader.load("/porsche.glb", function (gltf) {
  model = gltf.scene;
  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      objectmaterials[child.uuid] = child.material;
      if (checkbox.checked) {
        child.material = material;
      }
    }
  });
  scene.add(model);
});

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;

renderer.setSize(sizes.width, sizes.height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

/*
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
        Cameras
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*= 
*/
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const clock = new THREE.Clock();
let previousTime = 0;

function changeObjectMaterials(checked) {
  if (model) {
    if (checked) {
      model.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
    } else {
      model.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          console.log(objectmaterials);
          child.material = objectmaterials[child.uuid];
        }
      });
    }
  }
}
checkbox.addEventListener("change", () =>
  changeObjectMaterials(checkbox.checked)
);

const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};
animate();
