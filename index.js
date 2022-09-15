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

const client = Client.forTestnet();
const tokenId = "0.0.48247328";

const stake = async (amount) => {
  console.log(`Staking with ${amount} HBAR`);
  const contractId = "0.0.48247334";
  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setPayableAmount(new Hbar(amount))
    .setFunction(
      "stake"
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

const unStake = async (amount) => {
  console.log(`unStaking with ${amount} HBARX`);
  const contractId = "0.0.48247334";
  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      "unStake",
      new ContractFunctionParameters().addUint256(amount * 10 ** 8)
    );

  const txEx = await transaction.execute(client);
  const txExRx = await txEx.getRecord(client);

  console.log(
    `Check you transaction at https://v2.explorer.kabuto.sh/transaction/${txExRx.transactionId}`
  );

  if (txExRx.receipt.status.toString() === "SUCCESS") {
    console.log(`You have successfully unStaked ${amount} HBARX`);
  } else {
    console.log(`Something went wrong. Please try again`);
  }
};

const withdraw = async (index) => {
  console.log(`withdrawing ${index} index`);
  const contractId = "0.0.48247333";
  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      'withdraw', 
      new ContractFunctionParameters().addUint256(index)
    );

  const txEx = await transaction.execute(client);
  const txExRx = await txEx.getRecord(client);

  console.log(
    `Check you transaction at https://v2.explorer.kabuto.sh/transaction/${txExRx.transactionId}`
  );

  if (txExRx.receipt.status.toString() === "SUCCESS") {
    console.log(`You have successfully withdrawn`);
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
          rl.question("what would you like to do stake/unstake/withdraw?(case sensitive) ", async (name) => {
          if(name == "stake"){
            rl.question("How much would you like to stake? ", async (amount) => {
              await stake(amount);
              await getBalance(operatorId);
              rl.close();
            });
          }
          else if(name=="unstake"){
            rl.question("How much would you like to unStake?(make sure you have HBARX) ", async (amount) => {
              await unStake(amount);
              await getBalance(operatorId);
              rl.close();
            });
          }
          else if(name=="withdraw"){
            rl.question("Whats the index of withdraw?(its from 0 to the number of time you unstaked -1, Please make sure you have unstaked and undelegate time has reached, its 24 hours) ", async (index) => {
              await withdraw(index);
              await getBalance(operatorId);
              rl.close();
            });
          }
          else{
            console.log("invalid input");
            rl.close();
          }
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
