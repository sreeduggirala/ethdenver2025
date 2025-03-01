const { ethers } = require("ethers");
const { getRPC } = require("./getRPC");
const { getContractAddress } = require("./getContractAddress");

const abi = require("../../../contracts/out/Fantasy.sol/Fantasy.json").abi;

export async function getPrice(player: string, chainId: string): Promise<number> {
    const provider = new ethers.providers.JsonRpcProvider(getRPC(chainId));
    const contractAddress = getContractAddress(chainId);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    return await contract.getPrize(player);
}