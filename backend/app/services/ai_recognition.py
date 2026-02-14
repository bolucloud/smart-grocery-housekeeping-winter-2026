import os
from openai import OpenAI
import json

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def recognize_item_with_ai(image: str):
    try:
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
                    {"type": "input_image", "image_url": image},
                ],
            }],
        )

        return json.loads(response.output_text)

    except Exception as e:
        return {
            "item": "unknown",
            "confidence": 0,
            "alternatives": [],
            "error": str(e)
        }
