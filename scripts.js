const PASSWORD = "finnCracK12@";
const videosKey = 'videos';
const shortsKey = 'shorts';
const actoresKey = 'actrices';
const categoriasKey = 'categorias';
const carpetasKey = 'carpetas';
const favoritosKey = 'favoritos';
const favoritosShortsKey = 'favoritosShorts';
const actricesFotosKey = 'actricesFotos';

const galeria = document.getElementById('galeria');
const galeriaShorts = document.getElementById('galeriaShorts');
const galeriaActrices = document.getElementById('galeriaActrices');
const buscador = document.getElementById('buscador');
const categoriaFiltro = document.getElementById('categoriaFiltro');

// Función mejorada para normalizar nombres
function normalizarNombre(nombre) {
  return nombre ? nombre.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
}

// Función mejorada para obtener o crear actriz
function obtenerOCrearActriz(nombreActriz) {
  if (!nombreActriz || nombreActriz.trim() === '') return '';
  
  const actrices = getData(actoresKey);
  const nombreBuscado = normalizarNombre(nombreActriz);
  
  // Buscar actriz existente
  const actrizExistente = actrices.find(a => normalizarNombre(a) === nombreBuscado);
  
  if (actrizExistente) {
    return actrizExistente;
  } else {
    // Agregar nueva actriz
    const nombreFormateado = nombreActriz.trim();
    actrices.push(nombreFormateado);
    setData(actoresKey, actrices);
    
    // Actualizar selectores
    actualizarSelect(document.getElementById('actrizSelect'), actrices);
    actualizarSelect(categoriaFiltro, getData(categoriasKey), true);
    
    return nombreFormateado;
  }
}

function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  if (id === "galeriaTab") {
    cargarVideos(true);
  } else if (id === "shortsTab") {
    cargarShorts();
  } else if (id === "favoritosTab") {
    cargarFavoritos();
  } else if (id === "actricesTab") {
    cargarActrices();
  }
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function actualizarSelect(select, data, incluirTodas = false) {
  select.innerHTML = '';
  if (incluirTodas) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '📂 Todas las categorías';
    select.appendChild(opt);
  }
  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function guardarVideo() {
  const video = {
    videoUrl: document.getElementById('videoUrl').value,
    imageUrl: document.getElementById('imageUrl').value,
    videoNombre: document.getElementById('videoNombre').value,
    actriz: obtenerOCrearActriz(
      document.getElementById('nuevaActriz').value || document.getElementById('actrizSelect').value
    ),
    categoria: document.getElementById('nuevaCategoria').value || document.getElementById('categoriaSelect').value,
    carpeta: document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) return alert("Todos los campos son obligatorios");

  const categorias = getData(categoriasKey);
  const carpetas = getData(carpetasKey);

  if (video.categoria && !categorias.includes(video.categoria)) {
    categorias.push(video.categoria);
    setData(categoriasKey, categorias);
  }
  if (video.carpeta && !carpetas.includes(video.carpeta)) {
    carpetas.push(video.carpeta);
    setData(carpetasKey, carpetas);
  }

  const lista = getData(videosKey);
  lista.push(video);
  setData(videosKey, lista);

  document.querySelectorAll('.formulario input').forEach(input => input.value = '');
  cargarDatos();
  mostrarTab('galeriaTab');
}

function guardarShort() {
  const short = {
    videoUrl: document.getElementById('shortUrl').value,
    imageUrl: document.getElementById('shortImageUrl').value
  };

  if (!short.videoUrl || !short.imageUrl) return alert("Ambos campos son obligatorios");

  const lista = getData(shortsKey);
  lista.push(short);
  setData(shortsKey, lista);

  document.getElementById('shortUrl').value = '';
  document.getElementById('shortImageUrl').value = '';
  cargarShorts();
}

