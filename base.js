const canvas = document.getElementById('JogoCanvas');
const ctx = canvas.getContext('2d');

class Entidade {
    constructor(x, y, largura, altura, cor) {
        this._x = x;
        this._y = y;
        this._largura = largura;
        this._altura = altura;
        this._cor = cor;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    get largura() {
        return this._largura;
    }

    get altura() {
        return this._altura;
    }

    desenhar() {
        ctx.fillStyle = this._cor;
        ctx.fillRect(this._x, this._y, this._largura, this._altura);
    }

    atualizar() {}
}

class Nave extends Entidade {
    constructor(x, y, cor) {
        super(x, y, 50, 20, cor);
        this.velocidade = 5;
    }

    mover(direcao) {
        if (direcao === 'esquerda' && this._x > 0) this._x -= this.velocidade;
        if (direcao === 'direita' && this._x + this._largura < canvas.width) this._x += this.velocidade;
    }

    atualizar() {}
}

class Tiro extends Entidade {
    constructor(x, y) {
        super(x, y, 5, 10, 'yellow');
        this.velocidade = -7;
    }

    atualizar() {
        this._y += this.velocidade;
    }
}

class Invasor extends Entidade {
    constructor(x, y) {
        super(x, y, 40, 20, 'red');
        this.direcao = 1;
        this.velocidadeGravidade = 0.05;
        this.velocidadeHorizontal = 0.75;
    }

    atualizar() {
        this._x += this.direcao * this.velocidadeHorizontal;
        this._y += this.velocidadeGravidade;
    }

    inverterDirecao() {
        this.direcao = -this.direcao;
    }
}

class Jogo {
    constructor() {
        this.iniciar();
    }

    iniciar() {
        this.nave = new Nave(canvas.width / 2 - 25, canvas.height - 30, 'blue');
        this.tiros = [];
        this.invasores = [];
        this.linhas = 3;
        this.colunas = 8;
        this.pontuacao = 0;
        this.gameOver = false;
        this.criarInvasores();
        this.loop();
    }

    criarInvasores() {
        for (let l = 0; l < this.linhas; l++) {
            for (let c = 0; c < this.colunas; c++) {
                this.invasores.push(new Invasor(80 * c + 30, 40 * l + 30));
            }
        }
    }

    colisao(a, b) {
        return a.x < b.x + b.largura &&
               a.x + a.largura > b.x &&
               a.y < b.y + b.altura &&
               a.y + a.altura > b.y;
    }

    desenharPontuacao() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Pontuação: ' + this.pontuacao, 10, 30);
    }

    desenharGameOver() {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 90, canvas.height / 2);
    }

    atualizar() {
        if (this.gameOver) {
            this.desenharGameOver();
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.nave.desenhar();

        for (let i = this.tiros.length - 1; i >= 0; i--) {
            const tiro = this.tiros[i];
            tiro.atualizar();
            tiro.desenhar();

            if (tiro.y < 0) this.tiros.splice(i, 1);
        }

        let atingiuBorda = false;

        for (let i = this.invasores.length - 1; i >= 0; i--) {
            const inv = this.invasores[i];
            inv.atualizar();
            inv.desenhar();

            if (inv.x <= 0 || inv.x + inv.largura >= canvas.width) {
                atingiuBorda = true;
            }

            if (this.colisao(this.nave, inv)) {
                this.gameOver = true;
                return;
            }

            for (let j = this.tiros.length - 1; j >= 0; j--) {
                if (this.colisao(inv, this.tiros[j])) {
                    this.invasores.splice(i, 1);
                    this.tiros.splice(j, 1);
                    this.pontuacao += 10;
                    break;
                }
            }
        }

        if (atingiuBorda) {
            for (const inv of this.invasores) {
                inv.inverterDirecao();
            }
        }

        for (const inv of this.invasores) {
            if (inv.y + inv.altura >= canvas.height) {
                this.gameOver = true;
                return;
            }
        }

        this.desenharPontuacao();
    }

    loop() {
        this.atualizar();
        requestAnimationFrame(this.loop.bind(this));
    }
}

const jogo = new Jogo();

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' && !jogo.gameOver) jogo.nave.mover('esquerda');
    if (e.code === 'ArrowRight' && !jogo.gameOver) jogo.nave.mover('direita');
    if (e.code === 'Space' && !jogo.gameOver) jogo.tiros.push(new Tiro(jogo.nave.x + jogo.nave.largura / 2 - 2.5, jogo.nave.y));
});


document.getElementById('reiniciarBtn').addEventListener('click', () => {
    jogo.iniciar(); 
});
