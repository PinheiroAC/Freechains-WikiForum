const { spawnSync } = require('node:child_process');

const crypto = require('crypto');

const DiffMatchPatch = require('diff-match-patch');
const dmp = new DiffMatchPatch();

const newArticle = {
    header: {
        title: '',
        titleURI: '',
        hash: '',
        back: ''
    },
    body: ''
};

const articleResponse = {
    title: '',
    titleURI: '',
    titleId: '',
    postId: '',
    links: []
};

const lista = {
    total: 0,
    articles: []
};

const errorResponse = {
    error_description: 'Is currently unable to handle this request.'
};

let responseCode = 500;
let resposta = errorResponse;

exports.getTitles = (req, res) => {

    let chain = `#${req.params.chain}`;

    let consensus = spawnSync('freechains', ['chain', chain, 'consensus'], { encoding : 'utf8' });
    let last, index, payload, payloadJson;
    let hashes = cadeia = [];
    
    lista.total = 0;
    lista.articles = [];
     
    if (consensus.status == 1) {
        responseCode = 502;
        errorResponse.error_description = consensus.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        cadeia = consensus.stdout.replace('\n', '').split(" ");
        last = cadeia.length -1;

        for (let i = last; i > 0; i--) {
            
            payload = spawnSync('freechains', ['chain', chain,'get','payload', cadeia[i] ], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                lista.total = -1;
                break;
            } else if (payload.stdout.length == 0) {continue;};
            payloadJson = JSON.parse(payload.stdout);
            index = hashes.indexOf(payloadJson.header.hash);
            if ( index == -1 ) {
                hashes.push(payloadJson.header.hash);
                lista.total +=1;
                lista.articles.push( {
                    title: payloadJson.header.title,
                    titleURI: payloadJson.header.titleURI,
                    hash: payloadJson.header.hash,
                    postList: [cadeia[i] ]
                } );
            } else {
                lista.articles[index].postList.push(cadeia[i]);
            };
        }
        resposta = lista;

        if ( lista.total == -1) {
            resposta = errorResponse;
        } else if ( lista.total == 0) {
            responseCode = 404;
        } else {
            responseCode = 200;
        };
    }
  
    return res.status(responseCode).json(resposta);
  
};

