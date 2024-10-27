<template>
    <div>
        <h1> 账户信息 </h1>
        <p> 地址：{{ account.address }} </p>
        <p> 私钥：{{ account.privateKey }} </p>
        <p> 余额：{{ account.balance }}
            <van-button type="default" size="mini" plain round @click="updateBalance()">
                <van-icon name="circle" size="1rem" />
            </van-button>
        </p>

    </div>

    <div>
        <h1> 转账操作 </h1>
        <van-button type="primary" @click="transaction()">转账</van-button>
    </div>
</template>

<style lang="less" scoped>
div {
    background-color: #FAF4F4;
}
</style>
<script setup>
import { ref } from "vue"
import { Web3 } from "web3"
import { showToast } from 'vant';
import Tx from 'ethereumjs-tx'

// 实例化 web3
var web3 = new Web3(
    Web3.givenProvider || "wss://sepolia.infura.io/ws/v3/bd2d6aef434b4106a2e637e280eeb7a4"
);

// 执行账号创建
// let account = web3.eth.accounts.create('123321')

const account = ref({
    address: "0x5a5612E5d3A356b0EAd04c290F42E88623B20115",
    privateKey: "0x4309815e4926a43471b7c601f525b6f97a022a63f57edb155cc8358d3d7c5053",
    balance: -1,
})

const updateBalance = async () => {
    web3.eth.getBalance(account.value.address).then((res) => {
        // 结果转化为以太坊「 Eth 」
        account.value.balance = web3.utils.fromWei(res, 'ether');
    })
}

updateBalance();

// 转账
const transaction = async () => {
    // Step 1.构建转账参数
    // 获取账户交易次数
    let transactionNum = Number(await web3.eth.getTransactionCount(account.value.address));
    // 获取预计转账 gas
    let gasPrice = Number(await web3.eth.getGasPrice());
    // 转账金额转化至 wei
    let amount = Number(web3.utils.toWei('0.0001', 'ether'));

    // 检查账户余额
    let balance = await web3.eth.getBalance(account.value.address);
    if (balance <= 0) {
        showToast(`Account balance: ${balance}`);
        return;
    }
    // 获取 nonce
    const nonce = Number(await web3.eth.getTransactionCount(account.value.address, 'pending'));

    // 构建原始交易数据对象
    const rawTx = {
        from: account.value.address,
        to: "0xc9b9044352C5022028B42B46Eb9026b89404AE22",
        transactionNum,
        gasPrice,
        amount,
        data: "0x000000",
        nonce,
    }

    // Step 2. 生成序列化结果 
    // 转化私钥
    let privateKey = Buffer(account.value.privateKey.slice(2), 'hex')
    // gas 估算
    let gas = await web3.eth.estimateGas(rawTx);
    rawTx.gas = Number(gas); // 添加 gas 字段
    const tx = new Tx(rawTx); // 应用 ethereumjs-tx 完成私钥加密
    tx.sign(privateKey); // 使用私钥进行签名
    let serializedTx = `0x${tx.serialize().toString('hex')}`; // 生成序列化数据 结果转化成 16 进制字符串

    // Step 3. 执行转账
    let trans = web3.eth.sendSignedTransaction(serializedTx); // 生成交易对象
    // 监听交易状态
    trans.on('transactionHash', (txId) => {
        console.log('交易 hash id' + txId);
        console.log('https://sepolia.etherscan.io/tx/' + txId);
    })
    trans.on('receipt', (res) => {
        // 首次节点确认触发
        console.log('当前交易已被节点确认');
        console.log(res);
        updateBalance();
    })
    trans.on('confirmation', (res) => {
        // 节点二次确认触发
        console.log('当前交易已被节点二次确认');
        console.log(res);
        updateBalance();
    })
    updateBalance();
}
</script>
