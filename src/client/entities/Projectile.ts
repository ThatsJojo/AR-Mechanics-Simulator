import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import CannonUtils from '../utils/cannonUtils'

export class Projectile {
    private mass: number;
    private radius: number;

    private _geometry: THREE.BufferGeometry;
    private _mesh: THREE.Mesh;
    private _threeMaterial: THREE.Material;
    private _cannonShape:  CANNON.Shape;
    private _cannonBody: CANNON.Body;
    private _cannonMaterial: CANNON.Material;
    private _linearDamping: number;
    private _angularDamping: number;

    constructor(
        mass: number,
        radius: number,
        threeMaterial: THREE.Material,
        cannonMaterial: CANNON.Material,
        linearDamping: number,
        angularDamping: number,
        castShadow: boolean,
    ) {
        this.mass = mass;
        this.radius = radius;
        this._threeMaterial = threeMaterial;
        this._cannonMaterial = cannonMaterial;
        this._linearDamping = linearDamping;
        this._angularDamping = angularDamping;

        this._geometry = new THREE.SphereGeometry(this.radius);
        this._mesh = new THREE.Mesh(this._geometry, this._threeMaterial);
        this._mesh.castShadow = castShadow;

        this._cannonShape =  new CANNON.Sphere(this.radius);
        this._cannonBody = new CANNON.Body({ 
                mass: 60, 
                material: this._cannonMaterial, 
                linearDamping: this._linearDamping, 
                angularDamping: this._angularDamping 
            });

        this._cannonBody.addShape(this._cannonShape);
        this._cannonBody.position.x = this._mesh.position.x;
        this._cannonBody.position.y = this._mesh.position.y;
        this._cannonBody.position.z = this._mesh.position.z;
    }

    public copyPositionFrom(object: THREE.Object3D) {
        this._mesh.position.x = object.position.x;
        this._mesh.position.y = object.position.y;
        this._mesh.position.z = object.position.z;

        this._cannonBody.position.x = object.position.x;
        this._cannonBody.position.y = object.position.y;
        this._cannonBody.position.z = object.position.z;
    }

    public copyPositionTo(object: THREE.Object3D) {
        object.position.x = this._mesh.position.x;
        object.position.y = this._mesh.position.y;
        object.position.z = this._mesh.position.z;
    }

    public setPosition(x: number, y: number, z: number) {
        this._mesh.position.x = x;
        this._mesh.position.y = y;
        this._mesh.position.z = z;

        this._cannonBody.position.x = x;
        this._cannonBody.position.y = y;
        this._cannonBody.position.z = z;
    }

    get geometry(): THREE.BufferGeometry {
        return this._geometry;
    }
    
    get mesh(): THREE.Mesh {
        return this._mesh;
    }
    
    get threeMaterial(): THREE.Material {
        return this._threeMaterial;
    }
    
    get cannonShape(): CANNON.Shape {
        return this._cannonShape;
    }
    
    get cannonBody(): CANNON.Body {
        return this._cannonBody;
    }
    
    get cannonMaterial(): CANNON.Material {
        return this._cannonMaterial;
    }

    set cannonMaterial(cannonMaterial: CANNON.Material) {
        this._cannonMaterial = cannonMaterial;
    }
  }