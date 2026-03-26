// ====== Constantes / Claves ======
const PASSWORD = "finnCracK12@";
const videosKey = "videos";
const shortsKey = "shorts";
const imagenesKey = "imagenes";
const actoresKey = "actrices";
const categoriasKey = "categorias";
const carpetasKey = "carpetas";
const favoritosKey = "favoritos";
const favoritosShortsKey = "favoritosShorts";
const favoritosImagenesKey = "favoritosImagenes";

// ====== Referencias DOM ======
const galeria = document.getElementById("galeria");
const galeriaShorts = document.getElementById("galeriaShorts");
const galeriaImagenes = document.getElementById("galeriaImagenes");
const buscador = document.getElementById("buscador");
const categoriaFiltro = document.getElementById("categoriaFiltro");

let sortMode = "random";

// ====== Utilidades de Storage ======
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ====== TOAST ======
function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", info: "💬" };
  t.innerHTML = `<span>${icons[type] || "💬"}</span> ${msg}`;
  container.appendChild(t);
  requestAnimationFrame(() => {
    t.classList.add("show");
  });
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 350);
  }, 2800);
}

// ====== MODAL ======
let _modalCallback = null;

function abrirModal(titulo, html, onConfirm) {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  document.getElementById("modalTitle").textContent = titulo;
  document.getElementById("modalBody").innerHTML = html;
  _modalCallback = onConfirm;
  overlay.classList.add("open");
  // autofocus primer input
  setTimeout(() => {
    const first = overlay.querySelector("input");
    if (first) first.focus();
  }, 80);
}

function cerrarModal(e) {
  if (e.target.id === "modalOverlay") cerrarModalBtn();
}

function cerrarModalBtn() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.classList.remove("open");
  _modalCallback = null;
}

document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("modalConfirm");
  if (confirmBtn)
    confirmBtn.addEventListener("click", () => {
      if (_modalCallback) _modalCallback();
    });

  // Enter en modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModalBtn();
    if (
      e.key === "Enter" &&
      document.getElementById("modalOverlay")?.classList.contains("open")
    ) {
      if (_modalCallback) _modalCallback();
    }
  });
});

// ====== STATS ======
function actualizarStats() {
  const sv = document.getElementById("statVideos");
  const ss = document.getElementById("statShorts");
  const sf = document.getElementById("statFavs");
  const sa = document.getElementById("statActrices");
  if (sv) sv.textContent = getData(videosKey).length;
  if (ss) ss.textContent = getData(shortsKey).length;
  if (sf)
    sf.textContent =
      getData(favoritosKey).length +
      getData(favoritosShortsKey).length +
      getData(favoritosImagenesKey).length;
  if (sa) sa.textContent = getData(actoresKey).length;
}

// ====== SORT ======
function setSortMode(mode, el) {
  sortMode = mode;
  document
    .querySelectorAll(".sort-row .chip")
    .forEach((c) => c.classList.remove("active"));
  if (el) el.classList.add("active");
  cargarVideos(mode === "random");
}

