import { decodeMetadata } from './decodeMetadata.js';
import { PublicKey } from '@solana/web3.js';
import fetch from 'node-fetch';
const METADATA_PUBKEY = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
let m;
let postData;
export async function getNft(NFT_PUBLICKEY) {
    try {
        // input mint here
        let address = new PublicKey(NFT_PUBLICKEY);
        // let [pda, bump] = await PublicKey.findProgramAddress([
        let [pda] = await PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            METADATA_PUBKEY.toBuffer(),
            new PublicKey(address).toBuffer(),
        ], METADATA_PUBKEY);
        // console.log(pda.toBase58());
        const data = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAccountInfo",
            "params": [
                pda.toBase58(),
                {
                    "encoding": "base64"
                }
            ]
        };
        await fetch("https://api.devnet.solana.com", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        }).then((res) => res.json())
            .then((data) => {
                let buf = Buffer.from(data.result.value.data[0], 'base64');
                m = decodeMetadata(buf);
                // console.log(m)
            }).catch((e) => {console.log(e);});
        await fetch(m.data.uri).then((res) => res.json()).then((data) => {
            postData = data
            postData.mint = NFT_PUBLICKEY
            postData.level = postData.attributes.filter( (e) => e['trait_type'] === 'Level')[0]['value']
        })
        // console.log(postData)
        return postData
    }
    catch (e) {
        return e;
    }
}
