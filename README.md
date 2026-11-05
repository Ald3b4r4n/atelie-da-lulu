<div align="center">

# 🦋 Ateliê da Lulu 3D

**Um jogo infantil de vestir, criar e brincar no navegador.**

`Blender` · `Three.js` · `Web Audio`

[Como jogar](#como-jogar) · [Bastidores do 3D](#bastidores-do-3d) · [Hospedagem](#hospedagem)

</div>

![Lulu com seu vestido rosa de borboletas, em um ateliê com máquina de costura, balões e arara de vestidos](docs/atelie-da-lulu-3d.png)

Entre no ateliê, escolha um look e descubra que mundo aparece na janela. A foto da Lulu inspirou o vestido de borboletas e a paleta pastel do jogo.

## Como jogar

Com o Node.js instalado, clone o projeto e inicie o servidor local.

```bash
git clone https://github.com/Ald3b4r4n/atelie-da-lulu.git
cd atelie-da-lulu
node server.js
```

Abra [o ateliê](http://localhost:5173/) e clique em **Vamos brincar!** para liberar a música. A versão 3D usa WebGL 2. Se o navegador não oferecer esse recurso, o jogo abre no modo clássico ilustrado.

| No ateliê | O que fazer |
| --- | --- |
| 👗 **Guarda-roupa** | Combine roupas, sapatos, penteados, maquiagem e acessórios. |
| ↻ **Girar e aproximar** | Arraste a Lulu para girá-la ou use os controles da câmera. |
| 🌈 **Cenário** | Explore 20 vistas da janela, cada uma com a sua trilha. |
| 🎲 **Surpresa** | Sorteie um look. Use **Limpar** para voltar ao vestido de borboletas. |
| 📸 **Salvar foto** | Baixe um PNG do look na vista atual. |
| 🎵 **Música** | Ouça **Asas de Algodão**, o tema de abertura com sininhos, harpa e piano. |

## Bastidores do 3D

O [arquivo editável do Blender](blender/atelie.blend) contém a Lulu, o vestido de borboletas e o diorama do ateliê. No navegador, o [código da cena](studio.js) carrega os modelos GLB e aplica as escolhas do guarda-roupa em tempo real.

Para regenerar os modelos com o Blender 4.5 e recompilar a cena web:

```bash
blender --background --python blender/build_atelie.py
npm ci
npm run build
```

## Hospedagem

Para publicar na Vercel ou em outro host estático, envie `index.html`, `styles.css`, os scripts `art.js`, `clothes.js`, `accessories.js`, `scenes.js`, `music.js` e `game.js`, além de `assets/`, preservando essa estrutura. A engine já está compilada em `assets/studio.bundle.js`. O servidor Node.js serve para jogar localmente.
