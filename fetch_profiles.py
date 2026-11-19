import json
import time
import urllib.request
import urllib.error
import sys

BASE_URL = "http://levashubhmangal.com/web_service_14072020/new_user_updated_list_unseen_profile.php?nu_id=17500&lang_type=1&page={page}"
OUTPUT_FILE = "profiles.json"
DELAY_SECONDS = 5


def is_empty_value(val):
    """Check if value is None, empty string, or whitespace."""
    if val is None:
        return True
    if isinstance(val, str) and val.strip() == "":
        return True
    return False


def is_bg_gotra_empty(data):
    """
    Determines if 'bg_gotra' in the response signals the end of data.
    Handles responses formatted as:
      - A list of user profile dicts
      - A single dict with 'bg_gotra'
      - A dict wrapping a list (e.g., {'data': [...]} or {'profiles': [...]})
    """
    if not data:
        return True

    # Case 1: Response is a list of profiles/objects
    if isinstance(data, list):
        if len(data) == 0:
            return True

        # Check if any profile has a non-empty bg_gotra
        # If all items have empty/missing bg_gotra, or if the first item has empty bg_gotra
        gotra_values = []
        for item in data:
            if isinstance(item, dict):
                gotra_values.append(item.get("bg_gotra"))

        # If gotra values were found and all are empty
        if gotra_values and all(is_empty_value(g) for g in gotra_values):
            return True

        # If the first record has an empty bg_gotra sentinel
        if gotra_values and is_empty_value(gotra_values[0]):
            return True

        return False

    # Case 2: Response is a dict
    if isinstance(data, dict):
        # Direct key 'bg_gotra'
        if "bg_gotra" in data:
            return is_empty_value(data["bg_gotra"])

        # Nested list inside dict (e.g. data, user_list, profiles, result)
        for key in ["data", "profiles", "user_list", "result", "records", "users"]:
            if key in data and isinstance(data[key], list):
                return is_bg_gotra_empty(data[key])

    return False


def fetch_page(page_num):
    """Fetch and parse JSON from the API for a specific page."""
    url = BASE_URL.format(page=page_num)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01"
    }

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        content_type = response.headers.get("Content-Type", "")
        raw_body = response.read().decode("utf-8", errors="replace").strip()

        if not raw_body:
            return None

        # Parse JSON
        try:
            return json.loads(raw_body)
        except json.JSONDecodeError as e:
            print(f"  [!] Failed to parse JSON on page {page_num}: {e}")
            print(f"  Raw response snippet: {raw_body[:200]}")
            return None


def main():
    print("=" * 60)
    print("Starting profile extraction...")
    print(f"Delay between requests: {DELAY_SECONDS} seconds")
    print(f"Output destination: {OUTPUT_FILE}")
    print("=" * 60)

    page = 1
    all_responses = []
    total_profiles = 0

    try:
        while True:
            print(f"\n[Page {page}] Fetching data...")
            try:
                data = fetch_page(page)
            except urllib.error.HTTPError as e:
                print(f"  [!] HTTP Error {e.code}: {e.reason}")
                break
            except urllib.error.URLError as e:
                print(f"  [!] Connection failed: {e.reason}")
                break
            except Exception as e:
                print(f"  [!] Unexpected error: {e}")
                break

            if data is None:
                print("  [i] Empty or invalid response received. Stopping.")
                break

            # Check if bg_gotra is empty
            if is_bg_gotra_empty(data):
                print("  [i] 'bg_gotra' is empty or missing. End of records reached.")
                break

            # Store the page data
            all_responses.append({
                "page": page,
                "data": data
            })

            # Count profiles if list
            if isinstance(data, list):
                count = len(data)
                total_profiles += count
                print(f"  [+] Retrieved {count} profiles (Total so far: {total_profiles})")
            elif isinstance(data, dict):
                print(f"  [+] Retrieved data object successfully")

            page += 1

            # 5-second delay before next request
            print(f"  [-] Waiting {DELAY_SECONDS} seconds before next request...")
            time.sleep(DELAY_SECONDS)

    except KeyboardInterrupt:
        print("\n\n[!] Interrupted by user. Saving fetched data...")

    # Save all data into one JSON file
    print("\n" + "=" * 60)
    print(f"Saving collected data to '{OUTPUT_FILE}'...")

    output_payload = {
        "total_pages": len(all_responses),
        "total_profiles": total_profiles,
        "results": all_responses
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, ensure_ascii=False, indent=2)

    print(f"[SUCCESS] Saved {len(all_responses)} pages to '{OUTPUT_FILE}'")
    print("=" * 60)


if __name__ == "__main__":
    main()
