// Importações e inicializações iniciais
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const estrelas = [];
let estrelaSelecionada = null;
let estrelaEscolhidaParaConstelacao = null;
let currentConstellation = null; // Constelação atualmente selecionada para associar linhas
const linhasTexto = []; // Array para armazenar os sprites de texto
const constellations = []; // Array para armazenar constelações

// Função para carregar estrelas do arquivo JSON
async function carregarEstrelas() {
    const response = await fetch('../assets/estrelas.json');
    const data = await response.json();

    data.forEach(item => {
        const estrela = new Estrela(item.x, item.y, item.z, item.tamanho);
        estrelas.push(estrela);
        scene.add(estrela.mesh);
    });
}

// Função para criar sprites de texto
function createTextSprite(message) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Configurações do canvas
    const fontSize = 64; // Tamanho da fonte
    context.font = `${fontSize}px Orbitron`; // Usando a fonte Orbitron
    const textWidth = context.measureText(message).width;
    canvas.width = textWidth;
    canvas.height = fontSize;

    // Redefinir a fonte após redimensionar o canvas
    context.font = `${fontSize}px Orbitron`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    // Criar a textura a partir do canvas
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Escala inicial do sprite
    sprite.scale.set(5, 2, 1); // Ajuste conforme necessário

    return sprite;
}

// Função para desenhar linha e adicionar sprite de texto
function desenharLinha(estrela1, estrela2) {
    if (!currentConstellation) {
        alert("Por favor, selecione ou crie uma constelação para associar a linha.");
        return;
    }

    // Criar a linha
    const material = new THREE.LineBasicMaterial({ color: 0xffffff }); // Cor branca para combinar com o tema
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
        new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
    ]);
    const linha = new THREE.Line(geometry, material);
    scene.add(linha);

    // Adicionar a linha à constelação
    currentConstellation.lines.push(linha);

    // Criar o sprite de texto
    const texto = "lorem ispum";
    const textoSprite = createTextSprite(texto);

    // Calcular o ponto médio da linha
    const midPoint = new THREE.Vector3().addVectors(
        new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
        new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
    ).multiplyScalar(0.5);
    textoSprite.position.copy(midPoint);
    scene.add(textoSprite);

    // Armazenar o sprite e os pontos para ajuste posterior
    linhasTexto.push({ sprite: textoSprite, pontos: [estrela1, estrela2], constellation: currentConstellation });
}

// Função para criar uma nova constelação
function criarConstelacao(nome) {
    const constelacao = {
        name: nome,
        lines: []
    };
    constellations.push(constelacao);
    adicionarConstelacaoNaLista(constelacao);
}

// Função para adicionar constelação na lista do painel esquerdo
function adicionarConstelacaoNaLista(constelacao) {
    const constellationItems = document.getElementById('constellationItems');
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.className = 'constellation-name';
    span.textContent = constelacao.name;
    span.addEventListener('click', () => selecionarConstelacao(constelacao));

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.textContent = '✏️';
    editButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita que o clique no botão selecione a constelação
        editarConstelacaoNome(constelacao, span);
    });

    li.appendChild(span);
    li.appendChild(editButton);
    constellationItems.appendChild(li);
}

// Função para selecionar uma constelação
function selecionarConstelacao(constelacao) {
    // Desabilitar todas as linhas
    constellations.forEach(c => {
        c.lines.forEach(linha => linha.visible = false);
    });

    // Habilitar apenas as linhas da constelação selecionada
    constelacao.lines.forEach(linha => linha.visible = true);

    // Ajustar a visibilidade dos sprites de texto
    linhasTexto.forEach(item => {
        if (item.constellation === constelacao) {
            item.sprite.visible = true;
        } else {
            item.sprite.visible = false;
        }
    });

    currentConstellation = constelacao; // Definir a constelação atual para associar novas linhas
}

// Função para editar o nome da constelação
function editarConstelacaoNome(constelacao, spanElement) {
    const novoNome = prompt("Digite o novo nome da constelação:", constelacao.name);
    if (novoNome && novoNome.trim() !== "") {
        constelacao.name = novoNome.trim();
        spanElement.textContent = constelacao.name;
    }
}

// Função para criar uma nova constelação via UI
function handleAddConstellation() {
    const nome = prompt("Digite o nome da nova constelação:");
    if (nome && nome.trim() !== "") {
        criarConstelacao(nome.trim());
    }
}

// Função para criar sprites de texto (removida duplicação)
function createTextSprite(message) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Configurações do canvas
    const fontSize = 64; // Tamanho da fonte
    context.font = `${fontSize}px Orbitron`; // Usando a fonte Orbitron
    const textWidth = context.measureText(message).width;
    canvas.width = textWidth;
    canvas.height = fontSize;

    // Redefinir a fonte após redimensionar o canvas
    context.font = `${fontSize}px Orbitron`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    // Criar a textura a partir do canvas
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Escala inicial do sprite
    sprite.scale.set(5, 2, 1); // Ajuste conforme necessário

    return sprite;
}

