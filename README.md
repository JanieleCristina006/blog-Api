# API Blog

API backend para um projeto de blog, construida com Node.js, TypeScript, Express e Prisma.

Atualmente o projeto ja oferece:

- cadastro de usuario com upload opcional de foto de perfil
- listagem de usuarios
- login com JWT
- fluxo de recuperacao de senha por email
- redefinicao de senha por token
- validacao de entrada com Zod
- integracao com PostgreSQL, Cloudinary e Gmail

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

## Estrutura atual

```text
api-blog/
|-- prisma/
|   `-- schema.prisma
|-- src/
|   |-- config/
|   |   |-- cloudinary.ts
|   |   |-- mail.ts
|   |   |-- multer.ts
|   |   `-- sendMail.ts
|   |-- controllers/
|   |   `-- user/
|   |       |-- forgotPasswordController.ts
|   |       |-- listUsersController.ts
|   |       |-- loginUserController.ts
|   |       |-- registerUserController.ts
|   |       `-- resetPasswordController.ts
|   |-- database/
|   |   `-- db.ts
|   |-- generated/
|   |   `-- prisma/
|   |-- middlewares/
|   |   `-- validateSchema.ts
|   |-- routes/
|   |   `-- routes.ts
|   |-- services/
|   |   `-- user/
|   |       |-- forgotPasswordService.ts
|   |       |-- listUsersService.ts
|   |       |-- loginUserService.ts
|   |       |-- registerUserService.ts
|   |       `-- resetPasswordService.ts
|   |-- shema/
|   |   `-- userShema.ts
|   `-- server.ts
|-- uploads/
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Requisitos

- Node.js
- npm
- banco PostgreSQL acessivel
- conta Cloudinary
- conta Gmail ou credenciais compativeis com Nodemailer

## Variaveis de ambiente

Crie um arquivo `.env` na raiz com valores semelhantes a estes:

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

- a API usa `process.env.PORT || 3000`, entao a porta padrao atual e `3000`
- a conexao com o banco e feita via `@prisma/adapter-pg` usando `DATABASE_URL`
- o link enviado no fluxo de recuperacao hoje esta fixo em `http://localhost:3000/reset?token=...`

## Instalacao

```bash
npm install
```

## Como executar

Para iniciar em desenvolvimento:

```bash
npm run dev
```

Servidor disponivel em:

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: inicia a API com `tsx watch src/server.ts`

## Banco de dados

O schema Prisma atual possui os models:

- `User`
- `PasswordReset`
- `Post`
- `Media`
- `Comment`
- `Like`

Relacoes principais:

- um usuario pode ter posts, comentarios, likes e tokens de recuperacao
- um post pertence a um usuario e pode ter midias, comentarios e likes
- `PasswordReset` armazena hash do token, expiracao e uso

## Arquitetura

O projeto esta separado por responsabilidade:

- `routes`: define os endpoints
- `controllers`: recebe a requisicao HTTP
- `services`: contem a regra de negocio
- `middlewares`: validacoes e fluxo compartilhado
- `config`: integracoes externas
- `database`: instancia do Prisma Client

## Endpoints

### `POST /register`

Cria um novo usuario. Aceita `multipart/form-data` quando houver imagem.

Campos:

- `name`
- `email`
- `password`
- `role` -> `admin` ou `user`
- `photo_profile` -> arquivo opcional

Comportamento atual:

- valida os dados com Zod
- faz hash da senha com Bcrypt
- sobe a imagem para o Cloudinary, se enviada
- remove o arquivo temporario local
- salva o usuario no banco
- bloqueia email duplicado

Exemplo:

```bash
curl -X POST http://localhost:3000/register \
  -F "name=Janie" \
  -F "email=janie@example.com" \
  -F "password=123456" \
  -F "role=user" \
  -F "photo_profile=@foto.png"
```

Resposta esperada:

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

Lista os usuarios cadastrados.

Comportamento atual:

- ordena por `createdAt` decrescente
- nao retorna a senha
- retorna `id`, `name`, `email`, `role`, `photo_profile` e `createdAt`

Exemplo:

```bash
curl http://localhost:3000/users
```

### `POST /login`

Autentica um usuario com email e senha.

Campos:

- `email`
- `password`

Comportamento atual:

- busca o usuario por email
- compara a senha com Bcrypt
- gera JWT com `name` e `role`
- usa `subject` com o `id` do usuario
- define expiracao de `15d`
- retorna uma string no formato `token:...`

Exemplo:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"janie@example.com\",\"password\":\"123456\"}"
```

### `POST /forgot-password`

Inicia o fluxo de recuperacao de senha.

Campos:

- `email`

Comportamento atual:

- se o usuario existir, invalida tokens anteriores ainda abertos
- cria um novo token aleatorio
- salva apenas o hash do token no banco
- envia email com link de redefinicao
- define expiracao de 15 minutos
- atualmente retorna tambem o `resetToken` na resposta

Exemplo:

```bash
curl -X POST http://localhost:3000/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"janie@example.com\"}"
```

Resposta atual:

```json
{
  "message": "Email de recuperacao enviado com sucesso.",
  "resetToken": "token-gerado"
}
```

Se o email nao existir, a resposta atual segue uma mensagem neutra:

```json
{
  "message": "Se o email existir, voce recebera um link de recuperacao."
}
```

### `POST /reset-password/:token`

Redefine a senha usando o token recebido.

Campos:

- `newPassword`
- `token` pela URL

Comportamento atual:

- recebe o token puro na rota
- gera o hash SHA-256 desse token
- busca um registro valido e nao utilizado
- atualiza a senha do usuario com hash Bcrypt
- marca o token como usado

Exemplo:

```bash
curl -X POST http://localhost:3000/reset-password/seu-token \
  -H "Content-Type: application/json" \
  -d "{\"newPassword\":\"novaSenha123\"}"
```

Resposta atual:

```json
"Senha redefinida com sucesso!"
```

## Validacao

As rotas usam `validateSchema` com Zod.

Regras atuais:

- `register`
- `name`: minimo de 3 caracteres
- `email`: email valido
- `password`: minimo de 6 caracteres
- `role`: apenas `admin` ou `user`
- `login`
- `email`: email valido
- `password`: minimo de 6 caracteres
- `forgot-password`
- `email`: email valido
- `reset-password`
- `newPassword`: minimo de 6 caracteres
- `token` nos params: obrigatorio

Em caso de erro de validacao, a API responde com status `400` e um array em `details`.

## Upload de imagem

Configuracao atual do Multer:

- salva arquivos em `uploads/`
- limite de 5 MB
- aceita `image/jpeg`, `image/png` e `image/webp`

Campo esperado na rota:

```text
photo_profile
```

## Comandos uteis do Prisma

O `package.json` ainda nao possui scripts dedicados para o Prisma, mas estes comandos sao uteis no desenvolvimento:

```bash
npx prisma generate
npx prisma migrate dev
```

## Estado atual do projeto

A base de usuarios esta funcional, mas ainda nao ha:

- middleware de autenticacao para proteger rotas
- middleware de autorizacao por papel
- CRUD de posts
- CRUD de comentarios
- CRUD de likes
- tratamento centralizado de erros
- testes automatizados
- documentacao OpenAPI ou Swagger

## Observacoes importantes

- o projeto usa `"type": "module"` no `package.json`
- o Prisma Client e gerado em `src/generated/prisma`
- o diretorio `uploads/` funciona como armazenamento temporario
- o diretorio de schemas esta nomeado como `shema`, sem o `c`
