# API Blog

API backend de um projeto de blog construida com Node.js, TypeScript, Express e Prisma.

No estado atual, o projeto ja possui:

- servidor HTTP com Express
- conexao com PostgreSQL via Prisma
- cadastro de usuario
- listagem de usuarios
- login com geracao de token JWT
- validacao de dados com `zod`
- upload de imagem de perfil com `multer`
- envio da imagem para o Cloudinary
- hash de senha com `bcrypt`

## Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Multer
- Cloudinary
- Bcrypt
- JSON Web Token
- Zod
- TSX

## Estrutura Atual

```text
api-blog/
|-- prisma/
|   `-- schema.prisma
|-- src/
|   |-- config/
|   |   |-- cloudinary.ts
|   |   `-- multer.ts
|   |-- controllers/
|   |   `-- user/
|   |       |-- listUsersController.ts
|   |       |-- loginUserController.ts
|   |       `-- registerUserController.ts
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
|   |       |-- listUsersService.ts
|   |       |-- loginUserService.ts
|   |       `-- registerUserService.ts
|   |-- shema/
|   |   `-- userShema.ts
|   `-- server.ts
|-- uploads/
|-- .env
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Requisitos

- Node.js instalado
- npm instalado
- banco PostgreSQL disponivel
- conta Cloudinary configurada

## Variaveis de Ambiente

Crie um arquivo `.env` com as variaveis abaixo:

```env
DATABASE_URL="postgresql://usuario:senha@host:porta/database?sslmode=require"
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
JWT_SECRET=sua_chave_secreta
PORT=3333
```

## Instalacao

```bash
npm install
```

## Como Executar

Para iniciar a API em desenvolvimento:

```bash
npm run dev
```

Servidor disponivel em:

```text
http://localhost:3333
```

## Scripts

- `npm run dev`: inicia o servidor com recarregamento automatico usando `tsx watch`

## Arquitetura

O projeto segue uma separacao simples por responsabilidade:

- `routes`: define os endpoints da API
- `controllers`: recebe a requisicao HTTP e chama a regra de negocio
- `services`: executa a logica da aplicacao
- `middlewares`: trata comportamentos compartilhados, como validacao
- `config`: centraliza configuracoes externas
- `database`: instancia o client do Prisma

## Banco de Dados

O schema atual possui as entidades:

- `User`
- `Post`
- `Media`
- `Comment`
- `Like`

Relacionamentos principais:

- um usuario pode ter varios posts
- um usuario pode ter varios comentarios
- um usuario pode ter varias curtidas
- um post pode ter varias midias
- um post pode ter varios comentarios
- um post pode ter varias curtidas

O campo `photo_profile` foi adicionado ao model `User` para armazenar a URL da imagem enviada ao Cloudinary.

## Endpoints Disponiveis

### `POST /register`

Cria um novo usuario. O endpoint espera `multipart/form-data` quando houver imagem.

Campos aceitos:

- `name`
- `email`
- `password`
- `role`
- `photo_profile` -> arquivo de imagem

Fluxo implementado:

1. a rota recebe os dados do usuario
2. o `multer` processa o arquivo enviado no campo `photo_profile`
3. o middleware `validateSchema` valida os dados com `zod`
4. o controller encaminha os dados para o service
5. o service faz hash da senha com `bcrypt`
6. se houver imagem, o arquivo temporario e enviado ao Cloudinary
7. a URL retornada e salva em `photo_profile`
8. o usuario e criado no banco com Prisma

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3333/register \
  -F "name=Janie" \
  -F "email=janie@example.com" \
  -F "password=123456" \
  -F "role=user" \
  -F "photo_profile=@foto.png"
