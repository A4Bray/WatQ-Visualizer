// =========================
// MODE NAVIGATION
// =========================
function showMode(mode) {
    document.getElementById("modeMenu").style.display = "none";
    document.getElementById("singleQubitPage").style.display = "none";
    document.getElementById("twoQubitPage").style.display = "none";

    if (mode === "single") {
        document.getElementById("singleQubitPage").style.display = "block";
    } else if (mode === "two") {
        document.getElementById("twoQubitPage").style.display = "block";
    }
}

function showMenu() {
    document.getElementById("singleQubitPage").style.display = "none";
    document.getElementById("twoQubitPage").style.display = "none";
    document.getElementById("modeMenu").style.display = "grid";
}

// =========================
// MENU BACKGROUND
// =========================
const menuCanvas = document.getElementById("menuBackground");

const menuContext = menuCanvas.getContext("2d");

const menuPointCount = 32;
const menuConnectionDistance = 180;
const menuPoints = [];

let menuWidth;
let menuHeight;

// Use accent colour defined in .css
const menuAccentColor = getComputedStyle(document.documentElement)
                .getPropertyValue("--accent-color")
                .trim() || "#bb55ff";

function createMenuPoints() {
    menuPoints.length = 0;

    for (
        let index = 0;
        index < menuPointCount;
        index++
) {
        menuPoints.push({
            x: Math.random() * menuWidth,
            y: Math.random() * menuHeight,

            velocityX: (Math.random() - 0.5) * 0.35,
            velocityY: (Math.random() - 0.5) * 0.35
        });
    }
}
                    
function resizeMenuBackground() {
    menuWidth = window.innerWidth;
    menuHeight = window.innerHeight;

    //limit pixel density
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    menuCanvas.width = menuWidth * pixelRatio;
    menuCanvas.height = menuHeight * pixelRatio;

    menuContext.setTransform(
            pixelRatio, 0, 0,
            pixelRatio, 0, 0
    );

    createMenuPoints();
}

function animateMenuBackground() {
    requestAnimationFrame(
        animateMenuBackground
        );

    menuContext.clearRect(0, 0, menuWidth, menuHeight);
    
    //Have velocity for each point
    for (let point of menuPoints) {
        point.x += point.velocityX;
        point.y += point.velocityY;

        // Reverse horizontal direction upon edge
        if (
            point.x <= 0 || point.x >= menuWidth
        ) {
            point.velocityX *= -1;
        }

        // Reverse vertical direction upon edge
        if (
            point.y <= 0 || point.y >= menuHeight
            ) {
            point.velocityY *= -1;
        }
    }

    // Connect points if distance is less than
    for (
        let first = 0;
        first < menuPoints.length; 
        first ++
    ) {
        for (
            let second = first + 1;
            second < menuPoints.length;
            second++
        ) {
            const deltaX = menuPoints[first].x - menuPoints[second].x;
            const deltaY = menuPoints[first].y - menuPoints[second].y;
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            if (
                distance < menuConnectionDistance
            ) {
                menuContext.beginPath();

                menuContext.moveTo(
                    menuPoints[first].x,
                    menuPoints[first].y
                );

                menuContext.lineTo(
                    menuPoints[second].x,
                    menuPoints[second].y
                );

                menuContext.strokeStyle = menuAccentColor;

                //Closer points produce brighter connecting lines.
                menuContext.globalAlpha = 0.22 * ( 1- distance/menuConnectionDistance);
                menuContext.lineWidth = 1;
                menuContext.stroke();
            }
        }
    }

    //Draw individual points
    menuContext.globalAlpha = 0.7;

    menuContext.fillStyle = menuAccentColor;
    menuContext.shadowColor = menuAccentColor;
    menuContext.shadowBlur = 5;
    
    for (let point of menuPoints) {
        menuContext.beginPath();

        menuContext.arc(
            point.x, point.y,
            1.5, 0, 2 * Math.PI
        );

        menuContext.fill();
    }   
    //restore full opacity for animation
    menuContext.globalAlpha = 1;
    menuContext.shadowBlur = 0;
}

resizeMenuBackground();

window.addEventListener(
    "resize",
    resizeMenuBackground
);

// =========================
// COMPLEX-NUMBER SETUP
// =========================
function Complex(re, im) {
    return { re: re, im: im };
}

function add(a, b) {
    return Complex(a.re + b.re, a.im + b.im);
}

function subtract(a, b) {
    return Complex(a.re - b.re, a.im - b.im);
}

