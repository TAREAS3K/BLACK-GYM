let paqueteActual = '';
let precioActual = 0;
let cantidadSeleccionada = 1;

let carrito = JSON.parse(localStorage.getItem('blackgym_carrito')) || [];

document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorHeader();
    actualizarContadorSuscriptores();
    if (document.getElementById('cartContent')) {
        renderizarCarrito();
    }
});

function actualizarContadorHeader() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        let totalItems = 0;
        carrito.forEach(item => totalItems += item.cantidad);
        cartCountElement.innerText = totalItems;
    }
}

function actualizarContadorSuscriptores() {
    const subsCountElement = document.getElementById('subsCount');
    if (subsCountElement) {
        let totalSubs = parseInt(localStorage.getItem('blackgym_total_suscriptores') || 120);
        subsCountElement.innerText = totalSubs;
    }
}

function abrirModalPaquete(nombrePaquete, precio) {
    paqueteActual = nombrePaquete;
    precioActual = precio;
    cantidadSeleccionada = 1;

    document.getElementById('modalTitle').innerText = 'Paquete ' + nombrePaquete;
    actualizarContenidoModal();
    document.getElementById('customModal').classList.add('active');
}

function actualizarContenidoModal() {
    const body = document.getElementById('modalBody');

    body.innerHTML = `
        <p>Precio Unitario: <strong>$${precioActual.toLocaleString()}</strong></p>
        <p style="font-size: 0.95rem; color: #aaa;">Selecciona la cantidad de pases o suscripciones que deseas adquirir:</p>
        
        <div class="qty-control">
            <button class="btn-qty" onclick="cambiarCantidad(-1)">-</button>
            <span class="qty-number" id="qtyText">${cantidadSeleccionada}</span>
            <button class="btn-qty" onclick="cambiarCantidad(1)">+</button>
        </div>

        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="modal-btn" onclick="agregarAlCarrito()"><i class="fa-solid fa-cart-shopping"></i> Agregar al Carrito</button>
        </div>
    `;
}

function cambiarCantidad(cambio) {
    let nuevaCantidad = cantidadSeleccionada + cambio;
    if (nuevaCantidad >= 1) {
        cantidadSeleccionada = nuevaCantidad;
        document.getElementById('qtyText').innerText = cantidadSeleccionada;
    }
}

