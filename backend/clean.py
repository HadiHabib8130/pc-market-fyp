import json

print("Reading the backup file...")
with open('db_backup.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter out the broken admin logs (and user sessions, which also cause issues)
print("Removing admin logs...")
cleaned_data = [
    item for item in data 
    if item['model'] not in ['admin.logentry', 'sessions.session']
]

# Save the shiny new clean file
print("Saving clean database...")
with open('db_clean.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f)

print("Done! You are ready to load the data.")