function multiply(a, b) {
    return Complex(
        a.re * b.re - a.im * b.im,
        a.re * b.im + a.im * b.re
    );
}

function conjugate(a) {
    return Complex(a.re, -a.im);
}

function scale(a, s) {
    return Complex(a.re * s, a.im * s);
}

function magnitude(a) {
    return Math.sqrt(a.re * a.re + a.im * a.im);
}

function phase(a) {
    return Math.atan2(a.im, a.re);
}

function formatComplex(a) {
    let re = Math.abs(a.re) < 0.000001 ? 0 : a.re;
    let im = Math.abs(a.im) < 0.000001 ? 0 : a.im;

    if (im === 0) {
        return re.toFixed(3);
    }

    if (re === 0) {
        return im.toFixed(3) + "i";
    }

    let sign = im >= 0 ? " + " : " - ";

    return (
        re.toFixed(3) +
        sign +
        Math.abs(im).toFixed(3) +
        "i"
    );
}

function updateStateDisplay() {
    document.getElementById("stateDisplay").innerText =
        "|ψ⟩ = (" +
        formatComplex(alpha) +
        ")|0⟩ + (" +
        formatComplex(beta) +
        ")|1⟩";
}

// Generate a cryptographically secure classical
// random number between 0 and 1.
function secureRandom() {
    let values = new Uint32Array(1);

    crypto.getRandomValues(values);

    return values[0] / 4294967296;
}

// =========================
// SINGLE-QUBIT STATE
// =========================

// The initial sliders show theta = pi/2 and phi = 0,
// which represents the |+⟩ state.
let alpha = Complex(1 / Math.sqrt(2), 0);
let beta = Complex(1 / Math.sqrt(2), 0);

// Animation state
let currentDir = new THREE.Vector3(0, 0, 1);
let targetDir = new THREE.Vector3(0, 0, 1);
let isAnimating = false;
let t = 0;

// =========================
// MAIN THREE.JS SETUP
// =========================
let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(
    55,
    1,
    0.1,
    1000
);

camera.position.z = 2.4;

let renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
);

renderer.setSize(720, 720);

document
    .getElementById("bloch")
    .appendChild(renderer.domElement);

// =========================
// CAMERA CONTROLS
// =========================
let controls = new THREE.OrbitControls(
    camera,
    renderer.domElement
);

function resetView() {
    camera.position.set(0, 0, 3);
    controls.target.set(0, 0, 0);
    controls.update();
}

// =========================
// MAIN BLOCH SPHERE
// =========================
let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.25
    })
);

scene.add(sphere);

// Lighting
let light = new THREE.PointLight(0xffffff, 1);

light.position.set(5, 5, 5);
scene.add(light);

let ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.4
);

scene.add(ambientLight);

// Coordinate axes
scene.add(new THREE.AxesHelper(1.15));

// =========================
// STATE-VECTOR ARROW
// =========================
let arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    1,
    0xff0000,
    0.2,
    0.1
);

scene.add(arrow);

// =========================
// BLOCH-SPHERE LABELS
// =========================
function createLabel(text, pos) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.width = 256;
    canvas.height = 128;

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(text, 50, 70);

    let texture = new THREE.CanvasTexture(canvas);

    let sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: texture
        })
    );

    sprite.position.copy(pos);
    sprite.scale.set(0.5, 0.25, 1);

    scene.add(sprite);
}

createLabel(
    "|0⟩",
    new THREE.Vector3(0, 0, 1.2)
);

createLabel(
    "|1⟩",
    new THREE.Vector3(0, 0, -1.2)
);

// =========================
// SINGLE-QUBIT GATE LOGIC
// =========================
function applyGate(gate) {
    let a = alpha;
    let b = beta;

    if (gate === "X") {
        alpha = b;
        beta = a;
    } else if (gate === "Z") {
        alpha = a;
        beta = scale(b, -1);
    } else if (gate === "Y") {
        // Standard Pauli-Y:
        // alpha' = -i beta
        // beta' = i alpha
        alpha = Complex(b.im, -b.re);
        beta = Complex(-a.im, a.re);
    } else if (gate === "H") {
        alpha = scale(
            add(a, b),
            1 / Math.sqrt(2)
        );

        beta = scale(
            add(a, scale(b, -1)),
            1 / Math.sqrt(2)
        );
    }

    document.getElementById(
        "measurementResult"
    ).innerText = "Result: not measured";

    updateFromState();
}

