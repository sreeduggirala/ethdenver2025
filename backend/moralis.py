import aiohttp
import asyncio
from dexscreener import get_token_info
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('MORALIS_API_KEY')

async def get_portfolio(address: str):
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
    

async def get_net_worth(address: str):
    portfolio = await get_portfolio(address)
    
    if portfolio:
        try:
            net_worth = 0
            for token in portfolio['tokens']:
                token_info = await get_token_info('solana', token['associatedTokenAddress'])
                print(token_info)
                if token_info:
                    net_worth += float(token['amount']) * float(token_info['priceUsd'])
            # add amount of SOL * price of SOL to net_worth
            return net_worth
        except Exception as e:
            print(f"Error calculating net worth: {e}")
            return None
        
print(asyncio.run(get_net_worth('5PRw4hYJJh8EjLBg4UZTNEKHSYvyjxLKy3PHBn5PYxHb')))
    
