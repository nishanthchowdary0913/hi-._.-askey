"""Back up and recreate the production collection for clean metadata ingestion."""
from qdrant_client import QdrantClient
from qdrant_client.models import PointIdsList


QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge"
BACKUP_COLLECTION_NAME = "college_knowledge_pre_metadata_backup"


client = QdrantClient(path=QDRANT_PATH)

if not client.collection_exists(COLLECTION_NAME):
    raise RuntimeError(f"Collection {COLLECTION_NAME!r} does not exist.")

collection_info = client.get_collection(COLLECTION_NAME)
copied = 0

if client.collection_exists(BACKUP_COLLECTION_NAME):
    print(f"Using existing backup: {BACKUP_COLLECTION_NAME}")
else:
    client.create_collection(
        collection_name=BACKUP_COLLECTION_NAME,
        vectors_config=collection_info.config.params.vectors,
    )

    offset = None
    while True:
        points, offset = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=100,
            offset=offset,
            with_vectors=True,
            with_payload=True,
        )
        if not points:
            break

        client.upsert(collection_name=BACKUP_COLLECTION_NAME, points=points)
        copied += len(points)
        if offset is None:
            break

client.delete_collection(COLLECTION_NAME)
client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=collection_info.config.params.vectors,
)

# Qdrant local storage can retain old point files when a collection is deleted
# and recreated with the same name. Explicitly remove any residual point IDs.
residual_points, _ = client.scroll(
    collection_name=COLLECTION_NAME,
    limit=10_000,
    with_vectors=False,
    with_payload=False,
)
if residual_points:
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=PointIdsList(points=[point.id for point in residual_points]),
        wait=True,
    )

remaining = client.count(COLLECTION_NAME, exact=True).count
if remaining:
    raise RuntimeError(f"Expected an empty collection, found {remaining} points.")

print(
    f"Backed up {copied} existing points to {BACKUP_COLLECTION_NAME} and "
    f"recreated an empty {COLLECTION_NAME}."
)
client.close()
