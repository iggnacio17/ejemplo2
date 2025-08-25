// ====== Constantes / Claves ======
const PASSWORD = "finnCracK12@";
const videosKey = 'videos';
const shortsKey = 'shorts';
const imagenesKey = 'imagenes';
const actoresKey = 'actrices';
const categoriasKey = 'categorias';
const carpetasKey = 'carpetas';
const favoritosKey = 'favoritos';
const favoritosShortsKey = 'favoritosShorts';
const favoritosImagenesKey = 'favoritosImagenes';

// ====== Referencias DOM (pueden ser null en actrices.html) ======
const galeria = document.getElementById('galeria');
const galeriaShorts = document.getElementById('galeriaShorts');
const galeriaImagenes = document.getElementById('galeriaImagenes');
const buscador = document.getElementById('buscador');
const categoriaFiltro = document.getElementById('categoriaFiltro');

// ====== Utilidades de Storage ======
function getData(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function setData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// ====== Tabs ======
function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  if (id === "galeriaTab") {
    cargarVideos(true);
  } else if (id === "shortsTab") {
    cargarShorts();
  } else if (id === "imagenesTab") {
    cargarImagenes();
  } else if (id === "favoritosTab") {
    cargarFavoritos();
  }
}

// ====== Selects ======
function actualizarSelect(select, data, incluirTodas = false) {
  if (!select) return;
  select.innerHTML = '';
  if (incluirTodas) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '📂 Todas las categorías';
    select.appendChild(opt);
  }
  const nombres = data.map(item => typeof item === 'object' ? item.nombre : item);
  const unicos = [...new Set(nombres)];
  unicos.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// ====== Crear / Guardar ======
function guardarVideo() {
  const video = {
    videoUrl: document.getElementById('videoUrl').value.trim(),
    imageUrl: document.getElementById('imageUrl').value.trim(),
    videoNombre: document.getElementById('videoNombre').value.trim(),
    actriz: (document.getElementById('nuevaActriz').value || document.getElementById('actrizSelect').value || '').trim(),
    categoria: (document.getElementById('nuevaCategoria').value || document.getElementById('categoriaSelect').value || '').trim(),
    carpeta: (document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value || '').trim()
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) {
    alert("Todos los campos son obligatorios"); return;
  }

  // evitar duplicado exacto por URL
  const lista = getData(videosKey);
  if (lista.some(v => v.videoUrl === video.videoUrl)) {
    alert("Ese video ya existe (mismo enlace)."); return;
  }

  // actrices / categorias / carpetas
  const actrices = getData(actoresKey);
  if (video.actriz && !actrices.some(a => (typeof a === 'string' ? a : a.nombre) === video.actriz)) {
    actrices.push(video.actriz);
    setData(actoresKey, actrices);
  }
  const categorias = getData(categoriasKey);
  if (video.categoria && !categorias.includes(video.categoria)) {
    categorias.push(video.categoria); setData(categoriasKey, categorias);
  }
  const carpetas = getData(carpetasKey);
  if (video.carpeta && !carpetas.includes(video.carpeta)) {
    carpetas.push(video.carpeta); setData(carpetasKey, carpetas);
  }

  lista.push(video);
  setData(videosKey, lista);

  document.querySelectorAll('.formulario input').forEach(i => i.value = '');
  cargarDatos();
  mostrarTab('galeriaTab');
}

function guardarShort() {
  const short = {
    videoUrl: document.getElementById('shortUrl').value.trim(),
    imageUrl: document.getElementById('shortImageUrl').value.trim()
  };
  if (!short.videoUrl || !short.imageUrl) { alert("Ambos campos son obligatorios"); return; }

  const lista = getData(shortsKey);
  if (lista.some(s => s.videoUrl === short.videoUrl)) {
    alert("Ese short ya existe (mismo enlace)."); return;
  }

  lista.push(short);
  setData(shortsKey, lista);

  document.getElementById('shortUrl').value = '';
  document.getElementById('shortImageUrl').value = '';
  cargarShorts();
}

