"""
Test OCR API endpoint with fixed multipart support
"""
import requests
import json

print("=" * 80)
print("TEST 1: Create eKYC Session")
print("=" * 80)

try:
    response = requests.post("http://localhost:8080/api/ekyc/sessions?userId=1")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

    if response.status_code == 200:
        session_id = response.json()["data"]["sessionId"]
        print(f"\n✅ TEST 1 PASSED! Session ID: {session_id}")

        # Test 2: OCR with real images
        print("\n" + "=" * 80)
        print("TEST 2: OCR with Real CCCD Images")
        print("=" * 80)

        # Read base64 files
        with open('cccd_mat_truoc.jpg.base64.txt', 'r') as f:
            front_base64 = f.read().strip()

        with open('cccd_mat_sau.jpg.base64.txt', 'r') as f:
            back_base64 = f.read().strip()

        print(f"Front image base64 length: {len(front_base64)}")
        print(f"Back image base64 length: {len(back_base64)}")

        ocr_request = {
            "sessionId": session_id,
            "frontImageBase64": front_base64,
            "backImageBase64": back_base64
        }

        print("\n🔄 Sending OCR request (now using multipart/form-data internally)...")
        ocr_response = requests.post(
            "http://localhost:8080/api/ekyc/ocr",
            json=ocr_request,
            timeout=60
        )

        print(f"Status Code: {ocr_response.status_code}")
        print(f"Response: {json.dumps(ocr_response.json(), indent=2, ensure_ascii=False)}")

        if ocr_response.status_code == 200:
            data = ocr_response.json()["data"]
            print("\n✅ TEST 2 PASSED! OCR completed successfully!")
            print(f"   - ID Number: {data.get('idNumber')}")
            print(f"   - Full Name: {data.get('fullName')}")
            print(f"   - Date of Birth: {data.get('dateOfBirth')}")
            print(f"   - Gender: {data.get('gender')}")
            print(f"   - Address: {data.get('address')}")
        else:
            print(f"\n❌ TEST 2 FAILED! Status: {ocr_response.status_code}")
    else:
        print(f"\n❌ TEST 1 FAILED! Status: {response.status_code}")

except requests.exceptions.ConnectionError:
    print("❌ ERROR: Cannot connect to http://localhost:8080")
    print("Make sure the application is running!")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
print("Testing Complete")
print("=" * 80)