function guardarActrizFoto() {
  const nombre = document.getElementById('nuevaActrizFoto').value;
  const fotoUrl = document.getElementById('fotoActrizUrl').value;

  if (!nombre || !fotoUrl) return alert("Ambos campos son obligatorios");

  // Normalizar nombre y verificar existencia
  const nombreActriz = obtenerOCrearActriz(nombre);
  
  // Guardar foto (actualizar si ya existe)
  const actricesFotos = getData(actricesFotosKey);
  const index = actricesFotos.findIndex(a => normalizarNombre(a.nombre) === normalizarNombre(nombreActriz));
  
  if (index >= 0) {
    actricesFotos[index].fotoUrl = fotoUrl; // Actualizar foto existente
  } else {
    actricesFotos.push({ nombre: nombreActriz, fotoUrl }); // Agregar nueva
  }
  
  setData(actricesFotosKey, actricesFotos);
  
  // Limpiar y actualizar
  document.getElementById('nuevaActrizFoto').value = '';
  document.getElementById('fotoActrizUrl').value = '';
  cargarActrices();
  actualizarSelect(document.getElementById('actrizSelect'), getData(actoresKey));
}

function cargarDatos() {
  actualizarSelect(document.getElementById('actrizSelect'), getData(actoresKey));
  actualizarSelect(document.getElementById('categoriaSelect'), getData(categoriasKey));
  actualizarSelect(document.getElementById('carpetaSelect'), getData(carpetasKey));
  actualizarSelect(categoriaFiltro, getData(categoriasKey), true);
  cargarVideos(true);
}

function cargarShorts() {
  const shorts = getData(shortsKey);
  const favoritos = getData(favoritosShortsKey);
  
  galeriaShorts.innerHTML = '';
  
  shorts.forEach(short => {
    const card = document.createElement('div');
    card.className = 'short-card';

    const img = document.createElement('img');
    img.src = short.imageUrl;
    img.onclick = () => {
      copiarEnlace(short.videoUrl);
      window.open(short.videoUrl, '_blank');
    };

    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.style.marginTop = '10px';

    const star = document.createElement('span');
    star.textContent = favoritos.includes(short.videoUrl) ? '⭐' : '☆';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.title = 'Copiar enlace';
    copy.onclick = () => copiarEnlace(short.videoUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.onclick = () => eliminarShort(short.videoUrl);

    acciones.append(star, copy, trash);
    card.append(img, acciones);
    galeriaShorts.appendChild(card);
  });
}

function cargarActrices() {
  const actricesFotos = getData(actricesFotosKey);
  const todosVideos = getData(videosKey);
  galeriaActrices.innerHTML = '';

  actricesFotos.forEach(actriz => {
    // Contar videos de ESTA actriz (comparación exacta normalizada)
    const cantidad = todosVideos.filter(v => 
      v.actriz && normalizarNombre(v.actriz) === normalizarNombre(actriz.nombre)
    ).length;

    const card = document.createElement('div');
    card.className = 'actriz-card';
    card.onclick = () => filtrarPorActriz(actriz.nombre);

    const img = document.createElement('img');
    img.className = 'actriz-foto';
    img.src = actriz.fotoUrl;
    img.alt = actriz.nombre;
    img.classList.add(cantidad > 0 ? 'actriz-existe' : 'actriz-nueva');

    const nombre = document.createElement('div');
    nombre.className = 'actriz-nombre';
    nombre.textContent = actriz.nombre;
    
    const contador = document.createElement('div');
    contador.className = 'actriz-contador';
    contador.textContent = `${cantidad} video${cantidad !== 1 ? 's' : ''}`;

    card.append(img, nombre, contador);
    galeriaActrices.appendChild(card);
  });
}

function filtrarPorActriz(nombreActriz) {
  if (!nombreActriz) return;
  
  // Limpiar otros filtros
  buscador.value = '';
  categoriaFiltro.value = '';
  
  // Obtener todos los videos
  const todosVideos = getData(videosKey);
  const nombreBuscado = normalizarNombre(nombreActriz);
  
  // Filtrar videos de ESTA actriz (comparación normalizada)
  const videosFiltrados = todosVideos.filter(video => 
    video.actriz && normalizarNombre(video.actriz) === nombreBuscado
  );

  // Mostrar resultados
  galeria.innerHTML = '';
  const favoritos = getData(favoritosKey);
  
  if (videosFiltrados.length === 0) {
    galeria.innerHTML = `<p class="sin-resultados">No hay videos de ${nombreActriz}</p>`;
  } else {
    videosFiltrados.forEach(video => {
      galeria.appendChild(crearCard(video, favoritos));
    });
  }
  
  // Cambiar a la pestaña de galería
  mostrarTab('galeriaTab');
}

function crearCard(video, favoritos) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const img = document.createElement('img');
  img.src = video.imageUrl;
  img.onclick = () => {
    copiarEnlace(video.videoUrl);
    window.open(video.videoUrl, '_blank');
  };

  const nombre = document.createElement('div');
  nombre.className = 'video-name';
  nombre.textContent = video.videoNombre;

  const desc = document.createElement('p');
  desc.textContent = `🎭 ${video.actriz} | 🗂️ ${video.categoria} | 📁 ${video.carpeta}`;

  const acciones = document.createElement('div');
  acciones.className = 'acciones';

  const star = document.createElement('span');
  star.textContent = favoritos.includes(video.videoUrl) ? '⭐' : '☆';
  star.onclick = () => toggleFavorito(video.videoUrl);

  const copy = document.createElement('span');
  copy.textContent = '📋';
  copy.title = 'Copiar enlace';
  copy.onclick = () => copiarEnlace(video.videoUrl);

  const trash = document.createElement('span');
  trash.textContent = '🗑️';
  trash.onclick = () => eliminarVideo(video.videoUrl);

  acciones.append(star, copy, trash);
  card.append(img, nombre, desc, acciones);
  return card;
}

