const PASSWORD = "finnCracK12@";
const videosKey = 'videos';
const shortsKey = 'shorts';
const actoresKey = 'actrices';
const categoriasKey = 'categorias';
const carpetasKey = 'carpetas';
const favoritosKey = 'favoritos';
const favoritosShortsKey = 'favoritosShorts';

const galeria = document.getElementById('galeria');
const galeriaShorts = document.getElementById('galeriaShorts');
const buscador = document.getElementById('buscador');
const categoriaFiltro = document.getElementById('categoriaFiltro');

function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  if (id === "galeriaTab") {
    cargarVideos(true);
  } else if (id === "shortsTab") {
    cargarShorts();
  } else if (id === "favoritosTab") {
    cargarFavoritos();
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
  
  // Filtramos solo los nombres si son objetos
  const nombres = data.map(item => typeof item === 'object' ? item.nombre : item);
  const unicos = [...new Set(nombres)]; // Eliminamos duplicados
  
  unicos.forEach(item => {
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
    actriz: document.getElementById('nuevaActriz').value || document.getElementById('actrizSelect').value,
    categoria: document.getElementById('nuevaCategoria').value || document.getElementById('categoriaSelect').value,
    carpeta: document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) return alert("Todos los campos son obligatorios");

  const actrices = getData(actoresKey);
  const categorias = getData(categoriasKey);
  const carpetas = getData(carpetasKey);

  if (video.actriz) {
    const existe = actrices.some(a => 
      (typeof a === 'string' && a === video.actriz) || 
      (typeof a === 'object' && a.nombre === video.actriz)
    );
    
    if (!existe) {
      actrices.push(video.actriz);
      setData(actoresKey, actrices);
    }
  }
  
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

function cargarDatos() {
  actualizarSelect(document.getElementById('actrizSelect'), getData(actoresKey));
  actualizarSelect(document.getElementById('categoriaSelect'), getData(categoriasKey));
  actualizarSelect(document.getElementById('carpetaSelect'), getData(carpetasKey));
  actualizarSelect(categoriaFiltro, getData(categoriasKey), true);
  
  const urlParams = new URLSearchParams(window.location.search);
  const actrizParam = urlParams.get('actriz');
  
  if (actrizParam) {
    buscador.value = actrizParam;
  }
  
  cargarVideos(!actrizParam);
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
  actrizSpan.textContent = `🎭 ${video.actriz}`;
  actrizSpan.style.cursor = 'pointer';
  actrizSpan.style.textDecoration = 'underline';
  actrizSpan.onclick = (e) => {
    e.stopPropagation();
    buscarPorActriz(video.actriz);
  };

  const categoriaSpan = document.createElement('span');
  categoriaSpan.textContent = ` | 🗂️ ${video.categoria}`;

  const carpetaSpan = document.createElement('span');
  carpetaSpan.textContent = ` | 📁 ${video.carpeta}`;

  desc.append(actrizSpan, categoriaSpan, carpetaSpan);

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

function buscarPorActriz(actriz) {
  buscador.value = actriz;
  cargarVideos(false);
}

function cargarVideos(aleatorio = false) {
  const videos = getData(videosKey);
  const favoritos = getData(favoritosKey);
  const filtroCategoria = categoriaFiltro.value;
  const query = buscador.value.toLowerCase();

  let mostrar = videos;

  if (query !== "") {
    let resultados = mostrar.filter(v => v.videoNombre.toLowerCase().includes(query));
    
    if (resultados.length === 0) {
      resultados = mostrar.filter(v => v.actriz && v.actriz.toLowerCase().includes(query));
    }
    
    if (resultados.length === 0) {
      resultados = mostrar.filter(v => v.categoria.toLowerCase().includes(query));
    }
    
    mostrar = resultados;
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
    sessionStorage.setItem('autenticado', 'true');
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      cargarDatos();
    }
  }
}

function cargarActrices() {
  const actrices = getData(actoresKey);
  const galeria = document.getElementById('galeriaActrices');
  galeria.innerHTML = '';

  actrices.forEach(actriz => {
    const card = document.createElement('div');
    card.className = 'actriz-card';

    const img = document.createElement('img');
    img.className = 'actriz-imagen';
    if (typeof actriz === 'object' && actriz.imagenUrl) {
      img.src = actriz.imagenUrl;
    } else {
      img.src = 'https://i.imgur.com/JQWUQfH.png'; // Imagen por defecto
    }
    img.alt = typeof actriz === 'object' ? actriz.nombre : actriz;
    
    const nombre = document.createElement('div');
    nombre.className = 'actriz-nombre';
    nombre.textContent = typeof actriz === 'object' ? actriz.nombre : actriz;
    
    const acciones = document.createElement('div');
    acciones.className = 'acciones-actriz';
    
    const cambiarImg = document.createElement('span');
    cambiarImg.textContent = '🖼️';
    cambiarImg.title = 'Cambiar imagen';
    cambiarImg.onclick = (e) => {
      e.stopPropagation();
      cambiarImagenActriz(actriz);
    };
    
    const editar = document.createElement('span');
    editar.textContent = '✏️';
    editar.title = 'Editar actriz';
    editar.onclick = (e) => {
      e.stopPropagation();
      editarActriz(actriz);
    };
    
    const eliminar = document.createElement('span');
    eliminar.textContent = '🗑️';
    eliminar.title = 'Eliminar actriz';
    eliminar.onclick = (e) => {
      e.stopPropagation();
      eliminarActriz(actriz);
    };
    
    acciones.append(cambiarImg, editar, eliminar);
    card.append(img, nombre, acciones);
    
    card.onclick = () => {
      const nombreActriz = typeof actriz === 'object' ? actriz.nombre : actriz;
      window.location.href = `index.html?actriz=${encodeURIComponent(nombreActriz)}`;
    };
    
    galeria.appendChild(card);
  });
}

function cambiarImagenActriz(actriz) {
  const nombreActriz = typeof actriz === 'object' ? actriz.nombre : actriz;
  const imagenActual = typeof actriz === 'object' ? actriz.imagenUrl : '';
  
  const nuevaUrl = prompt(`Introduce la nueva URL de la imagen para ${nombreActriz}`, imagenActual || '');
  
  if (nuevaUrl !== null) {
    let actrices = getData(actoresKey);
    
    actrices = actrices.map(a => {
      if (typeof a === 'string') {
        if (a === nombreActriz) {
          return { nombre: a, imagenUrl: nuevaUrl };
        }
        return a;
      } else {
        if (a.nombre === nombreActriz) {
          return { ...a, imagenUrl: nuevaUrl };
        }
        return a;
      }
    });
    
    setData(actoresKey, actrices);
    cargarActrices();
  }
}

function editarActriz(actriz) {
  const nombreActual = typeof actriz === 'object' ? actriz.nombre : actriz;
  const nuevoNombre = prompt("Nuevo nombre para la actriz:", nombreActual);
  
  if (nuevoNombre && nuevoNombre !== nombreActual) {
    let actrices = getData(actoresKey);
    
    actrices = actrices.map(a => {
      if (typeof a === 'string') {
        if (a === nombreActual) {
          return nuevoNombre;
        }
        return a;
      } else {
        if (a.nombre === nombreActual) {
          return { ...a, nombre: nuevoNombre };
        }
        return a;
      }
    });
    
    // Actualizar en videos
    let videos = getData(videosKey);
    videos = videos.map(video => {
      if (video.actriz === nombreActual) {
        return { ...video, actriz: nuevoNombre };
      }
      return video;
    });
    
    setData(actoresKey, actrices);
    setData(videosKey, videos);
    cargarActrices();
    
    if (window.location.pathname.includes('index.html')) {
      cargarDatos();
    }
  }
}

function eliminarActriz(actriz) {
  const nombre = typeof actriz === 'object' ? actriz.nombre : actriz;
  
  if (!confirm(`¿Estás seguro de eliminar a ${nombre}? Esto no eliminará los videos asociados.`)) return;
  
  let actrices = getData(actoresKey);
  actrices = actrices.filter(a => {
    if (typeof a === 'string') {
      return a !== nombre;
    } else {
      return a.nombre !== nombre;
    }
  });
  
  setData(actoresKey, actrices);
  cargarActrices();
  
  if (window.location.pathname.includes('index.html')) {
    cargarDatos();
  }
}
