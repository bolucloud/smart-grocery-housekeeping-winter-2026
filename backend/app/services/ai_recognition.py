import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

async def recognize_item_with_ai(image_url_or_data_url: str):
    prompt = (
        "Identify the grocery item in the image. "
        "Return JSON ONLY in this format:\n"
        "{"
        "\"item\": string, "
        "\"confidence\": number between 0 and 1, "
        "\"alternatives\": [{\"item\": string, \"confidence\": number}]"
        "}\n"
        "Examples: banana, apple, tomato, milk carton, cereal box."
    )

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[{
            "role": "user",
            "content": [
                {"type": "input_text", "text": prompt},
                {"type": "input_image", "image_url": image_url_or_data_url},
            ],
        }],
    )

    import json
    return json.loads(response.output_text)
