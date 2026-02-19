import os
import httpx
from fastapi import APIRouter, HTTPException
 
router = APIRouter()
 
FDC_BASE = "https://api.nal.usda.gov/fdc/v1"
OFF_BASE = "https://world.openfoodfacts.org"
 
COMM_BASE = "https://example-upc-provider.com"
 
TIMEOUT = httpx.Timeout(10.0)
 
def _normalize_none(s: str | None) -> str | None:
    if not s:
        return None
    s = s.strip()
    return s if s else None
 
async def fetch_from_fdc(client: httpx.AsyncClient, upc: str) -> dict | None:
    api_key=os.environ("FDC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="FDC_API_KEY is not set")
 
    params = {
        "api_key": api_key,
        "query": upc,
        "dataType": "Branded",
        "pageSize": 5,
    }
 
    r = await client.get(f"{FDC_BASE}/foods/search", params=params)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail={"source": "fdc", "status": r.status_code, "body": r.text})
 
    data = r.json()
    foods = data.get("foods") or []
    if not foods:
        return None
 
    top = foods[0]
    nutrition = {}
    for n in top.get("foodNutrients", [])[:50]:
        name = (n.get("nutrientName") or "").lower()
        val = n.get("value")
        if name == "energy" and val is not None:
            nutrition["calories"] = val
 
    return {
        "upc": upc,
        "found": True,
        "source": "fdc",
        "name": top.get("description"),
        "brand": top.get("brandOwner") or top.get("brandName"),
        "image": None,
        "nutrition": nutrition or None,
        "raw": {"fdcId": top.get("fdcId"), "gtinUpc": top.get("gtinUpc")},
    }
 
async def fetch_from_openfoodfacts(client: httpx.AsyncClient, upc: str) -> dict | None:
    r = await client.get(f"{OFF_BASE}/api/v2/product/{upc}.json")
    if r.status_code != 200:
        return None
 
    data = r.json()
    if data.get("status") != 1:
        return None
 
    p = data.get("product") or {}
    nutr = p.get("nutriments") or {}
 
    return {
        "upc": upc,
        "found": True,
        "source": "off",
        "name": p.get("product_name") or p.get("generic_name") or p.get("product_name_en"),
        "brand": p.get("brands"),
        "image": p.get("image_url"),
        "nutrition": {
            "calories": nutr.get("energy-kcal_100g"),
            "protein_g": nutr.get("proteins_100g"),
            "carbs_g": nutr.get("carbohydrates_100g"),
            "fat_g": nutr.get("fat_100g"),
        },
        "raw": {"off_id": p.get("_id")},
    }
 
async def fetch_from_commercial(client: httpx.AsyncClient, upc: str) -> dict | None:
    api_key = _normalize_none(os.getenv("COMM_UPC_API_KEY"))
    if not api_key:
        return None  
 
    r = await client.get(
        f"{COMM_BASE}/lookup",
        params={"upc": upc},
        headers={"Authorization": f"Bearer {api_key}"},
    )
    if r.status_code != 200:
        return None
 
    data = r.json()
    name = data.get("name")
    if not name:
        return None
 
    return {
        "upc": upc,
        "found": True,
        "source": "commercial",
        "name": name,
        "brand": data.get("brand"),
        "image": data.get("image"),
        "nutrition": data.get("nutrition"),
        "raw": {"provider": "your-provider"},
    }
 
@router.get("/barcode/{upc}")
async def lookup_barcode(upc: str):
    upc = upc.strip()
 
    if not upc.isdigit():
        raise HTTPException(status_code=400, detail="UPC must be digits only")
    if len(upc) not in (8, 12, 13, 14):
        pass
 
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Try FDC
        try:
            res = await fetch_from_fdc(client, upc)
            if res:
                return res
        except HTTPException:
            raise
 
        # Try OpenFoodFacts
        res = await fetch_from_openfoodfacts(client, upc)
        if res:
            return res
 
        # Try commercial (optional)
        res = await fetch_from_commercial(client, upc)
        if res:
            return res
 
    return {"upc": upc, "found": False, "source": None, "name": None, "brand": None, "image": None, "nutrition": None, "raw": None}