function cargarVideos(aleatorio = false) {
  const videos = getData(videosKey);
  const favoritos = getData(favoritosKey);
  const filtroCategoria = categoriaFiltro.value;
  const query = buscador.value.toLowerCase();

  let mostrar = videos;

  if (query !== "") {
    const enTitulo = mostrar.filter(v => v.videoNombre.toLowerCase().includes(query));
    const enCategoria = mostrar.filter(v => v.categoria.toLowerCase().includes(query));
    const enActriz = mostrar.filter(v => v.actriz && v.actriz.toLowerCase().includes(query));

    const resultadosUnicos = [];
    const idsAgregados = new Set();

    enTitulo.forEach(video => {
      if (!idsAgregados.has(video.videoUrl)) {
        resultadosUnicos.push(video);
        idsAgregados.add(video.videoUrl);
      }
    });

    enCategoria.forEach(video => {
      if (!idsAgregados.has(video.videoUrl)) {
        resultadosUnicos.push(video);
        idsAgregados.add(video.videoUrl);
      }
    });

    enActriz.forEach(video => {
      if (!idsAgregados.has(video.videoUrl)) {
        resultadosUnicos.push(video);
        idsAgregados.add(video.videoUrl);
      }
    });

    mostrar = resultadosUnicos;
  }

  if (filtroCategoria !== "") {
    mostrar = mostrar.filter(v => v.categoria === filtroCategoria);
  } else if (query === "" && aleatorio) {
    mostrar = videos.sort(() => 0.5 - Math.random()).slice(0, 15);
  }

  galeria.innerHTML = '';
  mostrar.forEach(video => {
    galeria.appendChild(crearCard(video, favoritos));
  });
}

function filtrarVideos() {
  cargarVideos(false);
}

