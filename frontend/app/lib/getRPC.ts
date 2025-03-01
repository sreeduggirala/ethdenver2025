export function getRPC(chainId: string) {
	if(chainId == "eip155:11155111") { // Ethereum Sepolia
		return "https://rpc-sepolia.rockx.com";
	} else if(chainId == "eip155:48899") { // Zircuit
		return "https://zircuit1-testnet.p2pify.com";
	} else if(chainId == "eip155:296") { // Hedera
		return "https://testnet.hashio.io/api";
	} else if(chainId == "eip155:1301") { // Unichain Sepolia
		return "https://unichain-sepolia.drpc.org";
	} else if(chainId == "eip155:84532") { // Base Sepolia
		return "https://base-sepolia.drpc.org";
	} else if(chainId == "eip155:300") { // ZKSync
		return "https://sepolia.era.zksync.dev";
	} else if(chainId == "eip155:763373") { // Ink
		return "https://ink-sepolia.drpc.org";
	} else if(chainId == "eip155:50312") { // Somnia
		return "https://dream-rpc.somnia.network";
	} else if(chainId == "eip155:545") { // Flow
		return "https://testnet.evm.nodes.onflow.org";
	}
	return "https://rpc-sepolia.rockx.com";
}