import aiohttp
import asyncio


async def get_token_info(chain_id: str, token_address: str) -> dict:
    """
    Get token information from DEXScreener API
    Using /tokens/{contractAddress} endpoint
    """
    url = f"https://api.dexscreener.com/tokens/v1/{chain_id}/{token_address}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                res = await response.json()
                return res[0]
    except Exception as e:
        print(e)
        return None

