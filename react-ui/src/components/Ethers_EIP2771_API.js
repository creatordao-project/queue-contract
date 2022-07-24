import React, { useState, useEffect } from "react";
import "../App.css";
import Button from "@material-ui/core/Button";
import {
    helperAttributes,
    getDomainSeperator,
    getDataToSignForPersonalSign,
    getDataToSignForEIP712,
    buildForwardTxRequest,
    getBiconomyForwarderConfig
  } from '../api-helpers/biconomyForwarderHelpers';
import {
    NotificationContainer,
    NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");


let config = {
    contract: {
        address: "0xa23f34dc40515ad4202074ff1682c008862eff0f",
        abi: [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newAdmin","type":"address"}],"name":"AdminUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_commissionIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_addedBid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newBid","type":"uint256"}],"name":"CommissionBidUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_commissionIndex","type":"uint256"},{"indexed":false,"internalType":"enum CreatorDAOCommissionStorage.CommissionStatus","name":"_status","type":"uint8"}],"name":"CommissionProcessed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_commissionIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_bid","type":"uint256"}],"name":"CommissionRescinded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_commissionIndex","type":"uint256"},{"indexed":false,"internalType":"enum CreatorDAOCommissionStorage.CommissionStatus","name":"_status","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"taxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payAmount","type":"uint256"}],"name":"CommissionSettled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_shopId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_newMinBid","type":"uint256"}],"name":"MinBidUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_commissionIndex","type":"uint256"},{"indexed":false,"internalType":"string","name":"_id","type":"string"},{"indexed":false,"internalType":"uint256","name":"_shopId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_bid","type":"uint256"},{"indexed":false,"internalType":"address","name":"_recipient","type":"address"}],"name":"NewCommission","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_newShopIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_minBid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_tax","type":"uint256"},{"indexed":false,"internalType":"address","name":"owner","type":"address"}],"name":"NewShop","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_shopId","type":"uint256"},{"indexed":false,"internalType":"address","name":"_newOwner","type":"address"}],"name":"OwnerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"OP_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_trustedForwarder","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"addAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"addOp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minBid","type":"uint256"},{"internalType":"uint256","name":"_tax","type":"uint256"},{"internalType":"address","name":"_owner","type":"address"}],"name":"addShop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"callStarted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_id","type":"string"},{"internalType":"uint256","name":"_shopId","type":"uint256"}],"name":"commission","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"commissions","outputs":[{"internalType":"address payable","name":"recipient","type":"address"},{"internalType":"uint256","name":"shopId","type":"uint256"},{"internalType":"uint256","name":"bid","type":"uint256"},{"internalType":"enum CreatorDAOCommissionStorage.CommissionStatus","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_commissionIndex","type":"uint256"}],"name":"increaseCommissionBid","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_admin","type":"address"},{"internalType":"address payable","name":"_recipientDao","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isOp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newCommissionIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newShopIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_commissionIndexes","type":"uint256[]"}],"name":"processCommissions","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"recipientDao","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_commissionIndex","type":"uint256"}],"name":"rescindCommission","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_commissionIndex","type":"uint256"}],"name":"rescindCommissionByAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"root","type":"address"}],"name":"setRoot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"trustedForwarder","type":"address"}],"name":"setTrustedForwarder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_commissionIndexes","type":"uint256[]"}],"name":"settleCommissions","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"shops","outputs":[{"internalType":"uint256","name":"minBid","type":"uint256"},{"internalType":"uint256","name":"tax","type":"uint256"},{"internalType":"address payable","name":"owner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address payable","name":"_newAdmin","type":"address"}],"name":"updateAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_shopId","type":"uint256"},{"internalType":"uint256","name":"_newMinBid","type":"uint256"}],"name":"updateMinBid","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_shopId","type":"uint256"},{"internalType":"address payable","name":"_newOwner","type":"address"}],"name":"updateShopOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_newRecipientDao","type":"address"}],"name":"updateTaxRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"}]},
    apiKey: {
        test: "Mq8d8Bbsr.aa8c344b-1c2d-4aae-a6a1-b8bcef26ea18",
        prod: "Mq8d8Bbsr.aa8c344b-1c2d-4aae-a6a1-b8bcef26ea18"
    },
    api: {
        test: "https://api.biconomy.io",
        prod: "https://api.biconomy.io"
    }
}

