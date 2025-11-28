/* steamGenerator.js - SERPENTINA ELICOIDALE FISICAMENTE CORRETTA */

export function createDetailedSteamGenerator() {
    const sgGroup = new THREE.Group();

    // --- MATERIALI ---
    const shellMat = new THREE.MeshStandardMaterial({
        color: 0x445566, roughness: 0.7, metalness: 0.5,
        transparent: true, opacity: 1.0, side: THREE.DoubleSide
    });

    // SHADER GRADIENTE (Rosso -> Blu)
    const gradientShaderMat = new THREE.ShaderMaterial({
        uniforms: {
            colorHot: { value: new THREE.Color(0xff2200) },
            colorCold: { value: new THREE.Color(0x0066ff) },
            topY: { value: 4.0 },  // Inizio Serpentina
            bottomY: { value: 0.7 } // Fine Serpentina
        },
        vertexShader: `
            varying vec3 vPos;
            void main() {
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 colorHot;
            uniform vec3 colorCold;
            uniform float topY;
            uniform float bottomY;
            varying vec3 vPos;
            void main() {
                float t = (vPos.y - bottomY) / (topY - bottomY);
                t = clamp(t, 0.0, 1.0);
                vec3 finalColor = mix(colorCold, colorHot, t);
                gl_FragColor = vec4(finalColor, 1.0); 
            }
        `,
        side: THREE.DoubleSide
    });

    // --- GEOMETRIA GUSCIO (SHELL) ---
    // (Invariata, serve come contenitore)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 3.5, 32, 1, true), shellMat);
    base.position.y = 1.75; base.userData = { xrayType: 'shell' }; sgGroup.add(base);

    const bottom = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2), shellMat);
    bottom.position.y = 0.05; bottom.userData = { xrayType: 'shell' }; sgGroup.add(bottom);

    const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.3, 1.0, 32, 1, true), shellMat);
    cone.position.y = 4.0; cone.userData = { xrayType: 'shell' }; sgGroup.add(cone);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.8, 32, 16, 0, Math.PI*2, 0, Math.PI/2), shellMat);
    dome.position.y = 4.5; dome.userData = { xrayType: 'shell' }; sgGroup.add(dome);

    const outlet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16), shellMat);
    outlet.position.y = 6.3; outlet.userData = { xrayType: 'shell' }; sgGroup.add(outlet);


    // --- NUOVO INTERNO: SERPENTINA ELICOIDALE ---
    // [Image of helical coil heat exchanger]
    
    // Funzione per creare una spirale singola
    function createTrueHelix(radius, turns, offsetAngle) {
        const pathPoints = [];
        const heightStart = 4.0; // Altezza ingresso (dal tubo rosso)
        const heightEnd = 0.7;   // Altezza uscita (verso il tubo blu)
        const steps = 100;       // Alta risoluzione per curve morbide

        // Punto centrale di partenza (Collettore Alto)
        pathPoints.push(new THREE.Vector3(0, heightStart, 0));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            
            // Interpolazione lineare altezza (scende costantemente)
            const y = heightStart - t * (heightStart - heightEnd);
            
            // Raggio costante (CILINDRICO, non sferico)
            // Usiamo un ease-in all'inizio per allargarsi dal centro
            const currentRadius = radius * (t < 0.1 ? t * 10 : 1.0); 
            
            // Angolo che gira
            const angle = offsetAngle + (t * Math.PI * 2 * turns);
            
            const x = Math.cos(angle) * currentRadius;
            const z = Math.sin(angle) * currentRadius;
            
            pathPoints.push(new THREE.Vector3(x, y, z));
        }
        
        // Punto centrale di arrivo (Collettore Basso)
        pathPoints.push(new THREE.Vector3(0, heightEnd, 0));

        const curve = new THREE.CatmullRomCurve3(pathPoints);
        const geometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false); // Tubo sottile
        
        const tube = new THREE.Mesh(geometry, gradientShaderMat);
        tube.userData = { xrayType: 'internal' };
        return tube;
    }

    // Creiamo un fascio di serpentine
    const numCoils = 8; 
    for (let i = 0; i < numCoils; i++) {
        const angle = (i / numCoils) * Math.PI * 2;
        // Raggio 0.8 per riempire bene il cilindro da 1.3
        const coil = createTrueHelix(0.8, 3, angle); 
        sgGroup.add(coil);
    }
    
    // Aggiungiamo anche un fascio interno più stretto per densità
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const coil = createTrueHelix(0.4, 3, angle); 
        sgGroup.add(coil);
    }

    // Piccoli collettori centrali per nascondere le giunzioni
    const manifoldMat = new THREE.MeshStandardMaterial({ color: 0x222222 }); // Scuro, si vede solo il glow dei tubi
    
    const manTop = new THREE.Mesh(new THREE.SphereGeometry(0.3), manifoldMat);
    manTop.position.y = 4.0; manTop.userData = { xrayType: 'internal' }; sgGroup.add(manTop);
    
    const manBot = new THREE.Mesh(new THREE.SphereGeometry(0.3), manifoldMat);
    manBot.position.y = 0.7; manBot.userData = { xrayType: 'internal' }; sgGroup.add(manBot);

    return sgGroup;
}