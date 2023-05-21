import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as CANNON from 'cannon-es'
import CannonUtils from './utils/cannonUtils'
import CannonDebugRenderer from './utils/cannonDebugRenderer'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light1 = new THREE.SpotLight()
light1.position.set(2.5, 5, 5)
light1.angle = Math.PI / 4
light1.penumbra = 0.5
light1.castShadow = true
light1.shadow.mapSize.width = 1024
light1.shadow.mapSize.height = 1024
light1.shadow.camera.near = 0.5
light1.shadow.camera.far = 20
scene.add(light1)

const light2 = new THREE.SpotLight()
light2.position.set(-2.5, 5, 5)
light2.angle = Math.PI / 4
light2.penumbra = 0.5
light2.castShadow = true
light2.shadow.mapSize.width = 1024
light2.shadow.mapSize.height = 1024
light2.shadow.camera.near = 0.5
light2.shadow.camera.far = 20
scene.add(light2)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 10, 9);
var target = new THREE.Vector3(0, 10, 0);
camera.lookAt(target);
declare global {
    interface Window {
        testVar: any;
    }
}
  
window.testVar = camera;

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.y = 0.5

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
// world.broadphase = new CANNON.NaiveBroadphase()
// ;(world.solver as CANNON.GSSolver).iterations = 10
// world.allowSleep = true

const normalMaterial = new THREE.MeshNormalMaterial()
const phongMaterial = new THREE.MeshPhongMaterial()

const sphereGeometry = new THREE.SphereGeometry(0.5)
const sphereMesh = new THREE.Mesh(sphereGeometry, normalMaterial)
sphereMesh.position.x = -4.99
sphereMesh.position.y = 9
sphereMesh.position.z = 0.5
sphereMesh.castShadow = true
scene.add(sphereMesh)
const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({ mass: 60 })
sphereBody.addShape(sphereShape)
sphereBody.position.x = sphereMesh.position.x
sphereBody.position.y = sphereMesh.position.y
sphereBody.position.z = sphereMesh.position.z
world.addBody(sphereBody)

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
const rampMesh = new THREE.Mesh( rampGeometry, normalMaterial );
rampMesh.position.x = -2;

scene.add(rampMesh);

const rampCannonShape = CannonUtils.CreateTrimesh(rampGeometry)
const rampCannonBody = new CANNON.Body({ mass: 0 })
rampCannonBody.addShape(rampCannonShape)
rampCannonBody.position.x = rampMesh.position.x
rampCannonBody.position.y = rampMesh.position.y
rampCannonBody.position.z = rampMesh.position.z
world.addBody(rampCannonBody)


let rampContainerMesh: THREE.Object3D
let rampContainerBody: CANNON.Body
let rampContainerLoaded = false

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
                m.material = normalMaterial;
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
const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial)
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

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)

    cannonDebugRenderer.update()

        sphereMesh.position.set(
        sphereBody.position.x,
        sphereBody.position.y,
        sphereBody.position.z
    )
    sphereMesh.quaternion.set(
        sphereBody.quaternion.x,
        sphereBody.quaternion.y,
        sphereBody.quaternion.z,
        sphereBody.quaternion.w
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

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()