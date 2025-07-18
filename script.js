let productos = [];
let carrito = [];

window.onload = async () => {
  const res = await fetch("catalog.json");
  productos = await res.json();
  renderCatalog(productos);
  setupFilters(productos);
};

function renderCatalog(items) {
  const catalog = document.getElementById("catalog");
  catalog.innerHTML = "";
  items.forEach(item => {
    const art = document.createElement("article");
    art.innerHTML = `
      <img src="images/${item.imagen}" width="100%" />
      <h3>${item.nombre}</h3>
      <p>${item.precio.toFixed(2)} €</p>
      <button onclick="addToCart('${item.id}')">Añadir</button>
    `;
    catalog.appendChild(art);
  });
}

function setupFilters(data) {
  const idiomaSet = new Set(data.map(p => p.idioma));
  const nivelSet = new Set(data.map(p => p.nivel));

  idiomaSet.forEach(i => {
    document.getElementById("idiomaFilter").innerHTML += `<option>${i}</option>`;
  });

  nivelSet.forEach(n => {
    document.getElementById("nivelFilter").innerHTML += `<option>${n}</option>`;
  });

  document.getElementById("search").addEventListener("input", filterCatalog);
  document.getElementById("idiomaFilter").addEventListener("change", filterCatalog);
  document.getElementById("nivelFilter").addEventListener("change", filterCatalog);
}

function filterCatalog() {
  const search = document.getElementById("search").value.toLowerCase();
  const idioma = document.getElementById("idiomaFilter").value;
  const nivel = document.getElementById("nivelFilter").value;

  const filtrado = productos.filter(p => {
    return (
      (!idioma || p.idioma === idioma) &&
      (!nivel || p.nivel === nivel) &&
      p.nombre.toLowerCase().includes(search)
    );
  });

  renderCatalog(filtrado);
}

function addToCart(id) {
  const prod = productos.find(p => p.id === id);
  carrito.push(prod);
  updateCart();
}

function updateCart() {
  const list = document.getElementById("cartItems");
  list.innerHTML = "";
  carrito.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} - ${item.precio.toFixed(2)} €`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.onclick = () => {
      carrito.splice(i, 1);
      updateCart();
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

document.getElementById("checkoutBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  if (!email || carrito.length === 0) return alert("Falta el correo o carrito vacío");

  const links = carrito.map(p => p.link_drive).join("\n");

  emailjs.init("TU_USER_ID"); // tu ID de EmailJS
  emailjs.send("TU_SERVICE_ID", "TU_TEMPLATE_ID", {
    to_email: email,
    mensaje: `Gracias por tu compra. Aquí tienes los enlaces:\n\n${links}`
  }).then(() => {
    alert("¡Enlaces enviados por correo!");
    carrito = [];
    updateCart();
  }).catch(err => alert("Error enviando email"));
});
