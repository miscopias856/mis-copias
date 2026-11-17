const WHATSAPP = "543812160633";

// IMPORTANTE:
// Esta clave es solamente provisional para probar el diseño.
// No protege una administración publicada en Internet.
const CLAVE_DEMO = "2985";

const categorias = [
  "Librería",
  "Papelería",
  "Regalería",
  "Golosinas",
  "Sublimación",
  "Cotillón",
  "Artículos personalizados",
  "Impresiones",
  "Varios"
];

let productos = JSON.parse(localStorage.getItem("misCopiasProductos") || "[]");
let carrito = JSON.parse(localStorage.getItem("misCopiasCarrito") || "[]");
let imagenActual = "";
let vistaAnterior = "inicio";

function guardarProductos() {
  localStorage.setItem("misCopiasProductos", JSON.stringify(productos));
}

function guardarCarrito() {
  localStorage.setItem("misCopiasCarrito", JSON.stringify(carrito));
}

function formatoPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(valor);
}

function mostrarVista(id) {
  document.querySelectorAll(".vista").forEach(vista => {
    vista.classList.remove("activa");
  });

  const elegida = document.getElementById(id);

  if (elegida) {
    elegida.classList.add("activa");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

document.querySelectorAll("[data-view]").forEach(boton => {
  boton.addEventListener("click", () => mostrarVista(boton.dataset.view));
});

// Categorías
function mostrarCategorias() {
  const contenedor = document.getElementById("categorias-container");
  contenedor.innerHTML = "";

  categorias.forEach(categoria => {
    const boton = document.createElement("button");
    boton.className = "categoria";

    const titulo = document.createElement("h3");
    titulo.textContent = categoria;

    const descripcion = document.createElement("p");
    descripcion.textContent = "Ver nuestros productos";

    boton.append(titulo, descripcion);

    boton.addEventListener("click", () => {
      document.getElementById("titulo-categoria").textContent = categoria;
      mostrarProductos(categoria);
      mostrarVista("catalogo");
    });

    contenedor.appendChild(boton);
  });

  const selector = document.getElementById("categoria-producto");
  selector.innerHTML = "";

  categorias.forEach(categoria => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria;
    selector.appendChild(opcion);
  });
}

function mostrarProductos(categoria) {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  const lista = productos.filter(p => p.categoria === categoria);

  if (lista.length === 0) {
    contenedor.textContent = "Todavía no hay productos publicados en esta categoría.";
    return;
  }

  lista.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";

    if (producto.imagen) {
      const imagen = document.createElement("img");
      imagen.src = producto.imagen;
      imagen.alt = producto.nombre;
      tarjeta.appendChild(imagen);
    }

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = producto.descripcion || "";

    const presentacion = document.createElement("p");
    presentacion.className = "presentacion";
    presentacion.textContent = producto.presentacion || "Venta por unidad";

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = producto.tipoPrecio === "consultar"
      ? "Precio a consultar"
      : formatoPrecio(producto.precio);

    const boton = document.createElement("button");
    boton.className = "boton-principal";
    boton.textContent = "Agregar al carrito";

    boton.addEventListener("click", () => agregarAlCarrito(producto.id));

    tarjeta.append(nombre, descripcion, presentacion, precio, boton);
    contenedor.appendChild(tarjeta);
  });
}

// Carrito
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id, cantidad: 1 });
  }

  guardarCarrito();
  mostrarCarrito();
  alert("¡Producto agregado a Mis pedidos!");
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(p => p.id === id);
  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    carrito = carrito.filter(p => p.id !== id);
  }

  guardarCarrito();
  mostrarCarrito();
}

function quitarProducto(id) {
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();
  mostrarCarrito();
}

