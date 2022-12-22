const { spawnSync } = require('node:child_process'); 

const DiffMatchPatch = require('diff-match-patch');
const dmp = new DiffMatchPatch();

const errorResponse = {
    error_description: 'Is currently unable to handle this request.'
};

let responseCode = 500;
let resposta = errorResponse;

exports.createKeys = (req, res) => {

    let keys = [];
    let pubpvt_keys = spawnSync('freechains', ['keys', 'pubpvt', req.body.passphrase], { encoding : 'utf8' });

    if (pubpvt_keys.status == 1) {
        responseCode = 502;
        errorResponse.error_description = pubpvt_keys.stderr.replace('\n', '');
        resposta = errorResponse;
    } else {
        responseCode = 201;
        keys = pubpvt_keys.stdout.split(" ");
        resposta = {
            pubkey: keys[0],
            prikey: keys[1].replace('\n', ''),
        };
    };
    return res.status(responseCode).json(resposta);
};

exports.createPatch = (req, res) => {
    
    let patchText = dmp.patch_toText(dmp.patch_make(req.body.originalText, req.body.newText));

    if( patchText ) {
        return res.status(200).json(patchText);
    } else {
        errorResponse.error_description = "Os textos são iguais!"
        return res.status(400).json(errorResponse);
    };
};

exports.createWiki = (req, res) => {

    let join_out = spawnSync('freechains', ['chains','join', req.body.chain, req.body.key], { encoding : 'utf8' });

    if (join_out.status == 1) {
        errorResponse.error_description = join_out.stderr.replace('\n', '');
        let test = errorResponse.error_description.indexOf("chain already exists");
        if (test  !== -1 ) {
            responseCode = 409;
        } else {
            responseCode = 502;
        };
        resposta = errorResponse;
    } else {
        responseCode = 201;
        resposta = join_out.stdout.replace('\n', '');
    };
    return res.status(responseCode).json(resposta);
};
    