// =========================
// SINGLE-QUBIT MEASUREMENT
// =========================
function measureQubit() {
    // Born rule:
    // P(0) = |alpha|²
    // P(1) = |beta|²
    let alphaMagnitude = magnitude(alpha);
    let betaMagnitude = magnitude(beta);

    let normSquared =
        alphaMagnitude ** 2 +
        betaMagnitude ** 2;

    let p0 =
        alphaMagnitude ** 2 /
        normSquared;

    if (secureRandom() < p0) {
        // Outcome 0 collapses the state to |0⟩.
        alpha = Complex(1, 0);
        beta = Complex(0, 0);

        document.getElementById(
            "measurementResult"
        ).innerText =
            "Result: 0 — state collapsed to |0⟩";
    } else {
        // Outcome 1 collapses the state to |1⟩.
        alpha = Complex(0, 0);
        beta = Complex(1, 0);

        document.getElementById(
            "measurementResult"
        ).innerText =
            "Result: 1 — state collapsed to |1⟩";
    }

    updateFromState();
}

function prepareZero() {
    alpha = Complex(1, 0);
    beta = Complex(0, 0);

    document.getElementById(
        "measurementResult"
    ).innerText =
        "Result: qubit prepared in |0⟩";

    updateFromState();
}

// =========================
// STATE TO BLOCH ANGLES
// =========================
function updateFromState() {
    let norm = Math.sqrt(
        magnitude(alpha) ** 2 +
        magnitude(beta) ** 2
    );

    alpha = scale(alpha, 1 / norm);
    beta = scale(beta, 1 / norm);

    let theta =
        2 *
        Math.acos(
            Math.min(1, magnitude(alpha))
        );

    let phi =
        phase(beta) -
        phase(alpha);

    phi =
        (phi + 2 * Math.PI) %
        (2 * Math.PI);

    thetaSlider.value = theta;
    phiSlider.value = phi;

    document.getElementById(
        "thetaVal"
    ).innerText = theta.toFixed(2);

    document.getElementById(
        "phiVal"
    ).innerText = phi.toFixed(2);

    updateStateDisplay();
    updateBloch(theta, phi, true);
}

// =========================
// BLOCH-SPHERE GUIDES
// =========================
let ring = new THREE.Mesh(
    new THREE.RingGeometry(
        1,
        1.01,
        64
    ),
    new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        side: THREE.DoubleSide
    })
);

ring.rotation.x = Math.PI / 2;
scene.add(ring);

let arcPoints = [];

for (
    let angle = 0;
    angle <= Math.PI;
    angle += 0.05
) {
    arcPoints.push(
        new THREE.Vector3(
            Math.sin(angle),
            0,
            Math.cos(angle)
        )
    );
}

let arc = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
        arcPoints
    ),
    new THREE.LineBasicMaterial({
        color: 0xffff00
    })
);

scene.add(arc);

// =========================
// SPHERICAL INTERPOLATION
// =========================
function slerpVector(v1, v2, amount) {
    let start =
        v1.clone().normalize();

    let end =
        v2.clone().normalize();

    let dot = start.dot(end);

    dot = Math.max(
        -1,
        Math.min(1, dot)
    );

    let omega = Math.acos(dot);

    if (Math.abs(omega) < 0.0001) {
        return start;
    }

    // Opposite Bloch vectors do not have a
    // unique shortest arc. Choose a stable
    // perpendicular axis.
    if (dot < -0.9999) {
        let rotationAxis =
            new THREE.Vector3(1, 0, 0)
                .cross(start);

        if (
            rotationAxis.lengthSq() <
            0.0001
        ) {
            rotationAxis =
                new THREE.Vector3(0, 1, 0)
                    .cross(start);
        }

        return start
            .clone()
            .applyAxisAngle(
                rotationAxis.normalize(),
                Math.PI * amount
            )
            .normalize();
    }

    let sinOmega = Math.sin(omega);

    let part1 =
        start.multiplyScalar(
            Math.sin(
                (1 - amount) * omega
            ) / sinOmega
        );

    let part2 =
        end.multiplyScalar(
            Math.sin(
                amount * omega
            ) / sinOmega
        );

    return part1
        .add(part2)
        .normalize();
}

