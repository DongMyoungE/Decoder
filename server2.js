//
import morgan from "morgan";
//
import express from "express"
import cors from "cors"
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getNft } from "./getNFT_Metadata.js";

const app = express();
const logger = morgan("combined")
const PORT = 3001;

app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/:walletPubkeyStr([0-9a-zA-Z]{40,50})", async (req, res) => {
    const tokenArrayWithMeta = async (tokenArray) => {
        const rawMetadata = await Promise.all(
            tokenArray.map((element) => getNft(element))
        );
        return rawMetadata;
    };
    const connection = new Connection("https://api.devnet.solana.com/", "confirmed")
    const { walletPubkeyStr } = req.params;
    const walletParsedInfo = await connection.getParsedTokenAccountsByOwner(new PublicKey(walletPubkeyStr), { programId: TOKEN_PROGRAM_ID }, "confirmed");
    const tokenArray = walletParsedInfo.value.filter((element) => element.account.data.parsed.info.tokenAmount.amount === "1").map(
        (element) => element.account.data.parsed.info.mint
    );
    res.json((await tokenArrayWithMeta(tokenArray)))
})

app.get("/image/:mintPubkeyStr([0-9a-zA-Z]{40,50})", async (req, res) => {
    const { mintPubkeyStr } = req.params;
    const rawMetadata = await getNft(mintPubkeyStr);
    res.json({ imageUrl: rawMetadata.image })
});

app.listen(PORT, () => {
    console.log(`✅OK. Server is Connected! app listening at http://localhost:${PORT}`)
});
