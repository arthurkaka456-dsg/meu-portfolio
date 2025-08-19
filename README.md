# Studio AKD — Portfólio

Template simples e responsivo para portfólio de estúdio de branding e design, inspirado no layout minimalista do eichstudio.com.

## Como usar

1. Baixe este repositório como ZIP ou faça fork no GitHub.
2. Edite os textos no `index.html`.
3. Troque as imagens alterando as URLs usadas nos `style="--img:url('...')"` em cada card.
4. Ajuste cores no arquivo `styles/main.css` dentro de `:root`.

### Vídeo de fundo no hero
- Coloque seu arquivo em `assets/hero.mp4`.
- Descomente a linha do `<video>` no `index.html`.

## Rodar localmente
Abra o `index.html` no navegador ou rode com um servidor estático:

```bash
# Node
npx serve .

# Python 3
python -m http.server 8080
```

## Publicar no GitHub Pages

1. Crie um repositório novo no GitHub, por exemplo `meu-portfolio`.
2. Envie estes arquivos para a branch `main` na raiz do repositório.
3. No GitHub, vá em **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione **Branch: main** e **Folder: /** e salve.
6. A URL será algo como `https://seuusuario.github.io/meu-portfolio`.

## Personalização rápida

- **Marca e acento**: mude `--brand`, `--brand-hover` e `--accent` no `styles/main.css`.
- **Grid de projetos**: duplique um `<article class="card ...">` e edite o conteúdo.
- **Seções**: remova as que não quiser. A navegação já aponta para as âncoras.

## Licença
MIT. Fique à vontade para usar e modificar.