// =========================
// UPDATE MAIN BLOCH SPHERE
// =========================
function updateBloch(
    theta,
    phi,
    shouldAnimate = true
) {
    let x =
        Math.sin(theta) *
        Math.cos(phi);

    let y =
        Math.sin(theta) *
        Math.sin(phi);

    let z =
        Math.cos(theta);

    targetDir =
        new THREE.Vector3(
            x,
            y,
            z
        ).normalize();

    if (shouldAnimate) {
        isAnimating = true;
        t = 0;
    } else {
        arrow.setDirection(targetDir);

        currentDir =
            targetDir.clone();

        isAnimating = false;
    }

    let p0 =
        Math.pow(
            Math.cos(theta / 2),
            2
        );

    let p1 =
        Math.pow(
            Math.sin(theta / 2),
            2
        );
    
    document.getElementById(
        "prob0"
    ).innerText =
        "P(0): " +
        p0.toFixed(3);

    document.getElementById(
        "prob1"
    ).innerText =
        "P(1): " +
        p1.toFixed(3);

    document.getElementById(
        "singleBar0"
    ).value = p0;

    document.getElementById(
        "singleBar1"
    ).value = p1;
    
    updateStateDisplay();
}

// =========================
// SLIDERS
// =========================
let thetaSlider =
    document.getElementById("theta");

let phiSlider =
    document.getElementById("phi");

thetaSlider.oninput = function () {
    let theta =
        parseFloat(this.value);

    let phi =
        parseFloat(phiSlider.value);

    alpha = Complex(
        Math.cos(theta / 2),
        0
    );

    beta = Complex(
        Math.sin(theta / 2) *
            Math.cos(phi),
        Math.sin(theta / 2) *
            Math.sin(phi)
    );

    document.getElementById(
        "thetaVal"
    ).innerText = theta.toFixed(2);

    document.getElementById(
        "measurementResult"
    ).innerText =
        "Result: not measured";

    updateBloch(
        theta,
        phi,
        false
    );
};

phiSlider.oninput = function () {
    let phi =
        parseFloat(this.value);

    let theta =
        parseFloat(thetaSlider.value);

    alpha = Complex(
        Math.cos(theta / 2),
        0
    );

    beta = Complex(
        Math.sin(theta / 2) *
            Math.cos(phi),
        Math.sin(theta / 2) *
            Math.sin(phi)
    );

    document.getElementById(
        "phiVal"
    ).innerText = phi.toFixed(2);

    document.getElementById(
        "measurementResult"
    ).innerText =
        "Result: not measured";

    updateBloch(
        theta,
        phi,
        false
    );
};

// =========================
// INITIALIZE SINGLE QUBIT
// =========================
updateBloch(
    1.57,
    0,
    false
);

// =========================
// RENDER LOOP
// =========================
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        t += 0.05;

        if (t >= 1) {
            t = 1;
            isAnimating = false;
        }

        let newDir = slerpVector(
            currentDir,
            targetDir,
            t
        );

        arrow.setDirection(newDir);

        if (!isAnimating) {
            currentDir =
                targetDir.clone();
        }
    }

    renderer.render(
        scene,
        camera
    );

    qubit0Visualizer.renderer.render(
        qubit0Visualizer.scene,
        qubit0Visualizer.camera
    );

    qubit1Visualizer.renderer.render(
        qubit1Visualizer.scene,
        qubit1Visualizer.camera
    );

    qSphereVisualizer.renderer.render(
        qSphereVisualizer.scene,
        qSphereVisualizer.camera
    );
}

// =========================
// REDUCED BLOCH SPHERES
// =========================
function createReducedBlochVisualizer(
    containerId,
    arrowColor
) {
    let blochScene =
        new THREE.Scene();

    let blochCamera =
        new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000
        );

    blochCamera.position.z = 3;

    let blochRenderer =
        new THREE.WebGLRenderer({
            antialias: true
        });

    blochRenderer.setSize(
        320,
        320
    );

    blochRenderer.setClearColor(
        0x111111
    );

    document
        .getElementById(containerId)
        .appendChild(
            blochRenderer.domElement
        );

    let blochControls =
        new THREE.OrbitControls(
            blochCamera,
            blochRenderer.domElement
        );

    let blochSphere =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1,
                48,
                48
            ),
            new THREE.MeshPhongMaterial({
                color: 0x3399ff,
                transparent: true,
                opacity: 0.25
            })
        );

    blochScene.add(blochSphere);

    let pointLight =
        new THREE.PointLight(
            0xffffff,
            1
        );

    pointLight.position.set(
        5,
        5,
        5
    );

    blochScene.add(pointLight);

    blochScene.add(
        new THREE.AmbientLight(
            0xffffff,
            0.4
        )
    );

    blochScene.add(
        new THREE.AxesHelper(1.4)
    );

    let blochArrow =
        new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, 0),
            1,
            arrowColor,
            0.18,
            0.09
        );

    blochScene.add(blochArrow);

    // This marker remains visible when an
    // entangled qubit has a zero-length
    // individual Bloch vector.
    let centreMarker =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.045,
                20,
                20
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

    blochScene.add(centreMarker);

    return {
        scene: blochScene,
        camera: blochCamera,
        renderer: blochRenderer,
        controls: blochControls,
        arrow: blochArrow
    };
}

