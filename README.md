# Freechains-WikiForum
Atividade 3.6 da Disciplina Tópicos Especiais em Redes de Telecomunicações - Sistemas Peer-to-Peer: Protótipo de uma aplicação P2P usando o sistema de reputação do Freechains... 

## P2P - Protótipo de aplicação P2P usando o sistema de reputação do [Freechains](https://github.com/Freechains/README)

Protótipo da atividade 3.5 da Disciplina Tópicos Especiais em Redes de Telecomunicações - Sistemas Peer-to-Peer. <br><br>

### Atividade 3.6 - [proj] _Crie uma aplicação P2P usando o sistema de reputação do Freechains..._ 
##### A aplicação deve:
- se adaptar às regras do protocolo, que não deve ser alterado;
-  operar em um ambiente não permissionado, no qual os usuários podem entrar e sair (incluindo os pioneiros);
- ser mais sofisticada que um simples fórum público de mensagens nos quais os usuários avaliam postagens.
<hr>

### O Protótipo

Trata-se de uma API REST cujo objetivo é fornecer as requisições que o front-end da aplicação deve consumir para ser capaz de fornecer suas funcionalidades ao usuário final.

#### A Aplicação

Na Atividade 3.5 propusemos um fórum público cujo objetivo é, de modo colaborativo, compartilhar conhecimento, na forma de pequenos artigos, publicados em uma aplicação P2P semelhante a uma wiki.

Sua utilização será franqueada a qualquer usuário que poderá interagir, criando e consumindo conteúdo, sem necessitar de qualquer autorização para isso.

#### Interação e funcionamento

A aplicação, de modo transparente para seus usuários, será executada sobre um fórum público do freechains cujo sistema de reputação será responsável pelo consenso e manutenção da saúde das publicações e das interações entre seus usuários.

Usuários com reputação, automaticamente, poderão atuar como moderadores e, com isso, permitir a participação dos usuários sem reputação suficiente para realizar interações.

Cada artigo da wiki será uma postagem no freechains e seu conteúdo será estruturado de modo a obedecer a seguinte estrutura de dados {header {title, titleURI, hash, back}, body}  onde o título deverá ser único na aplicação.

#### Funcionalidades

A aplicação contará com as funcionalidades abaixo, cujo acesso deverá ser feito via menu na camada de aplicação, exceto para a manutenção de artigos, onde teremos algumas soluções para fornecer uma melhor usabilidade:

* Geração de chaves
    - Permite gerar as chaves assimétricas para interação na wiki
* Artigos - Finalidade principal da aplicação 
    - Criar, Listar, Editar, Remover e Ler artigos (o CRUD de artigos)
    - Interagir: Curtir e “Não Curtir”
    - Validar: permitir que usuários com reputação possam dar tratamento às postagem de usuários sem reputação
    - Manter: permitir que usuários com reputação possam tratamr conflitos de mesclagem de conteúdo, colisões nos títulos dos artigos e preservar a qualidade dos artigos.
* Configuração da aplicação
    - Permite configurar alguns parâmetros da aplicação
        +  Com persistência: Nome da cadeia e chave pública de seu pioneiro; os host de seus vizinhos;
        +  Sem persistência: a chave privada do usuário

#### A implementação

Para este protótipo implementou-se, apenas, o back-end e, somente, as requisições responsáveis por  suportar os serviços de manutenção e tratamento de artigos. São elas:

| Método | Descrição | _PATH_ |
| ------ | ------ | ------ |
| GET | Lista todos os títulos dos artigos | /wiki/v1/:chain/articles |
| POST | Cria um artigo | /wiki/v1/:chain/articles |
| GET | Lista as postagens bloqueadas | /wiki/v1/:chain/articles/blockeds |
| GET | Retorna a versao atual do artigo _titleURI_ | /wiki/v1/:chain/articles/:titleURI |
| PUT | Edita a versao o artigo _titleURI_ | /wiki/v1/:chain/articles/:titleURI |
| GET | Retorna a versao _postId_ do artigo _titleURI_ | /wiki/v1/:chain/articles/:titleURI/:postId |
| POST | Registra um _like_ no artigo | /wiki/v1/:chain/articles/:titleURI/like |
| POST | Registra um _like_ na versao _postId_ do artigo _titleURI_ | /wiki/v1/:chain/articles/:titleURI/like/postId |
| POST | Registra um _dislike_ no artigo _titleURI_ | /wiki/v1/:chain/articles/:titleURI/dislike |
| POST | Registra um _dislike_ na versao _postId_ do artigo _titleURI_ | /wiki/v1/:chain/articles/:titleURI/dislike/postId |

Além disso, as requisições não contam com estrutura de captura e tratamento de erros, proteção contra duplicação de artigo e tratamento de falhas na aplicação do _patch_ para remontar o texto dos artigos.

#### Ferramentas

O protótipo foi desenvolvido como uma API RESTful com Nodejs + express e, para otimizar o armazenamento dos artigos, utililzamos o pacote [diff-match-patch](https://www.npmjs.com/package/diff-match-patch) para, a cada aualização/edição de um artigo, armazenar, apenas, as diferenças introduzidas a cada edição.
<hr>

## Como executar

#### Pré-requisitos

- Instalar o [Freechains](https://github.com/Freechains/README#install).<br>
- Instalar o [Node.js](https://nodejs.org/pt-br/).<br>
- Clonar o projeto [Freechains-WikiForum](https://github.com/PinheiroAC/Freechains-WikiForum)

#### Rodar o protótipo

Iniciar o freechains e, no diretório do projeto, executar: `npm run dev` e teremos o protótipo rodando na porta 5000.<br>

A API pode ser executada no [Postman](https://www.postman.com/downloads/) com esta [collection](https://github.com/PinheiroAC/Freechains-WikiForum/blob/master/src/config/WIKI.postman_collection.json).