carregarEstrelas().then(() => {
    camera.position.set(0, 0, 20);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    document.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    document.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            camera.rotation.y += deltaMove.x * 0.005; // Rotação ao redor do eixo Y
            camera.rotation.x += deltaMove.y * 0.005; // Rotação ao redor do eixo X

            // Limitar a rotação para evitar giro completo
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        }

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    });

    let zoomSpeed = 0;

    document.addEventListener('mousedown', (event) => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(estrelas.map(estrela => estrela.mesh));

        if (intersects.length > 0) {
            const estrelaAtual = estrelas.find(estrela => estrela.mesh === intersects[0].object);
            if (estrelaEscolhidaParaConstelacao === null) {
                estrelaEscolhidaParaConstelacao = estrelaAtual;
                if (estrelaSelecionada) {
                    estrelaSelecionada.deselecionar();
                }
                estrelaSelecionada = estrelaAtual;
                estrelaSelecionada.selecionar();
                mostrarInformacoes(estrelaSelecionada);
                // Assegure-se de que há um elemento com id 'enterExoplanet' no HTML
                const enterExoplanet = document.getElementById('enterExoplanet');
                if (enterExoplanet) {
                    enterExoplanet.style.display = 'block';
                }
            } else {
                desenharLinha(estrelaEscolhidaParaConstelacao, estrelaAtual);
                estrelaEscolhidaParaConstelacao = null;
            }
        }
    });

    function mostrarInformacoes(estrela) {
        console.log(estrela);
        const infoPanel = document.getElementById('starInfo');

        // Converte x, y, z para números
        const x = parseFloat(estrela.x);
        const y = parseFloat(estrela.y);
        const z = parseFloat(estrela.z);
        const tamanho = parseFloat(estrela.tamanho);

        infoPanel.innerHTML = `
            <strong>Posição:</strong> (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})<br>
            <strong>Tamanho:</strong> ${tamanho}<br>
        `;
    }

    function desenharLinha(estrela1, estrela2) {
        if (!currentConstellation) {
            alert("Por favor, selecione ou crie uma constelação para associar a linha.");
            return;
        }

        // Criar a linha
        const material = new THREE.LineBasicMaterial({ color: 0xffffff }); // Cor branca para combinar com o tema
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
            new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
        ]);
        const linha = new THREE.Line(geometry, material);
        scene.add(linha);

        // Adicionar a linha à constelação
        currentConstellation.lines.push(linha);

        // Criar o sprite de texto
        const texto = "lorem ispum";
        const textoSprite = createTextSprite(texto);

        // Calcular o ponto médio da linha
        const midPoint = new THREE.Vector3().addVectors(
            new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
            new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
        ).multiplyScalar(0.5);
        textoSprite.position.copy(midPoint);
        scene.add(textoSprite);

        // Armazenar o sprite e os pontos para ajuste posterior
        linhasTexto.push({ sprite: textoSprite, pontos: [estrela1, estrela2], constellation: currentConstellation });
    }

    function animate() {
        requestAnimationFrame(animate);

        // Movimento suave de zoom
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.multiplyScalar(zoomSpeed);
        camera.position.add(direction);

        // Limitar a distância de zoom
        const distance = camera.position.length();
        if (distance < 1) {
            camera.position.setLength(1);
        }

        zoomSpeed *= 0.9; // Reduzir a velocidade do zoom ao longo do tempo

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(estrelas.map(estrela => estrela.mesh));

        estrelas.forEach(estrela => estrela.voltarTamanho());
        if (intersects.length > 0) {
            intersects[0].object.scale.set(1.5, 1.5, 1.5);
        }

        // Ajustar os sprites de texto
        linhasTexto.forEach(item => {
            const midPoint = new THREE.Vector3().addVectors(
                new THREE.Vector3(item.pontos[0].x, item.pontos[0].y, item.pontos[0].z),
                new THREE.Vector3(item.pontos[1].x, item.pontos[1].y, item.pontos[1].z)
            ).multiplyScalar(0.5);
            const distanceToCamera = midPoint.distanceTo(camera.position);

            // Ajustar a escala com base na distância
            const scaleFactor = 100 / distanceToCamera; // Ajuste o divisor para controlar a escala
            item.sprite.scale.set(scaleFactor, scaleFactor * 0.4, 1); // Proporção adequada

            // Orientar o sprite para a câmera
            item.sprite.lookAt(camera.position);

            // Ocultar o sprite se a distância for maior que um limite
            if (distanceToCamera > 50) { // Ajuste o limite conforme necessário
                item.sprite.visible = false;
            } else {
                item.sprite.visible = true;
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // Eventos de botão
    document.getElementById('downloadButton').addEventListener('click', () => {
        renderer.render(scene, camera); // Renderiza a cena atual
        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'mapa_estelar.png';
        link.click();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        window.history.back();
    });

    // Evento de adição de constelação
    document.getElementById('addConstellationButton').addEventListener('click', handleAddConstellation);

    // Evento de redimensionamento da janela
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Evento de roda do mouse para zoom
    window.addEventListener('wheel', (event) => {
        zoomSpeed -= event.deltaY * 0.001; // Ajuste o fator conforme necessário
    });
});
