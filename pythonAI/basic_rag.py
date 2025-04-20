from openai import OpenAI
import requests
import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import fitz  
from urllib.parse import quote

client = OpenAI(
    api_key="AIzaSyBb1jtVltsncFYIWmA-wFeaAJZQnMD2bFQ",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_pdf_prompt(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text


def chat_with_gemini(messages):
    login_data = {
        "username": "duonghoang",
        "password": "hoangduong"
    }
    response = requests.post("http://localhost:8080/tirashop/auth/login", json=login_data)
    token = response.json()['data']['token']

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    product_response = requests.get("http://localhost:8080/tirashop/product", headers=auth_headers)

    if product_response.status_code == 200:
        content_json = product_response.json()
        for item in content_json["data"]["elementList"]:
            item["imageUrls"] = [
                f"uploads/product/image/{quote(url.lstrip('/').split('/')[-1])}" 
                for url in item["imageUrls"]
            ]
        content = json.dumps(content_json, indent=4)
    else:
        content = "Không tìm thấy sản phẩm"


    pdf_path = "D:\\IntellijiProject\\TiraShop\\pythonAI\\Prompt-web-e-chatbot.txt"
    prompt_template = read_pdf_prompt(pdf_path)


    formatted_prompt = prompt_template.replace("{content}", content)

    messages[0]['content'] = formatted_prompt

    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=messages,
        max_tokens=2048,
        temperature=0.2
    )

    response_content = response.choices[0].message.content
    response_content = response_content.replace(
        "![", 
        "!["
    ).replace(
        "](uploads/product/image/", 
        "](http://localhost:8080/uploads/product/image/"
    )

    return response_content

@app.post("/")
async def call_api(request: Request):
    body = await request.json()
    message = body['messages']
    return chat_with_gemini(message)