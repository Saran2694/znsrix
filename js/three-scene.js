/* ==========================================================================
   ZNSRIX — Extreme 3D Graphics & Cinematic Scroll Engine
   ========================================================================== */

class ZnsrixExtreme3D {
  constructor() {
    this.container = document.getElementById('webgl-container');
    if (!this.container) return;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.scrollProgress = 0;
    this.isMobile = window.innerWidth <= 768;

    this.initCanvas();
    this.bindEvents();
    this.animate();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'webgl-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resize();

    // 1. Particle Network Nodes
    this.nodes = [];
    const nodeCount = this.isMobile ? 35 : 90;
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        x: (Math.random() - 0.5) * this.width * 1.6,
        y: (Math.random() - 0.5) * this.height * 1.6,
        z: Math.random() * 1200,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.65 ? '#FF6500' : '#333333',
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3
      });
    }

    // 2. 3D Digital Core Cube Vertices
    this.coreVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];
    this.coreEdges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    // 3. Service Visual Stage Models (Browser, Panels, Wireframe, Mobile, Network)
    this.activeServiceStage = 0;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width <= 1024;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX - this.width / 2) * 0.0012;
      this.mouse.targetY = (e.clientY - this.height / 2) * 0.0012;
    });

    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      this.scrollProgress = maxScroll > 0 ? this.targetScrollY / maxScroll : 0;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Lerp smooth motion
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render 3D Layers
    this.drawArchitecturalGrid();
    this.drawGiantTypography();
    this.drawParticleNetwork();
    this.renderButterfly3DModel();
  }

  /* 3D Butterfly Model & Core Renderer */
  initButterflyThreeScene() {
    const heroWrapper = document.querySelector('.hero-3d-wrapper');
    if (!heroWrapper || this.threeSceneInitialized || typeof THREE === 'undefined') return;

    this.threeSceneInitialized = true;
    
    // Replace 2D canvas with WebGL renderer if Three.js & GLTFLoader loaded
    const oldCanvas = document.getElementById('hero-3d-canvas');
    if (oldCanvas) oldCanvas.style.display = 'none';

    this.tScene = new THREE.Scene();
    this.tCamera = new THREE.PerspectiveCamera(45, heroWrapper.clientWidth / heroWrapper.clientHeight, 0.1, 1000);
    this.tCamera.position.set(0, 0, 10);

    this.tRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.tRenderer.setSize(heroWrapper.clientWidth, heroWrapper.clientHeight);
    this.tRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.tRenderer.shadowMap.enabled = true;
    heroWrapper.appendChild(this.tRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.tScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff6500, 2.5);
    dirLight.position.set(5, 10, 7);
    this.tScene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff6500, 3, 20);
    pointLight.position.set(-5, -2, 5);
    this.tScene.add(pointLight);

    // Group container for mouse/scroll interaction
    this.butterflyGroup = new THREE.Group();
    this.tScene.add(this.butterflyGroup);

    // Load butterflies.glb
    if (typeof THREE.GLTFLoader !== 'undefined') {
      const loader = new THREE.GLTFLoader();
      loader.load('img/butterflies.glb', (gltf) => {
        this.butterflyModel = gltf.scene;
        
        // Scale and center model
        this.butterflyModel.scale.set(1.8, 1.8, 1.8);
        this.butterflyModel.position.set(0, -0.5, 0);

        // Enhance materials with orange glow & metallic finish
        this.butterflyModel.traverse((child) => {
          if (child.isMesh) {
            child.material.roughness = 0.3;
            child.material.metalness = 0.7;
          }
        });

        this.butterflyGroup.add(this.butterflyModel);

        // Animation mixer if GLTF has embedded animations
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.butterflyModel);
          gltf.animations.forEach((clip) => {
            this.mixer.clipAction(clip).play();
          });
        }
      }, undefined, (err) => {
        console.warn('GLTF loading error, falling back to 3D wireframe core', err);
        if (oldCanvas) oldCanvas.style.display = 'block';
      });
    }

    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => {
      if (!this.tCamera || !this.tRenderer || !heroWrapper) return;
      this.tCamera.aspect = heroWrapper.clientWidth / heroWrapper.clientHeight;
      this.tCamera.updateProjectionMatrix();
      this.tRenderer.setSize(heroWrapper.clientWidth, heroWrapper.clientHeight);
    });
  }

  renderButterfly3DModel() {
    if (!this.threeSceneInitialized) {
      this.initButterflyThreeScene();
    }

    if (this.butterflyGroup) {
      // Dynamic mouse tracking & smooth float rotation
      const delta = this.clock ? this.clock.getDelta() : 0.016;
      if (this.mixer) this.mixer.update(delta);

      const targetRotY = this.mouse.x * 1.2 + (this.scrollY * 0.002);
      const targetRotX = this.mouse.y * 0.8;

      this.butterflyGroup.rotation.y += (targetRotY - this.butterflyGroup.rotation.y) * 0.05;
      this.butterflyGroup.rotation.x += (targetRotX - this.butterflyGroup.rotation.x) * 0.05;
      this.butterflyGroup.position.y = Math.sin(Date.now() * 0.002) * 0.25;

      if (this.tRenderer && this.tScene && this.tCamera) {
        this.tRenderer.render(this.tScene, this.tCamera);
        return;
      }
    }

    // Fallback wireframe canvas rendering if Three.js is unavailable
    this.drawHero3DCore();
  }

  /* 3D Architectural Grid Background */
  drawArchitecturalGrid() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const gridOffset = (this.scrollY * 0.4) % 60;

    ctx.strokeStyle = 'rgba(255, 101, 0, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal Perspective Grid Lines
    for (let y = -this.height; y < this.height * 2; y += 60) {
      const lineY = y + gridOffset + this.mouse.y * 50;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(this.width, lineY);
      ctx.stroke();
    }

    // Vertical Vanishing Lines
    for (let x = -this.width; x < this.width * 2; x += 100) {
      const lineX = x + this.mouse.x * 60;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX + (x - cx) * 0.3, this.height);
      ctx.stroke();
    }
  }

  /* Giant Background Watermark Typography */
  drawGiantTypography() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '900 180px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = this.height / 2 - (this.scrollY * 0.2);
    ctx.fillText('ZNSRIX', this.width / 2 + this.mouse.x * 100, textY);
    ctx.restore();
  }

  /* Particle Network */
  drawParticleNetwork() {
    const ctx = this.ctx;
    const fov = 450;
    const cx = this.width / 2;
    const cy = this.height / 2;

    for (let i = 0; i < this.nodes.length; i++) {
      let n = this.nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      if (n.z < 1) n.z = 1200;
      if (n.z > 1200) n.z = 1;

      const scale = fov / (fov + n.z);
      const px = (n.x + this.mouse.x * 250) * scale + cx;
      const py = (n.y + this.mouse.y * 250 - (this.scrollY * 0.12)) * scale + cy;

      if (px > 0 && px < this.width && py > 0 && py < this.height) {
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(px, py, n.radius * scale, 0, Math.PI * 2);
        ctx.fill();

        // Connect neighboring nodes with orange strokes
        for (let j = i + 1; j < this.nodes.length; j++) {
          let n2 = this.nodes[j];
          let dx = n.x - n2.x;
          let dy = n.y - n2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 170) {
            const scale2 = fov / (fov + n2.z);
            const p2x = (n2.x + this.mouse.x * 250) * scale2 + cx;
            const p2y = (n2.y + this.mouse.y * 250 - (this.scrollY * 0.12)) * scale2 + cy;

            ctx.strokeStyle = n.color === '#FF6500' ? 'rgba(255, 101, 0, 0.18)' : 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();
          }
        }
      }
    }
  }

  /* Hero 3D Digital Core Fallback */
  drawHero3DCore() {
    const heroCanvas = document.getElementById('hero-3d-canvas');
    if (!heroCanvas) return;

    const ctx = heroCanvas.getContext('2d');
    const w = heroCanvas.width = heroCanvas.parentElement.clientWidth || 500;
    const h = heroCanvas.height = heroCanvas.parentElement.clientHeight || 500;

    ctx.clearRect(0, 0, w, h);

    const scrollAngle = this.scrollY * 0.003;
    const breakExplosion = Math.min(1.8, Math.max(1.0, 1.0 + (this.scrollY * 0.0015)));

    const angleX = scrollAngle + this.mouse.y * 0.03;
    const angleY = scrollAngle * 1.5 + this.mouse.x * 0.03;

    const size = Math.min(w, h) * 0.26 * breakExplosion;
    const cx = w / 2;
    const cy = h / 2;

    const projected = [];

    for (let v of this.coreVertices) {
      let x = v[0] * size;
      let y = v[1] * size;
      let z = v[2] * size;

      let x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
      let z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);

      let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

      let scale = 400 / (400 + z2);
      let px = x1 * scale + cx;
      let py = y2 * scale + cy;

      projected.push({ x: px, y: py, z: z2 });
    }

    ctx.lineWidth = 2.5;
    for (let edge of this.coreEdges) {
      let p1 = projected[edge[0]];
      let p2 = projected[edge[1]];

      let grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, '#FF6500');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let p of projected) {
      ctx.fillStyle = '#FF6500';
      ctx.shadowColor = '#FF6500';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = 'rgba(255, 101, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.5, angleY, angleY + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.znsrix3D = new ZnsrixExtreme3D();
});
