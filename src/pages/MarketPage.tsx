import { useEffect, useMemo, useState } from "react";
import { MarketCategory, MarketItem, MarketStatus } from "../entities/market_model";
import { useMarket } from "../hooks/useMarket";
import { useModels3d } from "../hooks/useModels3d";
import { useParcels } from "../hooks/useParcels";

export function MarketPage() {
  const {
    items: marketItems,
    isLoading,
    isError,
    updateItem,
    createItem,
    deleteItem
  } = useMarket();

  const { models } = useModels3d();
  const { parcels } = useParcels();

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [auctionActive, setAuctionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bidHistory, setBidHistory] = useState<string[]>([]);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const minBid = Number((currentBid * 1.05).toFixed(2));
  const maxBid = Number((currentBid * 2).toFixed(2));
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MarketCategory | "all">("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MarketItem | null>(null);

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    startingPrice: 0,
    category: "alimentos" as MarketCategory,
    status: "disponible" as MarketStatus,
    unit: "Quintales",
    lotSize: 1,
    imageUrl: "",
    entityId: ""
  });

  // Filtrado dinámico estricto según la categoría elegida en el formulario
  const entitiesDropdownOptions = useMemo(() => {
    // Si la categoría del formulario es parcelas
    if (formData.category === "parcelas") {
      return parcels.map(p => ({ id: p.id, label: `${p.name} (${p.area})` }));
    }

    //  Si seleccionamos "animales", filtramos por "animal" 
    if (formData.category === "animales") {
      return models
        .filter(m => m.modelType === "animal")
        .map(m => ({ id: m.id, label: `${m.title} - por ${m.author}` }));
    }

    //  Si seleccionamos "alimentos", filtramos por "cultivo" 
    if (formData.category === "alimentos") {
      return models
        .filter(m => m.modelType === "cultivo") // <-- Aquí mapeamos "alimentos" -> "cultivo"
        .map(m => ({ id: m.id, label: `${m.title} - por ${m.author}` }));
    }

    return [];
  }, [formData.category, models, parcels]);

  const tabs = [
    {
      key: "all" as const,
      label: "Todos",
      icon: "fa-border-all",
      color: "bg-white/20 text-white border-white/20",
    },
    {
      key: "alimentos" as MarketCategory,
      label: "Alimentos",
      icon: "fa-seedling",
      color: "bg-emerald-500/30 text-emerald-300 border-emerald-400/20",
    },
    {
      key: "animales" as MarketCategory,
      label: "Animales",
      icon: "fa-cow",
      color: "bg-amber-500/30 text-amber-300 border-amber-400/20",
    },
    {
      key: "parcelas" as MarketCategory,
      label: "Parcelas",
      icon: "fa-map",
      color: "bg-cyan-500/30 text-cyan-300 border-cyan-400/20",
    },
  ];

  const filteredItems = useMemo(() => {
    return marketItems.filter((item) => {
      const matchesCategory = activeTab === "all" || item.category === activeTab;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeTab, search, marketItems]);

  //ABRIR CRUD DE CREAR
  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      startingPrice: 0,
      category: "alimentos",
      status: "disponible",
      unit: "Quintales",
      lotSize: 1,
      imageUrl: "",
      entityId: ""
    });
    setIsFormOpen(true);
  };

  const openEditForm = (item: MarketItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      startingPrice: item.startingPrice,
      category: item.category,
      status: item.status,
      unit: item.unit || "Unidades",
      lotSize: item.lotSize || 1,
      imageUrl: item.imageUrl ? item.imageUrl[0] : "",
      entityId: item.entityId || ""
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: MarketItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  // Manejador del cambio de categoría con reseteo de unidades
  const handleCategoryChange = (category: MarketCategory) => {
    let defaultUnit = "Quintales";
    if (category === "animales") defaultUnit = "Cabezas";
    if (category === "parcelas") defaultUnit = "Hectáreas";

    setFormData({
      ...formData,
      category,
      entityId: "",
      unit: defaultUnit
    });
  };

  // Rellenar automáticamente campos al seleccionar un modelo o parcela
  const handleEntitySelect = (entityId: string) => {
    if (!entityId) {
      setFormData(prev => ({ ...prev, entityId: "" }));
      return;
    }

    if (formData.category === "parcelas") {
      const targetParcel = parcels.find(p => p.id === entityId);
      if (targetParcel) {
        setFormData(prev => ({
          ...prev,
          entityId,
          name: `Alquiler: ${targetParcel.name}`,
          description: `Parcela con estado de fertilidad de ${targetParcel.fertility} y humedad del ${targetParcel.humidity}.`,
          unit: "Lote"
        }));
      }
    } else {
      const targetModel = models.find(m => m.id === entityId);
      if (targetModel) {
        setFormData(prev => ({
          ...prev,
          entityId,
          name: `${targetModel.title}`,
          description: `${targetModel.estimatedProduction}. ${targetModel.growthPeriod}.`,
          startingPrice: targetModel.currentPrice,
          price: targetModel.currentPrice
        }));
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const itemPayload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price) || Number(formData.startingPrice),
      startingPrice: Number(formData.startingPrice),
      category: formData.category,
      status: formData.status,
      unit: formData.unit,
      lotSize: Number(formData.lotSize),
      imageUrl: formData.imageUrl ? [formData.imageUrl] : undefined,
      entityId: editingItem?.entityId || crypto.randomUUID(),
      bidCount: editingItem?.bidCount || 0,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      endDate: editingItem?.endDate || new Date(Date.now() + 86400000).toISOString()
    };

    if (editingItem) {
      updateItem({
        id: editingItem.id,
        updatedItem: { ...editingItem, ...itemPayload }
      });
    } else {
      createItem(itemPayload);
    }

    setIsFormOpen(false);
  };

  const openAuction = (item: any) => {
    setSelectedItem(item);
    setSelectedImage(item.imageUrl[0]);
    setCurrentBid(item.price);
    setBidAmount("");
    setTimeLeft(120);
    setAuctionEnded(false);
    setBidHistory([`Subasta iniciada por $${item.price}`]);
    setAuctionActive(true);
  };

  const handleBid = () => {
    if (auctionEnded) return;
    const value = Number(bidAmount);
    if (!value) return;

    if (value < minBid) {
      alert(`La oferta mínima permitida es $${minBid}`);
      return;
    }
    if (value > maxBid) {
      alert(`La oferta máxima permitida es $${maxBid}`);
      return;
    }

    setCurrentBid(value);

    updateItem({
      id: selectedItem.id,
      updatedItem: { ...selectedItem, price: value }
    });

    setBidHistory((prev) => [`Tú ofertaste $${value}`, ...prev]);
    setBidAmount("");

    if (timeLeft <= 15) {
      setTimeLeft((prev) => prev + 20);
    }
  };

  const closeAuction = () => {
    setAuctionActive(false);
    setSelectedItem(null);
    setBidAmount("");
    setBidHistory([]);
    setAuctionEnded(false);
  };

  useEffect(() => {
    if (auctionActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [auctionActive]);

  useEffect(() => {
    if (!auctionActive || auctionEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAuctionEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionActive, auctionEnded]);

  useEffect(() => {
    if (!auctionActive || auctionEnded) return;

    const fakeBids = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * 120) + 20;

      setCurrentBid((prev) => {
        const nextBid = prev + randomIncrement;

        setBidHistory((history) => [
          `AgroUser_${Math.floor(Math.random() * 99)} ofertó $${nextBid}`,
          ...history,
        ]);

        updateItem({
          id: selectedItem.id,
          updatedItem: { ...selectedItem, price: nextBid }
        });

        return nextBid;
      });
    }, 9000);

    return () => clearInterval(fakeBids);
  }, [auctionActive, auctionEnded]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  if (isLoading) return <div className="text-white text-center py-10">Cargando mercado...</div>;
  if (isError) return <div className="text-red-400 text-center py-10">Error al cargar datos.</div>;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mercado de Subastas</h1>
          <p className="text-sm text-slate-400">
            Tierras en alquiler · Cultivos en venta · Subastas activas
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-400"
        >
          <i className="fas fa-plus" /> Nueva Subasta
        </button>
      </div>

      {/* BUSCADOR Y TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-emerald-400/30"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                  ? `${tab.color} scale-105 shadow-lg`
                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  }`}
              >
                <i className={`fas ${tab.icon}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* COLECCION DE PRODUCTOS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 bg-black/20 backdrop-blur">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="relative rounded-[14px] border border-white/8 bg-white/[0.03] overflow-hidden group"
          >
            <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => openEditForm(item, e)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-xs text-amber-400 backdrop-blur-sm transition hover:bg-amber-500 hover:text-black"
                title="Editar subasta"
              >
                <i className="fas fa-pen" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteClick(item, e)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-xs text-red-400 backdrop-blur-sm transition hover:bg-red-500 hover:text-white"
                title="Eliminar subasta"
              >
                <i className="fas fa-trash-alt" />
              </button>
            </div>

            <div className="flex h-36 items-center justify-center bg-black/20 text-5xl">
              <img
                src={item.imageUrl ? item.imageUrl[0] : "https://media.istockphoto.com/id/1842732901/es/vector/icono-de-carga.jpg?s=612x612&w=0&k=20&c=t9fex0geQSSL-upo-wtzFNsG48KHFnJFkLQUeMQEh68="}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex p-2 flex-col items-start gap-2">
              <div className="mt-3 text-lg font-semibold text-white truncate w-full">
                {item.name}
              </div>
              <span className="text-xs text-slate-500 line-clamp-2 h-8">{item.description}</span>
              <div className="w-full flex flex-row items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold border ${item.status === "disponible"
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : item.status === "pendiente"
                      ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-300"
                      : "border-red-400/20 bg-red-500/10 text-red-300"
                    }`}
                >
                  {item.status}
                </span>
                <div className="mt-1 text-xl font-black tracking-tight text-emerald-300">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <button
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-emerald-500/50 hover:text-white"
                type="button"
                onClick={() => openAuction(item)}
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}

        {!filteredItems.length && (
          <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-8 text-center text-slate-400 w-full col-span-full">
            No hay elementos registrados en esta categoría o coincidencia.
          </div>
        )}
      </div>

      {/* MODAL SUBASTA EN VIVO */}
      {auctionActive && selectedItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-md">
          <div className="relative w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#071510] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-black text-white">{selectedItem.name}</div>
                <div className="mt-2 text-sm text-slate-400">{selectedItem.description}</div>
              </div>
              <button
                onClick={closeAuction}
                className="rounded-xl bg-white/5 px-4 py-2 text-slate-300 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[1.2fr_0.8fr_0.5fr]">
              <div className="flex h-full flex-col gap-4">
                <div className="overflow-hidden rounded-[14px] border border-white/10">
                  <img src={selectedImage} alt={selectedItem.name} className="h-[340px] w-full object-cover" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {selectedItem.imageUrl?.map((img: string) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`overflow-hidden rounded-xl border transition ${selectedImage === img ? "border-emerald-400" : "border-white/10"}`}
                    >
                      <img src={img} alt="" className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex h-full flex-col gap-4">
                <div className="rounded-[14px] border border-emerald-400/20 bg-emerald-500/10 p-6">
                  <div className="text-sm font-semibold text-white">Oferta actual</div>
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/30 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-red-200">Tiempo restante</div>
                    <div className="mt-2 text-4xl font-black text-red-300">{formattedTime}</div>
                    {auctionEnded && <div className="mt-2 text-sm font-semibold text-white">Subasta finalizada</div>}
                  </div>
                  <div className="mt-3 text-xs text-emerald-100/70">Oferta mínima: ${minBid.toFixed(2)}</div>
                  <div className="text-xs text-emerald-100/70">Oferta máxima: ${maxBid.toFixed(2)}</div>
                  <div className="mt-2 text-5xl font-black text-emerald-300">${currentBid.toFixed(2)}</div>
                </div>

                <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5 h-full">
                  <div className="text-sm font-semibold text-white">Realizar oferta</div>
                  <div className="mt-4 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Ingresa tu oferta"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-8 pr-4 text-white outline-none disabled:opacity-50"
                      disabled={auctionEnded}
                    />
                  </div>
                  <button
                    onClick={handleBid}
                    className="mt-4 w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                    disabled={auctionEnded}
                  >
                    Pujar ahora
                  </button>
                  <button
                    onClick={closeAuction}
                    className="mt-3 w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Retirarse de la subasta
                  </button>
                </div>
              </div>

              <div className="flex max-h-[calc(90vh-20px)] min-h-0 flex-col rounded-[14px] border border-white/10 bg-white/[0.03] p-3 overflow-y-auto">
                <div className="text-sm font-semibold text-white mb-2">Actividad reciente</div>
                <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-2">
                  {bidHistory.map((activity, index) => (
                    <div key={index} className="rounded-xl border border-white/5 bg-black/20 p-3 text-sm text-slate-300">
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMULARIO: CREAR / EDITAR SUBASTA */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c1914] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? "Editar Subasta" : "Crear Nueva Subasta"}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block mb-1 font-medium text-slate-200">Nombre del lote/producto</label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-emerald-500"
                    placeholder="Ej: Lote de 50 Quintales de Maíz Blanco"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 font-medium text-slate-200">Descripción detallada</label>
                  <textarea
                    rows={2} required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-emerald-500"
                    placeholder="Especificaciones técnicas, calidad, ubicación o condiciones..."
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-200">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value as MarketCategory)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white outline-none transition-colors duration-200 hover:bg-slate-800 focus:border-emerald-500"
                  >
                    <option value="alimentos">Alimentos (Cultivos)</option>
                    <option value="animales">Animales</option>
                    <option value="parcelas">Parcelas</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-200">Estado inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MarketStatus })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white outline-none transition-colors duration-200 hover:bg-slate-800 focus:border-emerald-500"
                  >
                    <option value="disponible">Disponible / Activa</option>
                    <option value="pendiente">Pendiente / Pausa</option>
                    <option value="no disponible">No disponible / Cerrada</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 font-medium text-slate-200">
                    {formData.category === "parcelas" ? "Seleccionar Parcela" : `Vincular Modelo 3D (${formData.category})`}
                  </label>
                  <select
                    value={formData.entityId}
                    onChange={(e) => handleEntitySelect(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white outline-none transition-colors duration-200 hover:bg-slate-800 focus:border-emerald-500"
                  >
                    <option value="" className="bg-slate-950 text-white">
                      -- Selección libre / Ninguno --
                    </option>
                    {entitiesDropdownOptions.map(option => (
                      <option
                        key={option.id}
                        value={option.id}
                        className="bg-slate-950 text-white checked:bg-emerald-600"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-200">Precio Base ($)</label>
                  <input
                    type="number" required min="0" step="0.01"
                    value={formData.startingPrice || ""}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value), price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-medium text-slate-200">Cantidad</label>
                    <input
                      type="number" required min="1"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({ ...formData, lotSize: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-slate-200">Unidad</label>
                    <input
                      type="text" required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-emerald-500"
                      placeholder="Ej: Quintales, Cabezas"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 font-medium text-slate-200">URL de la Imagen (Opcional)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-emerald-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button" onClick={() => setIsFormOpen(false)}
                  className="rounded-xl bg-white/5 px-5 py-2.5 font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-white hover:bg-emerald-400"
                >
                  {editingItem ? "Guardar Cambios" : "Lanzar Subasta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar subasta?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Esta acción eliminará permanentemente la publicación <span className="text-emerald-400 font-semibold">"{itemToDelete.name}"</span> del mercado de subastas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}