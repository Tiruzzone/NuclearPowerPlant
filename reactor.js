/* reactor.js - CORRETTO (NO IMPORT THREE) */

export function createDetailedReactor() {
    const reactorGroup = new THREE.Group();

    // Materiali con supporto X-Ray
    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2e, roughness: 0.8, metalness: 0.4,
        side: THREE.DoubleSide, 
        transparent: true, opacity: 1.0
    });

    const boltMat = new THREE.MeshStandardMaterial({ 
        color: 0x555566, roughness: 0.6, metalness: 0.8 
    });

    const glowMat = new THREE.MeshStandardMaterial({ 
        color: 0x000000, emissive: 0xff2200, emissiveIntensity: 5.0, roughness: 1.0 
    });

    // --- 1. CORPO ---
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.5, 32), steelMat);
    body.position.y = -0.5; body.castShadow = true;
    body.userData = { xrayType: 'shell' }; 
    reactorGroup.add(body);

    const bottom = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), steelMat);
    bottom.rotation.x = Math.PI; bottom.position.y = -2.25;
    bottom.userData = { xrayType: 'shell' };
    reactorGroup.add(bottom);

    // --- 2. FLANGIA ---
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.8, 0.4, 32), steelMat);
    flange.position.y = 1.25;
    flange.userData = { xrayType: 'shell' };
    reactorGroup.add(flange);

    // Bulloni
    const boltCount = 12; const boltGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 6);
    for(let i=0; i<boltCount; i++) {
        const angle = (i / boltCount) * Math.PI * 2;
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(Math.cos(angle)*1.8, 1.55, Math.sin(angle)*1.8);
        reactorGroup.add(bolt);
    }

    // --- 3. COPERCHIO ---
    const lid = new THREE.Mesh(new THREE.SphereGeometry(1.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), steelMat);
    lid.scale.y = 0.8; lid.position.y = 1.25;
    lid.userData = { xrayType: 'shell' };
    reactorGroup.add(lid);

    // --- 4. DETTAGLI ---
    const crdmGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
    const crdmCenter = new THREE.Mesh(crdmGeo, boltMat); crdmCenter.position.y = 2.8; reactorGroup.add(crdmCenter);
    for(let i=0; i<4; i++) {
        const crdm = new THREE.Mesh(crdmGeo, boltMat);
        crdm.position.set(Math.cos(i*Math.PI/2)*0.4, 2.6, Math.sin(i*Math.PI/2)*0.4); reactorGroup.add(crdm);
    }

    const hookGeo = new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI);
    for(let i=0; i<3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const hook = new THREE.Mesh(hookGeo, boltMat);
        hook.position.set(Math.cos(angle)*1.4, 2.0, Math.sin(angle)*1.4);
        hook.lookAt(0, 2.0, 0);
        reactorGroup.add(hook);
    }

    // --- 5. UGELLI ---
    const nozzleGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.0, 16);
    // Alto
    const nozzleTop = new THREE.Mesh(nozzleGeo, steelMat); nozzleTop.rotation.z = -Math.PI/2; nozzleTop.position.set(1.5, 2.0, 0); 
    nozzleTop.userData = { xrayType: 'shell' }; reactorGroup.add(nozzleTop);
    const flangeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16), boltMat); flangeTop.rotation.z = -Math.PI/2; flangeTop.position.set(2.0, 2.0, 0); reactorGroup.add(flangeTop);

    // Basso
    const nozzleBot = new THREE.Mesh(nozzleGeo, steelMat); nozzleBot.rotation.z = -Math.PI/2; nozzleBot.position.set(1.5, -1.0, 0); 
    nozzleBot.userData = { xrayType: 'shell' }; reactorGroup.add(nozzleBot);
    const flangeBot = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16), boltMat); flangeBot.rotation.z = -Math.PI/2; flangeBot.position.set(2.0, -1.0, 0); reactorGroup.add(flangeBot);

    // --- INTERNO ---
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 16), glowMat);
    core.position.y = -0.5;
    core.userData = { xrayType: 'internal' }; 
    reactorGroup.add(core);

    reactorGroup.userData = { name: "Pressure Vessel", info: "Contiene il nocciolo." };
    return reactorGroup;
}