function guardarImagen() {
  const imagenUrl = document.getElementById('imagenUrl').value.trim();
  if (!imagenUrl) { alert("El campo es obligatorio"); return; }

  const lista = getData(imagenesKey);
  if (lista.some(img => img === imagenUrl)) {
    alert("Esta imagen ya existe (mismo enlace)."); return;
  }

  lista.push(imagenUrl);
  setData(imagenesKey, lista);

  document.getElementById('imagenUrl').value = '';
  cargarImagenes();
}

// ====== Carga inicial ======
function cargarDatos() {
  actualizarSelect(document.getElementById('actrizSelect'), getData(actoresKey));
  actualizarSelect(document.getElementById('categoriaSelect'), getData(categoriasKey));
  actualizarSelect(document.getElementById('carpetaSelect'), getData(carpetasKey));
  actualizarSelect(categoriaFiltro, getData(categoriasKey), true);

  const urlParams = new URLSearchParams(window.location.search);
  const actrizParam = urlParams.get('actriz');
  if (actrizParam && buscador) buscador.value = actrizParam;

  cargarVideos(!actrizParam);
}

// ====== Galería Shorts ======
function cargarShorts() {
  if (!galeriaShorts) return;
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
    star.title = 'Favorito';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);

    const edit = document.createElement('span');
    edit.textContent = '✏️';
    edit.title = 'Editar short';
    edit.onclick = () => editShort(short.videoUrl);

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.title = 'Copiar enlace';
    copy.onclick = () => copiarEnlace(short.videoUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.title = 'Eliminar short';
    trash.onclick = () => eliminarShort(short.videoUrl);

    acciones.append(star, edit, copy, trash);
    card.append(img, acciones);
    galeriaShorts.appendChild(card);
  });
}

// ====== Galería Imágenes ======
function cargarImagenes() {
  if (!galeriaImagenes) return;
  const imagenes = getData(imagenesKey);
  const favoritos = getData(favoritosImagenesKey);

  galeriaImagenes.innerHTML = '';

  if (imagenes.length === 0) {
    const vacio = document.createElement('div');
    vacio.className = 'sin-resultados';
    vacio.textContent = 'No hay imágenes guardadas';
    galeriaImagenes.appendChild(vacio);
    return;
  }

  imagenes.forEach(imagenUrl => {
    const card = document.createElement('div');
    card.className = 'imagen-card';

    const img = document.createElement('img');
    img.src = imagenUrl;
    img.onclick = () => {
      window.open(imagenUrl, '_blank');
    };

    const acciones = document.createElement('div');
    acciones.className = 'acciones-imagen';

    const star = document.createElement('span');
    star.textContent = favoritos.includes(imagenUrl) ? '⭐' : '☆';
    star.title = 'Favorito';
    star.onclick = () => toggleFavoritoImagen(imagenUrl);

    const view = document.createElement('span');
    view.textContent = '👁️';
    view.title = 'Ver imagen';
    view.onclick = () => window.open(imagenUrl, '_blank');

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.title = 'Copiar enlace';
    copy.onclick = () => copiarEnlace(imagenUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.title = 'Eliminar imagen';
    trash.onclick = () => eliminarImagen(imagenUrl);

    acciones.append(star, view, copy, trash);
    card.append(img, acciones);
    galeriaImagenes.appendChild(card);
  });
}

// ====== Card de Video ======
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

  const actrizSpan = document.createElement('span');
  actrizSpan.textContent = `🎭 ${video.actriz || '—'}`;
  actrizSpan.style.cursor = 'pointer';
  actrizSpan.style.textDecoration = 'underline';
  actrizSpan.onclick = (e) => { e.stopPropagation(); if (video.actriz) buscarPorActriz(video.actriz); };

  const categoriaSpan = document.createElement('span');
  categoriaSpan.textContent = ` | 🗂️ ${video.categoria || '—'}`;

  const carpetaSpan = document.createElement('span');
  carpetaSpan.textContent = ` | 📁 ${video.carpeta || '—'}`;

  desc.append(actrizSpan, categoriaSpan, carpetaSpan);

  const acciones = document.createElement('div');
  acciones.className = 'acciones';

  const star = document.createElement('span');
  star.textContent = favoritos.includes(video.videoUrl) ? '⭐' : '☆';
  star.title = 'Favorito';
  star.onclick = () => toggleFavorito(video.videoUrl);

  const edit = document.createElement('span');
  edit.textContent = '✏️';
  edit.title = 'Editar video';
  edit.onclick = () => editVideo(video.videoUrl);

  const copy = document.createElement('span');
  copy.textContent = '📋';
  copy.title = 'Copiar enlace';
  copy.onclick = () => copiarEnlace(video.videoUrl);

  const trash = document.createElement('span');
  trash.textContent = '🗑️';
  trash.title = 'Eliminar video';
  trash.onclick = () => eliminarVideo(video.videoUrl);

  acciones.append(star, edit, copy, trash);
  card.append(img, nombre, desc, acciones);
  return card;
}

