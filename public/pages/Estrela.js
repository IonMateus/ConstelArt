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
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const estrela = new THREE.Mesh(geometry, material);
        estrela.position.set(this.x, this.y, this.z);
        return estrela;
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
