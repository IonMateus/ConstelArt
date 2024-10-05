const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const estrelas = [];
        let estrelaSelecionada = null;
        let estrelaEscolhidaParaConstelacao = null;

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

            document.addEventListener('wheel', (event) => {
                zoomSpeed += event.deltaY * 0.01;
            });

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
                        document.getElementById('enterExoplanet').style.display = 'block';
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
                const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
                    new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
                ]);
                const linha = new THREE.Line(geometry, material);
                scene.add(linha);

                // Adiciona o texto "Ligação"
                const textoGeo = new THREE.TextGeometry("Ligação", {
                    font: new THREE.FontLoader().load('path/to/font.json'), // Adicione seu caminho para a fonte
                    size: 1,
                    height: 0.1
                });
                const textoMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const textoMesh = new THREE.Mesh(textoGeo, textoMaterial);

                // Posição do texto no meio da linha
                const midPoint = new THREE.Vector3().addVectors(
                    new THREE.Vector3(estrela1.x, estrela1.y, estrela1.z),
                    new THREE.Vector3(estrela2.x, estrela2.y, estrela2.z)
                ).multiplyScalar(0.5);

                textoMesh.position.set(midPoint.x, midPoint.y, midPoint.z);
                scene.add(textoMesh);
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

                renderer.render(scene, camera);
            }

            animate();

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

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            window.addEventListener('wheel', (event) => {
                camera.position.z += event.deltaY * 0.05; // Aumentando o fator de zoom
                camera.position.z = Math.max(1, camera.position.z);
            });
        });