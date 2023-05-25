import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as CANNON from 'cannon-es'
import CannonUtils from './utils/cannonUtils'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import { THREEx, ARjs } from "@ar-js-org/ar.js-threejs"

THREEx.ArToolkitContext.baseURL = "./";

// array of functions for the rendering loop
var onRenderFcts: any[] = [];
var arToolkitContext: any, arMarkerControls;

var arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: 'webcam',

  sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
  sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,
})

arToolkitSource.init(function onReady() {
    
  arToolkitSource.domElement.addEventListener('canplay', () => {
      console.log(
        'canplay',
        'actual source dimensions',
        arToolkitSource.domElement.videoWidth,
        arToolkitSource.domElement.videoHeight,
      );

      initARContext();
  }) as unknown as HTMLVideoElement;
  window.arToolkitSource = arToolkitSource;
  setTimeout(() => {
    onWindowResize()
  }, 2000);
}, function onError() { })

function initARContext() { // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/camera_para.dat',
      detectionMode: 'mono',
  })

  // initialize it
  arToolkitContext.init(() => { // copy projection matrix to camera
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

      arToolkitContext.arController.orientatio = getSourceOrientation();
      arToolkitContext.arController.options.orientation = getSourceOrientation();

      console.log('arToolkitContext', arToolkitContext);
      window.arToolkitContext = arToolkitContext;
  })

  // MARKER
  arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
      type: 'pattern',
      patternUrl: THREEx.ArToolkitContext.baseURL + './data/patt.hiro',
      // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
      // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
      changeMatrixMode: 'cameraTransformMatrix',
  })

  scene.visible = false

  console.log('ArMarkerControls', arMarkerControls);
  window.arMarkerControls = arMarkerControls;
}

function getSourceOrientation(): string {
  if (!arToolkitSource) {
      return '';
  }

  console.log(
      'actual source dimensions',
      arToolkitSource.domElement.videoWidth,
      arToolkitSource.domElement.videoHeight
  );

  if (arToolkitSource.domElement.videoWidth > arToolkitSource.domElement.videoHeight) {
      console.log('source orientation', 'landscape');
      return 'landscape';
  } else {
      console.log('source orientation', 'portrait');
      return 'portrait';
  }
}

window.addEventListener("markerFound", function (e) {
  planeMesh.visible = false;
  console.log("marker found!", e);
})

onRenderFcts.push(function () {
  if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
      return;
  }

  arToolkitContext.update(arToolkitSource.domElement)

  // update scene.visible if the marker is seen
  scene.visible = camera.visible
})


const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 10, 9);
var target = new THREE.Vector3(0, 10, 0);
camera.lookAt(target);

const light1 = new THREE.AmbientLight()
light1.position.set(2.5, 5, 5)
light1.intensity = 0.6
scene.add(light1)

const light2 = new THREE.SpotLight()
light2.position.set(-2.5, 10, 5)
light2.angle = Math.PI/4
light2.penumbra = 0.5
light2.castShadow = true
light2.intensity = 0.3
light2.shadow.mapSize.width = 1024
light2.shadow.mapSize.height = 1024
light2.shadow.camera.near = 0.5
light2.shadow.camera.far = 20
scene.add(light2)


declare global {
    interface Window {
        testVar: any;
    }
}

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild(renderer.domElement);

document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.y = 0.5

const world = new CANNON.World()
const wireframeEnabled = false;
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -9.82, 0)
// world.broadphase = new CANNON.NaiveBroadphase()
// ;(world.solver as CANNON.GSSolver).iterations = 10
// world.allowSleep = true

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.1
    }
)
world.defaultContactMaterial = defaultContactMaterial

const textureLoader = new THREE.TextureLoader()
const tenisTexture = textureLoader.load('/textures/objects/tenisball.jpg');
const woodTexture = textureLoader.load('/textures/objects/wood.jpg');
const floorTexture = textureLoader.load('/textures/objects/floor.jpg');
const marmorTexture = textureLoader.load('/textures/objects/marmor.jpg');
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.png',
  '/textures/environmentMaps/0/nx.png',
  '/textures/environmentMaps/0/py.png',
  '/textures/environmentMaps/0/ny.png',
  '/textures/environmentMaps/0/pz.png',
  '/textures/environmentMaps/0/nz.png'
])

const threeMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5
})

const woodMaterial = new THREE.MeshStandardMaterial({
  map: woodTexture,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5
})

const tenisballMaterial =  new THREE.MeshStandardMaterial({
  roughness: 1,
  map: tenisTexture,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5
})

const marmorMaterial =  new THREE.MeshStandardMaterial({
  metalness: 0.7,
  roughness: 1,
  map: marmorTexture,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5
})

const sphereGeometry = new THREE.SphereGeometry(0.5)
const sphereMesh = new THREE.Mesh(sphereGeometry, tenisballMaterial)
sphereMesh.position.x = -4.99
sphereMesh.position.y = 9
sphereMesh.position.z = 0.5
sphereMesh.castShadow = true
scene.add(sphereMesh)
const sphereShape = new CANNON.Sphere(0.5)
const sphereCannonBody = new CANNON.Body({ mass: 60, material: defaultMaterial, linearDamping: 0.1, angularDamping: 0.101 })
sphereCannonBody.addShape(sphereShape)
sphereCannonBody.position.x = sphereMesh.position.x
sphereCannonBody.position.y = sphereMesh.position.y
sphereCannonBody.position.z = sphereMesh.position.z
world.addBody(sphereCannonBody)

var rampShape = new THREE.Shape();

