import os
import json
import time
import urllib.request
import urllib.error
import sys

BASE_URL = "http://levashubhmangal.com/web_service_14072020/userProfileData.php?nu_id={nu_id}&lang_type=1&"
INPUT_FILES = ["profiles.json", "profile.json"]
OUTPUT_FILE = "user_profiles.json"
DELAY_SECONDS = 5


def load_nu_ids():
    """Load unique nu_ids from profiles.json or profile.json."""
    input_file = None
    for filename in INPUT_FILES:
        if os.path.exists(filename):
            input_file = filename
            break

    if not input_file:
        print(f"[!] Error: Could not find any input file matching {INPUT_FILES}")
        print("Please ensure profiles.json or profile.json exists in the current directory.")
        sys.exit(1)

    print(f"[*] Reading source data from '{input_file}'...")
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    nu_ids = []
    seen = set()

    def add_id(nid):
        if nid is not None:
            s_nid = str(nid).strip()
            if s_nid and s_nid not in seen:
                seen.add(s_nid)
                nu_ids.append(s_nid)

    # Traverse results
    if isinstance(data, dict):
        results = data.get("results", [])
        if not results and isinstance(data.get("data"), list):
            results = data["data"]
    elif isinstance(data, list):
        results = data
    else:
        results = []

    for item in results:
        # Check if item has 'data' -> 'bg_gotra'
        if isinstance(item, dict):
            page_data = item.get("data", item)
            if isinstance(page_data, dict):
                bg_gotra = page_data.get("bg_gotra", [])
                if isinstance(bg_gotra, list):
                    for profile in bg_gotra:
                        if isinstance(profile, dict) and "nu_id" in profile:
                            add_id(profile["nu_id"])
                elif "nu_id" in page_data:
                    add_id(page_data["nu_id"])
            elif isinstance(page_data, list):
                for profile in page_data:
                    if isinstance(profile, dict) and "nu_id" in profile:
                        add_id(profile["nu_id"])

    print(f"[*] Found {len(nu_ids)} unique nu_ids to process.")
    return nu_ids


def load_existing_results():
    """Load existing results if resuming a previous run."""
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                content = json.load(f)
                if isinstance(content, dict) and "results" in content:
                    return content.get("results", {})
                elif isinstance(content, dict):
                    return content
        except Exception as e:
            print(f"[!] Warning: Could not read existing output file: {e}")
    return {}


def save_results(results_map, total_count):
    """Save the consolidated results dictionary to JSON file."""
    payload = {
        "total_expected": total_count,
        "total_fetched": len(results_map),
        "results": results_map
    }
    # Write to a temporary file first then replace to prevent corruption on crash
    temp_file = OUTPUT_FILE + ".tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    if os.path.exists(OUTPUT_FILE):
        os.remove(OUTPUT_FILE)
    os.rename(temp_file, OUTPUT_FILE)


def fetch_user_profile(nu_id):
    """Fetch individual user profile data from API."""
    url = BASE_URL.format(nu_id=nu_id)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01"
    }

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        raw_body = response.read().decode("utf-8", errors="replace").strip()
        if not raw_body:
            return None
        try:
            return json.loads(raw_body)
        except json.JSONDecodeError:
            return {"raw_text": raw_body}


def main():
    print("=" * 65)
    print("User Profile Detail Fetcher")
    print(f"Delay between requests: {DELAY_SECONDS} seconds")
    print(f"Output file: {OUTPUT_FILE}")
    print("=" * 65)

    nu_ids = load_nu_ids()
    if not nu_ids:
        print("[!] No nu_ids found to fetch.")
        return

    # Check for existing progress to allow resuming
    results_map = load_existing_results()
    completed_ids = set(results_map.keys())

    if completed_ids:
        print(f"[*] Resuming: {len(completed_ids)} profiles already fetched previously.")

    remaining_ids = [nid for nid in nu_ids if nid not in completed_ids]
    print(f"[*] Remaining profiles to fetch: {len(remaining_ids)} / {len(nu_ids)}")

    if not remaining_ids:
        print("[+] All profiles are already fetched and saved!")
        return

    fetched_in_this_session = 0

    try:
        for idx, nu_id in enumerate(remaining_ids, start=1):
            total_done = len(results_map) + 1
            print(f"[{total_done}/{len(nu_ids)}] Fetching nu_id: {nu_id} ...", end=" ", flush=True)

            retries = 3
            profile_data = None
            for attempt in range(1, retries + 1):
                try:
                    profile_data = fetch_user_profile(nu_id)
                    break
                except urllib.error.HTTPError as e:
                    print(f"(HTTP {e.code})", end=" ", flush=True)
                except urllib.error.URLError as e:
                    print(f"(Net error: {e.reason})", end=" ", flush=True)
                except Exception as e:
                    print(f"(Error: {e})", end=" ", flush=True)

                if attempt < retries:
                    time.sleep(2)

            if profile_data is not None:
                results_map[nu_id] = profile_data
                fetched_in_this_session += 1
                print("✓ Success")
            else:
                results_map[nu_id] = {"error": "Failed to fetch or empty response"}
                print("✗ Failed")

            # Save progress after every fetch (safe against interruption)
            save_results(results_map, len(nu_ids))

            # Delay before next request (unless it's the last one)
            if idx < len(remaining_ids):
                print(f"    [-] Waiting {DELAY_SECONDS}s ...")
                time.sleep(DELAY_SECONDS)

    except KeyboardInterrupt:
        print("\n\n[!] Interrupted by user (Ctrl+C).")
        print(f"[*] Progress saved: {len(results_map)} / {len(nu_ids)} profiles in '{OUTPUT_FILE}'.")
        print("[*] You can rerun the script anytime to resume where you left off.")
        sys.exit(0)

    print("\n" + "=" * 65)
    print(f"[SUCCESS] All done! {len(results_map)} profiles saved into '{OUTPUT_FILE}'.")
    print("=" * 65)


if __name__ == "__main__":
    main()
