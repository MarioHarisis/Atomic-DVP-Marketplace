import { useState, useEffect } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { DIGITAL_COIN_ADDRESS, ASSETS_ADDRESS, CBDC_ABI, ASSETS_ABI } from "./constants";

function App() {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [balance, setBalance] = useState<string>("0");
  const [assetBalance, setAssetBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // Estados para formularios
  const [recipientDGC, setRecipientDGC] = useState("");
  const [amountDGC, setAmountDGC] = useState("");
  const [recipientAsset, setRecipientAsset] = useState("");
  const [tokenIdAsset, setTokenIdAsset] = useState("");

  const fetchBalances = async () => {
    if (wallet?.accounts[0]) {
      try {
        const provider = new ethers.BrowserProvider(wallet.provider);
        const network = await provider.getNetwork();

        if (network.chainId !== 11155111n) {
          alert("Por favor, cambia a la red Sepolia");
          return;
        }

        const coinContract = new ethers.Contract(
          DIGITAL_COIN_ADDRESS,
          CBDC_ABI,
          provider,
        );
        const rawBalance = await coinContract.balanceOf(wallet.accounts[0].address);
        setBalance(rawBalance.toString());

        const assetContract = new ethers.Contract(
          ASSETS_ADDRESS,
          [...ASSETS_ABI, "function balanceOf(address) view returns (uint256)"],
          provider,
        );
        const rawAssetBal = await assetContract.balanceOf(wallet.accounts[0].address);
        setAssetBalance(rawAssetBal.toString());
      } catch (error) {
        console.error("Error cargando saldos:", error);
      }
    }
  };

  const mintDGC = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(wallet.provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DIGITAL_COIN_ADDRESS, CBDC_ABI, signer);
      const tx = await contract.mint(wallet.accounts[0].address, "100");
      await tx.wait();
      fetchBalances();
      alert("¡100 DGC minteados!");
    } catch (error) {
      alert("Error al mintear DGC.");
    } finally {
      setLoading(false);
    }
  };

  const transferDGC = async () => {
    if (!wallet || !recipientDGC || !amountDGC) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(wallet.provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DIGITAL_COIN_ADDRESS, CBDC_ABI, signer);
      const tx = await contract.transfer(recipientDGC, amountDGC);
      await tx.wait();
      alert("Transferencia de CBDC realizada");
      fetchBalances();
    } catch (error) {
      alert("Error en la transferencia de DGC");
    } finally {
      setLoading(false);
    }
  };

  const mintAsset = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(wallet.provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ASSETS_ADDRESS, ASSETS_ABI, signer);
      const metadata = "https://mi-activo-financiero.com/metadata/1";
      const tx = await contract.mint(wallet.accounts[0].address, metadata);
      await tx.wait();
      fetchBalances();
      alert("¡Activo registrado con éxito!");
    } catch (error) {
      alert("Error al mintear Activo.");
    } finally {
      setLoading(false);
    }
  };

  const transferAsset = async () => {
    if (!wallet || !recipientAsset || !tokenIdAsset) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(wallet.provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ASSETS_ADDRESS, ASSETS_ABI, signer);

      // IMPORTANTE: Deben ser 3 argumentos
      const tx = await contract.transferFrom(
        wallet.accounts[0].address, // El dueño actual (tú)
        recipientAsset, // El destino
        tokenIdAsset, // El ID (ej: 0)
      );

      await tx.wait();
      alert("Transferencia exitosa");
      fetchBalances();
    } catch (error: any) {
      console.error("Error detallado:", error);
      // Si el error dice "execution reverted", es que el ID no es tuyo
      alert("Error al transferir: " + (error.reason || "Revisa la consola"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) fetchBalances();
  }, [wallet]);

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#1a1a1a",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>Marketplace Assets & CBDC</h1>

      <button
        onClick={() => (wallet ? disconnect(wallet) : connect())}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "30px",
          backgroundColor: wallet ? "#ff4b4b" : "#646cff",
          color: "white",
          border: "none",
        }}
      >
        {wallet ? "Desconectar Wallet" : "Conectar Wallet"}
      </button>

      {wallet && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          {/* Columna Moneda (CBDC) */}
          <div
            style={{
              border: "1px solid #646cff",
              padding: "25px",
              borderRadius: "15px",
              width: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              backgroundColor: "#242424",
            }}
          >
            <h3 style={{ margin: 0 }}>Saldo CBDC</h3>
            <p
              style={{
                fontSize: "1.8em",
                fontWeight: "bold",
                margin: "10px 0",
                color: "#646cff",
              }}
            >
              {balance} DGC
            </p>

            <button
              onClick={mintDGC}
              disabled={loading}
              style={{ backgroundColor: "#646cff", color: "white" }}
            >
              {loading ? "Procesando..." : "Mintear 100 DGC"}
            </button>

            <div
              style={{
                marginTop: "15px",
                borderTop: "1px solid #444",
                paddingTop: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0" }}>Enviar CBDC</h4>
              <input
                placeholder="Dirección destino"
                onChange={(e) => setRecipientDGC(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
              />
              <input
                placeholder="Cantidad"
                onChange={(e) => setAmountDGC(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
              />
              <button onClick={transferDGC} disabled={loading}>
                Enviar DGC
              </button>
            </div>
          </div>

          {/* Columna Activos (NFT) */}
          <div
            style={{
              border: "1px solid #4CAF50",
              padding: "25px",
              borderRadius: "15px",
              width: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              backgroundColor: "#242424",
            }}
          >
            <h3 style={{ margin: 0 }}>Saldo Activos</h3>
            <p
              style={{
                fontSize: "1.8em",
                fontWeight: "bold",
                margin: "10px 0",
                color: "#4CAF50",
              }}
            >
              {assetBalance} units
            </p>

            <button
              onClick={mintAsset}
              disabled={loading}
              style={{ backgroundColor: "#4CAF50", color: "white" }}
            >
              {loading ? "Procesando..." : "Mintear 1 Activo"}
            </button>

            <div
              style={{
                marginTop: "15px",
                borderTop: "1px solid #444",
                paddingTop: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0" }}>Enviar Activo</h4>
              <input
                placeholder="Dirección destino"
                onChange={(e) => setRecipientAsset(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
              />
              <input
                placeholder="Token ID (ej: 0)"
                onChange={(e) => setTokenIdAsset(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
              />
              <button onClick={transferAsset} disabled={loading}>
                Transferir ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