// ====== Búsqueda / Filtros ======
function buscarPorActriz(actriz) {
  if (buscador) buscador.value = actriz;
  cargarVideos(false);
}

function cargarVideos(aleatorio = false) {
  if (!galeria) return;
  const videos = getData(videosKey);
  const favoritos = getData(favoritosKey);
  const filtroCategoria = categoriaFiltro ? categoriaFiltro.value : '';
  const query = (buscador ? buscador.value : '').toLowerCase();

  let mostrar = videos;

  if (query !== "") {
    let resultados = mostrar.filter(v => (v.videoNombre || '').toLowerCase().includes(query));
    if (resultados.length === 0) resultados = mostrar.filter(v => v.actriz && v.actriz.toLowerCase().includes(query));
    if (resultados.length === 0) resultados = mostrar.filter(v => (v.categoria || '').toLowerCase().includes(query));
    mostrar = resultados;
  }

  if (filtroCategoria !== "") {
    mostrar = mostrar.filter(v => v.categoria === filtroCategoria);
  } else if (query === "" && aleatorio) {
    mostrar = [...videos].sort(() => 0.5 - Math.random()).slice(0, 15);
  }

  galeria.innerHTML = '';
  if (mostrar.length === 0) {
    const vacio = document.createElement('div');
    vacio.className = 'sin-resultados';
    vacio.textContent = 'Sin resultados';
    galeria.appendChild(vacio);
  } else {
    mostrar.forEach(video => galeria.appendChild(crearCard(video, favoritos)));
  }
}

function filtrarVideos() { cargarVideos(false); }

// ====== Favoritos ======
function cargarFavoritos() {
  const contenedor = document.getElementById('galeriaFavoritos');
  if (!contenedor) return;

  const favoritos = getData(favoritosKey);
  const videos = getData(videosKey).filter(v => favoritos.includes(v.videoUrl));

  const favoritosShorts = getData(favoritosShortsKey);
  const shorts = getData(shortsKey).filter(s => favoritosShorts.includes(s.videoUrl));

  const favoritosImagenes = getData(favoritosImagenesKey);
  const imagenes = getData(imagenesKey).filter(img => favoritosImagenes.includes(img));

  contenedor.innerHTML = '';

  videos.forEach(video => contenedor.appendChild(crearCard(video, favoritos)));

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
    star.title = 'Quitar de favoritos';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);

    const edit = document.createElement('span');
    edit.textContent = '✏️';
    edit.title = 'Editar short';
    edit.onclick = () => editShort(short.videoUrl);

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.title = 'Copiar enlace';
    copy.onclick = () => copiarEnlace(short.videoUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.title = 'Eliminar short';
    trash.onclick = () => eliminarShort(short.videoUrl);

    acciones.append(star, edit, copy, trash);
    card.append(img, acciones);
    contenedor.appendChild(card);
  });

  imagenes.forEach(imagenUrl => {
    const card = document.createElement('div');
    card.className = 'imagen-card';

    const img = document.createElement('img');
    img.src = imagenUrl;
    img.onclick = () => {
      window.open(imagenUrl, '_blank');
    };

    const acciones = document.createElement('div');
    acciones.className = 'acciones-imagen';

    const star = document.createElement('span');
    star.textContent = '⭐';
    star.title = 'Quitar de favoritos';
    star.onclick = () => toggleFavoritoImagen(imagenUrl);

    const view = document.createElement('span');
    view.textContent = '👁️';
    view.title = 'Ver imagen';
    view.onclick = () => window.open(imagenUrl, '_blank');

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.title = 'Copiar enlace';
    copy.onclick = () => copiarEnlace(imagenUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.title = 'Eliminar imagen';
    trash.onclick = () => eliminarImagen(imagenUrl);

    acciones.append(star, view, copy, trash);
    card.append(img, acciones);
    contenedor.appendChild(card);
  });
}

