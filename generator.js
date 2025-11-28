/* generator.js - ALTERNATORE INDUSTRIALE DETTAGLIATO */

export function createDetailedGenerator() {
    const genGroup = new THREE.Group();

    // --- MATERIALI ---

    // Guscio Esterno Giallo (Vernice industriale)
    const paintMat = new THREE.MeshStandardMaterial({
        color: 0xffcc00, // Giallo Caterpillar
        roughness: 0.4,
        metalness: 0.3,
        transparent: true, opacity: 1.0,
        side: THREE.DoubleSide
    });

    // Metallo Scuro (Estremità)
    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x333333, roughness: 0.7, metalness: 0.6,
        transparent: true, opacity: 1.0
    });

    // Rame (Avvolgimenti Interni) - Molto luminoso per X-Ray
    const copperMat = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        emissive: 0xaa4400, // Bagliore arancione rame
        emissiveIntensity: 2.0, // Brilla in Xray
        roughness: 0.3,
        metalness: 0.8,
        wireframe: false // Solido
    });

    // Acciaio Lucido (Giunto)
    const steelMat = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, roughness: 0.2, metalness: 0.9
    });

    // Gomma Nera (Cavi)
    const cableMat = new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 0.9
    });


    // --- 1. ROTORE (PARTE MOBILE) ---
    // Creiamo un gruppo specifico per la parte che deve girare
    const rotorGroup = new THREE.Group();
    rotorGroup.name = "GenRotor"; // Nome per animarlo in macro.js
    
    // Nucleo in Rame (Visibile in X-Ray)
    const copperCore = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4.5, 16), copperMat);
    copperCore.rotation.z = Math.PI / 2;
    copperCore.userData = { xrayType: 'internal' }; // Visibile dentro
    rotorGroup.add(copperCore);

    // Asse passante
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 7.5, 16), steelMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.userData = { xrayType: 'internal' };
    rotorGroup.add(shaft);

    // GIUNTO DI ACCOPPIAMENTO (Coupling)
    // Connette l'asse della turbina (sinistra) a questo asse.
    // Posizione locale: spostato a sinistra verso la turbina
    const coupling = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16), steelMat);
    coupling.rotation.z = Math.PI / 2;
    coupling.position.x = -3.8; // Sporge a sinistra
    
    // Bulloni sul giunto
    const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6);
    for(let i=0; i<6; i++) {
        const bolt = new THREE.Mesh(boltGeo, darkMetalMat);
        bolt.position.x = -0.28; // Sulla faccia del giunto
        bolt.position.y = Math.cos(i/6 * Math.PI*2) * 0.25;
        bolt.position.z = Math.sin(i/6 * Math.PI*2) * 0.25;
        bolt.rotation.z = Math.PI / 2;
        coupling.add(bolt);
    }
    
    rotorGroup.add(coupling);
    genGroup.add(rotorGroup); // Aggiungi il rotore al gruppo principale


    // --- 2. STATORE (PARTE FISSA INTERNA) ---
    // Avvolgimenti fissi attorno al rotore (Visibili in X-Ray)
    const statorGeo = new THREE.CylinderGeometry(1.1, 1.1, 4.0, 16, 1, true);
    const stator = new THREE.Mesh(statorGeo, copperMat);
    stator.rotation.z = Math.PI / 2;
    stator.userData = { xrayType: 'internal' };
    // Creiamo un effetto "barre" usando una texture o wireframe, o geometria semplice
    // Qui usiamo la geometria semplice ma con materiale rame
    genGroup.add(stator);


    // --- 3. GUSCIO ESTERNO (SHELL) ---
    
    // Corpo Cilindrico Giallo
    const bodyGeo = new THREE.CylinderGeometry(1.3, 1.3, 4.2, 32);
    const body = new THREE.Mesh(bodyGeo, paintMat);
    body.rotation.z = Math.PI / 2;
    body.userData = { xrayType: 'shell' }; // Diventa trasparente
    genGroup.add(body);

    // Alette di Raffreddamento (Cooling Fins)
    // Creiamo una serie di anelli sottili lungo il corpo
    const finGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.05, 32);
    const numFins = 12;
    for(let i=0; i<numFins; i++) {
        const fin = new THREE.Mesh(finGeo, paintMat);
        fin.rotation.z = Math.PI / 2;
        // Distribuisci lungo l'asse X (che è l'asse del cilindro ruotato)
        fin.position.x = -1.8 + (i * (3.6 / (numFins-1)));
        fin.userData = { xrayType: 'shell' };
        genGroup.add(fin);
    }

    // Estremità (End Caps) - Grigio scuro
    const capGeo = new THREE.CylinderGeometry(1.3, 1.1, 0.4, 32);
    
    const leftCap = new THREE.Mesh(capGeo, darkMetalMat);
    leftCap.rotation.z = Math.PI / 2;
    leftCap.position.x = -2.3;
    leftCap.userData = { xrayType: 'shell' };
    genGroup.add(leftCap);

    const rightCap = new THREE.Mesh(capGeo, darkMetalMat);
    rightCap.rotation.z = -Math.PI / 2;
    rightCap.position.x = 2.3;
    rightCap.userData = { xrayType: 'shell' };
    genGroup.add(rightCap);

    // Basamento (Feet)
    const baseL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 2.0), darkMetalMat);
    baseL.position.set(-1.5, -1.3, 0); baseL.userData = { xrayType: 'shell' };
    genGroup.add(baseL);
    
    const baseR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 2.0), darkMetalMat);
    baseR.position.set(1.5, -1.3, 0); baseR.userData = { xrayType: 'shell' };
    genGroup.add(baseR);


    // --- 4. TERMINAL BOX & CAVI ---
    
    // Scatola connessioni
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), darkMetalMat);
    box.position.set(0, 1.4, 0.8); // Sopra e di lato
    box.userData = { xrayType: 'shell' };
    genGroup.add(box);

    // 3 Cavi di Potenza
    function createCable(offsetX) {
        const path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(offsetX, 1.4, 1.4), // Esce dalla box
            new THREE.Vector3(offsetX, 1.0, 2.5), // Curva fuori
            new THREE.Vector3(offsetX, -2.0, 3.0) // Va a terra
        ]);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 12, 0.08, 8, false), cableMat);
        // I cavi non diventano trasparenti, sono esterni
        return tube;
    }

    genGroup.add(createCable(-0.3));
    genGroup.add(createCable(0));
    genGroup.add(createCable(0.3));

    // Metadata
    genGroup.userData = { 
        name: "Alternatore Trifase", 
        info: "Converte l'energia meccanica (rotazione) in energia elettrica (20.000 Volt)." 
    };

    return genGroup;
}