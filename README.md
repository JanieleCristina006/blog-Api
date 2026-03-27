# API Blog

Backend de blog construido com Node.js, TypeScript, Express e Prisma, com autenticacao via JWT, recuperacao de senha por email e gerenciamento de posts com upload de midia.

## Funcionalidades

- cadastro de usuario com upload opcional de foto de perfil
- listagem de usuarios
- login com JWT
- recuperacao de senha por email
- redefinicao de senha por token
- criacao, listagem, atualizacao e remocao de posts
- rotas administrativas de post protegidas por autenticacao e permissao de `admin`
- upload de imagens e videos para o Cloudinary
- validacao de entrada com Zod

## Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod
- JWT
- Bcrypt
- Multer
- Cloudinary
- Nodemailer
- TSX

## Estrutura

```text
api-blog/
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- src/
|   |-- config/
|   |-- controllers/
|   |   |-- post/
|   |   `-- user/
|   |-- database/
|   |-- generated/
|   |-- middlewares/
|   |-- routes/
|   |-- services/
|   |   |-- post/
|   |   `-- user/
|   |-- shema/
|   `-- server.ts
|-- upload/
|-- uploads/
|-- package.json
`-- README.md
```

## Requisitos

- Node.js 18+
- npm
- PostgreSQL acessivel pela aplicacao
- conta Cloudinary
- conta Gmail com credenciais validas para o Nodemailer

## Variaveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
PORT=3000
JWT_SECRET=sua_chave_secreta

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

Observacoes:

- a aplicacao usa `process.env.PORT || 3000`
- o Prisma usa `@prisma/adapter-pg` com `DATABASE_URL`
- o envio de email esta configurado com `service: "gmail"`
- o link de recuperacao enviado por email hoje aponta para `http://localhost:3000/reset?token=...`

## Instalacao

```bash
npm install
```

## Executando o projeto

```bash
npm run dev
```

API disponivel em `http://localhost:3000`.

## Scripts

- `npm run dev`: inicia o servidor com `tsx watch src/server.ts`

## Banco de dados

O schema Prisma atual possui os models:

- `User`
- `PasswordReset`
- `Post`
- `Media`
- `Comment`
- `Like`

Relacoes principais:

- um usuario possui posts, comentarios, likes e tokens de recuperacao
- um post pertence a um usuario e pode ter midias, comentarios e likes
- `Like` impede duplicidade por usuario e post com `@@unique([userId, postId])`
- `PasswordReset` armazena apenas o hash do token, prazo de expiracao e uso

## Rotas

### `POST /register`

Cria um novo usuario. Aceita `multipart/form-data`.

Campos:

- `name`
- `email`
- `password`
- `role` (`admin` ou `user`, padrao `user`)
- `photo_profile` (arquivo opcional)

Comportamento:

- valida os dados com Zod
- faz hash da senha com Bcrypt
- envia a foto de perfil para o Cloudinary, se houver
- remove o arquivo temporario local
- impede cadastro com email duplicado

Exemplo:

```bash
curl -X POST http://localhost:3000/register \
  -F "name=Janie" \
  -F "email=janie@example.com" \
  -F "password=123456" \
  -F "role=user" \
  -F "photo_profile=@foto.png"
```

Resposta de sucesso:

```json
{
  "id": "uuid",
  "name": "Janie",
  "email": "janie@example.com",
  "createdAt": "2026-03-25T12:00:00.000Z",
  "photo_profile": "https://res.cloudinary.com/..."
}
```

### `GET /users`

Lista os usuarios cadastrados em ordem decrescente de criacao.

Retorna:

- `id`
- `name`
- `email`
- `role`
- `photo_profile`
- `createdAt`

Exemplo:

```bash
curl http://localhost:3000/users
```

### `POST /login`

Autentica um usuario com email e senha.

Body JSON:

```json
{
  "email": "janie@example.com",
  "password": "123456"
}
```

Comportamento:

- busca o usuario por email
- compara a senha com Bcrypt
- gera JWT com `name` e `role`
- define `subject` com o `id` do usuario
- usa expiracao de `15d`

Resposta atual:

```json
"token:jwt-gerado"
```

### `POST /forgot-password`

Inicia o fluxo de recuperacao de senha.

Body JSON:

```json
{
  "email": "janie@example.com"
}
```

Comportamento:

- retorna mensagem neutra se o email nao existir
- invalida tokens anteriores ainda nao utilizados
- gera um token aleatorio
- salva apenas o hash do token no banco
- envia email com link de recuperacao
- define expiracao de 15 minutos

Resposta atual quando o usuario existe:

```json
{
  "message": "Email de recuperacao enviado com sucesso.",
  "resetToken": "token-gerado"
}
```

Resposta atual quando o usuario nao existe:

```json
{
  "message": "Se o email existir, voce recebera um link de recuperacao."
}
```

### `POST /reset-password/:token`

Redefine a senha a partir do token recebido.

Body JSON:

```json
{
  "newPassword": "novaSenha123"
}
```

Comportamento:

