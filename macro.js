/* macro.js - TUBI VERNICIATI E VISIBILI */
import { createRoundedBox } from './utils.js';
import { createDetailedReactor } from './reactor.js';
import { createDetailedSteamGenerator } from './steamGenerator.js';
import { createDetailedTurbine } from './turbine.js';
import { createDetailedGenerator } from './generator.js';
import { createDetailedCondenser } from './condenser.js';

let macroGroup;
let turbineRotor;
let generatorRotor;
let flowParticles = [];

export function initMacro(scene) {
    macroGroup = new THREE.Group();
    scene.add(macroGroup);

    // --- MATERIALI PER I GUSCI ESTERNI (VERNICIATI) ---
    // Questi sono i colori che vedi NORMALMENTE.
    // Hanno tutti transparent: true per funzionare con l'X-Ray.

    const shellGreyMat = new THREE.MeshStandardMaterial({ 
        color: 0x445566, roughness: 0.6, metalness: 0.4,
        transparent: true, opacity: 1.0, side: THREE.DoubleSide
    });

    // 1. Guscio Vapore (Rosso Industriale)
    const shellSteamMat = new THREE.MeshStandardMaterial({ 
        color: 0xcc3333, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 1.0 
    });

    // 2. Guscio Acqua (Blu Scuro)
    const shellWaterMat = new THREE.MeshStandardMaterial({ 
        color: 0x2244aa, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 1.0 
    });

    // 3. Guscio Raffreddamento Freddo (Ciano)
    const shellCoolingColdMat = new THREE.MeshStandardMaterial({ 
        color: 0x44cccc, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 1.0 
    });

    // 4. Guscio Raffreddamento Caldo (Verde Acqua)
    const shellCoolingWarmMat = new THREE.MeshStandardMaterial({ 
        color: 0x44aa88, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 1.0 
    });

    // --- MATERIALI FLUIDI INTERNI (LUMINOSI PER X-RAY) ---
    const fluidSteamMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff3300, emissiveIntensity: 3.0 }); 
    const fluidWaterMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x0066ff, emissiveIntensity: 3.0 });
    
    const fluidColdMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x00ffff, emissiveIntensity: 3.0 });
    const fluidWarmMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x00ff88, emissiveIntensity: 3.0 });

    // Ambiente
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1.0, metalness: 0.0 });
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x226622, roughness: 1.0 });
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x0055aa, transparent: true, opacity: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xaaccff, opacity: 0.3, transparent: true });

    // --- COSTRUZIONE AMBIENTE ---
    const ground = new THREE.Mesh(createRoundedBox(60, 2, 60, 0.5, 5), groundMat);
    ground.position.y = -1; ground.receiveShadow = true; macroGroup.add(ground);
    const river = new THREE.Mesh(createRoundedBox(60, 1.8, 12, 0.4, 4), riverMat);
    river.position.set(0, -1, 25); macroGroup.add(river);

    // --- MACCHINARI ---
    const reactor = createDetailedReactor();
    reactor.position.set(-10, 4, -5); reactor.rotation.y = Math.PI / 4; macroGroup.add(reactor);

    const sgGroup = createDetailedSteamGenerator();
    sgGroup.position.set(-6, -0.5, -5); 
    const waterInletNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), shellGreyMat);
    waterInletNozzle.rotation.z = -Math.PI / 2; waterInletNozzle.position.set(1.3, 1.0, 0); waterInletNozzle.userData = { xrayType: 'shell' };
    sgGroup.add(waterInletNozzle);
    macroGroup.add(sgGroup);

    const turbineGroup = createDetailedTurbine();
    turbineGroup.position.set(5.8, 3, -5); macroGroup.add(turbineGroup);
    turbineRotor = turbineGroup.getObjectByName("Rotor");

    const generatorGroup = createDetailedGenerator();
    generatorGroup.position.set(12.5, 3, -5); macroGroup.add(generatorGroup);
    generatorRotor = generatorGroup.getObjectByName("GenRotor");

    // Condensatore
    const condenser = createDetailedCondenser();
    condenser.position.set(8, 1.5, -5); 
    macroGroup.add(condenser);


    // --- SISTEMA TUBI (CURVE PIPE) ---
    function createCurvePipe(p1, p2, ctrl1, ctrl2, materialShell, materialFlow) {
        const curve = new THREE.CubicBezierCurve3(p1, ctrl1, ctrl2, p2);
        
        // Guscio Esterno (Ora usa il materiale colorato passato come argomento)
        const tubeMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.3, 16, false), materialShell);
        tubeMesh.userData = { xrayType: 'shell' }; macroGroup.add(tubeMesh);
        
        // Fluido Interno
        const flowMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.18, 16, false), materialFlow);
        flowMesh.userData = { xrayType: 'internal' }; macroGroup.add(flowMesh);
    }

    // 1. Primario Caldo (Reattore -> SG) [ROSSO]
    createCurvePipe(
        new THREE.Vector3(-8.2, 6, -5), new THREE.Vector3(-6, 3.5, -5), 
        new THREE.Vector3(-7, 6, -5), new THREE.Vector3(-7, 3.5, -5), 
        shellSteamMat, fluidSteamMat
    );
    
    // 2. Primario Freddo (SG -> Reattore) [BLU]
    createCurvePipe(
        new THREE.Vector3(-6, 0.2, -5), new THREE.Vector3(-8.2, 3, -5), 
        new THREE.Vector3(-7, 0.2, -5), new THREE.Vector3(-7, 3, -5), 
        shellWaterMat, fluidWaterMat
    );
    
    // 3. Secondario Vapore (SG -> Turbina) [ROSSO]
    createCurvePipe(
        new THREE.Vector3(-6, 5.8, -5), new THREE.Vector3(5, 4.2, -5), 
        new THREE.Vector3(-6, 8, -5), new THREE.Vector3(5, 8, -5), 
        shellSteamMat, fluidSteamMat
    );
    
    // 4. Secondario Acqua (Condensatore -> SG) [BLU]
    createCurvePipe(
        new THREE.Vector3(8, 1.0, -5), new THREE.Vector3(-4.7, 0.5, -5), 
        new THREE.Vector3(8, 0.5, -5), new THREE.Vector3(-2, 0.5, -5), 
        shellWaterMat, fluidWaterMat
    );


    // --- TUBI RAFFREDDAMENTO (TERZIARIO) ---
    
    // 5. Mandata Fredda (Torri -> Condensatore) [CIANO]
    createCurvePipe(
        new THREE.Vector3(10, 0, 10), new THREE.Vector3(11.5, 1.3, -7), 
        new THREE.Vector3(10, 0, -2), new THREE.Vector3(11.5, 1.3, -2),     
        shellCoolingColdMat, fluidColdMat
    );

    // 6. Ritorno Caldo (Condensatore -> Torri) [VERDE ACQUA]
    createCurvePipe(
        new THREE.Vector3(4.5, 1.9, -7), new THREE.Vector3(10, 4, 10), 
        new THREE.Vector3(4.5, 1.9, -2), new THREE.Vector3(10, 4, 0),      
        shellCoolingWarmMat, fluidWarmMat     
    );


    // --- STRUTTURE CIVILI ---
    const wallGeo = new THREE.LatheGeometry([new THREE.Vector2(8,0), new THREE.Vector2(8,10), new THREE.Vector2(7.2,10), new THREE.Vector2(7.2,0), new THREE.Vector2(8,0)], 64, -Math.PI/2, Math.PI);
    const wall = new THREE.Mesh(wallGeo, concreteMat); wall.position.set(-10, 1.01, -5); macroGroup.add(wall);
    
    const domePts = [];
    for(let i=0; i<=32; i++) { const t=i/32*Math.PI/2; domePts.push(new THREE.Vector2(Math.sin(t)*8, Math.cos(t)*8)); }
    for(let i=32; i>=0; i--) { const t=i/32*Math.PI/2; domePts.push(new THREE.Vector2(Math.sin(t)*7.2, Math.cos(t)*7.2)); }
    domePts.push(domePts[0]);
    const dome = new THREE.Mesh(new THREE.LatheGeometry(domePts, 64, -Math.PI/2, Math.PI), concreteMat);
    dome.position.set(-10, 11.03, -5); macroGroup.add(dome);

    const turbineFloor = new THREE.Mesh(createRoundedBox(16, 1, 10, 0.3, 4), concreteMat);
    turbineFloor.position.set(8, 0.5, -5); macroGroup.add(turbineFloor);
    const roof = new THREE.Mesh(createRoundedBox(16, 0.5, 10, 0.2, 3), glassMat); 
    roof.position.set(8, 8.5, -5); macroGroup.add(roof);

    // Torri
    function createThickTower(bottomRad, topRad, height, thickness) {
        const points = [];
        points.push(new THREE.Vector2(bottomRad, 0));
        points.push(new THREE.Vector2(topRad, height));
        points.push(new THREE.Vector2(topRad - thickness, height));
        points.push(new THREE.Vector2(bottomRad - thickness, 0));
        points.push(new THREE.Vector2(bottomRad, 0));
        return new THREE.LatheGeometry(points, 64);
    }
    const towerGeo = createThickTower(6, 3, 12, 0.5);
    const tower1 = new THREE.Mesh(towerGeo, concreteMat); tower1.position.set(5, 0, 10); macroGroup.add(tower1);
    const tower2 = new THREE.Mesh(towerGeo, concreteMat); tower2.position.set(15, 0, 10); macroGroup.add(tower2);

    return macroGroup;
}

export function updateMacro() {
    if(!macroGroup || !macroGroup.visible) return;
    if(turbineRotor) turbineRotor.rotation.x += 0.3;
    if(generatorRotor) generatorRotor.rotation.x += 0.3;
}

export function toggleMacro(visible) {
    if(macroGroup) macroGroup.visible = visible;
}

export function getMacroObjects() {
    return macroGroup ? macroGroup.children : [];
}