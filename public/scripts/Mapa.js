// Importações e inicializações iniciais
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const estrelas = [];
let estrelaSelecionada = null;
let estrelaEscolhidaParaConstelacao = null;
let currentConstellation = null; 
const constellations = []; 

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


// Função para criar uma nova constelação
function criarConstelacao(nome) {
    const constelacao = {
        name: nome,
        lines: []
    };
    constellations.push(constelacao);
    adicionarConstelacaoNaLista(constelacao);

    selecionarConstelacao(constelacao);

}

function calcularPontoMedio(constelacao) {
    const midPoint = new THREE.Vector3();

    // Soma as posições das estrelas da constelação
    const totalEstrelas = constelacao.lines.length;
    const positions = constelacao.lines.map(line => {
        return line.geometry.attributes.position.array;
    });

    for (const position of positions) {
        midPoint.add(new THREE.Vector3(position[0], position[1], position[2])); // Ponto inicial
        midPoint.add(new THREE.Vector3(position[3], position[4], position[5])); // Ponto final
    }

    // Divide pela quantidade de linhas para encontrar o ponto médio
    return midPoint.divideScalar(totalEstrelas * 2);
}

let constellationLabelSprite = null; 
function adicionarTextoConstelacao(constelacao) {
    // Calcular o ponto médio
    const pontoMedio = calcularPontoMedio(constelacao);

    // Criar ou atualizar o sprite de texto da constelação
    if (!constellationLabelSprite) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Aumentar a resolução do canvas para melhorar a qualidade
        const canvasScale = 4; // Fator de escala para aumentar a qualidade
        const canvasWidth = 500; // Aumentado para evitar corte
        const canvasHeight = 200; // Aumentado para evitar corte
        canvas.width = canvasWidth * canvasScale;
        canvas.height = canvasHeight * canvasScale;

        context.scale(canvasScale, canvasScale); // Escalar o contexto do canvas

        // Configurar o texto
        const fontSize = 100; // Tamanho da fonte maior
        context.font = `${fontSize}px Orbitron`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle'; // Centraliza verticalmente
        context.fillText(constelacao.name, canvasWidth / 2, canvasHeight / 2); // Posição centralizada

        // Criar textura a partir do canvas
        const textura = new THREE.Texture(canvas);
        textura.needsUpdate = true;
        textura.minFilter = THREE.LinearFilter; // Para evitar problemas com texturas de não-potência de 2

        // Criar material de sprite
        const material = new THREE.SpriteMaterial({ map: textura, transparent: true });

        // Criar sprite
        constellationLabelSprite = new THREE.Sprite(material);
        constellationLabelSprite.position.copy(pontoMedio); // Posicionar no ponto médio
        constellationLabelSprite.userData.isConstellationLabel = true; // Marcar o sprite

        // Adicionar sprite à cena
        scene.add(constellationLabelSprite);
    } else {
        // Se o sprite já existe, apenas atualize sua posição e texto
        constellationLabelSprite.position.copy(pontoMedio);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Aumentar a resolução do canvas para melhorar a qualidade
        const canvasScale = 4; // Fator de escala para aumentar a qualidade
        const canvasWidth = 500; // Aumentado para evitar corte
        const canvasHeight = 200; // Aumentado para evitar corte
        canvas.width = canvasWidth * canvasScale;
        canvas.height = canvasHeight * canvasScale;

        context.scale(canvasScale, canvasScale); // Escalar o contexto do canvas

        // Configurar o texto
        const fontSize = 100; // Tamanho da fonte maior
        context.font = `${fontSize}px Orbitron`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle'; // Centraliza verticalmente
        context.fillText(constelacao.name, canvasWidth / 2, canvasHeight / 2); // Posição centralizada

        // Atualizar textura do sprite
        const textura = new THREE.Texture(canvas);
        textura.needsUpdate = true;
        textura.minFilter = THREE.LinearFilter;

        constellationLabelSprite.material.map = textura;
        constellationLabelSprite.material.needsUpdate = true;
    }
}



