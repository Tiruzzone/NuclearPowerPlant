/* utils.js - Funzioni di aiuto */

// Noterai che non importiamo THREE perché assumiamo sia globale (caricato dall'HTML)
// Usiamo "export" per rendere questa funzione disponibile agli altri file.

export function createRoundedBox(width, height, depth, radius, smoothness) {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const radius0 = radius - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth - radius * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius,
        curveSegments: smoothness
    });
    geometry.center();
    return geometry;
}