function toggleFavorito(videoUrl) {
  let favoritos = getData(favoritosKey);
  if (favoritos.includes(videoUrl)) favoritos = favoritos.filter(url => url !== videoUrl);
  else favoritos.push(videoUrl);
  setData(favoritosKey, favoritos);
  cargarVideos(false);
  cargarFavoritos();
}

function toggleFavoritoShort(videoUrl) {
  let favoritos = getData(favoritosShortsKey);
  if (favoritos.includes(videoUrl)) favoritos = favoritos.filter(url => url !== videoUrl);
  else favoritos.push(videoUrl);
  setData(favoritosShortsKey, favoritos);
  cargarShorts();
  cargarFavoritos();
}

function toggleFavoritoImagen(imagenUrl) {
  let favoritos = getData(favoritosImagenesKey);
  if (favoritos.includes(imagenUrl)) favoritos = favoritos.filter(url => url !== imagenUrl);
  else favoritos.push(imagenUrl);
  setData(favoritosImagenesKey, favoritos);
  cargarImagenes();
  cargarFavoritos();
}

// ====== Eliminar ======
function eliminarVideo(videoUrl) {
  if (!confirm("¿Estás seguro de eliminar este video?")) return;
  let lista = getData(videosKey).filter(video => video.videoUrl !== videoUrl);
  setData(videosKey, lista);

  let favoritos = getData(favoritosKey).filter(url => url !== videoUrl);
  setData(favoritosKey, favoritos);

  cargarVideos(false);
  cargarFavoritos();
}

function eliminarShort(videoUrl) {
  if (!confirm("¿Estás seguro de eliminar este short?")) return;
  let lista = getData(shortsKey).filter(short => short.videoUrl !== videoUrl);
  setData(shortsKey, lista);

  let favoritos = getData(favoritosShortsKey).filter(url => url !== videoUrl);
  setData(favoritosShortsKey, favoritos);

  cargarShorts();
  cargarFavoritos();
}

function eliminarImagen(imagenUrl) {
  if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;
  let lista = getData(imagenesKey).filter(img => img !== imagenUrl);
  setData(imagenesKey, lista);

  let favoritos = getData(favoritosImagenesKey).filter(url => url !== imagenUrl);
  setData(favoritosImagenesKey, favoritos);

  cargarImagenes();
  cargarFavoritos();
}

// ====== Copiar ======
function copiarEnlace(videoUrl) {
  navigator.clipboard.writeText(videoUrl).catch(() => {});
}

// ====== Auth ======
function pedirContrasena() {
  const input = prompt("Introduce la contraseña:");
  if (input !== PASSWORD) {
    alert("Contraseña incorrecta. Acceso denegado.");
    document.body.innerHTML = "<h1 style='color: red; text-align:center;'>Acceso Denegado</h1>";
  } else {
    sessionStorage.setItem('autenticado', 'true');
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      cargarDatos();
    }
  }
}

