const { ethers } = require("ethers");
const { getRPC } = require("./getRPC");
const { getContractAddress } = require("./getContractAddress");

const abi = require("../../../contracts/out/Fantasy.sol/Fantasy.json").abi;

export async function getMembersFromTeam(id: string, chainId: string): Promise<string[]> {
    const provider = new ethers.providers.JsonRpcProvider(getRPC(chainId));
    const contractAddress = getContractAddress(chainId);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    return (await contract.getMembersFromTeam(id)).map((member) => {
        if(member == "0x0000000000000000000000000000000000000000") {
            return "";
        }
        return member;
    });
}