function mostrarCarrito() {
  const contenedor = document.getElementById("carrito-container");
  const totalContenedor = document.getElementById("carrito-total");

  contenedor.innerHTML = "";
  let total = 0;
  let hayProductos = false;

  carrito = carrito.filter(item => productos.some(p => p.id === item.id));

  carrito.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (!producto) return;

    hayProductos = true;

    const fila = document.createElement("div");
    fila.className = "item-carrito";

    const info = document.createElement("div");
    const subtotal = producto.tipoPrecio === "consultar"
      ? null
      : Number(producto.precio) * item.cantidad;

    if (subtotal !== null) total += subtotal;

    info.textContent = `${producto.nombre} — ${producto.presentacion || "Unidad"} × ${item.cantidad} — ${
      subtotal === null ? "A consultar" : formatoPrecio(subtotal)
    }`;

    const controles = document.createElement("div");
    controles.className = "controles-carrito";

    const menos = document.createElement("button");
    menos.textContent = "−";
    menos.addEventListener("click", () => cambiarCantidad(item.id, -1));

    const cantidad = document.createElement("span");
    cantidad.textContent = item.cantidad;

    const mas = document.createElement("button");
    mas.textContent = "+";
    mas.addEventListener("click", () => cambiarCantidad(item.id, 1));

    const quitar = document.createElement("button");
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", () => quitarProducto(item.id));

    controles.append(menos, cantidad, mas, quitar);
    fila.append(info, controles);
    contenedor.appendChild(fila);
  });

  guardarCarrito();

  if (!hayProductos) {
    contenedor.textContent = "Tu carrito está vacío.";
    totalContenedor.textContent = "";
    return;
  }

  const hayPrecioConsultar = carrito.some(item => {
    const p = productos.find(prod => prod.id === item.id);
    return p && p.tipoPrecio === "consultar";
  });

  totalContenedor.textContent = hayPrecioConsultar
    ? `Subtotal de precios fijos: ${formatoPrecio(total)}. Hay productos a consultar.`
    : `Total: ${formatoPrecio(total)}`;
}

document.getElementById("enviar-pedido").addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Primero agregá productos a Mis pedidos.");
    return;
  }

  let mensaje = "¡Hola, MIS COPIAS! 😊\n\nQuisiera realizar este pedido:\n\n";
  let total = 0;
  let hayConsultar = false;

  carrito.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (!producto) return;

    mensaje += `• ${producto.nombre}\n`;
    mensaje += `  Presentación: ${producto.presentacion || "Unidad"}\n`;
    mensaje += `  Cantidad: ${item.cantidad}\n`;

    if (producto.tipoPrecio === "consultar") {
      mensaje += "  Precio: A consultar\n\n";
      hayConsultar = true;
    } else {
      const subtotal = Number(producto.precio) * item.cantidad;
      total += subtotal;
      mensaje += `  Subtotal: ${formatoPrecio(subtotal)}\n\n`;
    }
  });

  mensaje += `Subtotal de precios fijos: ${formatoPrecio(total)}\n`;

  if (hayConsultar) {
    mensaje += "Hay productos cuyo precio necesito consultar.\n";
  }

  mensaje += "\n¿Podrían confirmarme el pedido? ¡Muchas gracias!";

  const enlace = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(enlace, "_blank");
});

// Administración provisional
document.getElementById("abrir-admin").addEventListener("click", () => {
  vistaAnterior = document.querySelector(".vista.activa")?.id || "inicio";
  document.getElementById("clave-admin").value = "";
  document.getElementById("mensaje-login").textContent = "";
  document.getElementById("login-admin").hidden = false;
  document.getElementById("panel-admin").hidden = true;
  mostrarVista("administracion");
});

document.getElementById("ingresar-admin").addEventListener("click", () => {
  const clave = document.getElementById("clave-admin").value;

  if (clave === CLAVE_DEMO) {
    document.getElementById("login-admin").hidden = true;
    document.getElementById("panel-admin").hidden = false;
    mostrarAdminProductos();
  } else {
    document.getElementById("mensaje-login").textContent = "Contraseña incorrecta.";
  }
});

document.getElementById("clave-admin").addEventListener("keydown", evento => {
  if (evento.key === "Enter") {
    document.getElementById("ingresar-admin").click();
  }
});

document.getElementById("cerrar-admin").addEventListener("click", () => {
  document.getElementById("panel-admin").hidden = true;
  document.getElementById("login-admin").hidden = false;
  mostrarVista(vistaAnterior);
});

// Formulario de productos
const formulario = document.getElementById("form-producto");
const inputImagen = document.getElementById("imagen-producto");
const vistaPrevia = document.getElementById("vista-previa");

