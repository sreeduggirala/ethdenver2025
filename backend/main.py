import asyncio
import aiohttp
import os
import supabase
from svm_moralis import get_svm_net_worth

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase.Client = supabase.create_client(supabase_url, supabase_key)

wallets = [
    "JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN",
    "73LnJ7G9ffBDjEBGgJDdgvLUhD5APLonKrNiHsKDCw5B",
    "DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj",
    "BCnqsPEtA1TkgednYEebRpkmwFRJDCjMQcKZMMtEdArc",
    "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o",
    "AJ6MGExeK7FXmeKkKPmALjcdXVStXYokYNv9uVfDRtvo",
    "HtucFepgUkMpHdrYsxMqjBNN6qVBdjmFaLZneNXopuJm",
    "7iabBMwmSvS4CFPcjW2XYZY53bUCHzXjCFEFhxeYP4CY",
    "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm",
    "4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk",
    "EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf",
    "96sErVjEN7LNJ6Uvj63bdRWZxNuBngj56fnT9biHLKBf",
    "9yYya3F5EJoLnBNKW6z4bZvyQytMXzDcpU5D6yYr4jqL",
    "F72vY99ihQsYwqEDCfz7igKXA5me6vN2zqVsVUTpw6qL",
    "BXNiM7pqt9Ld3b2Hc8iT3mA5bSwoe9CRrtkSUs15SLWN",
    "99i9uVA7Q56bY22ajKKUfTZTgTeP5yCtVGsrG9J4pDYQ",
    "2kv8X2a9bxnBM8NKLc6BBTX2z13GFNRL4oRotMUJRva9",
    "EaVboaPxFCYanjoNWdkxTbPvt57nhXGu5i6m9m6ZS2kK",
    "BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd",
    "7tiRXPM4wwBMRMYzmywRAE6jveS3gDbNyxgRrEoU6RLA",
    "F2SuErm4MviWJ2HzKXk2nuzBC6xe883CFWUDCPz6cyWm",
    "2YJbcB9G8wePrpVBcT31o8JEed6L3abgyCjt5qkJMymV",
    "215nhcAHjQQGgwpQSJQ7zR26etbjjtVdW74NLzwEgQjP",
    "GwoFJFjUTUSWq2EwTz4P2Sznoq9XYLrf8t4q5kbTgZ1R",
    "4DdrfiDHpmx55i4SPssxVzS9ZaKLb8qr45NKY9Er9nNh",
    "m7Kaas3Kd8FHLnCioSjCoSuVDReZ6FDNBVM6HTNYuF7",
    "GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65",
    "831qmkeGhfL8YpcXuhrug6nHj1YdK3aXMDQUCo85Auh1",
    "5B52w1ZW9tuwUduueP5J7HXz5AcGfruGoX6YoAudvyxG",
    "Ds8mcuP5r2phg596mLui3ti3PJtVvFRw19Eo9UFdJ5Bc",
    "9Vk7pkBZ9KFJmzaPzNYjGedyz8qoKMQtnYyYi2AehNMT",
]


async def generate_data(wallets: list) -> list:
    data = []
    try:
        for kol in wallets:
            net_worth = await get_svm_net_worth(kol)
            if net_worth:
                data.append({"kolAddress": kol, "netWorth": net_worth})
        return data
    except Exception as e:
        print(f"Error generating data: {e}")
        return None


async def insert_data(data: list):
    try:
        return supabase.table("Main").upsert(data).execute()
    except Exception as e:
        print(f"Error inserting data: {e}")
        return None


data = asyncio.run(generate_data(wallets))
insert_data(data)