function agregarAlCarrito() {
    let itemExistente = carrito.find(item => item.nombre === paqueteActual);

    if (itemExistente) {
        itemExistente.cantidad += cantidadSeleccionada;
        itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
    } else {
        carrito.push({
            nombre: paqueteActual,
            precio: precioActual,
            cantidad: cantidadSeleccionada,
            subtotal: cantidadSeleccionada * precioActual
        });
    }

    guardarYActualizarCarrito();

    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <p style="color: #28a745; font-size: 1.2rem; font-weight: bold;">¡Agregado con éxito!</p>
        <p>Se han añadido <strong>${cantidadSeleccionada}</strong> paquete(s) de <strong>${paqueteActual}</strong> al carrito.</p>
        <div class="modal-actions">
            <button class="modal-btn" onclick="cerrarModal()">Aceptar</button>
        </div>
    `;
}

function renderizarCarrito() {
    const container = document.getElementById('cartContent');
    if (!container) return;

    let totalPagar = 0;
    carrito.forEach(item => totalPagar += item.subtotal);
    actualizarContadorHeader();

    if (carrito.length === 0) {
        container.innerHTML = `<p style="color: #aaa; text-align: center; padding: 20px;">Tu carrito está vacío actualmente. Revisa la sección de Paquetes para comenzar.</p>`;
        return;
    }

    let html = `
        <div class="cart-table-container">
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Paquete</th>
                        <th>Precio U.</th>
                        <th>Cant.</th>
                        <th>Subtotal</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    carrito.forEach((item, index) => {
        html += `
            <tr>
                <td><strong>${item.nombre}</strong></td>
                <td>$${item.precio.toLocaleString()}</td>
                <td>${item.cantidad}</td>
                <td>$${item.subtotal.toLocaleString()}</td>
                <td><button class="btn-eliminar" onclick="eliminarDelCarrito(${index})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>

        <div class="cart-summary">
            <div class="cart-total-text">
                Total a pagar: <span class="cart-total-amount">$${totalPagar.toLocaleString()}</span>
            </div>
            
            <div class="cart-checkout-area">
                <div class="buyer-input-group">
                    <label for="nombreComprador">Nombre del Comprador:</label>
                    <input type="text" id="nombreComprador" class="buyer-input" placeholder="Ingresa tu nombre completo">
                </div>
                <div class="cart-actions">
                    <button class="btn-cart-action btn-vaciar" onclick="vaciarCarrito()">Vaciar</button>
                    <button class="btn-cart-action btn-comprar" onclick="procesarCompra()">Finalizar Compra</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarYActualizarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    guardarYActualizarCarrito();
}

function procesarCompra() {
    const inputComprador = document.getElementById('nombreComprador');
    const nombreComprador = inputComprador ? inputComprador.value.trim() : '';

    if (!nombreComprador) {
        alert("Por favor, ingresa el nombre del comprador para completar el pedido.");
        if (inputComprador) inputComprador.focus();
        return;
    }

    // Calcular el total de suscripciones compradas en el carrito actual
    let totalUnidadesCompradas = 0;
    carrito.forEach(item => totalUnidadesCompradas += item.cantidad);

    // Incrementar el contador global de suscriptores
    let totalSubsActual = parseInt(localStorage.getItem('blackgym_total_suscriptores') || 120);
    totalSubsActual += totalUnidadesCompradas;
    localStorage.setItem('blackgym_total_suscriptores', totalSubsActual);
    actualizarContadorSuscriptores();

    // Generar el número de pedido
    let contadorPedido = parseInt(localStorage.getItem('contadorPedidosBG') || 100);
    contadorPedido++;
    localStorage.setItem('contadorPedidosBG', contadorPedido);

    const numPedido = `BG-${new Date().getFullYear()}-${contadorPedido}`;

    document.getElementById('modalTitle').innerText = '¡Compra Exitosa!';
    document.getElementById('modalBody').innerHTML = `
        <p style="color: #28a745; font-weight: bold; font-size: 1.2rem; margin-bottom: 5px;">¡Gracias por tu compra!</p>
        <p style="margin-top: 5px;">Comprador: <strong>${nombreComprador}</strong></p>
        
        <div class="order-badge">
            N° DE PEDIDO: ${numPedido}
        </div>

        <p style="font-size: 0.95rem; color: #ccc;">Tu pedido ha sido procesado con éxito. Muestra este número de pedido en recepción para la entrega de tu pase o activación.</p>
        
        <div class="modal-actions">
            <button class="modal-btn" onclick="cerrarModal()">Aceptar</button>
        </div>
    `;

    carrito = [];
    guardarYActualizarCarrito();
    document.getElementById('customModal').classList.add('active');
}

function guardarYActualizarCarrito() {
    localStorage.setItem('blackgym_carrito', JSON.stringify(carrito));
    actualizarContadorHeader();
    if (document.getElementById('cartContent')) {
        renderizarCarrito();
    }
}

function cerrarModal() {
    document.getElementById('customModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const paseForm = document.getElementById('paseForm');
    if (paseForm) {
        paseForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nombre = document.getElementById('nombre').value;
            let contador = localStorage.getItem('contadorPases') || 0;
            
            contador++;
            localStorage.setItem('contadorPases', contador);

            document.getElementById('modalTitle').innerText = '¡Pase Registrado!';
            document.getElementById('modalBody').innerHTML = `
                <p>¡Felicidades, <strong>${nombre}</strong>!</p>
                <p>Tu pase de prueba ha sido registrado con éxito.</p>
                <p style="font-size: 0.95rem; color: #ff3b30;">Eres la persona registrada <strong>#${contador}</strong></p>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="cerrarModal()">Aceptar</button>
                </div>
            `;
            
            document.getElementById('customModal').classList.add('active');
            this.reset();
        });
    }
});