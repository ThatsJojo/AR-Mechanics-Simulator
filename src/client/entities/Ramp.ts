import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import CannonUtils from '../utils/cannonUtils'

export class Ramp {
    private mass: number;

    private vertice1: THREE.Vector2;
    private vertice2: THREE.Vector2;
    private vertice3: THREE.Vector2;
    private vertice4: THREE.Vector2;
    private startControlVertice: THREE.Vector2;
    private endControlVertice: THREE.Vector2;
    private _shape: THREE.Shape;

    private _extrudeSettings: THREE.ExtrudeGeometryOptions;
    private _geometry: THREE.ExtrudeGeometry;
    private _mesh: THREE.Mesh;
    private _threeMaterial: THREE.Material;
    private _cannonShape:  CANNON.Shape;
    private _cannonBody: CANNON.Body;
    private _cannonMaterial: CANNON.Material;



    constructor(
        mass: number,
        vertice1: THREE.Vector2,
        vertice2: THREE.Vector2,
        vertice3: THREE.Vector2,
        vertice4: THREE.Vector2,
        startControl: THREE.Vector2,
        endControl: THREE.Vector2,
        threeMaterial: THREE.Material,
        cannonMaterial: CANNON.Material,
        extrudeSettings?: THREE.ExtrudeGeometryOptions | undefined,
    ) {
        this.mass = mass;
        this.vertice1 = vertice1;
        this.vertice2 = vertice2;
        this.vertice3 = vertice3;
        this.vertice4 = vertice4;
        this.startControlVertice = startControl;
        this.endControlVertice = endControl;
        this._threeMaterial = threeMaterial;
        this._cannonMaterial = cannonMaterial;

        if(extrudeSettings) {
            this._extrudeSettings = extrudeSettings;
        } else {
            this._extrudeSettings = { 
                depth: 2, 
                bevelEnabled: false, 
                steps: 2, 
            };
        }

        this._shape = this.generateShape();
        this._geometry = new THREE.ExtrudeGeometry(this._shape, this._extrudeSettings);
        this._mesh = new THREE.Mesh(this._geometry, this._threeMaterial);

        this._cannonShape =  CannonUtils.CreateTrimesh(this._geometry);
        this._cannonBody = new CANNON.Body({ mass: this.mass, material: this._cannonMaterial });

        this._cannonBody.addShape(this._cannonShape);
        this._cannonBody.position.x = this._mesh.position.x;
        this._cannonBody.position.y = this._mesh.position.y;
        this._cannonBody.position.z = this._mesh.position.z;
    }

    public generateShape(): THREE.Shape {
        var rampShape = new THREE.Shape();

        var bezierCurve = new THREE.CubicBezierCurve(
                this.vertice1, 
                this.startControlVertice, 
                this.endControlVertice, 
                this.vertice4
            );

        var bezierCurvePoints = bezierCurve.getPoints(50);
        rampShape.setFromPoints(bezierCurvePoints);
        rampShape.lineTo(this.vertice4.x, this.vertice4.y);
        rampShape.lineTo(this.vertice3.x, this.vertice3.y);
        rampShape.lineTo(this.vertice2.x, this.vertice2.y);
        rampShape.lineTo(this.vertice1.x, this.vertice1.y);

        return rampShape;
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
  
    
    set extrudeSettings(extrudeSettings: THREE.ExtrudeGeometryOptions) {
      this._extrudeSettings = extrudeSettings;
    }

    get extrudeSettings() {
        return this._extrudeSettings;
    }

    get shape() : THREE.Shape {
        return this._shape;
    }

    get geometry(): THREE.ExtrudeGeometry {
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