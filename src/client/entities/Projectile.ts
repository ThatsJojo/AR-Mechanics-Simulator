import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Projectile {
    private _acceleration: CANNON.Vec3;
    private _oldVelocity: CANNON.Vec3;

    private radius: number;
    private defaultCannonState: CANNON.BodySleepState;
    
    private _mass: number;
    private _geometry: THREE.BufferGeometry;
    private _mesh: THREE.Mesh;
    private _threeMaterial: THREE.Material;
    private _cannonShape:  CANNON.Shape;
    private _cannonBody: CANNON.Body;
    private _cannonMaterial: CANNON.Material;
    private _linearDamping: number;
    private _angularDamping: number;
    private _startPosition: THREE.Vector3;

    constructor(
        mass: number,
        radius: number,
        threeMaterial: THREE.Material,
        cannonMaterial: CANNON.Material,
        linearDamping: number,
        angularDamping: number,
        castShadow: boolean,
        startPosition: THREE.Vector3,
        defaultCannonState: CANNON.BodySleepState,
    ) {
        this._mass = mass;
        this.radius = radius;
        this._threeMaterial = threeMaterial;
        this._cannonMaterial = cannonMaterial;
        this._linearDamping = linearDamping;
        this._angularDamping = angularDamping;
        this._startPosition = startPosition;
        this.defaultCannonState = defaultCannonState;

        this._geometry = new THREE.SphereGeometry(this.radius);
        this._mesh = new THREE.Mesh(this._geometry, this._threeMaterial);
        this._mesh.castShadow = castShadow;

        this._cannonShape =  new CANNON.Sphere(this.radius);
        this._cannonBody = new CANNON.Body({ 
                mass: this._mass, 
                material: this._cannonMaterial, 
                linearDamping: this._linearDamping, 
                angularDamping: this._angularDamping,
                allowSleep: true,
            });

        this._cannonBody.sleepState = this.defaultCannonState;
        this._cannonBody.addShape(this._cannonShape);
        this._cannonBody.position.x = this._mesh.position.x;
        this._cannonBody.position.y = this._mesh.position.y;
        this._cannonBody.position.z = this._mesh.position.z;
        this._oldVelocity = new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z);
        this._acceleration = new CANNON.Vec3(0, 0, 0);

        this.resetPosition();
    }

    public resetPosition() {
        this.startPosition = this._startPosition;
        this.setPosition(this._startPosition.x, this._startPosition.y, this._startPosition.z);

        this._cannonBody.velocity.set(0, 0, 0)
        this._cannonBody.angularVelocity.set(0, 0, 0)
    }

    public sleep() {
        this._cannonBody.sleep();
    }

    public awake() {
        this._cannonBody.wakeUp();
    }

    public isSleeping(): boolean {
        return this._cannonBody.sleepState == CANNON.Body.SLEEPING;
    }

    public updateMeshFromBody() {
        this._mesh.position.set(
            this._cannonBody.position.x,
            this._cannonBody.position.y,
            this._cannonBody.position.z
        )
        this._mesh.quaternion.set(
            this._cannonBody.quaternion.x,
            this._cannonBody.quaternion.y,
            this._cannonBody.quaternion.z,
            this._cannonBody.quaternion.w
        )
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

    public updateAcceleration(deltaMsec: number) {
        deltaMsec = deltaMsec / 1000;
        let accelerationX = (this.velocity.x - this._oldVelocity.x) / deltaMsec;
        let accelerationY = (this.velocity.y - this._oldVelocity.y) / deltaMsec;
        let accelerationZ = (this.velocity.z - this._oldVelocity.z) / deltaMsec;
        this._acceleration = new CANNON.Vec3(accelerationX, accelerationY, accelerationZ);
        this._oldVelocity = new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z);
    }

    get acceleration(): CANNON.Vec3 {
       return this._acceleration;
    }

    get velocity(): CANNON.Vec3 {
        return this._cannonBody.velocity;
    }

    get velocityModule(): number {
        return  Math.sqrt(this.velocity.x**2 + this.velocity.y**2 + this.velocity.z**2);
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

    get mass(): number {
        return this._mass;
    }

    set mass(mass: number) {
        this._mass = mass;
        this._cannonBody.mass = this._mass;
    }

    get startPosition(): THREE.Vector3 {
        return this._startPosition;
    }

    set startPosition(startPosition: THREE.Vector3) {
        this._startPosition = startPosition;
    }

    get position(): THREE.Vector3 {
        return this._mesh.position;
    }
  }