function cargarFavoritos() {
  const favoritos = getData(favoritosKey);
  const videos = getData(videosKey).filter(v => favoritos.includes(v.videoUrl));
  const favoritosShorts = getData(favoritosShortsKey);
  const shorts = getData(shortsKey).filter(s => favoritosShorts.includes(s.videoUrl));
  
  const contenedor = document.getElementById('galeriaFavoritos');
  contenedor.innerHTML = '';
  
  videos.forEach(video => {
    contenedor.appendChild(crearCard(video, favoritos));
  });
  
  shorts.forEach(short => {
    const card = document.createElement('div');
    card.className = 'short-card';

    const img = document.createElement('img');
    img.src = short.imageUrl;
    img.onclick = () => {
      copiarEnlace(short.videoUrl);
      window.open(short.videoUrl, '_blank');
    };

    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.style.marginTop = '10px';

    const star = document.createElement('span');
    star.textContent = '⭐';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.title = 'Copiar enlace';
    copy.onclick = () => copiarEnlace(short.videoUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.onclick = () => eliminarShort(short.videoUrl);

    acciones.append(star, copy, trash);
    card.append(img, acciones);
    contenedor.appendChild(card);
  });
}

function toggleFavorito(videoUrl) {
  let favoritos = getData(favoritosKey);
  if (favoritos.includes(videoUrl)) {
    favoritos = favoritos.filter(url => url !== videoUrl);
  } else {
    favoritos.push(videoUrl);
  }
  setData(favoritosKey, favoritos);
  cargarVideos(false);
  cargarFavoritos();
}

function toggleFavoritoShort(videoUrl) {
  let favoritos = getData(favoritosShortsKey);
  if (favoritos.includes(videoUrl)) {
    favoritos = favoritos.filter(url => url !== videoUrl);
  } else {
    favoritos.push(videoUrl);
  }
  setData(favoritosShortsKey, favoritos);
  cargarShorts();
  cargarFavoritos();
}

function eliminarVideo(videoUrl) {
  if (!confirm("¿Estás seguro de eliminar este video?")) return;
  let lista = getData(videosKey);
  lista = lista.filter(video => video.videoUrl !== videoUrl);
  setData(videosKey, lista);
  let favoritos = getData(favoritosKey);
  favoritos = favoritos.filter(url => url !== videoUrl);
  setData(favoritosKey, favoritos);
  cargarVideos(false);
  cargarFavoritos();
}

function eliminarShort(videoUrl) {
  if (!confirm("¿Estás seguro de eliminar este short?")) return;
  let lista = getData(shortsKey);
  lista = lista.filter(short => short.videoUrl !== videoUrl);
  setData(shortsKey, lista);
  let favoritos = getData(favoritosShortsKey);
  favoritos = favoritos.filter(url => url !== videoUrl);
  setData(favoritosShortsKey, favoritos);
  cargarShorts();
  cargarFavoritos();
}

function eliminarActriz(nombreActriz) {
  if (!confirm(`¿Estás seguro de eliminar a ${nombreActriz} y todas sus fotos?`)) return;
  
  let actricesFotos = getData(actricesFotosKey);
  actricesFotos = actricesFotos.filter(a => normalizarNombre(a.nombre) !== normalizarNombre(nombreActriz));
  setData(actricesFotosKey, actricesFotos);
  
  let actrices = getData(actoresKey);
  actrices = actrices.filter(a => normalizarNombre(a) !== normalizarNombre(nombreActriz));
  setData(actoresKey, actrices);
  
  cargarActrices();
  actualizarSelect(document.getElementById('actrizSelect'), actrices);
}

function copiarEnlace(videoUrl) {
  navigator.clipboard.writeText(videoUrl).then(() => {
    console.log("Enlace copiado");
  }).catch(err => {
    console.error("Error al copiar:", err);
  });
}

function pedirContrasena() {
  const input = prompt("Introduce la contraseña:");
  if (input !== PASSWORD) {
    alert("Contraseña incorrecta. Acceso denegado.");
    document.body.innerHTML = "<h1 style='color: red; text-align:center;'>Acceso Denegado</h1>";
  } else {
    cargarDatos();
  }
}

pedirContrasena();