let qubit0Visualizer =
    createReducedBlochVisualizer(
        "qubit0Bloch",
        0xff4444
    );

let qubit1Visualizer =
    createReducedBlochVisualizer(
        "qubit1Bloch",
        0x44ff88
    );

function setReducedBlochArrow(
    visualizer,
    vector
) {
    let length = Math.min(
        1,
        Math.max(
            0,
            vector.length()
        )
    );

    if (length < 0.000001) {
        visualizer.arrow.visible = false;
        return;
    }

    visualizer.arrow.visible = true;

    visualizer.arrow.setDirection(
        vector.clone().normalize()
    );

    visualizer.arrow.setLength(
        length,
        Math.min(
            0.18,
            length * 0.3
        ),
        Math.min(
            0.09,
            length * 0.15
        )
    );
}

// =========================
// Q-SPHERE LABELS
// =========================
function createQSphereLabel(
    targetScene,
    text,
    position
) {
    let canvas =
        document.createElement("canvas");

    let context =
        canvas.getContext("2d");

    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = "white";
    context.font = "38px Arial";
    context.textAlign = "center";

    context.fillText(
        text,
        128,
        72
    );

    let texture =
        new THREE.CanvasTexture(canvas);

    let sprite =
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture
            })
        );

    sprite.position.copy(
        position
            .clone()
            .multiplyScalar(1.25)
    );

    sprite.scale.set(
        0.5,
        0.25,
        1
    );

    targetScene.add(sprite);
}

// =========================
// GLOBAL TWO-QUBIT Q-SPHERE
// =========================
function createQSphereVisualizer(
    containerId
) {
    let qScene =
        new THREE.Scene();

    let qCamera =
        new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000
        );

    qCamera.position.z = 3;

    // Converts the Three.js scene into
    // pixels on a canvas.
    let qRenderer =
        new THREE.WebGLRenderer({
            antialias: true
        });

    qRenderer.setSize(
        350,
        350
    );

    qRenderer.setClearColor(
        0x111111
    );

    document
        .getElementById(containerId)
        .appendChild(
            qRenderer.domElement
        );

    let qControls =
        new THREE.OrbitControls(
            qCamera,
            qRenderer.domElement
        );

    // Mesh = geometry + material.
    let qSphereMesh =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1,
                48,
                48
            ),
            new THREE.MeshPhongMaterial({
                color: 0x7744cc,
                transparent: true,
                opacity: 0.18
            })
        );

    qScene.add(qSphereMesh);

    let equator =
        new THREE.Mesh(
            new THREE.RingGeometry(
                1,
                1.01,
                64
            ),
            new THREE.MeshBasicMaterial({
                color: 0x888888,
                side: THREE.DoubleSide
            })
        );

    qScene.add(equator);

    let qLight =
        new THREE.PointLight(
            0xffffff,
            1
        );

    qLight.position.set(
        5,
        5,
        5
    );

    qScene.add(qLight);

    qScene.add(
        new THREE.AmbientLight(
            0xffffff,
            0.45
        )
    );

    return {
        scene: qScene,
        camera: qCamera,
        renderer: qRenderer,
        controls: qControls,
        markers: [],
        lines: []
    };
}

let qSphereVisualizer =
    createQSphereVisualizer(
        "qSphere"
    );

// One fixed location for each
// computational basis state.
const qSphereBasis = [
    {
        label: "|00⟩",
        position:
            new THREE.Vector3(0, 0, 1)
    },
    {
        label: "|01⟩",
        position:
            new THREE.Vector3(1, 0, 0)
    },
    {
        label: "|10⟩",
        position:
            new THREE.Vector3(-1, 0, 0)
    },
    {
        label: "|11⟩",
        position:
            new THREE.Vector3(0, 0, -1)
    }
];

