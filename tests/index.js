import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.139.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.139.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.139.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.139.0/examples/jsm/postprocessing/UnrealBloomPass.js";

// Configurações Globais
let scene, camera, renderer, bloomComposer;

// Inicialização da Cena
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.webgl'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.0);
    
    // Compositor de Efeito
    bloomComposer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    bloomComposer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomComposer.addPass(bloomPass);
    
    // Adicionar Estrelas
    addStars(1000);

    // Luz Ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Evento de Redimensionamento
    window.addEventListener('resize', onWindowResize, false);

    // Animação
    animate();
}

// Função para Adicionar Estrelas
function addStars(count) {
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 24, 24);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(geometry, material);

        // Posição Aleatória das Estrelas
        star.position.set(
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000
        );

        scene.add(star);
    }
}

// Função de Redimensionamento
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
}

// Função de Animação
function animate() {
    requestAnimationFrame(animate);
    bloomComposer.render();
}

// Inicializar a Aplicação
init();
