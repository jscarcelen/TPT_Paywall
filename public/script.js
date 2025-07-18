let productos = [];
let carrito = [];

window.onload = async () => {
  const res = await fetch('/api/catalog');
  productos = await res.json();
  renderCatalog(productos);
};

function renderCatalog(items) {
  const container = document.getElementById('catalog');
  container.innerHTML = '';
  items.forEach(p => {
    const div = document.createElement('div');
    div.innerHTML = `
      <img src="/images/${p.imagen}" width="150">
      <h3>${p.nombre}</h3>
      <p>${(p.precio / 100).toFixed(2)}€</p>
      <button onclick="addToCart('${p.id}')">Añadir</button>
    `;
    container.appendChild(div);
  });
}

function addToCart(id) {
  const item = productos.find(p => p.id === id);
  carrito.push(item);
  updateCart();
}

function updateCart() {
  const ul = document.getElementById('cartItems');
  ul.innerHTML = '';
  carrito.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `${item.nombre} ${(item.precio / 100).toFixed(2)}€`;
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.onclick = () => {
      carrito.splice(i, 1);
      updateCart();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

document.getElementById("checkoutBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  if (!email || carrito.length === 0) return alert("Rellena el email y añade productos.");
  const itemIds = carrito.map(p => p.id);
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, itemIds })
  });
  const data = await res.json();
  if (data.url) {
    localStorage.setItem("carrito", JSON.stringify(itemIds));
    window.location = data.url;
  }
};
