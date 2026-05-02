import requests
import time

BASE_URL = "http://localhost:8000/api"

events = [
    {"component_id": "RDBMS_PRIMARY_01", "severity": "P0", "message": "Connection pool exhausted - max connections reached"},
    {"component_id": "RDBMS_PRIMARY_01", "severity": "P0", "message": "Query timeout after 30s"},
    {"component_id": "RDBMS_PRIMARY_01", "severity": "P0", "message": "Replication lag detected"},
    {"component_id": "CACHE_CLUSTER_01", "severity": "P2", "message": "Cache miss rate exceeded 80%"},
    {"component_id": "CACHE_CLUSTER_01", "severity": "P2", "message": "Memory usage at 95%"},
    {"component_id": "API_GATEWAY_01", "severity": "P1", "message": "Latency spike: p99 > 2000ms"},
    {"component_id": "API_GATEWAY_01", "severity": "P1", "message": "Error rate exceeded 5%"},
    {"component_id": "MCP_HOST_01", "severity": "P1", "message": "MCP host unreachable"},
    {"component_id": "QUEUE_KAFKA_01", "severity": "P2", "message": "Consumer lag: 50000 messages behind"},
]

print("🚨 Simulating infrastructure failure cascade...\n")

for event in events:
    try:
        res = requests.post(f"{BASE_URL}/signals", json=event)
        data = res.json()
        print(f"✅ {event['component_id']} [{data['severity']}] → WorkItem: {data['workitem_id'][:8]}... (new={data['is_new_workitem']})")
        time.sleep(0.5)
    except Exception as e:
        print(f"❌ Failed: {e}")

print("\n✅ Simulation complete! Check dashboard at http://localhost:3000")