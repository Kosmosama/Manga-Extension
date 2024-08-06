import json
from bs4 import BeautifulSoup

# Especifica la ruta correcta de tu archivo ado.html
file_path = 'PATH'

# Abre y lee el archivo
with open(file_path, 'r', encoding='utf-8') as file:
    content = file.read()

# Usa BeautifulSoup para parsear el contenido HTML
soup = BeautifulSoup(content, 'html.parser')

# Encuentra todos los elementos <DT> que contienen los marcadores
bookmark_elements = soup.find_all('dt')

bookmarks = []

# Procesa cada elemento <DT> y extrae la información relevante
for element in bookmark_elements:
    link = element.find('a')
    if link:
        href = link.get('href', 'N/A')
        add_date = link.get('add_date', 'N/A')
        text = link.text
        bookmarks.append({
            'title': text,
            'url': href,
            'add_date': add_date
        })

# Especifica la ruta correcta donde quieres guardar tu archivo bookmarks.json
output_path = 'PATH'

# Guarda los marcadores extraídos en un archivo JSON
with open(output_path, 'w', encoding='utf-8') as output_file:
    json.dump(bookmarks, output_file, ensure_ascii=False, indent=4)

print("Los marcadores han sido transformados y guardados en 'bookmarks.json'")
