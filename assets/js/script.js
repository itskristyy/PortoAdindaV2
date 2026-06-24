// ============================================
// AURORA CANVAS - WebGL Interactive Background
// ============================================

class AuroraCanvas {
    constructor() {
        this.canvas = document.getElementById('aurora-canvas');
        this.gl = this.canvas.getContext('webgl', { antialias: true, alpha: true });
        this.mouse = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
        this.time = 0;
        
        if (!this.gl) {
            console.warn('WebGL not supported');
            return;
        }

        this.setupCanvas();
        this.createShaderProgram();
        this.setupBuffers();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);
    }

    createShaderProgram() {
        const vertexShader = `
            attribute vec4 position;
            varying vec2 vUv;
            
            void main() {
                vUv = position.xy * 0.5 + 0.5;
                gl_Position = position;
            }
        `;

        const fragmentShader = `
            precision highp float;
            
            uniform float uTime;
            uniform vec2 uResolution;
            uniform vec2 uMouse;
            varying vec2 vUv;
            
            // Simplex noise function
            vec3 permute(vec3 x) {
                return mod((34.0 * x + 1.0) * x, 289.0);
            }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
                m = m * m;
                m = m * m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 a0 = x - floor(x + 0.5);
                m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vec2 uv = vUv;
                vec2 centerUv = uv - 0.5;
                float dist = length(centerUv);
                
                // Mouse position normalized
                vec2 mouseDelta = (uMouse - vec2(0.5)) * 0.3;
                vec2 auroraCenter = vec2(0.5) + mouseDelta;
                
                // Distance from aurora center
                float mouseInfluence = 1.0 - smoothstep(0.0, 1.0, distance(uv, auroraCenter));
                
                // Noise layers
                float noise1 = snoise(uv * 3.0 + uTime * 0.1) * 0.5 + 0.5;
                float noise2 = snoise(uv * 2.0 - uTime * 0.08 + mouseDelta * 5.0) * 0.5 + 0.5;
                float noise3 = snoise(uv * 5.0 + uTime * 0.15) * 0.5 + 0.5;
                
                // Combine noises with mouse influence
                float combined = mix(noise1, noise2, mouseInfluence * 0.5);
                combined = mix(combined, noise3, 0.3);
                
                // Colors from design palette
                vec3 colorPink = vec3(0.98, 0.85, 0.87);    // #fadadd soft pink
                vec3 colorGreen = vec3(0.85, 0.96, 0.88);   // soft green
                vec3 colorCream = vec3(0.99, 0.98, 0.95);   // #fcf9f3 cream
                vec3 colorAccent = vec3(0.87, 0.76, 0.63);  // warm accent
                
                // Create aurora effect
                vec3 color = colorCream;
                color = mix(color, colorPink, combined * 0.4);
                color = mix(color, colorGreen, noise2 * 0.3 * mouseInfluence);
                color = mix(color, colorAccent, noise1 * 0.2);
                
                // Add subtle radial gradient
                float vignette = 1.0 - smoothstep(0.0, 1.0, dist * 1.5);
                color = mix(color, colorCream, (1.0 - vignette) * 0.2);
                
                // Mouse attraction effect
                color = mix(color, colorPink, mouseInfluence * 0.3);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const program = this.gl.createProgram();
        const vs = this.createShader(this.gl.VERTEX_SHADER, vertexShader);
        const fs = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShader);
        
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Shader link error:', this.gl.getProgramInfoLog(program));
        }
        
        this.program = program;
        this.uTime = this.gl.getUniformLocation(program, 'uTime');
        this.uResolution = this.gl.getUniformLocation(program, 'uResolution');
        this.uMouse = this.gl.getUniformLocation(program, 'uMouse');
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    setupBuffers() {
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            
            // Smooth mouse tracking with easing
            this.mouse.vx += (x - this.mouse.x) * 0.1;
            this.mouse.vy += (y - this.mouse.y) * 0.1;
            this.mouse.vx *= 0.92;
            this.mouse.vy *= 0.92;
            this.mouse.x += this.mouse.vx;
            this.mouse.y += this.mouse.vy;
        });

        // Reset mouse on leave
        document.addEventListener('mouseleave', () => {
            this.mouse.vx = 0;
            this.mouse.vy = 0;
        });
    }

    animate() {
        this.time += 0.016; // ~60fps
        
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.uTime, this.time);
        this.gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uMouse, this.mouse.x, this.mouse.y);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Aurora
    new AuroraCanvas();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});