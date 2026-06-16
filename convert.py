import json
import re

# Ścieżki do plików
RESTAURANTS_FILE = 'restaurants.json'
OUTPUT_FILE = 'restaurants.json'

def hstore_to_dict(hstore_str):
    """Konwertuje tekst hstore na czysty słownik/obiekt {klucz: wartość}"""
    if not hstore_str:
        return {}
    
    # Wyciągamy pary "klucz"=>"wartość" za pomocą wyrażenia regularnego
    pairs = re.findall(r'"([^"]+)"=>"([^"]+)"', hstore_str)
    
    # Zwracamy jako słownik (w JSONie zmapuje się to jako obiekt {})
    return {k: v for k, v in pairs}

def main():
    print("1. Wczytywanie pliku restaurants.json...")
    with open(RESTAURANTS_FILE, 'r', encoding='utf-8') as f:
        restaurants = json.load(f)

    print("2. Przetwarzanie other_tags na płaskie obiekty...")
    for feature in restaurants:
        properties = feature.get('properties', {})
        
        # Pobieramy stary string hstore
        old_tags = properties.get('other_tags', '')
        
        # Nadpisujemy pole nowym, czystym słownikiem
        properties['other_tags'] = hstore_to_dict(old_tags)

    print("3. Zapisywanie poprawionej struktury...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(restaurants, f, ensure_ascii=False, indent=2)

    print("Sukces! JSON został poprawiony do formatu obiektowego (słownika).")

if __name__ == '__main__':
    main()