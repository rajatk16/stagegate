import json
import os
import subprocess
import time
from pathlib import Path

project = os.environ["FIREBASE_PROJECT_ID"]
configuration = json.loads(
    Path("firestore.indexes.json").read_text()
)

# The current repository uses composite indexes only.
# Add field-index readiness handling before introducing field overrides.
if configuration.get("fieldOverrides"):
    raise SystemExit(
        "Field overrides require an additional readiness check."
    )


def signature(collection_group, index):
    fields = [dict(field) for field in index["fields"]]

    # Firestore adds this field automatically when it is omitted.
    if not any(field["fieldPath"] == "__name__" for field in fields):
        last_order = next(
            (
                field["order"]
                for field in reversed(fields)
                if "order" in field
            ),
            "ASCENDING",
        )
        fields.append({
            "fieldPath": "__name__",
            "order": last_order,
        })

    return json.dumps({
        "collectionGroup": collection_group,
        "queryScope": index["queryScope"],
        "fields": fields,
    }, sort_keys=True)


expected = {
    signature(index["collectionGroup"], index)
    for index in configuration["indexes"]
}

deadline = time.monotonic() + 15 * 60

while True:
    result = subprocess.run(
        [
            "gcloud", "firestore", "indexes", "composite", "list",
            "--project", project,
            "--database", "(default)",
            "--format=json",
            "--quiet",
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=60,
    )

    actual = {}

    for index in json.loads(result.stdout):
        collection_group = (
            index["name"]
            .split("/collectionGroups/", 1)[1]
            .split("/indexes/", 1)[0]
        )

        actual[signature(collection_group, index)] = index["state"]

    states = [actual.get(key, "MISSING") for key in expected]

    if any(state == "NEEDS_REPAIR" for state in states):
        raise SystemExit(
            "A required Firestore index needs repair. Deployment stopped."
        )

    if all(state == "READY" for state in states):
        print("All required Firestore indexes are ready.", flush=True)
        break

    if time.monotonic() >= deadline:
        raise SystemExit(
            "Timed out waiting for required Firestore indexes."
        )

    pending = sum(state != "READY" for state in states)
    print(f"Waiting for {pending} required index(es)…", flush=True)
    time.sleep(15)
