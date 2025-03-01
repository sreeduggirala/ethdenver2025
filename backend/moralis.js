require('dotenv').config()

const API_KEY = process.env.MORALIS_API_KEY;

async function getSVMPortfolio(address) {
	try {
		return await (await fetch(`https://solana-gateway.moralis.io/account/mainnet/${address}/portfolio`, {
			headers: {
				"accept": "application/json",
				"X-API-Key": API_KEY
			}
		})).json();
	} catch(err) {
		console.error(err);
		return {
			nativeBalance: {
				solana: "0"
			},
			tokens: []
		};
	}
}

async function getSPLPrice(mint) {
	try {
		return (await (await fetch(`https://solana-gateway.moralis.io/token/mainnet/${mint}/price`, {
			headers: {
				"accept": "application/json",
				"X-API-Key": API_KEY
			}
		})).json()).usdPrice;
	} catch(err) {
		console.error(err);
		return 0;
	}
}

async function getSVMNetWorth(address) {
	try {
		let portfolio = await getSVMPortfolio(address);
		let netWorth = 0;
		let solanaPrice = await getSPLPrice("So11111111111111111111111111111111111111112");
		netWorth += solanaPrice * parseFloat(portfolio.nativeBalance.solana);
		for(let i = 0; i < portfolio.tokens.length; i++) {
			let price = (await getSPLPrice(portfolio.tokens[i].mint)) || 0;
			netWorth += parseFloat(portfolio.tokens[i].amount) * parseFloat(price);
		}
		return netWorth;
	} catch(err) {
		console.error(err);
		return 0;
	}
}

async function getSVMSwaps(address, start) {
	try {
		(await (await fetch(`https://solana-gateway.moralis.io/account/mainnet/${address}/swaps?order=DESC`, {
			headers: {
				"accept": "application/json",
				"X-API-Key": API_KEY
			}
		})).json()).result;
	} catch(err) {
		return [];
	}
}

async function getSVMPNL(address, start) {
	let swaps = await getSVMSwaps(address, start);
	for(let i = 0; i < swaps.length; i++) {

	}
}

(async() => {
	console.log(await getSVMNetWorth(""));
})();