function createQSphereMarkers() {
    for (
        let basisState
        of qSphereBasis
    ) {
        let marker =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1,
                    24,
                    24
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xff0000
                })
            );

        marker.position.copy(
            basisState.position
                .clone()
                .multiplyScalar(1.03)
        );

        marker.scale.setScalar(0.001);

        qSphereVisualizer.scene.add(
            marker
        );

        qSphereVisualizer.markers.push(
            marker
        );

        let line =
            new THREE.Line(
                new THREE.BufferGeometry()
                    .setFromPoints([
                        new THREE.Vector3(
                            0,
                            0,
                            0
                        ),
                        basisState.position
                    ]),
                new THREE.LineBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0
                })
            );

        qSphereVisualizer.scene.add(
            line
        );

        qSphereVisualizer.lines.push(
            line
        );

        createQSphereLabel(
            qSphereVisualizer.scene,
            basisState.label,
            basisState.position
        );
    }
}

createQSphereMarkers();

// =========================
// Q-SPHERE PHASE COLOUR
// =========================
function phaseToColor(
    relativePhase
) {
    let normalizedPhase =
        (
            (
                relativePhase %
                (2 * Math.PI)
            ) +
            2 * Math.PI
        ) %
        (2 * Math.PI);

    let hue =
        normalizedPhase /
        (2 * Math.PI);

    return new THREE.Color().setHSL(
        hue,
        1,
        0.5
    );
}

function updateQSphere() {
    let referencePhase = 0;

    // Global phase is not observable.
    // Use the first nonzero amplitude as
    // the phase reference.
    for (
        let amplitude
        of twoQubitState
    ) {
        if (
            magnitude(amplitude) >
            0.000001
        ) {
            referencePhase =
                phase(amplitude);

            break;
        }
    }

    for (
        let index = 0;
        index < twoQubitState.length;
        index++
    ) {
        let amplitude =
            twoQubitState[index];

        let probability =
            magnitude(amplitude) ** 2;

        let marker =
            qSphereVisualizer
                .markers[index];

        let line =
            qSphereVisualizer
                .lines[index];

        if (
            probability <
            0.000001
        ) {
            marker.visible = false;
            line.visible = false;
            continue;
        }

        marker.visible = true;
        line.visible = true;

        let relativePhase =
            phase(amplitude) -
            referencePhase;

        let color =
            phaseToColor(relativePhase);

        let markerSize =
            0.08 +
            0.24 *
            Math.sqrt(probability);

        marker.scale.setScalar(
            markerSize
        );

        marker.material.color.copy(
            color
        );

        line.material.color.copy(
            color
        );

        line.material.opacity =
            0.2 +
            0.8 * probability;
    }
}

// =========================
// TWO-QUBIT STATE
// =========================

// State order:
// |00⟩, |01⟩, |10⟩, |11⟩
let twoQubitState = [
    Complex(1, 0),
    Complex(0, 0),
    Complex(0, 0),
    Complex(0, 0)
];

function normalizeTwoQubitState() {
    let normSquared = 0;

    for (
        let amplitude
        of twoQubitState
    ) {
        normSquared +=
            magnitude(amplitude) ** 2;
    }

    let norm =
        Math.sqrt(normSquared);

    if (norm === 0) {
        throw new Error(
            "A quantum state cannot have all-zero amplitudes."
        );
    }

    twoQubitState =
        twoQubitState.map(
            amplitude =>
                scale(
                    amplitude,
                    1 / norm
                )
        );
}

// =========================
// TWO-QUBIT GATES
// =========================
function applyTwoQubitGate(gate) {
    let [
        a00,
        a01,
        a10,
        a11
    ] = twoQubitState;

    let oneOverRootTwo =
        1 / Math.sqrt(2);

    if (gate === "X0") {
        // Flip the first bit:
        // |00⟩ ↔ |10⟩
        // |01⟩ ↔ |11⟩
        twoQubitState = [
            a10,
            a11,
            a00,
            a01
        ];
    } else if (gate === "X1") {
        // Flip the second bit:
        // |00⟩ ↔ |01⟩
        // |10⟩ ↔ |11⟩
        twoQubitState = [
            a01,
            a00,
            a11,
            a10
        ];
    } else if (gate === "H0") {
        // Apply H to the first qubit.
        twoQubitState = [
            scale(
                add(a00, a10),
                oneOverRootTwo
            ),
            scale(
                add(a01, a11),
                oneOverRootTwo
            ),
            scale(
                add(
                    a00,
                    scale(a10, -1)
                ),
                oneOverRootTwo
            ),
            scale(
                add(
                    a01,
                    scale(a11, -1)
                ),
                oneOverRootTwo
            )
        ];
    } else if (gate === "H1") {
        // Apply H to the second qubit.
        twoQubitState = [
            scale(
                add(a00, a01),
                oneOverRootTwo
            ),
            scale(
                add(
                    a00,
                    scale(a01, -1)
                ),
                oneOverRootTwo
            ),
            scale(
                add(a10, a11),
                oneOverRootTwo
            ),
            scale(
                add(
                    a10,
                    scale(a11, -1)
                ),
                oneOverRootTwo
            )
        ];
    } else if (gate === "CNOT") {
        // Qubit 0 is the control.
        // Flip Qubit 1 when Qubit 0 is 1.
        twoQubitState = [
            a00,
            a01,
            a11,
            a10
        ];
    }

    document.getElementById(
        "twoQubitMeasurementResult"
    ).innerText =
        "Result: not measured";

    updateTwoQubitDisplay();
}

