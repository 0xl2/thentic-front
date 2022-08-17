import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Web3Modal from 'web3modal';
import { providers } from 'ethers';
import { apiTo, chainID } from '../helpers/api.helper';
import WalletConnectProvider from '@walletconnect/web3-provider';

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '570f1ebd62024227a90b259a6e718de0',
        },
      }
    },
  });
}

export default function Home() {
  const [contracts, setContracts] = useState([]);
  const [nftID, setNFTID] = useState(0);
  const [nftData, setNFTData] = useState("");
  const [receiver, setReceiver] = useState("");
  const [userAddr, setUserAddr] = useState(null);
  const [useContract, setContract] = useState(null);
  const [userSigner, setUserSigner] = useState(null);

  useEffect(() => {
    const getContracts = async() => {
      await axios.get(apiTo('nft/show_contracts'), {
        params: {
          chain: 4
        }
      })
      .then((resp) => {
        console.log(resp.data.data);
        if(typeof(resp.data.data) === "string") {
          console.log(resp.data.data);
        } else {
          setContracts(resp.data.data);
        }
      });
    }

    getContracts();

    const interval = setInterval(() => {
      getContracts();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    try{
      const provider = await web3Modal.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const conSigner = web3Provider.getSigner(0);
      const conAddr = await conSigner.getAddress();

      const network = await web3Provider.getNetwork();
      setUserAddr(conAddr);
      setUserSigner(conSigner);
    } catch(err) {
      console.log(err);
      alert(err.message);
    }
  }

  const mintFunc = async() => {
    if(useContract && nftID && parseInt(nftID) == nftID && nftID > 0 && nftData.length > 0 && receiver.length > 0) {
      const mintReq = await axios.post(apiTo('nft/mint_nft'), {
        chain: 4,
        contract: useContract,
        nft_id: nftID,
        nft_data: nftData,
        receiver
      });

      console.log(mintReq.data.data);
    } else {
      alert('Invalid input');
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Thentic dApp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="#">Thentic DAPP</a>
        </h1>
        {
          userAddr ? 
          <>
            <div className="grid wallet-addr">
              <h3>Your Wallet Address: {userAddr.substr(0, 6)}...{userAddr.substr(userAddr.length - 4)} </h3>
            </div>
            <hr/>
            <select className='input-style' onChange={e => setContract(e.target.value)}>
              <option value="0">Select NFT Contract</option>
              {
                contracts.length > 0 ?
                contracts.map((contract) => <option value={contract.contract} key={contract.chain_id + " " + contract.contract}>{nft.tokenName}</option>) : null
              }
            </select>
            <input type="text" onChange={e => setReceiver(e.target.value)} value={receiver} className='input-style' placeholder='Input Receiver' />
            <input type="text" onChange={e => setNFTData(e.target.value)} value={nftData} className='input-style' placeholder='Input NFT Data URL' />
            <input type="number" onChange={e => setNFTID(e.target.value)} value={nftID} className='input-style' placeholder='Input your NFTID' />
            <button onClick={e => mintFunc()} className='click-btn'>Mint Your NFT</button>
          </> :
          <div className="grid">
            <button onClick={e => connectWallet()} className="click-btn">Connect Wallet</button>
          </div>
        }
        <div className='grid'>
          <h1>NFT Contracts</h1>
        </div>
        <div className='grid tx-div'>
          <table className='tx-table'>
            <thead>
              <tr>
                <th>Chain</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              
            </tbody>
          </table>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .input-style {
          height: 40px;
          font-size: 16px;
          border-radius: 8px;
          margin-bottom: 10px;
          padding: 0 10px;
        }

        .click-btn {
          width: 200px;
          height: 50px;
          text-align: center;
          align-items: center;
          padding: 0 0.5rem;
          color: white;
          margin-top: 10px;
          cursor: pointer;
          font-size: 20px;
          background-color: #042d5b;
          border-radius: 10px;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title {
          text-align: center;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 2rem;
        }

        .wallet-addr {
          width: 50%;
          border-bottom: 2px solid;
          margin-bottom: 20px;
        }

        .logo {
          height: 1em;
        }

        .tx-div {
          width: 100%;
        }

        table, th, td {
          border: 1px solid;
          border-collapse: collapse;
          font-size: 16px;
          padding: 10px;
        }

        th {
          text-align: left;
        }

        .tx-table {
          width: 100%;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