function deselecionarTodasConstelacoes() {
    // Desabilitar todas as linhas
    constellations.forEach(c => {
        c.lines.forEach(linha => linha.visible = false);
    });


    currentConstellation = null; // Nenhuma constelação atualmente selecionada

    // Atualizar a exibição na UI
    const constellationNameElement = document.getElementById('constellationName');
    constellationNameElement.textContent = 'Nenhuma selecionada';
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


function selecionarConstelacao(constelacao) {
    // Desabilitar todas as linhas
    constellations.forEach(c => {
        c.lines.forEach(linha => linha.visible = false);
    });

    // Habilitar apenas as linhas da constelação selecionada
    constelacao.lines.forEach(linha => linha.visible = true);

    currentConstellation = constelacao; // Definir a constelação atual para associar novas linhas

    const constellationNameElement = document.getElementById('constellationName');
    if (constelacao) {
        constellationNameElement.textContent = constelacao.name;
        adicionarTextoConstelacao(constelacao); 
    } else {
        constellationNameElement.textContent = 'None selected';
    }
}
// Função para editar o nome da constelação
function editarConstelacaoNome(constelacao, spanElement) {
    const novoNome = prompt("Enter the new name for the constellation:", constelacao.name);
    if (novoNome && novoNome.trim() !== "") {
        constelacao.name = novoNome.trim();
        spanElement.textContent = constelacao.name;
    }
}

// Função para criar uma nova constelação via UI
function handleAddConstellation() {
    const nome = prompt("Enter the name of the new constellation:");
    if (nome && nome.trim() !== "") {
        criarConstelacao(nome.trim());
    }
}

// Função para criar sprites de texto (removida duplicação)


function togglePanels() {
    const infoPanel = document.getElementById('infoPanel');
    const leftPanel = document.getElementById('leftPanel');
    const toggleButton = document.getElementById('togglePanelsButton');

    if (infoPanel.style.display === 'none' && leftPanel.style.display === 'none') {
        // Mostrar os painéis
        infoPanel.style.display = 'block';
        leftPanel.style.display = 'flex'; // Flex para manter a direção definida
        toggleButton.textContent = '☰'; // Ícone para esconder
        toggleButton.title = 'Hide Panels';
    } else {
        // Esconder os painéis
        infoPanel.style.display = 'none';
        leftPanel.style.display = 'none';
        toggleButton.textContent = '☰'; // Você pode mudar o ícone se preferir
        toggleButton.title = 'Show Panels';
    }
}

// Adicionar evento de clique ao botão
document.getElementById('togglePanelsButton').addEventListener('click', togglePanels);

// Opcional: Inicialmente, garantir que os painéis estão visíveis
window.addEventListener('load', () => {
    const infoPanel = document.getElementById('infoPanel');
    const leftPanel = document.getElementById('leftPanel');
    infoPanel.style.display = 'block';
    leftPanel.style.display = 'flex';
});

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
                mostrarInstrucoes(); 
                // Assegure-se de que há um elemento com id 'enterExoplanet' no HTML
                const enterExoplanet = document.getElementById('enterExoplanet');
                if (enterExoplanet) {
                    enterExoplanet.style.display = 'block';
                }
            } else {
                desenharLinha(estrelaEscolhidaParaConstelacao, estrelaAtual);
                estrelaEscolhidaParaConstelacao = null;
                esconderInstrucoes(); // Esconder instruções após desenhar a linha

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
            <strong>Position:</strong> (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})<br>
            <strong>Size:</strong> ${tamanho}<br>
        `;
    }
    
    function fecharAlerta() {
        const alertElement = document.getElementById('alert');
        alertElement.style.display = 'none'; // Oculta o alerta
    }   

    function mostrarAlerta(text) {
        const alertElement = document.getElementById('alert');
        alertElement.style.display = 'block'; 
        document.getElementById("alertP").innerText = text
        // Oculta o alerta
    }   

    function desenharLinha(estrela1, estrela2) {
        if (!currentConstellation) {
            mostrarAlerta("First, select or create a constellation!")
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
    
        // Calcular o ponto médio da linha
        const midPoint = new THREE.Vector3().addVectors(
            new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
            new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
        ).multiplyScalar(0.5);
    
        // Atualizar o rótulo de texto da constelação
        adicionarTextoConstelacao(currentConstellation);
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

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Mantenha o eixo Y constante
        cameraDirection.normalize();
    
        const cameraRight = new THREE.Vector3();
    camera.getWorldDirection(cameraRight);
    cameraRight.cross(camera.up); // Direção à direita
    cameraRight.normalize();

    if (moveForward) camera.position.add(cameraDirection.multiplyScalar(moveSpeed));
    if (moveBackward) camera.position.add(cameraDirection.multiplyScalar(-moveSpeed));
    if (moveLeft) camera.position.add(cameraRight.multiplyScalar(-moveSpeed));
    if (moveRight) camera.position.add(cameraRight.multiplyScalar(moveSpeed));
    
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(estrelas.map(estrela => estrela.mesh));
    
        estrelas.forEach(estrela => estrela.voltarTamanho());
        if (intersects.length > 0) {
            intersects[0].object.scale.set(1.5, 1.5, 1.5);
        }
    
        scene.children.forEach(child => {
            if (child.isSprite) { // Verifique se é um sprite
                child.lookAt(camera.position);
                if (child.userData.isConstellationLabel) {
                    const distance = camera.position.distanceTo(child.position);
                    const scale = distance * 0.2; // Ajuste o fator conforme necessário
                    child.scale.set(scale, scale, scale);
                }
            }
        });
    
        renderer.render(scene, camera);
    }
    

    animate();

    function mostrarInstrucoes() {
        const instructionText = document.getElementById('instructionText');
        instructionText.style.display = 'block';
    }
    
    function esconderInstrucoes() {
        const instructionText = document.getElementById('instructionText');
        instructionText.style.display = 'none';
    }


    document.getElementById('downloadButton').addEventListener('click', () => {
        
        renderer.setClearColor(0x000000); 
        renderer.render(scene, camera);

        const dataURL = renderer.domElement.toDataURL('image/png');
    
        const tempCanvas = document.createElement('canvas');
        const scaleFactor = 4; 
        tempCanvas.width = renderer.domElement.width * scaleFactor;
        tempCanvas.height = renderer.domElement.height * scaleFactor;

        const ctx = tempCanvas.getContext('2d');
        
        const img = new Image();
        img.onload = function() {
            
            ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            
            ctx.font = `${30 * scaleFactor}px Orbitron`; 
            ctx.fillStyle = 'white'; 
            ctx.textAlign = 'center'; 
            ctx.fillText('ConstelArt', tempCanvas.width / 2, 100 * scaleFactor); 
            
            const finalDataURL = tempCanvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.href = finalDataURL;
            link.download = 'mapa_estelar.png';
            link.click();
        };
        
        img.src = dataURL;
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

    // Eventos para acessibilidade mobile
    let isTouching = false;
    let initialDistance = 0;

    // Eventos para Mobile (Toque)
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isTouching = true;
            previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else if (event.touches.length === 2) {
            isTouching = false;
            initialDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
            );
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', (event) => {
        if (isTouching && event.touches.length === 1) {
            const deltaMove = {
                x: event.touches[0].clientX - previousMousePosition.x,
                y: event.touches[0].clientY - previousMousePosition.y
            };
    
            camera.rotation.y += deltaMove.x * 0.005;
            camera.rotation.x += deltaMove.y * 0.005;
    
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            const currentDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
            );
    
            const zoomFactor = currentDistance / initialDistance;
            zoomSpeed = (zoomFactor - 1) * 5; // Ajuste o fator conforme necessário
            initialDistance = currentDistance;
        }
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
        isTouching = false;
    }, { passive: false });
    
});

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const moveSpeed = 0.1; // Velocidade de movimento da câmera

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
        case 'W':
            moveForward = true;
            break;
        case 's':
        case 'S':
            moveBackward = true;
            break;
        case 'a':
        case 'A':
            moveLeft = true;
            break;
        case 'd':
        case 'D':
            moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 'W':
            moveForward = false;
            break;
        case 's':
        case 'S':
            moveBackward = false;
            break;
        case 'a':
        case 'A':
            moveLeft = false;
            break;
        case 'd':
        case 'D':
            moveRight = false;
            break;
    }
});
