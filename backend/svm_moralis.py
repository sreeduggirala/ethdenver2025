import aiohttp
import asyncio
from dotenv import load_dotenv
import os
import supabase

load_dotenv()
api_key = os.getenv("MORALIS_API_KEY")


async def get_svm_portfolio(address: str):
    url = f"https://solana-gateway.moralis.io/account/mainnet/{address}/portfolio"

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


async def get_spl_price(mint_address: str):
    url = f"https://solana-gateway.moralis.io/token/mainnet/{mint_address}/price"

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


async def get_svm_net_worth(address: str):
    portfolio = await get_svm_portfolio(address)

    try:
        if not portfolio:
            return None

        net_worth = 0
        for token in portfolio["tokens"]:
            token_price = await get_spl_price(token["mint"])

            if token_price:
                net_worth += float(token["amount"]) * float(token_price)

        sol_value = float(portfolio["nativeBalance"]) * await get_spl_price(
            "So11111111111111111111111111111111111111112"
        )
        return net_worth + sol_value

    except Exception as e:
        print(f"Error calculating net worth: {e}")
        return None


async def get_svm_swaps(address: str):
    url = (
        f"https://solana-gateway.moralis.io/account/mainnet/{address}/swaps?order=DESC"
    )

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


async def get_svm_pnl(address: str):

    swaps = await get_svm_swaps(address)
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