// ====== Actrices (página actrices.html) ======
function cargarActrices() {
  const gal = document.getElementById('galeriaActrices');
  if (!gal) return;

  const actrices = getData(actoresKey);
  gal.innerHTML = '';

  actrices.forEach(actriz => {
    const card = document.createElement('div');
    card.className = 'actriz-card';

    const img = document.createElement('img');
    img.className = 'actriz-imagen';
    if (typeof actriz === 'object' && actriz.imagenUrl) img.src = actriz.imagenUrl;
    else img.src = 'https://i.imgur.com/JQWUQfH.png';
    img.alt = typeof actriz === 'object' ? actriz.nombre : actriz;

    const nombre = document.createElement('div');
    nombre.className = 'actriz-nombre';
    nombre.textContent = typeof actriz === 'object' ? actriz.nombre : actriz;

    const acciones = document.createElement('div');
    acciones.className = 'acciones-actriz';

    const cambiarImg = document.createElement('span');
    cambiarImg.textContent = '🖼️';
    cambiarImg.title = 'Cambiar imagen';
    cambiarImg.onclick = (e) => { e.stopPropagation(); cambiarImagenActriz(actriz); };

    const editar = document.createElement('span');
    editar.textContent = '✏️';
    editar.title = 'Editar actriz';
    editar.onclick = (e) => { e.stopPropagation(); editarActriz(actriz); };

    const eliminar = document.createElement('span');
    eliminar.textContent = '🗑️';
    eliminar.title = 'Eliminar actriz';
    eliminar.onclick = (e) => { e.stopPropagation(); eliminarActriz(actriz); };

    acciones.append(cambiarImg, editar, eliminar);
    card.append(img, nombre, acciones);

    card.onclick = () => {
      const nombreActriz = typeof actriz === 'object' ? actriz.nombre : actriz;
      window.location.href = `index.html?actriz=${encodeURIComponent(nombreActriz)}`;
    };

    gal.appendChild(card);
  });
}

function cambiarImagenActriz(actriz) {
  const nombreActriz = typeof actriz === 'object' ? actriz.nombre : actriz;
  const imagenActual = typeof actriz === 'object' ? actriz.imagenUrl : '';
  const nuevaUrl = prompt(`Nueva URL de la imagen para ${nombreActriz}`, imagenActual || '');
  if (nuevaUrl === null) return;

  let actrices = getData(actoresKey).map(a => {
    if (typeof a === 'string') return (a === nombreActriz) ? { nombre: a, imagenUrl: nuevaUrl } : a;
    return (a.nombre === nombreActriz) ? { ...a, imagenUrl: nuevaUrl } : a;
  });

  setData(actoresKey, actrices);
  cargarActrices();
}

function editarActriz(actriz) {
  const nombreActual = typeof actriz === 'object' ? actriz.nombre : actriz;
  const nuevoNombre = prompt("Nuevo nombre para la actriz:", nombreActual);
  if (!nuevoNombre || nuevoNombre === nombreActual) return;

  let actrices = getData(actoresKey).map(a => {
    if (typeof a === 'string') return (a === nombreActual) ? nuevoNombre : a;
    return (a.nombre === nombreActual) ? { ...a, nombre: nuevoNombre } : a;
  });

  // Actualizar en videos
  let videos = getData(videosKey).map(video => (video.actriz === nombreActual) ? { ...video, actriz: nuevoNombre } : video);

  setData(actoresKey, actrices);
  setData(videosKey, videos);
  cargarActrices();
  if (window.location.pathname.includes('index.html')) cargarDatos();
}

function eliminarActriz(actriz) {
  const nombre = typeof actriz === 'object' ? actriz.nombre : actriz;
  if (!confirm(`¿Eliminar a ${nombre}? (No borra los videos asociados)`)) return;

  let actrices = getData(actoresKey).filter(a => (typeof a === 'string') ? a !== nombre : a.nombre !== nombre);
  setData(actoresKey, actrices);
  cargarActrices();
  if (window.location.pathname.includes('index.html')) cargarDatos();
}

