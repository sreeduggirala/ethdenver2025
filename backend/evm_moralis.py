import aiohttp
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("MORALIS_API_KEY")


async def get_evm_portfolio(address: str):
    url = f"https://deep-index.moralis.io/api/v2.2/wallets/{address}/tokens?chain=eth"

    headers = {
        "accept": "application/json",
        "X-API-Key": api_key,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                return await response.json()

    except Exception as e:
        print(f"Error fetching wallet portfolio: {e}")
        return None


async def get_erc20_price(token_address: str):
    url = f"https://deep-index.moralis.io/api/v2.2/erc20/{token_address}/price?chain=eth&include=percent_change"

    headers = {
        "accept": "application/json",
        "X-API-Key": api_key,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                res = await response.json()
                return float(res["usdPrice"])

    except Exception as e:
        print(f"Error fetching token price: {e}")
        return None


async def get_evm_net_worth(address: str):
    portfolio = await get_evm_portfolio(address)

    try:
        if not portfolio:
            return None

        net_worth = 0
        for token in portfolio["tokens"]:
            token_price = await get_erc20_price(token["mint"])

            if token_price:
                net_worth += float(token["amount"]) * float(token_price)
        eth_value = float(portfolio[""]) * await get_erc20_price(
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        )
        return net_worth

    except Exception as e:
        print(f"Error calculating net worth: {e}")
        return None


async def get_evm_swaps(address: str):
    url = f"https://deep-index.moralis.io/api/v2.2/wallets/{address}/swaps?chain=eth&order=DESC"

    headers = {
        "accept": "application/json",
        "X-API-Key": api_key,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                return await response.json()

    except Exception as e:
        print(f"Error fetching token price: {e}")
        return None


async def get_evm_pnl(address: str):

    swaps = await get_evm_swaps(address)
    pnl = 0.0
    transactions = swaps.get("result", [])

    if transactions:
        try:
            for tx in transactions:
                # Retrieve the sold and bought USD amounts.
                sold_info = tx.get("sold", {})
                bought_info = tx.get("bought", {})

                # Get the values and check if they are None.
                sold_val = sold_info.get("usdAmount")
                bought_val = bought_info.get("usdAmount")

                sold_usd = float(sold_val) if sold_val is not None else 0.0
                bought_usd = float(bought_val) if bought_val is not None else 0.0

                # Calculate PnL for this transaction.
                token_pnl = sold_usd - bought_usd
                pnl += token_pnl

                # Print details for this transaction.
                print(
                    f"Transaction {tx.get('transactionHash')}: PnL = {token_pnl:.2f} USD"
                )

            return pnl

        except Exception as e:
            print(e)
            return None


# print(asyncio.run(get_erc20_price('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')))
# print(asyncio.run(get_evm_portfolio('0x0d8775f648430679a709e98d2b0cb6250d2887ef')))
# print(asyncio.run(get_evm_net_worth('0x0d8775f648430679a709e98d2b0cb6250d2887ef')))