var rampV1 = new THREE.Vector2(-3, 6);
var rampV2 = new THREE.Vector2(-3, 0);
var rampV3 = new THREE.Vector2(3, 0);
var rampV4 = new THREE.Vector2(3, 1.5);

var startControlPoint = new THREE.Vector2(-1, 0);
var endControlPoint = new THREE.Vector2(2, 0);

var bezierCurve = new THREE.CubicBezierCurve(rampV1, startControlPoint, endControlPoint, rampV4);
var bezierCurvePoints = bezierCurve.getPoints(50);

rampShape.setFromPoints(bezierCurvePoints);
rampShape.lineTo(rampV4.x, rampV4.y);
rampShape.lineTo(rampV3.x, rampV3.y);
rampShape.lineTo(rampV2.x, rampV2.y);
rampShape.lineTo(rampV1.x, rampV1.y);


const rampExtrudeSettings = { 
	depth: 1, 
	bevelEnabled: false, 
	steps: 2, 
};

const rampGeometry = new THREE.ExtrudeGeometry( rampShape, rampExtrudeSettings );
const rampMesh = new THREE.Mesh( rampGeometry, woodMaterial );
rampMesh.position.x = -2;

scene.add(rampMesh);

const rampCannonShape = CannonUtils.CreateTrimesh(rampGeometry)
const rampCannonBody = new CANNON.Body({ mass: 0, material: defaultMaterial })
rampCannonBody.addShape(rampCannonShape)
rampCannonBody.position.x = rampMesh.position.x
rampCannonBody.position.y = rampMesh.position.y
rampCannonBody.position.z = rampMesh.position.z
world.addBody(rampCannonBody)


let rampContainerMesh: THREE.Object3D
let rampContainerBody: CANNON.Body
let rampContainerLoaded = false

const raycaster = new THREE.Raycaster()

const loader = new GLTFLoader()
loader.load(
    'models/votive-holder.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
                m.receiveShadow = true
                m.castShadow = true
                m.scale.x = 0.2;
                m.scale.y = 0.2;
                m.scale.z = 0.2;
                m.position.x = 4;
                m.position.y = 0;
                m.position.z = 0.5;
                m.material =marmorMaterial;
                rampContainerMesh = m;
                rampContainerBody = new CANNON.Body({ mass: 0 });
                const rampContainerCannonShape = CannonUtils.CreateTrimesh(m.geometry);
                rampContainerCannonShape.scale.x = m.scale.x;
                rampContainerCannonShape.scale.y = m.scale.y;
                rampContainerCannonShape.scale.z = m.scale.z;
                rampContainerBody.addShape(rampContainerCannonShape);
                rampContainerBody.position.x = m.position.x
                rampContainerBody.position.y = m.position.y
                rampContainerBody.position.z = m.position.z

                world.addBody(rampContainerBody);
                rampContainerLoaded = true;

                raycaster.set(
                  rampContainerMesh.position,
                  new THREE.Vector3(0, 1, 0)
                )
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([rampContainerMesh.position, raycaster.ray.direction.multiplyScalar(100)]);
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
                const line = new THREE.Line(lineGeometry, lineMaterial);

                // Adicionando a linha à cena
                scene.add(line);
            }
            if ((child as THREE.Light).isLight) {
                const l = child as THREE.Light
                l.castShadow = true
                l.shadow.bias = -0.003
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        
    },
    (error) => {
        console.log(error)
    }
)

const planeGeometry = new THREE.PlaneGeometry(25, 25)
const planeMesh = new THREE.Mesh(planeGeometry, threeMaterial)
planeMesh.position.y = -0.01
planeMesh.rotateX(-Math.PI / 2)
planeMesh.receiveShadow = true
scene.add(planeMesh)
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if (window.arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(window.arToolkitContext.arController.canvas)
    }
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)
physicsFolder.open()

const cameraFolder = gui.addFolder('camera')
cameraFolder.add(camera.position, 'x', -10.0, 10.0, 0.1)
cameraFolder.add(camera.position, 'y', -10.0, 10.0, 0.1)
cameraFolder.add(camera.position, 'z', -10.0, 10.0, 0.1)
cameraFolder.open()

const clock = new THREE.Clock()
let delta

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

var lastTimeMsec: number;
requestAnimationFrame(animate);
function animate(nowMsec: number) {
    // keep looping
    requestAnimationFrame(animate);
    controls.update()

    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)

    if(wireframeEnabled) {
      cannonDebugRenderer.update()
    }

        sphereMesh.position.set(
        sphereCannonBody.position.x,
        sphereCannonBody.position.y,
        sphereCannonBody.position.z
    )
    sphereMesh.quaternion.set(
        sphereCannonBody.quaternion.x,
        sphereCannonBody.quaternion.y,
        sphereCannonBody.quaternion.z,
        sphereCannonBody.quaternion.w
    )
    
    if (rampContainerLoaded) {
        rampContainerMesh.position.set(
            rampContainerBody.position.x,
            rampContainerBody.position.y,
            rampContainerBody.position.z
        )
        rampContainerMesh.quaternion.set(
            rampContainerBody.quaternion.x,
            rampContainerBody.quaternion.y,
            rampContainerBody.quaternion.z,
            rampContainerBody.quaternion.w
        )
    }
    
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec

    onRenderFcts.forEach(function (onRenderFct) {
      onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    })

    render()

    stats.update()
}

var exibindoMensagem = false;
function render() {

    const intersects = raycaster.intersectObjects( [sphereMesh] );
    if(intersects.length && !exibindoMensagem && !Math.round(sphereCannonBody.velocity.y * 10000)) {
      exibindoMensagem = true;
      alert('Conseguiu!!!')
    } 

    renderer.render(scene, camera)
}