// =========================
// TWO-QUBIT MEASUREMENT
// =========================
function measureTwoQubits() {
    normalizeTwoQubitState();

    let probabilities =
        twoQubitState.map(
            amplitude =>
                magnitude(amplitude) ** 2
        );

    let randomValue =
        secureRandom();

    let cumulativeProbability = 0;

    let measuredIndex =
        probabilities.length - 1;

    for (
        let index = 0;
        index < probabilities.length;
        index++
    ) {
        cumulativeProbability +=
            probabilities[index];

        if (
            randomValue <
            cumulativeProbability
        ) {
            measuredIndex = index;
            break;
        }
    }

    let basisLabels = [
        "00",
        "01",
        "10",
        "11"
    ];

    // Collapse the state to the
    // measured basis state.
    twoQubitState = [
        Complex(0, 0),
        Complex(0, 0),
        Complex(0, 0),
        Complex(0, 0)
    ];

    twoQubitState[measuredIndex] =
        Complex(1, 0);

    document.getElementById(
        "twoQubitMeasurementResult"
    ).innerText =
        "Result: " +
        basisLabels[measuredIndex] +
        " — state collapsed to |" +
        basisLabels[measuredIndex] +
        "⟩";

    updateTwoQubitDisplay();
}

function prepareTwoQubitZero() {
    twoQubitState = [
        Complex(1, 0),
        Complex(0, 0),
        Complex(0, 0),
        Complex(0, 0)
    ];

    document.getElementById(
        "twoQubitMeasurementResult"
    ).innerText =
        "Result: qubits prepared in |00⟩";

    updateTwoQubitDisplay();
}

function createBellState() {
    // |00⟩
    // → (|00⟩ + |10⟩)/√2
    // → (|00⟩ + |11⟩)/√2
    prepareTwoQubitZero();

    applyTwoQubitGate("H0");
    applyTwoQubitGate("CNOT");

    document.getElementById(
        "twoQubitMeasurementResult"
    ).innerText =
        "Bell state created: " +
        "(|00⟩ + |11⟩) / √2";
}

// =========================
// REDUCED BLOCH VECTORS
// =========================
function calculateReducedBlochVectors() {
    let [
        a00,
        a01,
        a10,
        a11
    ] = twoQubitState;

    // Qubit 0:
    // sum over the possible values
    // of Qubit 1.
    let q0Rho00 =
        magnitude(a00) ** 2 +
        magnitude(a01) ** 2;

    let q0Rho11 =
        magnitude(a10) ** 2 +
        magnitude(a11) ** 2;

    let q0Rho01 =
        add(
            multiply(
                a00,
                conjugate(a10)
            ),
            multiply(
                a01,
                conjugate(a11)
            )
        );

    // Qubit 1:
    // sum over the possible values
    // of Qubit 0.
    let q1Rho00 =
        magnitude(a00) ** 2 +
        magnitude(a10) ** 2;

    let q1Rho11 =
        magnitude(a01) ** 2 +
        magnitude(a11) ** 2;

    let q1Rho01 =
        add(
            multiply(
                a00,
                conjugate(a01)
            ),
            multiply(
                a10,
                conjugate(a11)
            )
        );

    return [
        new THREE.Vector3(
            2 * q0Rho01.re,
            -2 * q0Rho01.im,
            q0Rho00 - q0Rho11
        ),
        new THREE.Vector3(
            2 * q1Rho01.re,
            -2 * q1Rho01.im,
            q1Rho00 - q1Rho11
        )
    ];
}

