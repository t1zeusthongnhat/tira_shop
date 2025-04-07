from openai import OpenAI
import requests
import json
from pyngrok import ngrok
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF

# Khởi tạo client với Gemini API (Google)
client = OpenAI(
    api_key="AIzaSyBb1jtVltsncFYIWmA-wFeaAJZQnMD2bFQ",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Khởi tạo FastAPI app
app = FastAPI()

# CORS middleware để frontend gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hàm đọc nội dung prompt từ file PDF
def read_pdf_prompt(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text

# Hàm xử lý chat với Gemini
def chat_with_gemini(messages):
    # Bước 1: Đăng nhập lấy token
    login_data = {
        "username": "contrau",
        "password": "contrau"
    }
    response = requests.post("http://localhost:8080/tirashop/auth/login", json=login_data)
    token = response.json()['data']['token']

    # Bước 2: Gọi API lấy danh sách sản phẩm
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    product_response = requests.get("http://localhost:8080/tirashop/product", headers=auth_headers)

    if product_response.status_code == 200:
        content_json = product_response.json()
        for item in content_json["data"]["elementList"]:
            item["imageUrls"] = [url.lstrip('/') for url in item["imageUrls"]]
        content = json.dumps(content_json, indent=4)
    else:
        content = "Không tìm thấy sản phẩm"

    # Bước 3: Đọc prompt từ file PDF
    pdf_path = "C:\\Users\\HUU LY\\promt-dataa.pdf"

    prompt_template = read_pdf_prompt(pdf_path)

    # Bước 4: Thay {content} trong file prompt bằng dữ liệu sản phẩm
    formatted_prompt = prompt_template.replace("{content}", content)

    # Gán prompt vào messages
    messages[0]['content'] = formatted_prompt

    # Gọi Gemini API
    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=messages,
        max_tokens=2048,
        temperature=0.2
    )

    return response.choices[0].message.content

# API endpoint chính để nhận request từ frontend
@app.post("/")
async def call_api(request: Request):
    body = await request.json()
    message = body['messages']
    return chat_with_gemini(message)

# Khởi chạy ngrok để public ra ngoài
ngrok.set_auth_token("2Anflrye3lfX8XaAn589i35tmCZ_25je3BN5FYPquBvYXd1cY")
port = 8000
public_url = ngrok.connect(port).public_url
print(f"Public URL: {public_url}")

# Chạy server FastAPI với Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")