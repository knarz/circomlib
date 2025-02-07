const TestRPC = require("ganache-cli");
const Web3 = require("web3");
const chai = require("chai");
const mimcGenContract = require("../src/mimcsponge_gencontract.js");
const mimcjs = require("../src/mimcsponge.js");


const assert = chai.assert;
const log = (msg) => { if (process.env.MOCHA_VERBOSE) console.log(msg); };

const SEED = "mimcsponge";

describe("MiMC Sponge Smart contract test", () => {
    let testrpc;
    let web3;
    let mimc;
    let accounts;

    before(async () => {
        testrpc = TestRPC.server({
            ws: true,
            gasLimit: 5800000,
            total_accounts: 10,
        });

        testrpc.listen(8546, "127.0.0.1");

        web3 = new Web3("ws://127.0.0.1:8546");
        accounts = await web3.eth.getAccounts();
    });

    after(async () => testrpc.close());

    it("Should deploy the contract", async () => {
        const C = new web3.eth.Contract(mimcGenContract.abi);

        mimc = await C.deploy({
            data: mimcGenContract.createCode(SEED, 220)
        }).send({
            gas: 3500000,
            from: accounts[0]
        });
    });

    it("Shold calculate the mimc correctly", async () => {
        const res = await mimc.methods.MiMCSponge(1,2,3).call();
        const res2 = await mimcjs.hash(1,2,3);

        assert.equal(res.xL.toString(), res2.xL.toString());
        assert.equal(res.xR.toString(), res2.xR.toString());
    });
});