// =========================
// ENTANGLEMENT
// =========================
function calculateConcurrence() {
    let [
        a00,
        a01,
        a10,
        a11
    ] = twoQubitState;

    let determinant =
        subtract(
            multiply(a00, a11),
            multiply(a01, a10)
        );

    // For a normalized pure two-qubit
    // state, concurrence ranges from 0 to 1.
    return Math.min(
        1,
        2 * magnitude(determinant)
    );
}

function describeBlochLength(length) {
    if (length > 0.999999) {
        return "pure";
    }

    if (length < 0.000001) {
        return (
            "maximally mixed individually"
        );
    }

    return "mixed individually";
}

// =========================
// TWO-QUBIT DISPLAY
// =========================
function updateTwoQubitDisplay() {
    normalizeTwoQubitState();

    let basisLabels = [
        "00",
        "01",
        "10",
        "11"
    ];

    let probabilityIds = [
        "prob00",
        "prob01",
        "prob10",
        "prob11"
    ];

    let probabilityBarIds = [
        "bar00",
        "bar01",
        "bar10",
        "bar11"
    ];

    let probabilities = [];
    let stateTerms = [];

    for (
        let index = 0;
        index < twoQubitState.length;
        index++
    ) {
        let amplitude =
            twoQubitState[index];

        let probability =
            magnitude(amplitude) ** 2;

        probabilities.push(
            probability
        );

        document.getElementById(
            probabilityIds[index]
        ).innerText =
            "P(" +
            basisLabels[index] +
            "): " +
            probability.toFixed(3);

        document.getElementById(
            probabilityBarIds[index]
        ).value = probability;

        if (
            magnitude(amplitude) >
            0.000001
        ) {
            stateTerms.push(
                "(" +
                formatComplex(amplitude) +
                ")|" +
                basisLabels[index] +
                "⟩"
            );
        }
    }

    document.getElementById(
        "twoQubitStateDisplay"
    ).innerText =
        "|ψ⟩ = " +
        stateTerms.join(" + ");

    let sameProbability =
        probabilities[0] +
        probabilities[3];

    let differentProbability =
        probabilities[1] +
        probabilities[2];

    document.getElementById(
        "correlationDisplay"
    ).innerText =
        "Same result: " +
        sameProbability.toFixed(3) +
        " | Different result: " +
        differentProbability.toFixed(3);

    let [
        q0Vector,
        q1Vector
    ] = calculateReducedBlochVectors();

    let q0Length = Math.min(
        1,
        q0Vector.length()
    );

    let q1Length = Math.min(
        1,
        q1Vector.length()
    );

    setReducedBlochArrow(
        qubit0Visualizer,
        q0Vector
    );

    setReducedBlochArrow(
        qubit1Visualizer,
        q1Vector
    );

    document.getElementById(
        "qubit0BlochStatus"
    ).innerText =
        "Bloch-vector length: " +
        q0Length.toFixed(3) +
        " — " +
        describeBlochLength(q0Length);

    document.getElementById(
        "qubit1BlochStatus"
    ).innerText =
        "Bloch-vector length: " +
        q1Length.toFixed(3) +
        " — " +
        describeBlochLength(q1Length);

    let concurrence =
        calculateConcurrence();

    let entanglementDescription =
        "partially entangled";

    if (
        concurrence <
        0.000001
    ) {
        entanglementDescription =
            "separable";
    } else if (
        concurrence >
        0.999999
    ) {
        entanglementDescription =
            "maximally entangled";
    }

    document.getElementById(
        "entanglementDisplay"
    ).innerText =
        "Concurrence: " +
        concurrence.toFixed(3) +
        " — " +
        entanglementDescription;

    document.getElementById(
        "entanglementBar"
    ).value = concurrence;

    // The beam is a visual metaphor.
    // Its strength is controlled by the
    // calculated concurrence.
    let beam =
        document.getElementById(
            "entanglementBeam"
        );

    let beamLabel =
        document.getElementById(
            "entanglementBeamLabel"
        );

    beam.style.opacity =
        concurrence;

    beam.style.transform =
        "scaleX(" +
        concurrence +
        ")";

    if (
        concurrence <
        0.000001
    ) {
        beamLabel.innerText =
            "Not entangled";
    } else if (
        concurrence >
        0.999999
    ) {
        beamLabel.innerText =
            "Maximally entangled";
    } else {
        beamLabel.innerText =
            "Partially entangled: " +
            concurrence.toFixed(3);
    }

    updateQSphere();
}

// Initialize the two-qubit displays.
updateTwoQubitDisplay();

// Begin rendering after all scenes and
// visualizers have been created.
    
// =========================
// ANIMATIONS
// =========================
animate();
animateMenuBackground();
