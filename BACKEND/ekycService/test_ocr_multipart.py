"""
Test OCR API with MultipartFile approach
This script tests the new multipart/form-data endpoint
"""

import requests
import json
import os

# Base URL
BASE_URL = "http://localhost:8081/api/ekyc"

# Image files
FRONT_IMAGE = "cccd_mat_truoc.jpg"
BACK_IMAGE = "cccd_mat_sau.jpg"

def test_ocr_with_multipart():
    """
    Test OCR endpoint with multipart file upload
    """
    print("=" * 80)
    print("Testing OCR API with MultipartFile")
    print("=" * 80)

    # Step 1: Create session
    print("\n[Step 1] Creating session...")
    response = requests.post(f"{BASE_URL}/sessions?userId=1")

    if response.status_code != 200:
        print(f"❌ Failed to create session: {response.status_code}")
        print(response.text)
        return

    session_data = response.json()
    session_id = session_data['data']['sessionId']
    print(f"✅ Session created: {session_id}")
    print(f"   Status: {session_data['data']['status']}")
    print(f"   Current Step: {session_data['data']['currentStep']}")

    # Step 2: Upload images for OCR
    print(f"\n[Step 2] Uploading images for OCR...")
    print(f"   Front image: {FRONT_IMAGE}")
    print(f"   Back image: {BACK_IMAGE}")

    # Check if files exist
    if not os.path.exists(FRONT_IMAGE):
        print(f"❌ Front image not found: {FRONT_IMAGE}")
        return

    if not os.path.exists(BACK_IMAGE):
        print(f"❌ Back image not found: {BACK_IMAGE}")
        return

    data = {
        'sessionId': session_id
    }

    # Send request with explicit MIME types to avoid server-side validation issues
    try:
        with open(FRONT_IMAGE, 'rb') as f_front, open(BACK_IMAGE, 'rb') as f_back:
            files = {
                'frontImage': (FRONT_IMAGE, f_front, 'image/jpeg'),
                'backImage': (BACK_IMAGE, f_back, 'image/jpeg')
            }

            response = requests.post(
                f"{BASE_URL}/ocr",
                files=files,
                data=data
            )

        if response.status_code != 200:
            print(f"❌ OCR failed: {response.status_code}")
            print(response.text)
            return

        ocr_result = response.json()

        if not ocr_result['success']:
            print(f"❌ OCR failed: {ocr_result['message']}")
            return

        print("✅ OCR successful!")
        print("\n" + "=" * 80)
        print("OCR RESULT:")
        print("=" * 80)

        data = ocr_result['data']
        print(f"Session ID:     {data['sessionId']}")
        print(f"ID Number:      {data['idNumber']}")
        print(f"Full Name:      {data['fullName']}")
        print(f"Date of Birth:  {data['dateOfBirth']}")
        print(f"Gender:         {data['gender']}")
        print(f"Address:        {data['address']}")
        print(f"Issue Date:     {data['issueDate']}")
        print(f"Expiry Date:    {data['expiryDate']}")
        print(f"Confidence:     {data['confidence']}")
        print(f"Front Image:    {data['frontImagePath']}")
        print(f"Back Image:     {data['backImagePath']}")

        print("\n" + "=" * 80)
        print("✅ Test completed successfully!")
        print("=" * 80)

        # Return session ID for further testing
        return session_id

    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        return None

if __name__ == "__main__":
    test_ocr_with_multipart()
