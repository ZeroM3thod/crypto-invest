#!/usr/bin/env python3
"""
Deriv API connection tester — run from your terminal.
Usage:
    pip install websocket-client
    python3 deriv_test.py YOUR_API_TOKEN [APP_ID]

If APP_ID is omitted, defaults to 1089 (Deriv's public test app_id).
"""
import sys
import json
import websocket

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 deriv_test.py YOUR_API_TOKEN [APP_ID]")
        sys.exit(1)

    token = sys.argv[1]
    app_id = sys.argv[2] if len(sys.argv) > 2 else "1089"
    url = f"wss://ws.derivws.com/websockets/v3?app_id={app_id}"

    print(f"Connecting to: {url}")

    try:
        ws = websocket.create_connection(url, timeout=10)
    except Exception as e:
        print(f"✗ Could not open WebSocket connection: {e}")
        print("  → This confirms a network-level block (firewall/VPN/ISP/DNS),")
        print("    not a browser or Deriv-account issue.")
        sys.exit(1)

    print("✓ WebSocket connected.")

    ws.send(json.dumps({"authorize": token, "req_id": 1}))
    resp = json.loads(ws.recv())

    if resp.get("error"):
        err = resp["error"]
        print(f"✗ Authorization failed: [{err.get('code')}] {err.get('message')}")
        ws.close()
        sys.exit(1)

    auth = resp["authorize"]
    print("✓ Authorization succeeded.")
    print(f"  Login ID: {auth['loginid']}")
    print(f"  Is virtual (demo)?: {'YES' if auth.get('is_virtual') else 'NO — this is a REAL-money account token'}")
    print(f"  Currency: {auth.get('currency')}")

    ws.send(json.dumps({"balance": 1, "req_id": 2}))
    resp = json.loads(ws.recv())
    if resp.get("error"):
        print(f"✗ Balance request failed: {resp['error'].get('message')}")
    else:
        bal = resp["balance"]
        print(f"✓ Balance: {bal['balance']} {bal['currency']}")
        print("\nALL CHECKS PASSED.")

    ws.close()

if __name__ == "__main__":
    main()
