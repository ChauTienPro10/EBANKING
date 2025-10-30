"""
Test FPT AI OCR API with both front and back CCCD images separately
"""
import requests
import json

# FPT AI API config
api_key = "juexeQ3Q2nVoK59t6SCmp1J5ioXe3GTY"
url = "https://api.fpt.ai/vision/idr/vnm/"

headers = {
    "api-key": api_key
}

print("=" * 80)
print("TEST: FPT AI OCR with Front and Back Images")
print("=" * 80)

# Test Front Image
print("\n" + "=" * 80)
print("1. Testing FRONT IMAGE (mặt trước)")
print("=" * 80)

try:
    with open('cccd_mat_truoc.jpg', 'rb') as f:
        files = {'image': ('cccd_mat_truoc.jpg', f, 'image/jpeg')}
        response = requests.post(url, headers=headers, files=files, timeout=30)

    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")

    if result.get("data"):
        data = result["data"][0]
        print(f"\n✅ Extracted from FRONT:")
        print(f"   - ID: {data.get('id')}")
        print(f"   - Name: {data.get('name')}")
        print(f"   - DOB: {data.get('dob')}")
        print(f"   - Gender: {data.get('sex')}")
        print(f"   - Address: {data.get('address', 'N/A')}")
        print(f"   - Home: {data.get('home', 'N/A')}")
        print(f"   - Type: {data.get('type')}")

except Exception as e:
    print(f"❌ ERROR: {str(e)}")

# Test Back Image
print("\n" + "=" * 80)
print("2. Testing BACK IMAGE (mặt sau)")
print("=" * 80)

try:
    with open('cccd_mat_sau.jpg', 'rb') as f:
        files = {'image': ('cccd_mat_sau.jpg', f, 'image/jpeg')}
        response = requests.post(url, headers=headers, files=files, timeout=30)

    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")

    if result.get("data"):
        data = result["data"][0]
        print(f"\n✅ Extracted from BACK:")
        print(f"   - ID: {data.get('id', 'N/A')}")
        print(f"   - Name: {data.get('name', 'N/A')}")
        print(f"   - Address: {data.get('address', 'N/A')}")
        print(f"   - Home: {data.get('home', 'N/A')}")
        print(f"   - Type: {data.get('type')}")
        print(f"   - Issue Date: {data.get('issue_date', 'N/A')}")
        print(f"   - Expiry Date: {data.get('doe', 'N/A')}")

except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print("\n" + "=" * 80)
print("Testing Complete")
print("=" * 80)

