export function getContractAddress(chainId: string) {
	if(chainId == "eip155:11155111") { // Ethereum Sepolia
		return "0xb5d19e2d476bcfD944c910b43Db8BE674a9489f9";
	} else if(chainId == "eip155:48899") { // Zircuit
		return "0x56B6893A61F9D3988B176f36f2C33bc910513495";
	} else if(chainId == "eip155:296") { // Hedera
		return "0x16D769B7de2fB76AaA9bd52b563e639c3015A8ea";
	} else if(chainId == "eip155:1301") { // Unichain Sepolia
		return "0xE0e4f202Ddee2850Ed29E3B7b59Bd205ac107E80";
	} else if(chainId == "eip155:84532") { // Base Sepolia
		return "0x277CC8f10eBa41B9190Ac59107dc8B5BaC1D67b5";
	} else if(chainId == "eip155:300") { // ZKSync
		return "0xfF0d8A273c983C9cfABA115B4Fb7c4AE1ECB6475";
	} else if(chainId == "eip155:763373") { // Ink
		return "0xa8e8b268C1fff143B30Eb727b79187ac551A8a4b";
	} else if(chainId == "eip155:50312") { // Somnia
		return "0xE0e4f202Ddee2850Ed29E3B7b59Bd205ac107E80";
	} else if(chainId == "eip155:545") { // Flow
		return "0xE0e4f202Ddee2850Ed29E3B7b59Bd205ac107E80";
	}
	return "0xb5d19e2d476bcfD944c910b43Db8BE674a9489f9";
}