// ====== Editar Video / Short ======
function editVideo(oldUrl) {
  let videos = getData(videosKey);
  const idx = videos.findIndex(v => v.videoUrl === oldUrl);
  if (idx === -1) return alert("No se encontró el video");

  const v = videos[idx];
  const nuevoNombre = prompt("Editar nombre:", v.videoNombre || "") ?? v.videoNombre;
  const nuevaUrl = prompt("Editar enlace:", v.videoUrl) ?? v.videoUrl;
  const nuevaImg = prompt("Editar imagen:", v.imageUrl || "") ?? v.imageUrl;
  const nuevaActriz = prompt("Editar actriz (opcional):", v.actriz || "") ?? v.actriz;
  const nuevaCategoria = prompt("Editar categoría (opcional):", v.categoria || "") ?? v.categoria;
  const nuevaCarpeta = prompt("Editar carpeta (opcional):", v.carpeta || "") ?? v.carpeta;

  if (!nuevoNombre || !nuevaUrl || !nuevaImg) return alert("Nombre, enlace e imagen no pueden quedar vacíos.");

  const urlCambia = v.videoUrl !== nuevaUrl;
  videos[idx] = { ...v, videoNombre: nuevoNombre, videoUrl: nuevaUrl, imageUrl: nuevaImg, actriz: nuevaActriz, categoria: nuevaCategoria, carpeta: nuevaCarpeta };
  setData(videosKey, videos);

  // actualizar listas
  if (nuevaActriz) {
    const actrices = getData(actoresKey);
    if (!actrices.some(a => (typeof a === 'string' ? a : a.nombre) === nuevaActriz)) {
      actrices.push(nuevaActriz); setData(actoresKey, actrices);
    }
  }
  if (nuevaCategoria) {
    const cats = getData(categoriasKey);
    if (!cats.includes(nuevaCategoria)) { cats.push(nuevaCategoria); setData(categoriasKey, cats); }
  }
  if (nuevaCarpeta) {
    const carps = getData(carpetasKey);
    if (!carps.includes(nuevaCarpeta)) { carps.push(nuevaCarpeta); setData(carpetasKey, carps); }
  }

  // actualizar favoritos si cambió URL
  if (urlCambia) {
    let favs = getData(favoritosKey);
    if (favs.includes(oldUrl)) {
      favs = favs.map(u => u === oldUrl ? nuevaUrl : u);
      setData(favoritosKey, favs);
    }
  }

  cargarVideos(false);
  cargarFavoritos();
}

function editShort(oldUrl) {
  let shorts = getData(shortsKey);
  const idx = shorts.findIndex(s => s.videoUrl === oldUrl);
  if (idx === -1) return alert("No se encontró el short");

  const s = shorts[idx];
  const nuevaUrl = prompt("Editar enlace del short:", s.videoUrl) ?? s.videoUrl;
  const nuevaImg = prompt("Editar imagen del short:", s.imageUrl || "") ?? s.imageUrl;
  if (!nuevaUrl || !nuevaImg) return alert("Enlace e imagen no pueden quedar vacíos.");

  const urlCambia = s.videoUrl !== nuevaUrl;
  shorts[idx] = { ...s, videoUrl: nuevaUrl, imageUrl: nuevaImg };
  setData(shortsKey, shorts);

  if (urlCambia) {
    let favs = getData(favoritosShortsKey);
    if (favs.includes(oldUrl)) {
      favs = favs.map(u => u === oldUrl ? nuevaUrl : u);
      setData(favoritosShortsKey, favs);
    }
  }

  cargarShorts();
  cargarFavoritos();
}