```

Exemplo de resposta:

```json
{
  "id": "uuid-do-usuario",
  "name": "Janie",
  "email": "janie@example.com",
  "createdAt": "2026-03-25T12:00:00.000Z",
  "photo_profile": "https://res.cloudinary.com/..."
}
```

### `GET /users`

Lista os usuarios cadastrados.

Comportamento atual:

- retorna os usuarios ordenados pelos mais recentes
- nao expoe o campo `password`
- retorna `id`, `name`, `email`, `role`, `photo_profile` e `createdAt`

Exemplo com `curl`:

```bash
curl http://localhost:3333/users
```

Exemplo de resposta:

```json
[
  {
    "id": "uuid-do-usuario",
    "name": "Janie",
    "email": "janie@example.com",
    "role": "user",
    "photo_profile": "https://res.cloudinary.com/...",
    "createdAt": "2026-03-25T12:00:00.000Z"
  }
]
```

### `POST /login`

Autentica um usuario com email e senha.

Campos aceitos:

- `email`
- `password`

Comportamento atual:

- busca o usuario pelo email
- compara a senha com `bcrypt`
- gera um token JWT com `name` e `role`
- define o `subject` do token com o `id` do usuario
- usa expiracao de `15d`

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"janie@example.com\",\"password\":\"123456\"}"
```

Exemplo de resposta:

```json
"token:seu.jwt.aqui"
```

Em caso de credenciais invalidas, a API responde com status `400`.

## Validacao

O projeto usa `zod` para validar os dados de entrada antes de chegar aos controllers.

Regras atuais de `POST /register`:

- `name`: minimo de 3 caracteres
- `email`: precisa ser valido
- `password`: minimo de 6 caracteres
- `role`: aceita apenas `admin` ou `user`

Regras atuais de `POST /login`:

- `email`: precisa ser valido
- `password`: minimo de 6 caracteres

Em caso de erro de validacao, a API responde com status `400`.

## Upload de Imagem

O upload foi implementado da seguinte forma:

- o `multer` salva temporariamente o arquivo na pasta `uploads/`
- o service envia o arquivo para o Cloudinary
- depois do processamento, o arquivo local temporario e removido

Campo esperado na rota:

```text
photo_profile
```

Se o frontend enviar outro nome de campo, `req.file` nao sera preenchido.

## Arquivos Principais

- `src/server.ts`: inicializacao do Express
- `src/routes/routes.ts`: rotas `POST /register`, `GET /users` e `POST /login`
- `src/controllers/user/registerUserController.ts`: controller de cadastro
- `src/controllers/user/listUsersController.ts`: controller de listagem de usuarios
- `src/controllers/user/loginUserController.ts`: controller de login
- `src/services/user/registerUserService.ts`: regra de negocio de cadastro e upload
- `src/services/user/listUsersService.ts`: regra de negocio da listagem de usuarios
- `src/services/user/loginUserService.ts`: autenticacao e geracao do JWT
- `src/middlewares/validateSchema.ts`: validacao de entrada com `zod`
- `src/config/cloudinary.ts`: configuracao do Cloudinary
- `src/config/multer.ts`: configuracao do upload de arquivos
- `src/database/db.ts`: conexao Prisma com PostgreSQL
- `src/shema/userShema.ts`: schemas de validacao das rotas de usuario
- `prisma/schema.prisma`: models do banco

## Estado Atual do Projeto

A API ja cobre a base inicial de usuarios, mas ainda nao possui:

- middleware de autenticacao para proteger rotas
- middleware de autorizacao por `role`
- tratamento centralizado de erros
- CRUD de posts
- CRUD de comentarios
- upload de midia para posts
- testes automatizados

## Proximos Passos Sugeridos

- proteger rotas privadas com verificacao do JWT
- implementar middleware de autorizacao por `role`
- adicionar paginacao na listagem de usuarios
- padronizar a resposta do login para retornar objeto com token
- implementar CRUD de posts
- documentar a API com Swagger ou Insomnia/Postman
- adicionar testes unitarios e de integracao

## Observacoes

- o projeto usa `"type": "module"` no `package.json`
- o Prisma Client esta sendo gerado em `src/generated/prisma`
- o diretorio `uploads/` e usado como armazenamento temporario antes do envio ao Cloudinary

## Autor

Projeto `api-blog`.
