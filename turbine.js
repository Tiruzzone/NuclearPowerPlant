/* turbine.js - CORRETTO (NO IMPORT, USA GLOBAL THREE) */

export function createDetailedTurbine() {
    const turbineGroup = new THREE.Group();
    turbineGroup.name = "TurbineUnit"; // Utile per debug

    // --- MATERIALI ---
    
    // Guscio Esterno (Metallo Pesante) - Diventa trasparente in X-Ray
    const casingMat = new THREE.MeshStandardMaterial({
        color: 0x445566,
        roughness: 0.7,
        metalness: 0.5,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
    });

    // Rotore e Pale (Acciaio Lucido) - SEMPRE VISIBILE (Internal)
    const rotorMat = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.2,
        metalness: 0.9
    });

    // Vapore Interno (Rosso Vivo) - VISIBILE SOLO IN X-RAY
    const steamFlowMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0xff3300,
        emissiveIntensity: 3.0,
        transparent: true,
        opacity: 0.6, 
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // --- 1. IL ROTORE (Parte Mobile) ---
    const rotorGroup = new THREE.Group();
    rotorGroup.name = "Rotor"; // Nome fondamentale per l'animazione in macro.js
    
    // Asse Centrale
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 7, 32), rotorMat);
    shaft.rotation.z = Math.PI / 2; // Orizzontale lungo X
    shaft.userData = { xrayType: 'internal' };
    rotorGroup.add(shaft);

    // Pale Alta Pressione (Dischi piccoli)
    for(let i=0; i<5; i++) {
        const bladeDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16), rotorMat);
        bladeDisk.rotation.z = Math.PI / 2;
        bladeDisk.position.x = -1.5 + (i * 0.4);
        bladeDisk.userData = { xrayType: 'internal' };
        
        // Denti pale
        const teeth = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 12), rotorMat);
        teeth.rotation.z = Math.PI / 2;
        teeth.userData = { xrayType: 'internal' };
        bladeDisk.add(teeth);
        
        rotorGroup.add(bladeDisk);
    }

    // Pale Bassa Pressione (Dischi grandi)
    for(let i=0; i<4; i++) {
        const bladeDisk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 16), rotorMat);
        bladeDisk.rotation.z = Math.PI / 2;
        bladeDisk.position.x = 1.0 + (i * 0.6);
        bladeDisk.userData = { xrayType: 'internal' };
        
        const teeth = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.12, 16), rotorMat);
        teeth.rotation.z = Math.PI / 2;
        teeth.userData = { xrayType: 'internal' };
        bladeDisk.add(teeth);

        rotorGroup.add(bladeDisk);
    }

    turbineGroup.add(rotorGroup);


    // --- 2. GUSCIO ESTERNO (CASING) ---
    // Involucro Alta Pressione
    const hpCasing = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.5, 16), casingMat);
    hpCasing.rotation.z = Math.PI / 2;
    hpCasing.position.x = -0.8;
    hpCasing.userData = { xrayType: 'shell' };
    turbineGroup.add(hpCasing);

    // Involucro Bassa Pressione
    const lpCasing = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 3.0, 16), casingMat);
    lpCasing.rotation.z = Math.PI / 2;
    lpCasing.position.x = 2.0;
    lpCasing.userData = { xrayType: 'shell' };
    turbineGroup.add(lpCasing);

    // Cono di raccordo tra HP e LP
    const transition = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.8, 1.0, 16), casingMat);
    transition.rotation.z = Math.PI / 2;
    transition.position.x = 0.5; 
    transition.userData = { xrayType: 'shell' };
    turbineGroup.add(transition);

    // Flangia di Ingresso Vapore (In Alto su HP)
    // Posizione locale: x=-0.8, y=1.2 (un po' sopra il cilindro raggio 1.1)
    const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.8, 16), casingMat);
    inlet.position.set(-0.8, 1.2, 0); 
    inlet.userData = { xrayType: 'shell' };
    turbineGroup.add(inlet);


    // --- 3. FLUSSO VAPORE INTERNO (X-RAY) ---
    // Volume che riempie la turbina di rosso
    const steamVolHP = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.4, 16), steamFlowMat);
    steamVolHP.rotation.z = Math.PI / 2;
    steamVolHP.position.x = -0.8;
    steamVolHP.userData = { xrayType: 'internal' }; 
    turbineGroup.add(steamVolHP);

    const steamVolLP = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 2.9, 16), steamFlowMat);
    steamVolLP.rotation.z = Math.PI / 2;
    steamVolLP.position.x = 2.0;
    steamVolLP.userData = { xrayType: 'internal' };
    turbineGroup.add(steamVolLP);

    // Flusso in ingresso
    const steamInletFlow = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 16), steamFlowMat);
    steamInletFlow.position.set(-0.8, 1.2, 0);
    steamInletFlow.userData = { xrayType: 'internal' };
    turbineGroup.add(steamInletFlow);

    // Metadata per il tooltip
    turbineGroup.userData = { 
        name: "Turbina a Vapore", 
        info: "Il vapore ad alta pressione espande e fa ruotare le pale (1500 RPM)." 
    };

    return turbineGroup;
}