import {
  AccountBalanceQuery,
  AccountId,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  PrivateKey,
} from "@hashgraph/sdk";
import readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = Client.forMainnet();
const tokenId = "0.0.834116";

const stake = async (operatorId, amount) => {
  console.log(`Staking with ${amount} HBAR`);
  const contractId = "0.0.834119";
  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setPayableAmount(new Hbar(amount))
    .setFunction(
      "stake",
      new ContractFunctionParameters().addAddress(
        operatorId.toSolidityAddress()
      )
    );

  const txEx = await transaction.execute(client);
  const txExRx = await txEx.getRecord(client);

  console.log(
    `Check you transaction at https://v2.explorer.kabuto.sh/transaction/${txExRx.transactionId}`
  );

  if (txExRx.receipt.status.toString() === "SUCCESS") {
    console.log(`You have successfully staked ${amount} HBAR`);
  } else {
    console.log(`Something went wrong. Please try again`);
  }
};

const getBalance = async (operatorId) => {
  const query = new AccountBalanceQuery().setAccountId(operatorId);
  const accountBalance = await query.execute(client);
  console.log(
    `- Account balance: ${accountBalance.hbars.toBigNumber().toString()}`
  );

  if (accountBalance.tokens) {
    const tokens = accountBalance.tokens;
    const hbarX = tokens.get(tokenId);

    if (hbarX) {
      console.log(`- Current HBARX balance: ${hbarX.toNumber() / 10 ** 8}`);
    } else {
      console.log(`- Current HBARX balance: 0`);
    }
  }
};
const main = async () => {
  try {
    rl.question("What is your account id? ", async (accountId) => {
      const operatorId = AccountId.fromString(accountId);
      rl.question(
        "What is your account Private key (We do not store or upload this key)? ",
        async (privateKey) => {
          const operatorKey = PrivateKey.fromString(privateKey);
          client.setOperator(operatorId, operatorKey);
          await getBalance(operatorId);
          rl.question("How much would you like to stake? ", async (amount) => {
            await stake(operatorId, amount);
            await getBalance(operatorId);
            rl.close();
          });
        }
      );
    });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    // console.log(e);
    process.exit(1);
  }
};

main();
