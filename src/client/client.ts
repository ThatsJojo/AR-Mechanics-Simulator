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

var scene: any, camera: any, renderer: any, clock: any, deltaTime: any, totalTime: any;

var arToolkitSource: any, arToolkitContext: any;

var markerRoot1, markerRoot2;

var mesh1;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();

	let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
	scene.add( ambientLight );
				
	camera = new THREE.OrthographicCamera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
    sourceHeight: 1080,
    sourceWidth: 1920
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	let loader = new THREE.TextureLoader();
	let texture = loader.load( 'textures/objects/marmor.jpg' );
		
	let patternArray = ["letterA", "letterB", "letterC", "letterD", "letterF", "kanji", "hiro"];
	let colorArray   = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0000ff, 0xcc00ff, 0xcccccc];
	for (let i = 0; i < 7; i++)
	{
		let markerRoot = new THREE.Group();
		scene.add(markerRoot);
		let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
			type : 'pattern', patternUrl : "data/" + patternArray[i] + ".patt",
		});
	
		let mesh = new THREE.Mesh( 
			new THREE.BoxGeometry(1.25,1.25,1.25), 
			new THREE.MeshBasicMaterial({color:colorArray[i], map:texture, transparent:true, opacity:0.5}) 
		);
		mesh.position.y = 1.25/2;
		markerRoot.add( mesh );
	}
}


function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}


function render()
{
	renderer.render( scene, camera );
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
