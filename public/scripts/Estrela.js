// Estrela.js
class Estrela {
    constructor(x, y, z, tamanho) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.tamanho = tamanho;
        this.mesh = this.criarEstrela();
    }

    criarEstrela() {
        const geometry = new THREE.SphereGeometry(this.tamanho, 24, 24);
        const material = new THREE.MeshBasicMaterial({ map: this.criarTextura() });
        const estrela = new THREE.Mesh(geometry, material);
        estrela.position.set(this.x, this.y, this.z);
        return estrela;
    }

    criarTextura() {
        const size = 256;
        const data = new Uint8Array(size * size * 4); // Use RGBA (4 componentes)

        const simplex = new SimplexNoise();

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const value = simplex.noise2D(x / 50, y / 50); // Ajuste a escala do noise
                const color = Math.floor((value + 1) * 128); // Normaliza para [0, 255]

                const index = (x + y * size) * 4; // Ajustado para RGBA
                data[index] = color;     // R
                data[index + 1] = color; // G
                data[index + 2] = color; // B
                data[index + 3] = 255;   // A (opacidade)
            }
        }

        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        texture.needsUpdate = true;
        return texture;
    }

    aumentarTamanho() {
        this.mesh.scale.set(1.5, 1.5, 1.5);
    }

    voltarTamanho() {
        this.mesh.scale.set(1, 1, 1);
    }

    selecionar() {
        this.mesh.material.color.set(0x0000ff); // Muda a cor para azul
    }

    deselecionar() {
        this.mesh.material.color.set(0xffffff); // Volta para branco
    }
}

// Anexa a classe ao objeto global
window.Estrela = Estrela;