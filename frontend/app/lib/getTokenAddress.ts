export function getTokenAddress(chainId: string) {
	if(chainId == "eip155:11155111") { // Ethereum Sepolia
		return "0x866386C7f4F2A5f46C5F4566D011dbe3e8679BE4";
	} else if(chainId == "eip155:48899") { // Zircuit
		return "0x7a722C4C585F17B237DD2C57dD46677c7D348420";
	} else if(chainId == "eip155:296") { // Hedera
		return "0xa8e8b268C1fff143B30Eb727b79187ac551A8a4b";
	} else if(chainId == "eip155:1301") { // Unichain Sepolia
		return "0x26c2A3eB005f99db89d1Ae160a53d5e96a82d937";
	} else if(chainId == "eip155:84532") { // Base Sepolia
		return "0x7F9E336321B4bdb67d41AF3613A8C1D135FfA5B1";
	} else if(chainId == "eip155:300") { // ZKSync
		return "0x955f617186Ce45f70203a752104e66eFc9dBc1Ef";
	} else if(chainId == "eip155:763373") { // Ink
		return "0x813722E1244b608a8d60fD5090C68bF6Ac12b602";
	} else if(chainId == "eip155:50312") { // Somnia
		return "0x26c2A3eB005f99db89d1Ae160a53d5e96a82d937";
	} else if(chainId == "eip155:545") { // Flow
		return "0x26c2A3eB005f99db89d1Ae160a53d5e96a82d937";
	}
	return "0x866386C7f4F2A5f46C5F4566D011dbe3e8679BE4";
}