// ====== Exportar / Importar ======
function exportData() {
  const data = {
    _exportVersion: 1,
    videos: getData(videosKey),
    shorts: getData(shortsKey),
    imagenes: getData(imagenesKey),
    actrices: getData(actoresKey),
    categorias: getData(categoriasKey),
    carpetas: getData(carpetasKey),
    favoritos: getData(favoritosKey),
    favoritosShorts: getData(favoritosShortsKey),
    favoritosImagenes: getData(favoritosImagenesKey)
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_videos_${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      // 1) Merge videos (clave = videoUrl). Mantener los existentes si hay choque.
      const mergedVideos = mergeVideos(getData(videosKey), Array.isArray(imported.videos) ? imported.videos : []);
      setData(videosKey, mergedVideos);

      // 2) Merge shorts (clave = videoUrl)
      const mergedShorts = mergeShorts(getData(shortsKey), Array.isArray(imported.shorts) ? imported.shorts : []);
      setData(shortsKey, mergedShorts);

      // 3) Merge imágenes (strings)
      const mergedImagenes = mergeStrings(getData(imagenesKey), Array.isArray(imported.imagenes) ? imported.imagenes : []);
      setData(imagenesKey, mergedImagenes);

      // 4) Merge actrices (por nombre). Si una versión tiene imagenUrl, se conserva.
      const mergedActrices = mergeActrices(getData(actoresKey), Array.isArray(imported.actrices) ? imported.actrices : []);
      setData(actoresKey, mergedActrices);

      // 5) Merge categorías / carpetas (strings)
      setData(categoriasKey, mergeStrings(getData(categoriasKey), Array.isArray(imported.categorias) ? imported.categorias : []));
      setData(carpetasKey, mergeStrings(getData(carpetasKey), Array.isArray(imported.carpetas) ? imported.carpetas : []));

      // 6) Favoritos: filtrar para que solo apunten a URLs existentes
      const favV = mergeStrings(getData(favoritosKey), Array.isArray(imported.favoritos) ? imported.favoritos : [])
        .filter(u => mergedVideos.some(v => v.videoUrl === u));
      setData(favoritosKey, favV);

      const favS = mergeStrings(getData(favoritosShortsKey), Array.isArray(imported.favoritosShorts) ? imported.favoritosShorts : [])
        .filter(u => mergedShorts.some(s => s.videoUrl === u));
      setData(favoritosShortsKey, favS);

      const favI = mergeStrings(getData(favoritosImagenesKey), Array.isArray(imported.favoritosImagenes) ? imported.favoritosImagenes : [])
        .filter(u => mergedImagenes.includes(u));
      setData(favoritosImagenesKey, favI);

      // refrescar UI
      if (document.getElementById('galeria')) cargarDatos();
      if (document.getElementById('galeriaShorts')) cargarShorts();
      if (document.getElementById('galeriaImagenes')) cargarImagenes();
      if (document.getElementById('galeriaFavoritos')) cargarFavoritos();

      alert("Datos importados y fusionados correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error al importar archivo. Asegúrate de que sea un JSON válido.");
    } finally {
      // permitir volver a subir el mismo archivo
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// ---- Funciones de merge ----
function mergeVideos(actuales, nuevos) {
  const map = new Map();
  // primero los nuevos (se mantendrán solo si no existen actuales)
  for (const v of nuevos) {
    if (v && v.videoUrl) map.set(v.videoUrl, v);
  }
  // luego los actuales (prioridad a lo que ya tienes)
  for (const v of actuales) {
    if (v && v.videoUrl) map.set(v.videoUrl, v);
  }
  return Array.from(map.values());
}

function mergeShorts(actuales, nuevos) {
  const map = new Map();
  for (const s of nuevos) {
    if (s && s.videoUrl) map.set(s.videoUrl, s);
  }
  for (const s of actuales) {
    if (s && s.videoUrl) map.set(s.videoUrl, s);
  }
  return Array.from(map.values());
}

function mergeActrices(actuales, nuevas) {
  // normalizar a {nombre, imagenUrl?}
  const toObj = (a) => (typeof a === 'string') ? { nombre: a } : { nombre: a?.nombre || '', imagenUrl: a?.imagenUrl || '' };
  const all = [...actuales.map(toObj), ...nuevas.map(toObj)];
  const map = new Map();
  for (const a of all) {
    if (!a.nombre) continue;
    const prev = map.get(a.nombre);
    // preferir versión con imagenUrl si no existía
    if (!prev) map.set(a.nombre, a);
    else if (!prev.imagenUrl && a.imagenUrl) map.set(a.nombre, a);
  }
  // mantener mezcla original: si no tiene imagen, podrías guardar string
  return Array.from(map.values()).map(a => a.imagenUrl ? a : a.nombre);
}

function mergeStrings(actuales, nuevas) {
  return Array.from(new Set([...(Array.isArray(actuales) ? actuales : []), ...(Array.isArray(nuevas) ? nuevas : [])]));
}
