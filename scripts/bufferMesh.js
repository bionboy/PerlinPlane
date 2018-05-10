'use strict'
//@ts-check

let windowWidth, windowHeight;
let stats;
let renderer, scene, camera, controls;
let PerlinPlanes;
let updateLoopCount = 0;

let xOff = 0;
let yOff = 0;

class PerlinPlane {

  constructor(size, height, offset, angleX) {
    //// Parameter conditioning
    this.geometry = (size == null) ?
      new THREE.PlaneBufferGeometry(50000, 50000, 1024, 1024) :
      new THREE.PlaneBufferGeometry(size, size, size / 150, size / 150);
    this.height = (height == null) ? 1000 : height;
    this.offset = (offset == null) ? 0.02 : offset;
    this.geometry.rotateX(angleX == null ? -Math.PI / 2 : angleX);

    //// Vertices
    this.planeVertices = this.geometry.attributes.position;
    this.planeVertices.dynamic = true;
    this.count = this.planeVertices.count;
    this.SideLength = Math.floor(Math.sqrt(this.count));
    for (let i = 0; i < this.count; i++)
      this.planeVertices.setY(i, 35 * Math.sin(i / 2));

    //// Color
    this.geometry.addAttribute('color', new THREE.BufferAttribute(
      new Float32Array(this.planeVertices.count * 3), 3));
    this.planeColors = this.geometry.attributes.color;
    this.planeColors.dynamic = true;

    //// Material
    this.material = new THREE.MeshPhongMaterial({
      flatShading: true,
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
      shininess: 0
    });

    //// Create Perlin noise space
    noise.seed(Math.random());

    //// Add to scene
    this.plane = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.plane);
  }

  update() {
    let colorBuff = new Float32Array(this.count * 3);

    noise.seed(Math.random());
    let i, j;
    for (i = j = xOff = yOff = 0; i < this.count; i++) {
      //// Offsets
      xOff += this.offset;
      if (i % this.SideLength == 0) {
        xOff = 0;
        yOff += this.offset;
      }

      //// Position
      let y = this.height * (noise.simplex2(xOff, yOff) / 2 + 1);
      this.planeVertices.setY(i, y);

      //// Color
      let colorTemp = new THREE.Color();
      colorTemp.setHSL(y / this.height, 0.9, 0.5);
      colorBuff[j++] = colorTemp.r;
      colorBuff[j++] = colorTemp.g;
      colorBuff[j++] = colorTemp.b;
    }

    //// Update flags
    this.planeColors.set(colorBuff);
    this.planeVertices.needsUpdate = true;
    this.planeColors.needsUpdate = true;
  }
}

init();
animate();

function init() {
  //// Window
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    renderer.setSize(windowWidth, windowHeight);
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
  })

  //// Info
  let info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '20px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.style.color = '#f57af9';
  info.style.fontWeight = 'bold';
  info.style.backgroundColor = 'transparent';
  info.style.zIndex = '1';
  info.style.fontFamily = 'Monospace';
  info.innerHTML = "2D Perlin Noise";
  document.body.appendChild(info);

  //// Stats
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  //// renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //// scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x338570);

  //// camera
  camera = new THREE.PerspectiveCamera(
    80, window.innerWidth / window.innerHeight, 1, Math.pow(10, 5));
  camera.position.set(4000, 4000, 4000);

  //// Light
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  //// Controls
  controls = new THREE.OrbitControls(camera);
  controls.update();

  //// Planes
  // PerlinPlanes = new Array(1).fill().map(() =>
  // new PerlinPlane(Math.pow(10, 5), 2000, 0.02));
  PerlinPlanes = new Array(1).fill().map(() => new PerlinPlane());

  PerlinPlanes.forEach(pp => pp.update());
  update();
}

function update() {
  updateLoopCount++;
  stats.update();
  if (updateLoopCount % 600 == 0) PerlinPlanes.forEach(pp => pp.update());
}

function render() { renderer.render(scene, camera); }

function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}