exports.createTitle = (req, res) => {

    let chain = `#${req.params.chain}`;
    let pvtkey = '--sign='.concat(req.body.pvtkey);

    newArticle.header.title = req.body.article.title;
    newArticle.header.titleURI = encodeURIComponent(req.body.article.title);
    newArticle.header.hash = crypto.createHash('sha256').update(req.body.article.title.concat(Date.now())).digest('hex');
    newArticle.header.back = null;
    newArticle.body = req.body.article.body;
    
    let postagem = JSON.stringify(newArticle);

    let baseUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}/${newArticle.header.titleURI}`;
        
    let freechainsPost = spawnSync('freechains', ['chain', chain,'post', 'inline', postagem, pvtkey], { encoding : 'utf8' });

    if (freechainsPost.status == 1) {
        responseCode = 502;
        errorResponse.error_description = freechainsPost.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        responseCode = 201;

        articleResponse.links = [];
        
        articleResponse.title = newArticle.header.title;
        articleResponse.titleURI = newArticle.header.titleURI;
        articleResponse.titleId = newArticle.header.hash;
        articleResponse.postId = freechainsPost.stdout.replace('\n', '');
        articleResponse.links[0] = {
            href: `${baseUrl}/${articleResponse.postId}`,
            rel: 'self',
            method: 'GET'
        };
        articleResponse.links[1] = {
            href: baseUrl,
            rel: 'article',
            method: 'GET'
        };
        articleResponse.links[2] = {
            href: baseUrl,
            rel: 'edit',
            method: 'PUT'
        };
        articleResponse.links[3] = {
            href: `${baseUrl}/like/${articleResponse.postId}`,
            rel: 'like',
            method: 'POST'
        };
        articleResponse.links[4] = {
            href: `${baseUrl}/dislike/${articleResponse.postId}`,
            rel: 'dislike',
            method: 'POST'
        };

        resposta = articleResponse;
    };

    return res.status(responseCode).json(resposta);
};

exports.getBlockeds = (req, res) => {

    let chain = `#${req.params.chain}`;
    
    let last, blockeds, payload, payloadJson, baseUrl;

    let headsBlocked = spawnSync('freechains', ['chain', chain,'heads','blocked'], { encoding : 'utf8' });
    
    lista.total = 0;
    lista.articles = [];
    
    if (headsBlocked.status == 1) {
        responseCode = 502;
        errorResponse.error_description = headsBlocked.stderr.replace('\n', '');
        resposta = errorResponse;
    } else if (headsBlocked.stdout.length == 0) {
        responseCode = 404;
        errorResponse.error_description = 'Não há dados para essa consulta!';
        resposta = errorResponse;
    } else {
        blockeds = headsBlocked.stdout.replace('\n', '').split(" ");
        last = blockeds.length;
        for (let i = 0; i < last; i++) {
            payload = spawnSync('freechains', ['chain', chain,'get','payload', blockeds[i] ], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                lista.total = -1;
                break;
            } else if (payload.stdout.length == 0) {
                continue;
            } else {
                payloadJson = JSON.parse(payload.stdout);

                baseUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}/${payloadJson.header.titleURI}`;
                baseUrl = baseUrl.replace('/blockeds', '');
                
                lista.total = lista.articles.push({
                    title: payloadJson.header.title,
                    titleURI: payloadJson.header.titleURI,
                    titleId: payloadJson.header.hash,
                    postId: blockeds[i],
                    body: payloadJson.body,
                    links: [
                        { href: baseUrl, rel: 'article', method: 'GET'},
                        { href: `${baseUrl}/like/${blockeds[i]}`, rel: 'like', method: 'POST'},
                        { href: `${baseUrl}/dislike/${blockeds[i]}`, rel: 'dislike', method: 'POST'},
                    ]
                });
            };
        }
        resposta = lista;

        if ( lista.total == -1) {
            resposta = errorResponse;
        } else if ( lista.total == 0) {
            responseCode = 404;
        } else {
            responseCode = 200;
        };
    };

    return res.status(responseCode).json(resposta);
};  

exports.getOneTitle = (req, res) => {

    let chain = `#${req.params.chain}`;
    let titleURI = req.params.titleURI;

    let consensus = spawnSync('freechains', ['chain', chain, 'consensus'], { encoding : 'utf8' });
    let last, payload, payloadJson;
    let cadeia = [];

    lista.total = 0;
    lista.articles = [];
     
    if (consensus.status == 1) {
        responseCode = 502;
        errorResponse.error_description = consensus.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        cadeia = consensus.stdout.replace('\n', '').split(" ");
        last = cadeia.length -1;
        for (let i = last; i > 0; i--) {
            payload = spawnSync('freechains', ['chain', chain,'get','payload', cadeia[i] ], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                lista.total = -1;
                break;
            } else if (payload.stdout.length == 0) { continue; };
            payloadJson = JSON.parse(payload.stdout);
            if ( payloadJson.header.titleURI != titleURI && payloadJson.header.title != titleURI ) { continue; };
            lista.total = lista.articles.push(payloadJson);
            if (lista.total == 1) {articleResponse.postId = cadeia[i];};
            if ( payloadJson.header.back == null) { break; };
        }
        if ( lista.total == -1) {
            resposta = errorResponse;
        } else if ( lista.total == 0) {
            responseCode = 404;
            errorResponse.error_description = `${titleURI} not found!`;
            resposta = errorResponse;
        } else if (payloadJson.header.back != null) {
            responseCode = 500;
            resposta = {
                error_description: 'Original article is missing. Cannot apply a diff whitout its original!',
                article_log: lista
            };
        } else {
            let patched = [];
            let patches;
            last = lista.total -2;
            for (let i = last; i > -1; i--) {
                patches = dmp.patch_fromText(lista.articles[i].body);
                patched = dmp.patch_apply(patches,payloadJson.body);
                payloadJson.body = patched[0];
            };
            responseCode = 200;

            baseUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
            articleResponse.links = [];

            articleResponse.title = payloadJson.header.title;
            articleResponse.titleURI = payloadJson.header.titleURI;
            articleResponse.titleId = payloadJson.header.hash;
            articleResponse.links[0] = {
                href: `${baseUrl}${articleResponse.postId}`,
                rel: 'self',
                method: 'GET'
            };
            articleResponse.links[1] = {
                href: baseUrl,
                rel: 'edit',
                method: 'PUT'
            };
            articleResponse.links[2] = {
                href: `${baseUrl}like`,
                rel: 'like',
                method: 'POST'
            };
            articleResponse.links[3] = {
                href: `${baseUrl}dislike`,
                rel: 'dislike',
                method: 'POST'
            };

            
            resposta = { body: payloadJson.body, article: articleResponse };
        };
    };
    return res.status(responseCode).json(resposta);
};

exports.getAny = (req, res) => {

    let chain = `#${req.params.chain}`;
    let titleURI = req.params.titleURI;
    let postId = req.params.postId;

    let consensus = spawnSync('freechains', ['chain', chain, 'consensus'], { encoding : 'utf8' });
    let last, payload, payloadJson;
    let cadeia = [];

    lista.total = 0;
    lista.articles = [];
     
    if (consensus.status == 1) {
        responseCode = 502;
        errorResponse.error_description = consensus.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        cadeia = consensus.stdout.replace('\n', '').split(" ");
        last = cadeia.lastIndexOf(postId);
        for (let i = last; i > 0; i--) {
            payload = spawnSync('freechains', ['chain', chain,'get','payload', cadeia[i] ], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                lista.total = -1;
                break;
            } else if (payload.stdout.length == 0) { continue; };
            payloadJson = JSON.parse(payload.stdout);
            if ( payloadJson.header.titleURI != titleURI && payloadJson.header.title != titleURI ) { continue; };
            lista.total = lista.articles.push(payloadJson);
            if (lista.total == 1) {articleResponse.postId = cadeia[i];};
            if ( payloadJson.header.back == null) { break; };
        }
        if ( lista.total == -1) {
            resposta = errorResponse;
        } else if ( lista.total == 0) {
            responseCode = 404;
            errorResponse.error_description = `${titleURI} not found!`;
            resposta = errorResponse;
        } else if (payloadJson.header.back != null) {
            responseCode = 500;
            resposta = {
                error_description: 'Original article is missing. Cannot apply a diff whitout its original!',
                article_log: lista
            };
        } else {
            let patched = [];
            let patches;
            last = lista.total -2;
            for (let i = last; i > -1; i--) {
                patches = dmp.patch_fromText(lista.articles[i].body);
                patched = dmp.patch_apply(patches,payloadJson.body);
                payloadJson.body = patched[0];
            }
            responseCode = 200;
            
            baseUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl.replace(postId,'')}`;
            console.log(baseUrl);
            articleResponse.links = [];

            articleResponse.title = payloadJson.header.title;
            articleResponse.titleURI = payloadJson.header.titleURI;
            articleResponse.titleId = payloadJson.header.hash;
            articleResponse.links[0] = {
                href: baseUrl,
                rel: 'article',
                method: 'GET'
            };
            articleResponse.links[1] = {
                href: `${baseUrl}like/${postId}`,
                rel: 'like',
                method: 'POST'
            };
            articleResponse.links[2] = {
                href: `${baseUrl}dislike/${postId}`,
                rel: 'dislike',
                method: 'POST'
            };

            resposta = { body: payloadJson.body, article: articleResponse };
        };
    };
    return res.status(responseCode).json(resposta);
};

exports.likeTitle = (req, res) => {

    let chain = `#${req.params.chain}`;
    let titleURI = req.params.titleURI;
    let pvtkey = '--sign='.concat(req.body.pvtkey);

    let consensus = spawnSync('freechains', ['chain', chain, 'consensus'], { encoding : 'utf8' });
    let last, payload, payloadJson;
    let hash = -1;
    let cadeia = [];
     
    if (consensus.status == 1) {
        responseCode = 502;
        errorResponse.error_description = consensus.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        cadeia = consensus.stdout.replace('\n', '').split(" ");
        last = cadeia.length -1;
        for (let i = last; i > 0; i--) {
            payload = spawnSync('freechains', ['chain', chain,'get','payload', cadeia[i] ], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                break;
            } else if (payload.stdout.length == 0) { continue; };
            payloadJson = JSON.parse(payload.stdout);
            if ( payloadJson.header.titleURI == titleURI || payloadJson.header.title == titleURI) {
                hash = cadeia[i];
                break;
            };
        };
        if (responseCode == 502) {
            resposta = errorResponse;
        } else if ( hash == -1 ) {
            responseCode = 404;
            errorResponse.error_description = `${titleURI} not found!`;
            resposta = errorResponse;
        } else {
            payload = spawnSync('freechains', ['chain', chain,'like', hash, pvtkey], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                resposta = errorResponse;
            } else {
                responseCode = 200;
                resposta = {message: comando.stdout.replace('\n', '') };
            };
        };
    };
    return res.status(responseCode).json(resposta);
};

exports.likeOne = (req, res) => {

    let chain = `#${req.params.chain}`;
    let titleURI = req.params.titleURI;
    let postId = req.params.postId;
    let pvtkey = '--sign='.concat(req.body.pvtkey);

    payload = spawnSync('freechains', ['chain', chain,'like', postId, pvtkey], { encoding : 'utf8' });
     
    if (payload.status == 1) {
        responseCode = 502;
        errorResponse.error_description = payload.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        responseCode = 200;
        resposta = {message: payload.stdout.replace('\n', '') };
    };
    return res.status(responseCode).json(resposta);
};

exports.dislikeTitle = (req, res) => {

    let chain = `#${req.params.chain}`;
    let titleURI = req.params.titleURI;
    let pvtkey = '--sign='.concat(req.body.pvtkey);

    let consensus = spawnSync('freechains', ['chain', chain, 'consensus'], { encoding : 'utf8' });
    let last, payload, payloadJson;
    let hash = -1;
    let cadeia = [];
     
    if (consensus.status == 1) {
        responseCode = 502;
        errorResponse.error_description = consensus.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        cadeia = consensus.stdout.replace('\n', '').split(" ");
        last = cadeia.length -1;
        for (let i = last; i > 0; i--) {
            payload = spawnSync('freechains', ['chain', chain,'get','payload', cadeia[i] ], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                break;
            } else if (payload.stdout.length == 0) { continue; };
            payloadJson = JSON.parse(payload.stdout);
            if ( payloadJson.header.titleURI == titleURI || payloadJson.header.title == titleURI) {
                hash = cadeia[i];
                break;
            };
        };
        if (responseCode == 502) {
            resposta = errorResponse;
        } else if ( hash == -1 ) {
            responseCode = 404;
            errorResponse.error_description = `${titleURI} not found!`;
            resposta = errorResponse;
        } else {
            payload = spawnSync('freechains', ['chain', chain,'dislike', hash, pvtkey], { encoding : 'utf8' });
            if (payload.status == 1) {
                responseCode = 502;
                errorResponse.error_description = payload.stderr.replace('\n', '');
                resposta = errorResponse;
            } else {
                responseCode = 200;
                resposta = {message: comando.stdout.replace('\n', '') };
            };
        };
    };
    return res.status(responseCode).json(resposta);
};

exports.dislikeOne = (req, res) => {

    let chain = `#${req.params.chain}`;
    let titleURI = req.params.titleURI;
    let postId = req.params.postId;
    let pvtkey = '--sign='.concat(req.body.pvtkey);

    payload = spawnSync('freechains', ['chain', chain,'dislike', postId, pvtkey], { encoding : 'utf8' });
     
    if (payload.status == 1) {
        responseCode = 502;
        errorResponse.error_description = payload.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        responseCode = 200;
        resposta = {message: payload.stdout.replace('\n', '') };
    };
    return res.status(responseCode).json(resposta);
};

exports.updateOne = (req, res) => {

    let chain = `#${req.params.chain}`;
    let pvtkey = '--sign='.concat(req.body.pvtkey);

    newArticle.header.title = req.body.article.title;
    newArticle.header.titleURI = req.body.article.titleURI;
    newArticle.header.hash = req.body.article.titleId;
    newArticle.header.back = req.body.article.back;
    newArticle.body = req.body.article.body;
    
    let postagem = JSON.stringify(newArticle);

    let baseUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}/${newArticle.header.titleURI}`;
        
    let freechainsPost = spawnSync('freechains', ['chain', chain,'post', 'inline', postagem, pvtkey], { encoding : 'utf8' });

    if (freechainsPost.status == 1) {
        responseCode = 502;
        errorResponse.error_description = freechainsPost.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        responseCode = 200;

        articleResponse.links = [];
        
        articleResponse.title = newArticle.header.title;
        articleResponse.titleURI = newArticle.header.titleURI;
        articleResponse.titleId = newArticle.header.hash;
        articleResponse.postId = freechainsPost.stdout.replace('\n', '');
        articleResponse.links[0] = {
            href: `${baseUrl}/${articleResponse.postId}`,
            rel: 'self',
            method: 'GET'
        };
        articleResponse.links[1] = {
            href: baseUrl,
            rel: 'article',
            method: 'GET'
        };
        articleResponse.links[2] = {
            href: baseUrl,
            rel: 'edit',
            method: 'PUT'
        };
        articleResponse.links[3] = {
            href: `${baseUrl}/like/${articleResponse.postId}`,
            rel: 'like',
            method: 'POST'
        };
        articleResponse.links[4] = {
            href: `${baseUrl}/dislike/${articleResponse.postId}`,
            rel: 'dislike',
            method: 'POST'
        };

        resposta = articleResponse;
    };

    return res.status(responseCode).json(resposta);


};
