import aiohttp
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('MORALIS_API_KEY')

async def get_svm_portfolio(address: str):
    url = f'https://solana-gateway.moralis.io/account/mainnet/{address}/portfolio'

    headers = {
        'accept': 'application/json',
        'X-API-Key': api_key,
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                return await response.json()
            
    except Exception as e:
        print(f"Error fetching wallet portfolio: {e}")
        return None
    
async def get_spl_price(mint_address: str):
    url = f'https://solana-gateway.moralis.io/token/mainnet/{mint_address}/price'

    headers = {
        'accept': 'application/json',
        'X-API-Key': api_key,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                res = await response.json()
                return float(res['usdPrice'])
    
    except Exception as e:
        print(f"Error fetching token price: {e}")
        return None
    

async def get_svm_net_worth(address: str):
    portfolio = await get_svm_portfolio(address)
    
    try:
        if not portfolio:
            return None
        
        net_worth = 0
        for token in portfolio['tokens']:
            token_price = await get_spl_price(token['mint'])
            
            if token_price:
                net_worth += float(token['amount']) * float(token_price)
        
        return net_worth
    
    except Exception as e:
        print(f"Error calculating net worth: {e}")
        return None
    

async def get_svm_swaps(address: str):
    url = f'https://solana-gateway.moralis.io/account/mainnet/{address}/swaps?order=DESC'

    headers = {
        'accept': 'application/json',
        'X-API-Key': api_key,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                res = await response.json()
                return float(res['usdPrice'])
    
    except Exception as e:
        print(f"Error fetching token price: {e}")
        return None
    

async def get_svm_pnl(address: str):
    swaps = await get_svm_swaps(address)