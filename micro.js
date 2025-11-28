/* micro.js - Logica dell'Atomo */

let microGroup;
let atomGroup;
let fissionFragments = [];
let isFissioning = false;

export function initMicro(scene) {
    microGroup = new THREE.Group();
    microGroup.visible = false; // Parte nascosto
    scene.add(microGroup);
    
    // Luce microbo aumentata
    const pointLight = new THREE.PointLight(0x4ecca3, 8, 100);
    pointLight.name = "fissionLight";
    microGroup.add(pointLight);

    atomGroup = new THREE.Group();
    const protonMat = new THREE.MeshStandardMaterial({color: 0xe74c3c, emissive: 0xaa0000, emissiveIntensity: 2, roughness: 0.3});
    const neutronMat = new THREE.MeshStandardMaterial({color: 0xaaaaaa, roughness: 0.3});

    for(let i=0; i<40; i++) {
        const isProton = Math.random() > 0.5;
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), isProton ? protonMat : neutronMat);
        sphere.position.set((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2);
        atomGroup.add(sphere);
    }
    microGroup.add(atomGroup);
    return microGroup;
}

export function triggerFission() {
    if(isFissioning) return; 
    isFissioning = true;
    
    document.getElementById('atom-status').innerText = "CRITICO - REAZIONE IN CORSO"; 
    document.getElementById('atom-status').style.color = "#e74c3c";
    
    const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshBasicMaterial({color: 0xffffaa})); 
    bullet.position.set(-20, 0, 0); 
    microGroup.add(bullet);
    
    const animateBullet = function() {
        if(bullet.position.x < -1.5) { 
            bullet.position.x += 0.5; 
            requestAnimationFrame(animateBullet); 
        } else { 
            microGroup.remove(bullet); 
            performExplosion(); 
        }
    }; 
    animateBullet();
}

function performExplosion() {
    const light = microGroup.getObjectByName("fissionLight");
    light.intensity = 20; 
    atomGroup.visible = false;
    
    const frag1 = atomGroup.clone(); 
    const frag2 = atomGroup.clone();
    frag1.scale.set(0.6, 0.6, 0.6); frag2.scale.set(0.7, 0.7, 0.7);
    frag1.visible = true; frag2.visible = true;
    
    microGroup.add(frag1); microGroup.add(frag2);
    
    fissionFragments.push({mesh: frag1, dir: new THREE.Vector3(1, 1, 0).normalize()});
    fissionFragments.push({mesh: frag2, dir: new THREE.Vector3(-1, -1, 0).normalize()});
    
    const fadeLight = function() { 
        if(light.intensity > 0) { 
            light.intensity -= 0.4; 
            requestAnimationFrame(fadeLight); 
        }
    }; 
    fadeLight();
}

export function resetFission() {
    isFissioning = false; 
    if(atomGroup) atomGroup.visible = true;
    
    document.getElementById('atom-status').innerText = "Stabile"; 
    document.getElementById('atom-status').style.color = "#4ecca3";
    
    fissionFragments.forEach(f => microGroup.remove(f.mesh)); 
    fissionFragments = [];
    
    const light = microGroup.getObjectByName("fissionLight"); 
    if(light) light.intensity = 0;
}

export function updateMicro() {
    if(!microGroup || !microGroup.visible) return;

    if(isFissioning) {
        fissionFragments.forEach(f => { 
            f.mesh.position.add(f.dir.clone().multiplyScalar(0.1)); 
            f.mesh.rotation.x += 0.05; 
        });
    } else { 
        atomGroup.rotation.y += 0.002; 
    }
}

export function toggleMicro(visible) {
    if(microGroup) {
        microGroup.visible = visible;
        if(visible) resetFission();
    }
}