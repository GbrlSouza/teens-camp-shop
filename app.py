from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)
PRODUCTS_FILE = 'products.json'

def load_products():
    """Carrega os produtos do arquivo JSON."""
    if not os.path.exists(PRODUCTS_FILE):
        return []
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_products(products):
    """Salva a lista de produtos no arquivo JSON."""
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=4)

@app.route('/api/products', methods=['GET'])
def get_products():
    """Retorna a lista de todos os produtos."""
    products = load_products()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product_api():
    """Adiciona um novo produto."""
    new_product_data = request.json
    products = load_products()
    
    new_id = max([p['id'] for p in products]) + 1 if products else 1
    new_product_data['id'] = new_id
    
    products.append(new_product_data)
    save_products(products)
    
    return jsonify({"message": "Produto adicionado com sucesso!", "product": new_product_data}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product_api(product_id):
    """Atualiza um produto existente."""
    updated_data = request.json
    products = load_products()
    
    product_found = False
    for i, product in enumerate(products):
        if product['id'] == product_id:
            products[i].update(updated_data)
            product_found = True
            break
            
    if product_found:
        save_products(products)
        return jsonify({"message": "Produto atualizado com sucesso!"}), 200
    else:
        return jsonify({"error": "Produto não encontrado."}), 404

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product_api(product_id):
    """Exclui um produto."""
    products = load_products()
    
    original_count = len(products)
    products = [p for p in products if p['id'] != product_id]
    
    if len(products) < original_count:
        save_products(products)
        return jsonify({"message": "Produto excluído com sucesso!"}), 200
    else:
        return jsonify({"error": "Produto não encontrado."}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5500)