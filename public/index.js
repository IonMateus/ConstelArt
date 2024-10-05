import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './styles/styles.css';
import data from './assets/data.json';

// Variáveis Globais
let scene, camera, renderer, controls;
let planets = [];
let stars = [];
let selectedStars = []; // Array para armazenar estrelas selecionadas
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Carregar dados dos planetas
planets = data.planets;
init();

function init() {
  // Cena
  scene = new THREE.Scene();

  // Câmera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  // Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Controles de Órbita
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Luz
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Adicionar estrelas principais
  addMainStars();

  // Adicionar planetas
  addPlanets();

  // Eventos
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('pointerdown', onPointerDown, false);

  animate();
}

function addMainStars() {
  for (let i = 0; i < 500; i++) {
    let starGeometry = new THREE.SphereGeometry(0.5, 24, 24);
    let brightness = Math.random() * 0.5 + 0.5;
    let starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: brightness,
      emissive: 0xffffff,
      emissiveIntensity: brightness,
    });

    let star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.x = (Math.random() - 0.5) * 1000;
    star.position.y = (Math.random() - 0.5) * 1000;
    star.position.z = (Math.random() - 0.5) * 1000;
    star.scale.set(brightness, brightness, brightness);
    star.userData.selected = false; // Propriedade para verificar se a estrela foi selecionada

    scene.add(star);
    stars.push(star);
  }
}

function addPlanets() {
  const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x00f5ff });

  planets.forEach((planetData) => {
    let planet = new THREE.Mesh(planetGeometry, planetMaterial.clone());
    planet.position.set(planetData.position.x, planetData.position.y, planetData.position.z);
    planet.name = planetData.name;
    scene.add(planet);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
  // Atualizar posição do mouse
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Raycaster para cliques
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(stars); // Intersecta apenas estrelas

  if (intersects.length > 0) {
    let intersectedStar = intersects[0].object;

    // Selecionar estrela
    selectStar(intersectedStar);
  }
}

let storedStar = null; // Variável para armazenar a estrela selecionada

function selectStar(star) {
  if (storedStar === null) {
    // Se não houver estrela armazenada, armazena a estrela clicada
    storedStar = star;
    highlightStar(star, true); // Destacar fortemente a estrela inicial
  } else {
    // Se já houver uma estrela armazenada, ligue as duas
    highlightStar(star, false); // Destacar a estrela final

    // Desenhar linha entre a estrela armazenada e a atual
    drawLineBetweenStars(storedStar, star);

    // Limpar a variável armazenada para a próxima seleção
    storedStar = null;
  }
}

function highlightStar(star, isInitial) {
  if (isInitial) {
    star.material.color.set(0xaa0000); // Cor mais forte para estrela inicial
  } else {
    star.material.color.set(0xff0000); // Cor normal para estrela final
  }

  // Resetar a cor após um breve tempo
  setTimeout(() => {
    star.material.color.set(0xffffff);
  }, 500);
}

function drawLineBetweenStars(star1, star2) {
  let material = new THREE.LineBasicMaterial({ color: 0x00f5ff });
  let points = [];
  points.push(star1.position);
  points.push(star2.position);
  let geometry = new THREE.BufferGeometry().setFromPoints(points);
  let line = new THREE.Line(geometry, material);
  scene.add(line);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Iniciar a animação
animate();
