"""
Test Liveness API with MultipartFile approach
This script tests the new multipart/form-data endpoint for liveness check
"""

import requests
import json
import os
import sys

# Base URL
BASE_URL = "http://localhost:8080/api/ekyc"

# Video file - you need to provide this
VIDEO_FILE = "liveness_video.mp4"

def test_liveness_with_multipart(session_id=None):
    """
    Test Liveness endpoint with multipart file upload
    """
    print("=" * 80)
    print("Testing Liveness API with MultipartFile")
    print("=" * 80)

    # If no session ID provided, create a new one
    if session_id is None:
        print("\n[Step 1] Creating session...")
        response = requests.post(f"{BASE_URL}/sessions?userId=1")

        if response.status_code != 200:
            print(f"❌ Failed to create session: {response.status_code}")
            print(response.text)
            return

        session_data = response.json()
        session_id = session_data['data']['sessionId']
        print(f"✅ Session created: {session_id}")
    else:
        print(f"\n[Using existing session: {session_id}]")

    # Upload video for liveness check
    print(f"\n[Step 2] Uploading video for liveness check...")
    print(f"   Video file: {VIDEO_FILE}")

    # Check if file exists
    if not os.path.exists(VIDEO_FILE):
        print(f"❌ Video file not found: {VIDEO_FILE}")
        print(f"   Please provide a liveness video file")
        return

    # Get file size
    file_size = os.path.getsize(VIDEO_FILE)
    file_size_mb = file_size / (1024 * 1024)
    print(f"   File size: {file_size_mb:.2f} MB")

    if file_size_mb > 50:
        print(f"❌ File too large. Maximum allowed: 50MB")
        return

    # Prepare files and data
    files = {
        'video': open(VIDEO_FILE, 'rb')
    }

    data = {
        'sessionId': session_id
    }

    # Send request
    try:
        print("   Uploading... (this may take a while)")
        response = requests.post(
            f"{BASE_URL}/liveness",
            files=files,
            data=data,
            timeout=120  # 2 minutes timeout for large videos
        )

        # Close file
        files['video'].close()

        if response.status_code != 200:
            print(f"❌ Liveness check failed: {response.status_code}")
            print(response.text)
            return

        liveness_result = response.json()

        if not liveness_result['success']:
            print(f"❌ Liveness check failed: {liveness_result['message']}")
            return

        print("✅ Liveness check successful!")
        print("\n" + "=" * 80)
        print("LIVENESS RESULT:")
        print("=" * 80)

        data = liveness_result['data']
        print(f"Is Live:        {data['isLive']}")
        print(f"Confidence:     {data['confidence']:.4f}")

        if data['isLive']:
            print("\n✅ LIVENESS PASSED - Person is live!")
        else:
            print("\n❌ LIVENESS FAILED - Potential fake/spoof detected!")

        print("\n" + "=" * 80)
        print("✅ Test completed successfully!")
        print("=" * 80)

        return session_id

    except requests.exceptions.Timeout:
        print(f"❌ Request timeout. Video file might be too large or server is slow.")
        return None
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        return None

if __name__ == "__main__":
    # Check if session ID is provided as argument
    session_id = sys.argv[1] if len(sys.argv) > 1 else None
    test_liveness_with_multipart(session_id)

