/* condenser.js - SCAMBIATORE DI CALORE CON GRADIENTE */

export function createDetailedCondenser() {
    const condenserGroup = new THREE.Group();

    // --- MATERIALI ---

    // 1. Guscio Esterno (Scatola Blu)
    const shellMat = new THREE.MeshStandardMaterial({
        color: 0x0044aa,      // Blu scuro
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 1.0,         // Diventa trasparente in X-Ray
        side: THREE.DoubleSide
    });

    // 2. Acqua sul fondo (Liquido statico)
    const waterPoolMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x0066ff,
        emissiveIntensity: 2.0
    });

    // 3. SHADER PER LA SERPENTINA (Il cuore del gradiente)
    // Sfuma da Ciano (Freddo) a Verde-Acqua (Caldo) lungo il tubo
    const coilShaderMat = new THREE.ShaderMaterial({
        uniforms: {
            colorIn: { value: new THREE.Color(0x00ffff) },  // Ciano (Ingresso)
            colorOut: { value: new THREE.Color(0x00ff88) }  // Verde Acqua (Uscita)
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv; // La coordinata UV.x va da 0 (inizio tubo) a 1 (fine tubo)
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 colorIn;
            uniform vec3 colorOut;
            varying vec2 vUv;
            
            void main() {
                // Mixa i colori in base alla lunghezza del tubo (vUv.x)
                vec3 finalColor = mix(colorIn, colorOut, vUv.x);
                // Output colore luminoso (emula l'emissive)
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });


    // --- GEOMETRIA ---

    // Guscio Scatola (Box smussato)
    // Dimensioni: 8 x 1.5 x 4
    function createBox(w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        // Smussiamo leggermente (opzionale, per semplicità usiamo box standard qui)
        return geo;
    }
    
    const casing = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 4), shellMat);
    casing.userData = { xrayType: 'shell' };
    condenserGroup.add(casing);

    // Pozza d'acqua sul fondo (condensa raccolta)
    const pool = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.4, 3.5), waterPoolMat);
    pool.position.y = -0.5; // Sul fondo della scatola
    pool.userData = { xrayType: 'internal' };
    condenserGroup.add(pool);


    // --- SERPENTINA A GRADIENTE ---
    // Creiamo un percorso continuo a serpentina
    
    const path = new THREE.CurvePath();
    
    // Coordinate relative al centro della scatola
    // Ingresso (Retro Basso Sinistra): Z=-1.8, Y=-0.2, X=3
    // Uscita (Retro Alto Sinistra): Z=-1.8, Y=0.4, X=3
    
    // Creiamo 4 curve a U che percorrono la lunghezza X
    const startX = 3.5;
    const endX = -3.5;
    const zBack = -1.0;
    const zFront = 1.0;
    
    // Inizia dal retro
    const coilPoints = [];
    coilPoints.push(new THREE.Vector3(startX, -0.2, -2.0)); // Ingresso esterno
    
    for(let i=0; i<4; i++) {
        const x = startX - (i * 2.3); // Spostamento verso sinistra
        
        // Andata verso il fronte
        coilPoints.push(new THREE.Vector3(x, -0.2, zBack));
        coilPoints.push(new THREE.Vector3(x, -0.2, zFront));
        
        // Curva a U verso l'alto (scambio termico)
        coilPoints.push(new THREE.Vector3(x - 0.5, 0.4, zFront));
        
        // Ritorno verso il retro
        coilPoints.push(new THREE.Vector3(x - 1.0, 0.4, zFront));
        coilPoints.push(new THREE.Vector3(x - 1.0, 0.4, zBack));
    }
    
    // Uscita finale
    coilPoints.push(new THREE.Vector3(endX - 1.0, 0.4, -2.0)); // Uscita esterna

    const curve = new THREE.CatmullRomCurve3(coilPoints);
    
    // Tubo Serpentina
    // Raggio 0.15 (più spesso per visibilità)
    const coilGeo = new THREE.TubeGeometry(curve, 128, 0.15, 8, false);
    const coil = new THREE.Mesh(coilGeo, coilShaderMat);
    coil.userData = { xrayType: 'internal' }; // Visibile in X-Ray
    condenserGroup.add(coil);

    // Dati tooltip
    condenserGroup.userData = { 
        name: "Condensatore", 
        info: "Il vapore esausto tocca i tubi freddi e torna acqua liquida." 
    };

    return condenserGroup;
}