// ====== TABS ======
function mostrarTab(id, btnEl) {
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");

  // nav highlight
  document
    .querySelectorAll("aside button")
    .forEach((b) => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");

  if (id === "galeriaTab") cargarVideos(sortMode === "random");
  else if (id === "shortsTab") cargarShorts();
  else if (id === "imagenesTab") cargarImagenes();
  else if (id === "favoritosTab") cargarFavoritos();
}

// ====== Selects ======
function actualizarSelect(
  select,
  data,
  incluirTodas = false,
  placeholder = "",
) {
  if (!select) return;
  select.innerHTML = "";
  if (incluirTodas) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder || "📂 Todas";
    select.appendChild(opt);
  }
  const nombres = data.map((item) =>
    typeof item === "object" ? item.nombre : item,
  );
  const unicos = [...new Set(nombres)];
  unicos.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// ====== Guardar Video ======
function guardarVideo() {
  const video = {
    videoUrl: document.getElementById("videoUrl").value.trim(),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    videoNombre: document.getElementById("videoNombre").value.trim(),
    actriz: (
      document.getElementById("nuevaActriz").value ||
      document.getElementById("actrizSelect").value ||
      ""
    ).trim(),
    categoria: (
      document.getElementById("nuevaCategoria").value ||
      document.getElementById("categoriaSelect").value ||
      ""
    ).trim(),
    carpeta: (
      document.getElementById("nuevaCarpeta").value ||
      document.getElementById("carpetaSelect").value ||
      ""
    ).trim(),
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) {
    showToast("URL, imagen y nombre son obligatorios", "error");
    return;
  }

  const lista = getData(videosKey);
  if (lista.some((v) => v.videoUrl === video.videoUrl)) {
    showToast("Ese video ya existe (mismo enlace)", "error");
    return;
  }

  const actrices = getData(actoresKey);
  if (
    video.actriz &&
    !actrices.some(
      (a) => (typeof a === "string" ? a : a.nombre) === video.actriz,
    )
  ) {
    actrices.push(video.actriz);
    setData(actoresKey, actrices);
  }
  const categorias = getData(categoriasKey);
  if (video.categoria && !categorias.includes(video.categoria)) {
    categorias.push(video.categoria);
    setData(categoriasKey, categorias);
  }
  const carpetas = getData(carpetasKey);
  if (video.carpeta && !carpetas.includes(video.carpeta)) {
    carpetas.push(video.carpeta);
    setData(carpetasKey, carpetas);
  }

  lista.push(video);
  setData(videosKey, lista);

  document
    .querySelectorAll("#formularioTab input")
    .forEach((i) => (i.value = ""));
  cargarDatos();
  actualizarStats();
  mostrarTab("galeriaTab", document.getElementById("navGaleria"));
  showToast(`"${video.videoNombre}" guardado ✓`, "success");
}

function guardarShort() {
  const short = {
    videoUrl: document.getElementById("shortUrl").value.trim(),
    imageUrl: document.getElementById("shortImageUrl").value.trim(),
  };
  if (!short.videoUrl || !short.imageUrl) {
    showToast("Ambos campos son obligatorios", "error");
    return;
  }

  const lista = getData(shortsKey);
  if (lista.some((s) => s.videoUrl === short.videoUrl)) {
    showToast("Ese short ya existe", "error");
    return;
  }

  lista.push(short);
  setData(shortsKey, lista);
  document.getElementById("shortUrl").value = "";
  document.getElementById("shortImageUrl").value = "";
  cargarShorts();
  actualizarStats();
  showToast("Short guardado ✓", "success");
}

function guardarImagen() {
  const imagenUrl = document.getElementById("imagenUrl").value.trim();
  if (!imagenUrl) {
    showToast("El campo es obligatorio", "error");
    return;
  }

  const lista = getData(imagenesKey);
  if (lista.some((img) => img === imagenUrl)) {
    showToast("Esta imagen ya existe", "error");
    return;
  }

  lista.push(imagenUrl);
  setData(imagenesKey, lista);
  document.getElementById("imagenUrl").value = "";
  cargarImagenes();
  actualizarStats();
  showToast("Imagen guardada ✓", "success");
}

// ====== Carga inicial ======
function cargarDatos() {
  actualizarSelect(
    document.getElementById("actrizSelect"),
    getData(actoresKey),
  );
  actualizarSelect(
    document.getElementById("categoriaSelect"),
    getData(categoriasKey),
  );
  actualizarSelect(
    document.getElementById("carpetaSelect"),
    getData(carpetasKey),
  );
  actualizarSelect(
    categoriaFiltro,
    getData(categoriasKey),
    true,
    "📂 Todas las categorías",
  );
  actualizarSelect(
    document.getElementById("carpetaFiltro"),
    getData(carpetasKey),
    true,
    "📁 Todas las carpetas",
  );

  const urlParams = new URLSearchParams(window.location.search);
  const actrizParam = urlParams.get("actriz");
  if (actrizParam && buscador) {
    buscador.value = actrizParam;
    setSortMode("az", null);
  }

  cargarVideos(!actrizParam);
}

// ====== Galería Shorts ======
function cargarShorts() {
  if (!galeriaShorts) return;
  const shorts = getData(shortsKey);
  const favoritos = getData(favoritosShortsKey);
  galeriaShorts.innerHTML = "";

  const rc = document.getElementById("resultCountShorts");
  if (rc)
    rc.textContent = `${shorts.length} short${shorts.length !== 1 ? "s" : ""}`;

  if (shorts.length === 0) {
    galeriaShorts.innerHTML = emptyState("📱", "No hay shorts guardados");
    return;
  }

  shorts.forEach((short) => {
    const card = document.createElement("div");
    card.className = "short-card";

    const wrap = document.createElement("div");
    wrap.className = "thumb-wrap";

    const img = document.createElement("img");
    img.src = short.imageUrl;
    img.loading = "lazy";

    const overlay = document.createElement("div");
    overlay.className = "play-overlay";
    overlay.onclick = () => {
      copiarEnlace(short.videoUrl);
      window.open(short.videoUrl, "_blank");
    };
    const playBtn = document.createElement("div");
    playBtn.className = "play-btn";
    playBtn.innerHTML = "▶";
    overlay.appendChild(playBtn);

    const favBadge = document.createElement("div");
    favBadge.className = "fav-badge";
    favBadge.textContent = favoritos.includes(short.videoUrl) ? "⭐" : "☆";
    favBadge.onclick = () => toggleFavoritoShort(short.videoUrl);

    wrap.append(img, overlay, favBadge);

    const acciones = document.createElement("div");
    acciones.className = "acciones";
    acciones.style.paddingTop = "8px";

    acciones.appendChild(
      actionBtn("✏️", "Editar", () => editShortModal(short.videoUrl)),
    );
    acciones.appendChild(
      actionBtn("📋", "Copiar enlace", () => {
        copiarEnlace(short.videoUrl);
        showToast("Enlace copiado ✓", "info");
      }),
    );
    acciones.appendChild(
      actionBtn("🗑️", "Eliminar", () => eliminarShort(short.videoUrl), true),
    );

    card.append(wrap, acciones);
    galeriaShorts.appendChild(card);
  });
}

// ====== Galería Imágenes ======
function cargarImagenes() {
  if (!galeriaImagenes) return;
  const imagenes = getData(imagenesKey);
  const favoritos = getData(favoritosImagenesKey);
  galeriaImagenes.innerHTML = "";

  if (imagenes.length === 0) {
    galeriaImagenes.innerHTML = `<div style="grid-column:1/-1">${emptyState("🖼️", "No hay imágenes guardadas")}</div>`;
    return;
  }

  imagenes.forEach((imagenUrl) => {
    const card = document.createElement("div");
    card.className = "imagen-card";

    const img = document.createElement("img");
    img.src = imagenUrl;
    img.loading = "lazy";
    img.onclick = () => window.open(imagenUrl, "_blank");

    const acciones = document.createElement("div");
    acciones.className = "acciones-imagen";

    const star = document.createElement("div");
    star.className = "action-btn";
    star.textContent = favoritos.includes(imagenUrl) ? "⭐" : "☆";
    star.title = "Favorito";
    star.onclick = () => toggleFavoritoImagen(imagenUrl);

    acciones.appendChild(star);
    acciones.appendChild(
      actionBtn("👁️", "Ver imagen", () => window.open(imagenUrl, "_blank")),
    );
    acciones.appendChild(
      actionBtn("📋", "Copiar enlace", () => {
        copiarEnlace(imagenUrl);
        showToast("Enlace copiado ✓", "info");
      }),
    );
    acciones.appendChild(
      actionBtn("🗑️", "Eliminar", () => eliminarImagen(imagenUrl), true),
    );

    card.append(img, acciones);
    galeriaImagenes.appendChild(card);
  });
}

// ====== Helper: crear botón de acción ======
function actionBtn(icon, title, onClick, isDanger = false) {
  const btn = document.createElement("div");
  btn.className = "action-btn" + (isDanger ? " danger" : "");
  btn.textContent = icon;
  btn.title = title;
  btn.onclick = onClick;
  return btn;
}

function emptyState(icon, text) {
  return `<div class="sin-resultados"><span class="empty-icon">${icon}</span><p>${text}</p></div>`;
}

// ====== Card de Video ======
function crearCard(video, favoritos) {
  const card = document.createElement("div");
  card.className = "video-card";

  // thumbnail
  const wrap = document.createElement("div");
  wrap.className = "thumb-wrap";

  const img = document.createElement("img");
  img.src = video.imageUrl;
  img.loading = "lazy";

  const overlay = document.createElement("div");
  overlay.className = "play-overlay";
  overlay.onclick = () => {
    copiarEnlace(video.videoUrl);
    window.open(video.videoUrl, "_blank");
  };
  const playBtn = document.createElement("div");
  playBtn.className = "play-btn";
  playBtn.innerHTML = "▶";
  overlay.appendChild(playBtn);

  const favBadge = document.createElement("div");
  favBadge.className = "fav-badge";
  favBadge.textContent = favoritos.includes(video.videoUrl) ? "⭐" : "☆";
  favBadge.title = "Favorito";
  favBadge.onclick = (e) => {
    e.stopPropagation();
    toggleFavorito(video.videoUrl);
  };

  wrap.append(img, overlay, favBadge);

  // info
  const info = document.createElement("div");
  info.className = "video-info";

  const nombre = document.createElement("div");
  nombre.className = "video-name";
  nombre.textContent = video.videoNombre;
  nombre.title = video.videoNombre;

  const meta = document.createElement("div");
  meta.className = "video-meta";

  if (video.actriz) {
    const tag = document.createElement("span");
    tag.className = "meta-tag actriz";
    tag.textContent = `🎭 ${video.actriz}`;
    tag.onclick = () => buscarPorActriz(video.actriz);
    meta.appendChild(tag);
  }
  if (video.categoria) {
    const tag = document.createElement("span");
    tag.className = "meta-tag";
    tag.textContent = `🗂️ ${video.categoria}`;
    meta.appendChild(tag);
  }
  if (video.carpeta) {
    const tag = document.createElement("span");
    tag.className = "meta-tag";
    tag.textContent = `📁 ${video.carpeta}`;
    meta.appendChild(tag);
  }

  info.append(nombre, meta);

  // acciones
  const acciones = document.createElement("div");
  acciones.className = "acciones";

  acciones.appendChild(
    actionBtn("✏️", "Editar video", () => editVideoModal(video.videoUrl)),
  );
  acciones.appendChild(
    actionBtn("📋", "Copiar enlace", () => {
      copiarEnlace(video.videoUrl);
      showToast("Enlace copiado ✓", "info");
    }),
  );
  acciones.appendChild(
    actionBtn(
      "🗑️",
      "Eliminar video",
      () => eliminarVideoModal(video.videoUrl),
      true,
    ),
  );

  card.append(wrap, info, acciones);
  return card;
}

// ====== Búsqueda / Filtros ======
function buscarPorActriz(actriz) {
  if (buscador) buscador.value = actriz;
  mostrarTab("galeriaTab", document.getElementById("navGaleria"));
  cargarVideos(false);
}

function cargarVideos(aleatorio = false) {
  if (!galeria) return;
  const videos = getData(videosKey);
  const favoritos = getData(favoritosKey);
  const filtroCategoria = categoriaFiltro ? categoriaFiltro.value : "";
  const filtroCarpeta = document.getElementById("carpetaFiltro")
    ? document.getElementById("carpetaFiltro").value
    : "";
  const query = (buscador ? buscador.value : "").toLowerCase().trim();

  let mostrar = [...videos];

  if (query !== "") {
    let res = mostrar.filter((v) =>
      (v.videoNombre || "").toLowerCase().includes(query),
    );
    if (res.length === 0)
      res = mostrar.filter(
        (v) => v.actriz && v.actriz.toLowerCase().includes(query),
      );
    if (res.length === 0)
      res = mostrar.filter((v) =>
        (v.categoria || "").toLowerCase().includes(query),
      );
    mostrar = res;
  }

  if (filtroCategoria !== "")
    mostrar = mostrar.filter((v) => v.categoria === filtroCategoria);
  if (filtroCarpeta !== "")
    mostrar = mostrar.filter((v) => v.carpeta === filtroCarpeta);

  // sort
  if (query === "" && !filtroCategoria && !filtroCarpeta) {
    if (aleatorio || sortMode === "random") {
      mostrar = [...mostrar].sort(() => 0.5 - Math.random()).slice(0, 18);
    } else if (sortMode === "az") {
      mostrar = [...mostrar].sort((a, b) =>
        (a.videoNombre || "").localeCompare(b.videoNombre || ""),
      );
    } else if (sortMode === "reciente") {
      mostrar = [...mostrar].reverse().slice(0, 30);
    }
  } else {
    if (sortMode === "az")
      mostrar.sort((a, b) =>
        (a.videoNombre || "").localeCompare(b.videoNombre || ""),
      );
  }

  // subtítulo
  const subtitle = document.getElementById("headerSubtitle");
  if (subtitle) {
    if (query) subtitle.textContent = `Resultados para "${query}"`;
    else if (filtroCategoria)
      subtitle.textContent = `Categoría: ${filtroCategoria}`;
    else if (sortMode === "random")
      subtitle.textContent = "Selección aleatoria";
    else if (sortMode === "az") subtitle.textContent = "Ordenado A–Z";
    else subtitle.textContent = "Más recientes";
  }

  const rc = document.getElementById("resultCount");
  if (rc)
    rc.innerHTML = `<strong>${mostrar.length}</strong> video${mostrar.length !== 1 ? "s" : ""}`;

  galeria.innerHTML = "";
  if (mostrar.length === 0) {
    galeria.innerHTML = emptyState("🎬", "Sin resultados");
  } else {
    mostrar.forEach((video) =>
      galeria.appendChild(crearCard(video, favoritos)),
    );
  }
}

function filtrarVideos() {
  cargarVideos(false);
}

// ====== Favoritos ======
function cargarFavoritos() {
  const contenedor = document.getElementById("galeriaFavoritos");
  if (!contenedor) return;

  const favoritos = getData(favoritosKey);
  const videos = getData(videosKey).filter((v) =>
    favoritos.includes(v.videoUrl),
  );
  const favoritosShorts = getData(favoritosShortsKey);
  const shorts = getData(shortsKey).filter((s) =>
    favoritosShorts.includes(s.videoUrl),
  );
  const favoritosImagenes = getData(favoritosImagenesKey);
  const imagenes = getData(imagenesKey).filter((img) =>
    favoritosImagenes.includes(img),
  );

  contenedor.innerHTML = "";

  if (!videos.length && !shorts.length && !imagenes.length) {
    contenedor.innerHTML = emptyState("⭐", "Todavía no tienes favoritos");
    return;
  }

  videos.forEach((video) =>
    contenedor.appendChild(crearCard(video, favoritos)),
  );

  shorts.forEach((short) => {
    const card = document.createElement("div");
    card.className = "short-card";
    const wrap = document.createElement("div");
    wrap.className = "thumb-wrap";
    const img = document.createElement("img");
    img.src = short.imageUrl;
    img.loading = "lazy";
    const overlay = document.createElement("div");
    overlay.className = "play-overlay";
    overlay.onclick = () => {
      copiarEnlace(short.videoUrl);
      window.open(short.videoUrl, "_blank");
    };
    const pb = document.createElement("div");
    pb.className = "play-btn";
    pb.innerHTML = "▶";
    overlay.appendChild(pb);
    const fb = document.createElement("div");
    fb.className = "fav-badge";
    fb.textContent = "⭐";
    fb.onclick = () => toggleFavoritoShort(short.videoUrl);
    wrap.append(img, overlay, fb);
    const acc = document.createElement("div");
    acc.className = "acciones";
    acc.style.paddingTop = "8px";
    acc.appendChild(
      actionBtn("📋", "Copiar", () => {
        copiarEnlace(short.videoUrl);
        showToast("Enlace copiado ✓", "info");
      }),
    );
    acc.appendChild(
      actionBtn("🗑️", "Eliminar", () => eliminarShort(short.videoUrl), true),
    );
    card.append(wrap, acc);
    contenedor.appendChild(card);
  });

  imagenes.forEach((imagenUrl) => {
    const card = document.createElement("div");
    card.className = "imagen-card";
    const img = document.createElement("img");
    img.src = imagenUrl;
    img.loading = "lazy";
    img.onclick = () => window.open(imagenUrl, "_blank");
    const acc = document.createElement("div");
    acc.className = "acciones-imagen";
    const fb = document.createElement("div");
    fb.className = "action-btn";
    fb.textContent = "⭐";
    fb.onclick = () => toggleFavoritoImagen(imagenUrl);
    acc.appendChild(fb);
    acc.appendChild(
      actionBtn("👁️", "Ver", () => window.open(imagenUrl, "_blank")),
    );
    acc.appendChild(
      actionBtn("🗑️", "Eliminar", () => eliminarImagen(imagenUrl), true),
    );
    card.append(img, acc);
    contenedor.appendChild(card);
  });
}

function toggleFavorito(videoUrl) {
  let favoritos = getData(favoritosKey);
  const era = favoritos.includes(videoUrl);
  if (era) favoritos = favoritos.filter((u) => u !== videoUrl);
  else favoritos.push(videoUrl);
  setData(favoritosKey, favoritos);
  cargarVideos(false);
  cargarFavoritos();
  actualizarStats();
  showToast(era ? "Eliminado de favoritos" : "⭐ Agregado a favoritos", "info");
}

function toggleFavoritoShort(videoUrl) {
  let favs = getData(favoritosShortsKey);
  const era = favs.includes(videoUrl);
  if (era) favs = favs.filter((u) => u !== videoUrl);
  else favs.push(videoUrl);
  setData(favoritosShortsKey, favs);
  cargarShorts();
  cargarFavoritos();
  actualizarStats();
  showToast(era ? "Eliminado de favoritos" : "⭐ Agregado a favoritos", "info");
}

function toggleFavoritoImagen(imagenUrl) {
  let favs = getData(favoritosImagenesKey);
  const era = favs.includes(imagenUrl);
  if (era) favs = favs.filter((u) => u !== imagenUrl);
  else favs.push(imagenUrl);
  setData(favoritosImagenesKey, favs);
  cargarImagenes();
  cargarFavoritos();
  actualizarStats();
  showToast(era ? "Eliminado de favoritos" : "⭐ Agregado a favoritos", "info");
}

// ====== Eliminar con confirmación modal ======
function eliminarVideoModal(videoUrl) {
  const v = getData(videosKey).find((x) => x.videoUrl === videoUrl);
  abrirModal(
    "🗑️ Eliminar video",
    `
    <p style="color:var(--text-muted);font-size:.9rem">¿Estás seguro de que quieres eliminar <strong style="color:var(--text)">"${v?.videoNombre || "este video"}"</strong>? Esta acción no se puede deshacer.</p>
  `,
    () => {
      let lista = getData(videosKey).filter((v) => v.videoUrl !== videoUrl);
      setData(videosKey, lista);
      let favs = getData(favoritosKey).filter((u) => u !== videoUrl);
      setData(favoritosKey, favs);
      cerrarModalBtn();
      cargarVideos(false);
      cargarFavoritos();
      actualizarStats();
      showToast("Video eliminado", "error");
    },
  );
  document.getElementById("modalConfirm").textContent = "Eliminar";
  document.getElementById("modalConfirm").style.background = "var(--accent)";
}

function eliminarShort(videoUrl) {
  abrirModal(
    "🗑️ Eliminar short",
    `<p style="color:var(--text-muted);font-size:.9rem">¿Eliminar este short?</p>`,
    () => {
      let lista = getData(shortsKey).filter((s) => s.videoUrl !== videoUrl);
      setData(shortsKey, lista);
      let favs = getData(favoritosShortsKey).filter((u) => u !== videoUrl);
      setData(favoritosShortsKey, favs);
      cerrarModalBtn();
      cargarShorts();
      cargarFavoritos();
      actualizarStats();
      showToast("Short eliminado", "error");
    },
  );
  document.getElementById("modalConfirm").textContent = "Eliminar";
}

function eliminarImagen(imagenUrl) {
  abrirModal(
    "🗑️ Eliminar imagen",
    `<p style="color:var(--text-muted);font-size:.9rem">¿Eliminar esta imagen?</p>`,
    () => {
      let lista = getData(imagenesKey).filter((img) => img !== imagenUrl);
      setData(imagenesKey, lista);
      let favs = getData(favoritosImagenesKey).filter((u) => u !== imagenUrl);
      setData(favoritosImagenesKey, favs);
      cerrarModalBtn();
      cargarImagenes();
      cargarFavoritos();
      actualizarStats();
      showToast("Imagen eliminada", "error");
    },
  );
  document.getElementById("modalConfirm").textContent = "Eliminar";
}

// ====== Copiar ======
function copiarEnlace(url) {
  navigator.clipboard.writeText(url).catch(() => {});
}

// ====== Auth ======
function pedirContrasena() {
  abrirModal(
    "🔐 Acceso",
    `
    <div class="form-group"><label>Contraseña</label><input type="password" id="passInput" placeholder="••••••••"></div>
  `,
    () => {
      const input = document.getElementById("passInput")?.value;
      if (input !== PASSWORD) {
        showToast("Contraseña incorrecta", "error");
      } else {
        sessionStorage.setItem("autenticado", "true");
        cerrarModalBtn();
        cargarDatos();
        actualizarStats();
      }
    },
  );
  document.getElementById("modalConfirm").textContent = "Entrar";
  // Ocultar botón cancelar en login
  const cancelBtn = document.querySelector(".btn-cancel");
  if (cancelBtn) cancelBtn.style.display = "none";
}

// ====== Actrices ======
let _allActrices = [];

function cargarActrices() {
  const gal = document.getElementById("galeriaActrices");
  if (!gal) return;

  _allActrices = getData(actoresKey);
  const sub = document.getElementById("actrizSubtitle");
  if (sub)
    sub.textContent = `${_allActrices.length} actriz${_allActrices.length !== 1 ? "ces" : ""}`;

  renderActrices(_allActrices);
}

function renderActrices(lista) {
  const gal = document.getElementById("galeriaActrices");
  if (!gal) return;
  gal.innerHTML = "";

  if (lista.length === 0) {
    gal.innerHTML = emptyState("🌟", "No hay actrices guardadas");
    return;
  }

  lista.forEach((actriz) => {
    const card = document.createElement("div");
    card.className = "actriz-card";

    const img = document.createElement("img");
    img.className = "actriz-imagen";
    img.src =
      typeof actriz === "object" && actriz.imagenUrl
        ? actriz.imagenUrl
        : "https://i.imgur.com/JQWUQfH.png";
    img.alt = typeof actriz === "object" ? actriz.nombre : actriz;
    img.loading = "lazy";
    img.onerror = () => {
      img.src = "https://i.imgur.com/JQWUQfH.png";
    };

    const nombre = document.createElement("div");
    nombre.className = "actriz-nombre";
    nombre.textContent = typeof actriz === "object" ? actriz.nombre : actriz;
    nombre.title = nombre.textContent;

    const acciones = document.createElement("div");
    acciones.className = "acciones-actriz";

    acciones.appendChild(
      actionBtn("🖼️", "Cambiar imagen", (e) => {
        e.stopPropagation();
        cambiarImagenActrizModal(actriz);
      }),
    );
    acciones.appendChild(
      actionBtn("✏️", "Editar nombre", (e) => {
        e.stopPropagation();
        editarActrizModal(actriz);
      }),
    );
    acciones.appendChild(
      actionBtn(
        "🗑️",
        "Eliminar",
        (e) => {
          e.stopPropagation();
          eliminarActrizModal(actriz);
        },
        true,
      ),
    );

    card.append(img, nombre, acciones);
    card.onclick = () => {
      const n = typeof actriz === "object" ? actriz.nombre : actriz;
      window.location.href = `index.html?actriz=${encodeURIComponent(n)}`;
    };

    gal.appendChild(card);
  });
}

function filtrarActrices() {
  const q = (document.getElementById("buscadorActriz")?.value || "")
    .toLowerCase()
    .trim();
  if (!q) {
    renderActrices(_allActrices);
    return;
  }
  const filtered = _allActrices.filter((a) =>
    (typeof a === "string" ? a : a.nombre).toLowerCase().includes(q),
  );
  renderActrices(filtered);
}

function cambiarImagenActrizModal(actriz) {
  const nombreActriz = typeof actriz === "object" ? actriz.nombre : actriz;
  const imgActual = typeof actriz === "object" ? actriz.imagenUrl || "" : "";
  abrirModal(
    "🖼️ Cambiar imagen",
    `
    <div class="form-group"><label>Nueva URL de imagen para <strong>${nombreActriz}</strong></label>
    <input type="text" id="mImgUrl" placeholder="https://…" value="${imgActual}"></div>
  `,
    () => {
      const nuevaUrl = document.getElementById("mImgUrl").value.trim();
      if (nuevaUrl === null) return;
      let actrices = getData(actoresKey).map((a) => {
        if (typeof a === "string")
          return a === nombreActriz ? { nombre: a, imagenUrl: nuevaUrl } : a;
        return a.nombre === nombreActriz ? { ...a, imagenUrl: nuevaUrl } : a;
      });
      setData(actoresKey, actrices);
      cerrarModalBtn();
      cargarActrices();
      showToast("Imagen actualizada ✓", "success");
    },
  );
}

function editarActrizModal(actriz) {
  const nombreActual = typeof actriz === "object" ? actriz.nombre : actriz;
  abrirModal(
    "✏️ Editar actriz",
    `
    <div class="form-group"><label>Nombre</label><input type="text" id="mNombreEdit" value="${nombreActual}"></div>
  `,
    () => {
      const nuevoNombre = document.getElementById("mNombreEdit").value.trim();
      if (!nuevoNombre || nuevoNombre === nombreActual) {
        cerrarModalBtn();
        return;
      }

      let actrices = getData(actoresKey).map((a) => {
        if (typeof a === "string") return a === nombreActual ? nuevoNombre : a;
        return a.nombre === nombreActual ? { ...a, nombre: nuevoNombre } : a;
      });
      let videos = getData(videosKey).map((v) =>
        v.actriz === nombreActual ? { ...v, actriz: nuevoNombre } : v,
      );
      setData(actoresKey, actrices);
      setData(videosKey, videos);
      cerrarModalBtn();
      cargarActrices();
      if (window.location.pathname.includes("index.html")) cargarDatos();
      showToast("Nombre actualizado ✓", "success");
    },
  );
}

function eliminarActrizModal(actriz) {
  const nombre = typeof actriz === "object" ? actriz.nombre : actriz;
  abrirModal(
    "🗑️ Eliminar actriz",
    `
    <p style="color:var(--text-muted);font-size:.9rem">¿Eliminar a <strong style="color:var(--text)">${nombre}</strong>? No borra los videos asociados.</p>
  `,
    () => {
      let actrices = getData(actoresKey).filter(
        (a) => (typeof a === "string" ? a : a.nombre) !== nombre,
      );
      setData(actoresKey, actrices);
      cerrarModalBtn();
      cargarActrices();
      if (window.location.pathname.includes("index.html")) cargarDatos();
      showToast(`${nombre} eliminada`, "error");
    },
  );
  document.getElementById("modalConfirm").textContent = "Eliminar";
}

// ====== Editar Video MODAL ======
function editVideoModal(oldUrl) {
  const videos = getData(videosKey);
  const v = videos.find((x) => x.videoUrl === oldUrl);
  if (!v) {
    showToast("Video no encontrado", "error");
    return;
  }

  abrirModal(
    "✏️ Editar video",
    `
    <div class="form-group"><label>Nombre</label><input type="text" id="eNombre" value="${v.videoNombre || ""}"></div>
    <div class="form-group"><label>Enlace del video</label><input type="text" id="eUrl" value="${v.videoUrl || ""}"></div>
    <div class="form-group"><label>Enlace de imagen</label><input type="text" id="eImg" value="${v.imageUrl || ""}"></div>
    <div class="form-group"><label>Actriz</label><input type="text" id="eActriz" value="${v.actriz || ""}"></div>
    <div class="form-group"><label>Categoría</label><input type="text" id="eCat" value="${v.categoria || ""}"></div>
    <div class="form-group"><label>Carpeta</label><input type="text" id="eCarp" value="${v.carpeta || ""}"></div>
  `,
    () => {
      const nuevoNombre = document.getElementById("eNombre").value.trim();
      const nuevaUrl = document.getElementById("eUrl").value.trim();
      const nuevaImg = document.getElementById("eImg").value.trim();
      const nuevaActriz = document.getElementById("eActriz").value.trim();
      const nuevaCat = document.getElementById("eCat").value.trim();
      const nuevaCarp = document.getElementById("eCarp").value.trim();

      if (!nuevoNombre || !nuevaUrl || !nuevaImg) {
        showToast("Nombre, enlace e imagen son obligatorios", "error");
        return;
      }

      let lista = getData(videosKey);
      const idx = lista.findIndex((x) => x.videoUrl === oldUrl);
      if (idx === -1) return;

      const urlCambia = oldUrl !== nuevaUrl;
      lista[idx] = {
        ...v,
        videoNombre: nuevoNombre,
        videoUrl: nuevaUrl,
        imageUrl: nuevaImg,
        actriz: nuevaActriz,
        categoria: nuevaCat,
        carpeta: nuevaCarp,
      };
      setData(videosKey, lista);

      if (nuevaActriz) {
        const actrices = getData(actoresKey);
        if (
          !actrices.some(
            (a) => (typeof a === "string" ? a : a.nombre) === nuevaActriz,
          )
        ) {
          actrices.push(nuevaActriz);
          setData(actoresKey, actrices);
        }
      }
      if (nuevaCat) {
        const cats = getData(categoriasKey);
        if (!cats.includes(nuevaCat)) {
          cats.push(nuevaCat);
          setData(categoriasKey, cats);
        }
      }
      if (nuevaCarp) {
        const carps = getData(carpetasKey);
        if (!carps.includes(nuevaCarp)) {
          carps.push(nuevaCarp);
          setData(carpetasKey, carps);
        }
      }

      if (urlCambia) {
        let favs = getData(favoritosKey);
        if (favs.includes(oldUrl)) {
          favs = favs.map((u) => (u === oldUrl ? nuevaUrl : u));
          setData(favoritosKey, favs);
        }
      }

      cerrarModalBtn();
      cargarVideos(false);
      cargarFavoritos();
      showToast("Video actualizado ✓", "success");
    },
  );
}

// ====== Editar Short MODAL ======
function editShortModal(oldUrl) {
  const shorts = getData(shortsKey);
  const s = shorts.find((x) => x.videoUrl === oldUrl);
  if (!s) {
    showToast("Short no encontrado", "error");
    return;
  }

  abrirModal(
    "✏️ Editar short",
    `
    <div class="form-group"><label>Enlace del short</label><input type="text" id="sUrl" value="${s.videoUrl || ""}"></div>
    <div class="form-group"><label>Enlace de imagen</label><input type="text" id="sImg" value="${s.imageUrl || ""}"></div>
  `,
    () => {
      const nuevaUrl = document.getElementById("sUrl").value.trim();
      const nuevaImg = document.getElementById("sImg").value.trim();
      if (!nuevaUrl || !nuevaImg) {
        showToast("Enlace e imagen son obligatorios", "error");
        return;
      }

      let lista = getData(shortsKey);
      const idx = lista.findIndex((x) => x.videoUrl === oldUrl);
      if (idx === -1) return;
      const urlCambia = oldUrl !== nuevaUrl;
      lista[idx] = { ...s, videoUrl: nuevaUrl, imageUrl: nuevaImg };
      setData(shortsKey, lista);

      if (urlCambia) {
        let favs = getData(favoritosShortsKey);
        if (favs.includes(oldUrl)) {
          favs = favs.map((u) => (u === oldUrl ? nuevaUrl : u));
          setData(favoritosShortsKey, favs);
        }
      }

      cerrarModalBtn();
      cargarShorts();
      cargarFavoritos();
      showToast("Short actualizado ✓", "success");
    },
  );
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
    favoritosImagenes: getData(favoritosImagenesKey),
  };
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_videos_${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Datos exportados ✓", "success");
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      const mergedVideos = mergeVideos(
        getData(videosKey),
        Array.isArray(imported.videos) ? imported.videos : [],
      );
      setData(videosKey, mergedVideos);
      const mergedShorts = mergeShorts(
        getData(shortsKey),
        Array.isArray(imported.shorts) ? imported.shorts : [],
      );
      setData(shortsKey, mergedShorts);
      const mergedImagenes = mergeStrings(
        getData(imagenesKey),
        Array.isArray(imported.imagenes) ? imported.imagenes : [],
      );
      setData(imagenesKey, mergedImagenes);
      const mergedActrices = mergeActrices(
        getData(actoresKey),
        Array.isArray(imported.actrices) ? imported.actrices : [],
      );
      setData(actoresKey, mergedActrices);
      setData(
        categoriasKey,
        mergeStrings(
          getData(categoriasKey),
          Array.isArray(imported.categorias) ? imported.categorias : [],
        ),
      );
      setData(
        carpetasKey,
        mergeStrings(
          getData(carpetasKey),
          Array.isArray(imported.carpetas) ? imported.carpetas : [],
        ),
      );
      const favV = mergeStrings(
        getData(favoritosKey),
        Array.isArray(imported.favoritos) ? imported.favoritos : [],
      ).filter((u) => mergedVideos.some((v) => v.videoUrl === u));
      setData(favoritosKey, favV);
      const favS = mergeStrings(
        getData(favoritosShortsKey),
        Array.isArray(imported.favoritosShorts) ? imported.favoritosShorts : [],
      ).filter((u) => mergedShorts.some((s) => s.videoUrl === u));
      setData(favoritosShortsKey, favS);
      const favI = mergeStrings(
        getData(favoritosImagenesKey),
        Array.isArray(imported.favoritosImagenes)
          ? imported.favoritosImagenes
          : [],
      ).filter((u) => mergedImagenes.includes(u));
      setData(favoritosImagenesKey, favI);

      if (document.getElementById("galeria")) cargarDatos();
      if (document.getElementById("galeriaShorts")) cargarShorts();
      if (document.getElementById("galeriaImagenes")) cargarImagenes();
      if (document.getElementById("galeriaFavoritos")) cargarFavoritos();
      actualizarStats();
      showToast("Datos importados y fusionados ✓", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al importar el archivo JSON", "error");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// ======  Merge helpers ======
function mergeVideos(actuales, nuevos) {
  const map = new Map();
  for (const v of nuevos) {
    if (v && v.videoUrl) map.set(v.videoUrl, v);
  }
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
  const toObj = (a) =>
    typeof a === "string"
      ? { nombre: a }
      : { nombre: a?.nombre || "", imagenUrl: a?.imagenUrl || "" };
  const all = [...actuales.map(toObj), ...nuevas.map(toObj)];
  const map = new Map();
  for (const a of all) {
    if (!a.nombre) continue;
    const prev = map.get(a.nombre);
    if (!prev) map.set(a.nombre, a);
    else if (!prev.imagenUrl && a.imagenUrl) map.set(a.nombre, a);
  }
  return Array.from(map.values()).map((a) => (a.imagenUrl ? a : a.nombre));
}
function mergeStrings(actuales, nuevas) {
  return Array.from(
    new Set([
      ...(Array.isArray(actuales) ? actuales : []),
      ...(Array.isArray(nuevas) ? nuevas : []),
    ]),
  );
}
