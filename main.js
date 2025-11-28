/* main.js - LUCI SCURE E DRAMMATICHE */
import { initMacro, updateMacro, toggleMacro, getMacroObjects } from './macro.js';
import { initMicro, updateMicro, toggleMicro, triggerFission } from './micro.js';

let scene, camera, renderer, controls, raycaster, mouse, composer;
let xRayEnabled = false;

try {
    init();
    animate();
} catch (err) {
    console.error(err);
    document.getElementById('error-msg').style.display = 'block';
    document.getElementById('error-msg').innerText = "Errore: " + err.message;
}

function init() {
    scene = new THREE.Scene();
    const bgColor = 0x111118; // Sfondo molto scuro
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 50, 200);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 30, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Bloom
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0.9);
    composer.addPass(bloomPass);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    // LUCI (Basse per evitare il bianco)
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 50, 30); dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    initMacro(scene);
    initMicro(scene);

    document.getElementById('btn-macro').onclick = () => switchView('macro');
    document.getElementById('btn-micro').onclick = () => switchView('micro');
    document.getElementById('btn-fire').onclick = () => triggerFission();
    document.getElementById('btn-xray').onclick = () => toggleXRayMode();
    document.getElementById('btn-back-macro').onclick = () => switchView('macro');

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    switchView('macro');
}

function toggleXRayMode() {
    xRayEnabled = !xRayEnabled;
    const btn = document.getElementById('btn-xray');

    if (xRayEnabled) {
        btn.style.background = "#4ecca3";
        btn.style.color = "#000";
    } else {
        btn.style.background = "linear-gradient(45deg, #444444, #777777)";
        btn.style.color = "#fff";
    }

    scene.traverse((obj) => {
        if (obj.isMesh && obj.userData) {
            if (obj.userData.xrayType === 'shell') {
                obj.material.transparent = true;
                obj.material.opacity = xRayEnabled ? 0.1 : 1.0;
                obj.material.depthWrite = !xRayEnabled;
                obj.material.needsUpdate = true;
            }
            if (obj.userData.xrayType === 'internal') {
                obj.visible = true;
            }
        }
    });
}

function switchView(view) {
    const btnMacro = document.getElementById('btn-macro');
    const btnMicro = document.getElementById('btn-micro');
    const btnXray = document.getElementById('btn-xray');
    const btnBack = document.getElementById('btn-back-macro');

    if(view === 'macro') {
        toggleMacro(true); toggleMicro(false);
        camera.position.set(40, 30, 40); controls.target.set(0,0,0);
        scene.background.setHex(0x111118); scene.fog = new THREE.Fog(0x111118, 50, 200);

        document.getElementById('fission-controls').style.display = 'none';
        document.getElementById('scene-title').innerText = "PWR Plant Model";

        btnMacro.style.display = 'flex';
        btnMicro.style.display = 'flex';
        btnXray.style.display = 'flex';
        btnBack.style.display = 'none';

        btnMacro.classList.add('active'); btnMicro.classList.remove('active');
    } else {
        toggleMacro(false); toggleMicro(true);
        camera.position.set(0, 0, 30); controls.target.set(0,0,0);
        scene.background.setHex(0x000000); scene.fog = null;

        document.getElementById('fission-controls').style.display = 'block';
        document.getElementById('scene-title').innerText = "Fissione Nucleare U-235";

        btnMacro.style.display = 'none';
        btnMicro.style.display = 'none';
        btnXray.style.display = 'none';
        btnBack.style.display = 'flex';

        btnMicro.classList.add('active'); btnMicro.classList.remove('active');
        if(xRayEnabled) toggleXRayMode();
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateMacro();
    updateMicro();
    composer.render();
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (getMacroObjects().length > 0 && !xRayEnabled) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const tooltip = document.getElementById('tooltip');
        let target = null;
        for(let i=0; i<intersects.length; i++) {
            let obj = intersects[i].object;
            while(obj) { if(obj.userData && obj.userData.name) { target = obj; break; } obj = obj.parent; }
            if(target) break;
        }
        if (target) {
            tooltip.style.display = 'block'; tooltip.style.left = event.clientX + 15 + 'px'; tooltip.style.top = event.clientY + 15 + 'px';
            tooltip.innerHTML = '<strong>' + target.userData.name + '</strong>' + target.userData.info; document.body.style.cursor = 'pointer';
        } else { tooltip.style.display = 'none'; document.body.style.cursor = 'default'; }
    }
}

function onMouseClick(event) {
    if (getMacroObjects().length > 0 && !xRayEnabled) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        let target = null;
        for(let i=0; i<intersects.length; i++) {
            let obj = intersects[i].object;
            while(obj) { if(obj.userData && obj.userData.name) { target = obj; break; } obj = obj.parent; }
            if(target) break;
        }

        if (target && target.userData.name === "Pressure Vessel") {
            switchView('micro');
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(window.innerWidth, window.innerHeight);
}
