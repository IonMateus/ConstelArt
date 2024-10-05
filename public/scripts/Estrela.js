// Estrela.js
class Estrela {
    constructor(x, y, z, tamanho) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.tamanho = tamanho;
        this.selected = false;

        const geometry = new THREE.SphereGeometry(tamanho, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
    }

    selecionar() {
        this.selected = true;
        this.mesh.material.color.set(0xff0000); // Cor vermelha ao selecionar
    }

    deselecionar() {
        this.selected = false;
        this.mesh.material.color.set(0xffffff); // Volta para branco
    }

    voltarTamanho() {
        if (!this.selected) {
            this.mesh.scale.set(1, 1, 1);
        }
    }
}
