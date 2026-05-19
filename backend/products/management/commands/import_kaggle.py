import csv
from django.core.management.base import BaseCommand
from products.models import MasterProduct

class Command(BaseCommand):
    help = 'Imports PC components from various CSV formats'

    def add_arguments(self, parser):
        # Corrected: add_argument (singular)
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')
        parser.add_argument('category', type=str, help='Category (e.g., CPU, GPU, SSD)')

    def handle(self, *args, **options):
        file_path = options['csv_file']
        input_category = options['category']
        
        manufacturers = [
            "Asus", "MSI", "Gigabyte", "ASRock", "EVGA", "Zotac", "Palit", "Sapphire", 
            "Lian Li", "NZXT", "Corsair", "Cooler Master", "G.Skill", "Samsung", 
            "Kingston", "Crucial", "TeamGroup", "Deepcool", "Fractal Design",
            "Silverstone", "be quiet!", "SeaSonic", "SHARKOON", "FSP Group", 
            "Thermaltake", "Enermax", "Phanteks", "Antec", "Rosewill",
            "Western Digital", "WD", "HP", "PNY", "ADATA", "Silicon Power", "Sabrent"
        ]
        
        count = 0
        # The 'try' block starts here
        try:
            with open(file_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    full_name = row.get('name')
                    if not full_name:
                        continue

                    # --- SMART STORAGE CATEGORIZATION ---
                    storage_type = row.get('type', '').upper()
                    current_category = input_category
                    
                    if "HDD" in storage_type:
                        current_category = "HDD"
                    elif "NVME" in storage_type or "SATA" in storage_type:
                        current_category = "SSD"

                    # --- SMART BRAND EXTRACTION ---
                    extracted_brand = None
                    model_name = full_name
                    for m in manufacturers:
                        if full_name.lower().startswith(m.lower()):
                            extracted_brand = m
                            model_name = full_name[len(m):].strip()
                            break
                    
                    if not extracted_brand:
                        parts = full_name.split(' ', 1)
                        extracted_brand = parts[0]
                        model_name = parts[1] if len(parts) > 1 else full_name

                    # --- DATABASE UPDATE ---
                    MasterProduct.objects.update_or_create(
                        brand=extracted_brand,
                        model_name=model_name,
                        defaults={
                            'category': current_category,
                            'stock_image_url': row.get('image'),
                            'specs_json': {
                                'capacity': row.get('space'),
                                'interface': storage_type,
                                'power': row.get('power'),
                                'size': row.get('size'),
                                'chipset': row.get('brand'),
                                'socket': row.get('socket'),
                                'vram': row.get('VRAM'),
                                'speed': row.get('speed'),
                                'url': row.get('url')
                            }
                        }
                    )
                    count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Successfully sorted and imported {count} items!'))

        # This was the missing clause causing the SyntaxError
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An unexpected error occurred: {e}"))