document.getElementById("nuevo-producto").addEventListener("click", () => {
  formulario.reset();
  document.getElementById("producto-id").value = "";
  document.getElementById("titulo-formulario").textContent = "Nuevo producto";
  document.getElementById("mensaje-formulario").textContent = "";
  imagenActual = "";
  vistaPrevia.hidden = true;
  formulario.hidden = false;
  formulario.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("cancelar-edicion").addEventListener("click", () => {
  formulario.hidden = true;
});

inputImagen.addEventListener("change", () => {
  const archivo = inputImagen.files[0];
  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    alert("Elegí un archivo de imagen.");
    inputImagen.value = "";
    return;
  }

  if (archivo.size > 700000) {
    alert("La imagen es muy pesada. Elegí una imagen de menos de 700 KB.");
    inputImagen.value = "";
    return;
  }

  const lector = new FileReader();

  lector.onload = () => {
    imagenActual = lector.result;
    vistaPrevia.src = imagenActual;
    vistaPrevia.hidden = false;
  };

  lector.readAsDataURL(archivo);
});

formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  const idExistente = document.getElementById("producto-id").value;
  const existente = productos.find(p => p.id === idExistente);

  const producto = {
    id: idExistente || String(Date.now()),
    nombre: document.getElementById("nombre-producto").value.trim(),
    categoria: document.getElementById("categoria-producto").value,
    descripcion: document.getElementById("descripcion-producto").value.trim(),
    precio: Number(document.getElementById("precio-producto").value) || 0,
    tipoPrecio: document.getElementById("tipo-precio").value,
    presentacion: document.getElementById("presentacion-producto").value.trim(),
    imagen: imagenActual || (existente ? existente.imagen : "")
  };

  if (!producto.nombre) {
    alert("Escribí el nombre del producto.");
    return;
  }

  if (producto.tipoPrecio === "fijo" && producto.precio <= 0) {
    alert("Ingresá un precio válido o elegí A consultar.");
    return;
  }

  if (existente) {
    productos = productos.map(p => p.id === idExistente ? producto : p);
  } else {
    productos.push(producto);
  }

  try {
    guardarProductos();
    formulario.hidden = true;
    inputImagen.value = "";
    imagenActual = "";
    mostrarAdminProductos();
    mostrarCategorias();
    mostrarCarrito();
    alert("Producto guardado.");
  } catch (error) {
    alert("No se pudo guardar. Puede que el almacenamiento del navegador esté lleno.");
  }
});

function mostrarAdminProductos() {
  const contenedor = document.getElementById("admin-productos");
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.textContent = "Todavía no agregaste productos.";
    return;
  }

  productos.forEach(producto => {
    const fila = document.createElement("div");
    fila.className = "admin-producto";

    if (producto.imagen) {
      const imagen = document.createElement("img");
      imagen.src = producto.imagen;
      imagen.alt = producto.nombre;
      fila.appendChild(imagen);
    }

    const info = document.createElement("div");
    info.className = "admin-producto-info";

    const nombre = document.createElement("strong");
    nombre.textContent = producto.nombre;

    const detalle = document.createElement("p");
    detalle.textContent = `${producto.categoria} · ${
      producto.tipoPrecio === "consultar" ? "A consultar" : formatoPrecio(producto.precio)
    } · ${producto.presentacion || "Unidad"}`;

    info.append(nombre, detalle);

    const editar = document.createElement("button");
    editar.className = "boton-secundario";
    editar.textContent = "Editar";
    editar.addEventListener("click", () => editarProducto(producto.id));

    const eliminar = document.createElement("button");
    eliminar.className = "boton-principal";
    eliminar.textContent = "Eliminar";
    eliminar.addEventListener("click", () => eliminarProducto(producto.id));

    fila.append(info, editar, eliminar);
    contenedor.appendChild(fila);
  });
}

function editarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  document.getElementById("producto-id").value = producto.id;
  document.getElementById("nombre-producto").value = producto.nombre;
  document.getElementById("categoria-producto").value = producto.categoria;
  document.getElementById("descripcion-producto").value = producto.descripcion;
  document.getElementById("precio-producto").value = producto.precio || "";
  document.getElementById("tipo-precio").value = producto.tipoPrecio;
  document.getElementById("presentacion-producto").value = producto.presentacion || "";

  imagenActual = producto.imagen || "";

  if (imagenActual) {
    vistaPrevia.src = imagenActual;
    vistaPrevia.hidden = false;
  } else {
    vistaPrevia.hidden = true;
  }

  document.getElementById("titulo-formulario").textContent = "Editar producto";
  formulario.hidden = false;
  formulario.scrollIntoView({ behavior: "smooth" });
}

function eliminarProducto(id) {
  if (!confirm("¿Querés eliminar este producto del catálogo?")) return;

  productos = productos.filter(p => p.id !== id);
  carrito = carrito.filter(p => p.id !== id);

  guardarProductos();
  guardarCarrito();
  mostrarAdminProductos();
  mostrarCarrito();
  mostrarCategorias();
}

mostrarCategorias();
mostrarCarrito();
mostrarVista("inicio");