- recebe o token puro pela URL
- gera hash SHA-256 do token
- procura um token valido, nao utilizado e nao expirado
- atualiza a senha com hash Bcrypt
- marca o token como usado

Resposta atual:

```json
"Senha redefinida com sucesso!"
```

### `POST /createdpost`

Cria um post com upload opcional de multiplos arquivos.

Requisitos:

- header `Authorization: Bearer <token>`
- o usuario autenticado precisa ter `role === "admin"`
- requisicao em `multipart/form-data`

Campos:

- `title`
- `content`
- `category` (opcional)
- `files` (0 ou mais arquivos)

Comportamento:

- valida o token JWT
- busca o usuario no banco
- bloqueia usuarios que nao sejam `admin`
- envia imagens e videos para o Cloudinary
- remove arquivos temporarios locais mesmo em caso de falha
- cria o post e as entradas de midia relacionadas no banco

Exemplo:

```bash
curl -X POST http://localhost:3000/createdpost \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "title=Meu primeiro post" \
  -F "content=Conteudo do post" \
  -F "category=tecnologia" \
  -F "files=@imagem.png" \
  -F "files=@video.mp4"
```

Resposta de sucesso:

```json
{
  "id": "uuid",
  "title": "Meu primeiro post",
  "content": "Conteudo do post",
  "category": "tecnologia",
  "createdAt": "2026-03-26T12:00:00.000Z",
  "userId": "uuid"
}
```

### `GET /posts`

Lista os posts cadastrados.

Retorna atualmente:

- `id`
- `title`
- `content`
- `category`
- `media`
- `likes`
- `comments`

Exemplo:

```bash
curl http://localhost:3000/posts
```

### `PATCH /posts/:postId`

Atualiza um post existente.

Requisitos:

- header `Authorization: Bearer <token>`
- o usuario autenticado precisa ter `role === "admin"`
- requisicao em `multipart/form-data` quando houver envio de arquivos

Campos aceitos:

- `title` (opcional)
- `content` (opcional)
- `category` (opcional)
- `files` (0 ou mais arquivos opcionais)

Comportamento:

- localiza o post pelo `postId`
- atualiza apenas os campos enviados
- se novos arquivos forem enviados, remove as midias antigas do Cloudinary
- apaga os registros antigos de midia no banco
- faz upload das novas midias e as vincula ao post

Exemplo:

```bash
curl -X PATCH http://localhost:3000/posts/POST_ID \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "title=Titulo atualizado" \
  -F "content=Conteudo atualizado" \
  -F "files=@nova-imagem.png"
```

### `DELETE /posts/:postId`

Remove um post existente.

Requisitos:

- header `Authorization: Bearer <token>`
- o usuario autenticado precisa ter `role === "admin"`

Validacao:

- `postId` precisa ser um UUID valido

Comportamento:

- localiza o post com as midias relacionadas
- remove os arquivos do Cloudinary
- exclui `likes`, `comments`, `media` e o `post` no banco

Exemplo:

```bash
curl -X DELETE http://localhost:3000/posts/POST_ID \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resposta de sucesso:

```json
{
  "message": "Post deletado com sucesso"
}
```

## Validacao

As rotas que usam schema passam pelo middleware `validateSchema` com Zod.

Regras atuais:

- `register`
- `name`: minimo de 3 caracteres
- `email`: email valido
- `password`: minimo de 6 caracteres
- `role`: `admin` ou `user`
- `login`
- `email`: email valido
- `password`: minimo de 6 caracteres
- `forgot-password`
- `email`: email valido
- `reset-password`
- `newPassword`: minimo de 6 caracteres
- `token` nos parametros: obrigatorio
- `delete post`
- `postId` nos parametros: UUID obrigatorio

Em caso de erro de validacao, a API responde com status `400` no formato:

```json
{
  "error": "Erro de validacao",
  "details": [
    {
      "campo": "body.email",
      "mensagem": "Email invalido"
    }
  ]
}
```

## Uploads

Configuracao atual do Multer:

- usa a pasta temporaria `upload/`
- aceita ate `100MB` por arquivo
- aceita `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm` e `video/quicktime`

Campos esperados:

- `photo_profile` para foto de perfil
- `files` para midias do post

## Comandos uteis do Prisma

O `package.json` ainda nao possui scripts dedicados para o Prisma, mas estes comandos sao uteis:

```bash
npx prisma generate
npx prisma migrate dev
```

## Estado atual do projeto

Ja existe:

- autenticacao com JWT
- recuperacao e redefinicao de senha
- middleware de autorizacao para rotas administrativas de posts
- criacao, listagem, atualizacao e exclusao de posts
- upload de midia para posts

Ainda nao existe:

- CRUD de comentarios
- CRUD de likes
- middleware global de tratamento de erros
- testes automatizados
- documentacao OpenAPI ou Swagger
- validacao Zod para criacao e atualizacao de post

## Observacoes importantes

- o projeto usa `"type": "module"` no `package.json`
- o Prisma Client e gerado em `src/generated/prisma`
- ha duas pastas relacionadas a upload no repositorio: `upload/` e a usada pelo Multer atualmente
- o diretorio de schemas esta nomeado como `shema`