let ethersProvider,walletProvider, walletSigner;
let contract, contractInterface;

const useStyles = makeStyles((theme) => ({
    root: {
        '& > * + *': {
            marginLeft: theme.spacing(2),
        },
    },
    link: {
        marginLeft: "5px"
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        opacity: '.85!important',
        background: '#000'
    },
}));

let biconomy, userAddress;

function App() {
    const classes = useStyles();
    const [backdropOpen, setBackdropOpen] = React.useState(true);
    const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");
    const [quote, setQuote] = useState("This is a default quote");
    const [owner, setOwner] = useState("Default Owner Address");
    const [newQuote, setNewQuote] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
    const [metaTxEnabled] = useState(true);
    const [transactionHash, setTransactionHash] = useState("");

    const handleClose = () => {
        setBackdropOpen(false);
    };



    useEffect(() => {
        async function init() {
            if (
                typeof window.ethereum !== "undefined" &&
                window.ethereum.isMetaMask
            ) {
                // Ethereum user detected. You can now use the provider.
                const provider = window["ethereum"];
                await provider.enable();
                setLoadingMessage("Initializing Biconomy ...");
                // We're creating biconomy provider linked to your network of choice where your contract is deployed
                let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9c1bf8ba0af14b79a0b15ec7658238ed");
                biconomy = new Biconomy(jsonRpcProvider, {
                    walletProvider: window.ethereum,
                    apiKey: config.apiKey.prod,
                    debug: true
                });

                /*
                  This provider is linked to your wallet.
                  If needed, substitute your wallet solution in place of window.ethereum 
                */
                ethersProvider = new ethers.providers.Web3Provider(biconomy);
                walletProvider = new ethers.providers.Web3Provider(window.ethereum);
                walletSigner = walletProvider.getSigner();

                userAddress = await walletSigner.getAddress()
                setSelectedAddress(userAddress);

                biconomy.onEvent(biconomy.READY, async () => {

                    // Initialize your dapp here like getting user accounts etc
                    contract = new ethers.Contract(
                        config.contract.address,
                        config.contract.abi,
                        biconomy.getSignerByAddress(userAddress)
                    );

                    contractInterface = new ethers.utils.Interface(config.contract.abi);
                }).onEvent(biconomy.ERROR, (error, message) => {
                    // Handle error while initializing mexa
                    console.log("event heere");
                    console.log(message);
                    console.log(error);
                });
            } else {
                showErrorMessage("Metamask not installed");
            }
        }
        init();
    }, []);

    const onQuoteChange = event => {
        setNewQuote(event.target.value);
    };

    const onSubmitWithEIP712Sign = async () => {
      if (newQuote != "" && contract) {
        setTransactionHash("");
        if (metaTxEnabled) {
          console.log("Sending meta transaction");
          let userAddress = selectedAddress;

          let { data } = await contract.populateTransaction.setQuote(newQuote);
          let gasPrice = await ethersProvider.getGasPrice();
          let gasLimit = await ethersProvider.estimateGas({
            to: config.contract.address,
            from: userAddress,
            data: data,
          });
          console.log(gasLimit.toString());
          console.log(gasPrice.toString());

          let forwarder = await getBiconomyForwarderConfig(4);
          let forwarderContract = new ethers.Contract(
            forwarder.address,
            forwarder.abi,
            biconomy.getSignerByAddress(userAddress)
          );

          const batchNonce = await forwarderContract.getNonce(userAddress, 0);
          //const batchId = await forwarderContract.getBatch(userAddress);

          console.log(batchNonce);
          const to = config.contract.address;
          const gasLimitNum = Number(gasLimit.toNumber().toString());
          console.log(gasLimitNum);
          const batchId = 0;
          const req = await buildForwardTxRequest({
            account: userAddress,
            to,
            gasLimitNum,
            batchId,
            batchNonce,
            data,
          });
          console.log(req);

          const domainSeparator = await getDomainSeperator(4);
          console.log(domainSeparator);

          const dataToSign = await getDataToSignForEIP712(req, 4);
          walletProvider
            .send("eth_signTypedData_v3", [userAddress, dataToSign])
            .then(function (sig) {
              sendTransaction({
                userAddress,
                request:req,
                domainSeparator,
                sig,
                signatureType: "EIP712_SIGN",
              });
            })
            .catch(function (error) {
              console.log(error);
            });
        } else {
          console.log("Sending normal transaction");
          let tx = await contract.setQuote(newQuote);
          console.log("Transaction hash : ", tx.hash);
          showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
          let confirmation = await tx.wait();
          console.log(confirmation);
          setTransactionHash(tx.hash);

          showSuccessMessage("Transaction confirmed on chain");
        }
      } else {
        showErrorMessage("Please enter the quote");
      }
    };

    const onSubmitWithEIP712Sign2 = async () => {
      if ( contract) {
        setTransactionHash("");
        if (metaTxEnabled) {
          console.log("Sending meta transaction");
          let userAddress = selectedAddress;

          let { data } = await contract.populateTransaction.addShop(1,1,userAddress);
          console.log("data",data);
          let gasPrice = await ethersProvider.getGasPrice();
          let gasLimit = await ethersProvider.estimateGas({
            to: config.contract.address,
            from: userAddress,
            data: data,
          });
          console.log(gasLimit.toString());
          console.log(gasPrice.toString());

          let forwarder = await getBiconomyForwarderConfig(4);
          let forwarderContract = new ethers.Contract(
            forwarder.address,
            forwarder.abi,
            biconomy.getSignerByAddress(userAddress)
          );

          const batchNonce = await forwarderContract.getNonce(userAddress, 0);
          //const batchId = await forwarderContract.getBatch(userAddress);

          console.log(batchNonce);
          const to = config.contract.address;
          const gasLimitNum = Number(gasLimit.toNumber().toString());
          console.log(gasLimitNum);
          const batchId = 0;
          const req = await buildForwardTxRequest({
            account: userAddress,
            to,
            gasLimitNum,
            batchId,
            batchNonce,
            data,
          });
          console.log(req);

          const domainSeparator = await getDomainSeperator(4);
          console.log(domainSeparator);

          const dataToSign = await getDataToSignForEIP712(req, 4);
          walletProvider
            .send("eth_signTypedData_v3", [userAddress, dataToSign])
            .then(function (sig) {
              sendTransaction({
                userAddress,
                request:req,
                domainSeparator,
                sig,
                signatureType: "EIP712_SIGN",
              });
            })
            .catch(function (error) {
              console.log(error);
            });
        } else {
          console.log("Sending normal transaction");
          let tx = await contract.setQuote(newQuote);
          console.log("Transaction hash : ", tx.hash);
          showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
          let confirmation = await tx.wait();
          console.log(confirmation);
          setTransactionHash(tx.hash);

          showSuccessMessage("Transaction confirmed on chain");
        }
      } else {
        showErrorMessage("Please enter the quote");
      }
    };

    const onSubmitWithPersonalSign = async () => {
        if (newQuote != "" && contract) {
          setTransactionHash("");
          if (metaTxEnabled) {
            console.log("Sending meta transaction");
            let userAddress = selectedAddress;
  
            let { data } = await contract.populateTransaction.setQuote(newQuote);
            let gasPrice = await ethersProvider.getGasPrice();
            let gasLimit = await ethersProvider.estimateGas({
              to: config.contract.address,
              from: userAddress,
              data: data,
            });
            console.log(gasLimit.toString());
            console.log(gasPrice.toString());
  
            let forwarder = await getBiconomyForwarderConfig(4);
            let forwarderContract = new ethers.Contract(
              forwarder.address,
              forwarder.abi,
              biconomy.getSignerByAddress(userAddress)
            );
  
            const batchNonce = await forwarderContract.getNonce(userAddress, 0);
            //const batchId = await forwarderContract.getBatch(userAddress);
  
            console.log(batchNonce);
            const to = config.contract.address;
            const gasLimitNum = Number(gasLimit.toNumber().toString());
            console.log(gasLimitNum);
            const batchId = 0;
            const req = await buildForwardTxRequest({
              account: userAddress,
              to,
              gasLimitNum,
              batchId,
              batchNonce,
              data,
            });
            console.log(req);
  
  
            const hashToSign = getDataToSignForPersonalSign(req);
            walletSigner.signMessage(hashToSign)
            .then(function(sig){
              console.log('signature ' + sig);
              sendTransaction({userAddress, request:req, sig, signatureType:"PERSONAL_SIGN"});
            })
            .catch(function(error) {
                console.log(error)
              });


          } else {
            console.log("Sending normal transaction");
            let tx = await contract.setQuote(newQuote);
            console.log("Transaction hash : ", tx.hash);
            showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
            let confirmation = await tx.wait();
            console.log(confirmation);
            setTransactionHash(tx.hash);
  
            showSuccessMessage("Transaction confirmed on chain");
          }
        } else {
          showErrorMessage("Please enter the quote");
        }
      };

    const onSubmitWithPrivateKey = async () => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            try {
                if (metaTxEnabled) {
                    let privateKey = "bf096e6fb9754860c4c99eb336c0579db994a3ef7fb3f7db869ad2f1972fc755";
                    let userAddress = "0xf7AB2d00f379167c339691c23B23111eB598B3fb";
                    let userSigner = new ethers.Wallet(privateKey);
                    let { data } = await contract.populateTransaction.setQuote(newQuote);
                    let gasPrice = await ethersProvider.getGasPrice();
                    let gasLimit = await ethersProvider.estimateGas({
                      to: config.contract.address,
                      from: userAddress,
                      data: data,
                    });
                    console.log(gasLimit.toString());
                    console.log(gasPrice.toString());
          
                    let forwarder = await getBiconomyForwarderConfig(4);
                    let forwarderContract = new ethers.Contract(
                      forwarder.address,
                      forwarder.abi,
                      biconomy.getSignerByAddress(userAddress)
                    );
          
                    const batchNonce = await forwarderContract.getNonce(userAddress, 0);
                    //const batchId = await forwarderContract.getBatch(userAddress);
          
                    console.log(batchNonce);
                    const to = config.contract.address;
                    const gasLimitNum = Number(gasLimit.toNumber().toString());
                    console.log(gasLimitNum);
                    const batchId = 0;
                    const req = await buildForwardTxRequest({
                      account: userAddress,
                      to,
                      gasLimitNum,
                      batchId,
                      batchNonce,
                      data,
                    });
                    console.log(req);
          
                    const hashToSign = getDataToSignForPersonalSign(req);

                    const signature = await userSigner.signMessage(hashToSign);
                      sendTransaction({
                        userAddress,
                        request:req,
                        sig:signature,
                        signatureType: "PERSONAL_SIGN",
                      });

                    
                } else {
                    console.log("Sending normal transaction");
                    let tx = await contract.setQuote(newQuote);
                    console.log("Transaction hash : ", tx.hash);
                    showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
                    let confirmation = await tx.wait();
                    console.log(confirmation);
                    setTransactionHash(tx.hash);

                    showSuccessMessage("Transaction confirmed on chain");
                }
            } catch (error) {
                console.log(error);
                handleClose();
            }
        } else {
            showErrorMessage("Please enter the quote");
        }
    }

    const getQuoteFromNetwork = async () => {
        setLoadingMessage("Getting Quote from contact ...");
        let result = await contract.getQuote();
        if (
            result &&
            result.currentQuote != undefined &&
            result.currentOwner != undefined
        ) {
            if (result.currentQuote == "") {
                showErrorMessage("No quotes set on blockchain yet");
            } else {
                setQuote(result.currentQuote);
                setOwner(result.currentOwner);
            }
        } else {
            showErrorMessage("Not able to get quote information from Network");
        }
        handleClose();
    };

    const showErrorMessage = message => {
        NotificationManager.error(message, "Error", 5000);
    };

    const showSuccessMessage = message => {
        NotificationManager.success(message, "Message", 3000);
    };

    const showInfoMessage = message => {
        NotificationManager.info(message, "Info", 3000);
    };

    const sendTransaction = async ({userAddress, request, sig, domainSeparator, signatureType}) => {
        if (ethersProvider && contract) {
          let params;
          if (domainSeparator) {
            params = [request, domainSeparator, sig];
          } else {
            params = [request, sig];
          }
          try {
            fetch(`${config.api.prod}/api/v2/meta-tx/native`, {
              method: "POST",
              headers: {
                "x-api-key": config.apiKey.prod,
                "Content-Type": "application/json;charset=utf-8",
              },
              body: JSON.stringify({
                to: config.contract.address,
                apiId: "4ee469f2-c6ba-461d-b337-54118c1301d6",
              //apiId: "ca45b2dc-0279-4952-87cd-bbc584427538",
                params: params,
                from: userAddress,
                signatureType: signatureType
              }),
            })
              .then((response) => response.json())
              .then(function(result) {
                console.log(result);
                showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);
                return result.txHash;
                // todo - fetch mined transaction receipt, show tx confirmed and update quotes
              }).then(function(hash){     
                 //event emitter methods
                ethersProvider.once(hash, (transaction) => {
                // Emitted when the transaction has been mined
                console.log(transaction);
                setTransactionHash(hash);
                })
              })
              .catch(function (error) {
                console.log(error);
              });
          } catch (error) {
            console.log(error);
          }
        }
    };


    return (
        <div className="App">
            <section className="top-row">
                <div className="top-row-item">
                    <span className="label">Library </span>
                    <span className="label-value">ethers.js</span>
                </div>
                <div className="top-row-item">
                    <span className="label">Meta Transaction</span>
                    <span className="label-value">EIP-2771</span>
                </div>
                <div className="top-row-item">
                    <span className="label">Signature Type</span>
                    <span className="label-value">EIP-712 Signature</span>
                </div>
            </section>
            <section className="main">
                <div className="mb-wrap mb-style-2">
                    <blockquote cite="http://www.gutenberg.org/ebboks/11">
                        <p>{quote}</p>
                    </blockquote>
                </div>

                <div className="mb-attribution">
                    <p className="mb-author">{owner}</p>
                    
                </div>
            </section>
            <section>
                {transactionHash !== "" && <Box className={classes.root} mt={2} p={2}>
                    <Typography>
                        Check your transaction hash
            <Link href={`https://kovan.etherscan.io/tx/${transactionHash}`} target="_blank"
                            className={classes.link}>
                            here
            </Link>
                    </Typography>
                </Box>}
            </section>

            <section>
                <div className="submit-container">
                    <div className="submit-row">
                        <input
                            type="text"
                            placeholder="Enter your quote"
                            onChange={onQuoteChange}
                            value={newQuote}
                        />
                        <Button variant="contained" color="primary" onClick={onSubmitWithEIP712Sign2} style={{ marginLeft: "10px" }}>
                            Submit With EIP712 Sign
            </Button>
                    </div>
                </div>
            </section>
            <Backdrop className={classes.backdrop} open={backdropOpen} onClick={handleClose}>
                <CircularProgress color="inherit" />
                <div style={{ paddingLeft: "10px" }}>{loadingMessage}</div>
            </Backdrop>
            <NotificationContainer />
        </div>
    );
}

export default App;